# -*- coding: utf-8 -*-
"""
SMAIL Phishing Detection Service
================================
JPCERT/CC + PhishTank integration, similar URL detection, risk scoring
"""

import os
import re
import json
import requests
import csv
from io import StringIO
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import urlparse
import Levenshtein

app = Flask(__name__)
CORS(app)

# ================== Configuration ==================

CACHE_DIR = os.path.dirname(os.path.abspath(__file__))
JPCERT_CACHE_FILE = os.path.join(CACHE_DIR, 'jpcert_cache.json')
PHISHTANK_CACHE_FILE = os.path.join(CACHE_DIR, 'phishtank_cache.json')
CACHE_DURATION_HOURS = 24
JPCERT_BASE_URL = "https://raw.githubusercontent.com/JPCERTCC/phishurl-list/main"

# Official domains for similar URL detection
OFFICIAL_DOMAINS = [
    "mufg.jp", "smbc.co.jp", "mizuhobank.co.jp", "japannetbank.co.jp",
    "rakuten-bank.co.jp", "aeonbank.co.jp", "shinseibank.com",
    "amazon.co.jp", "rakuten.co.jp", "yahoo.co.jp", "mercari.com",
    "zozo.jp", "uniqlo.com", "yodobashi.com",
    "apple.com", "google.com", "microsoft.com", "meta.com",
    "twitter.com", "instagram.com", "line.me",
    "nttdocomo.co.jp", "au.com", "softbank.jp",
    "smbc-card.com", "jcb.co.jp", "saisoncard.co.jp",
    "kuronekoyamato.co.jp", "sagawa-exp.co.jp", "post.japanpost.jp",
    "netflix.com", "spotify.com", "paypal.com", "eki-net.com",
]

# Dangerous keywords with scores
DANGEROUS_KEYWORDS = {
    "urgent": 3,
    "important": 2,
    "verify your account": 4,
    "account suspended": 4,
    "account locked": 4,
    "password reset": 3,
    "change password": 3,
    "payment failed": 4,
    "update payment": 4,
    "congratulations": 2,
    "winner": 3,
    "free gift": 3,
    "click here": 2,
    "click now": 3,
    "expires": 3,
    "limited time": 3,
}

# Japanese keywords
JAPANESE_KEYWORDS = {
    "kinkyu": 3,      # 緊急
    "shikyuu": 3,     # 至急
    "juuyou": 2,      # 重要
    "akaunto kakunin": 4,  # アカウント確認
    "akaunto teishi": 4,   # アカウント停止
    "akaunto rokku": 4,    # アカウントロック
    "pasuwaado henkou": 3, # パスワード変更
    "pasuwaado risetto": 3, # パスワードリセット
    "shiharai shippai": 4,  # 支払い失敗
    "kurejitto kaado koushin": 4,  # クレジットカード更新
    "omedetou": 2,    # おめでとう
    "tousen": 3,      # 当選
    "purezento": 2,   # プレゼント
    "muryou": 2,      # 無料
    "ima sugu kurikku": 3,  # 今すぐクリック
    "kochira wo kurikku": 2, # こちらをクリック
    "24jikan inai": 3,      # 24時間以内
    "honjitsu chuu": 3,     # 本日中
}

# Japanese keyword patterns (actual Japanese text)
JAPANESE_PATTERNS = [
    (r"緊急", 3),
    (r"至急", 3),
    (r"重要", 2),
    (r"アカウント確認", 4),
    (r"アカウント停止", 4),
    (r"アカウントロック", 4),
    (r"パスワード変更", 3),
    (r"パスワードリセット", 3),
    (r"パスワード確認", 3),
    (r"支払い失敗", 4),
    (r"お支払い情報", 3),
    (r"クレジットカード更新", 4),
    (r"おめでとう", 2),
    (r"当選", 3),
    (r"プレゼント", 2),
    (r"無料", 2),
    (r"今すぐクリック", 3),
    (r"こちらをクリック", 2),
    (r"24時間以内", 3),
    (r"本日中", 3),
]

# ================== Data Manager ==================

class PhishingDataManager:
    def __init__(self):
        self.jpcert_urls = set()
        self.phishtank_urls = set()
        self.last_update = None
    
    def load_jpcert_data(self):
        try:
            if os.path.exists(JPCERT_CACHE_FILE):
                with open(JPCERT_CACHE_FILE, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
                    cache_time = datetime.fromisoformat(cache.get('timestamp', '2000-01-01'))
                    if datetime.now() - cache_time < timedelta(hours=CACHE_DURATION_HOURS):
                        self.jpcert_urls = set(cache.get('urls', []))
                        print(f"[OK] JPCERT/CC cache: {len(self.jpcert_urls)} URLs loaded")
                        return
            
            year = datetime.now().year
            urls_collected = set()
            
            for month in range(1, 13):
                try:
                    url = f"{JPCERT_BASE_URL}/{year}/{year}{month:02d}.csv"
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        reader = csv.reader(StringIO(response.text))
                        next(reader, None)
                        for row in reader:
                            if row and len(row) > 0:
                                urls_collected.add(row[0].strip().lower())
                except:
                    continue
            
            try:
                url = f"{JPCERT_BASE_URL}/phishing_url.csv"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    reader = csv.reader(StringIO(response.text))
                    next(reader, None)
                    for row in reader:
                        if row and len(row) > 0:
                            urls_collected.add(row[0].strip().lower())
            except:
                pass
            
            self.jpcert_urls = urls_collected
            
            with open(JPCERT_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'urls': list(self.jpcert_urls)
                }, f)
            
            print(f"[OK] JPCERT/CC: {len(self.jpcert_urls)} phishing URLs fetched")
            
        except Exception as e:
            print(f"[WARN] JPCERT/CC load error: {e}")
    
    def load_phishtank_data(self):
        try:
            if os.path.exists(PHISHTANK_CACHE_FILE):
                with open(PHISHTANK_CACHE_FILE, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
                    self.phishtank_urls = set(cache.get('urls', []))
                    print(f"[OK] PhishTank cache: {len(self.phishtank_urls)} URLs loaded")
        except Exception as e:
            print(f"[WARN] PhishTank load error: {e}")
    
    def refresh_data(self):
        self.load_jpcert_data()
        self.load_phishtank_data()
        self.last_update = datetime.now()
        return {
            'jpcert_count': len(self.jpcert_urls),
            'phishtank_count': len(self.phishtank_urls),
            'last_update': self.last_update.isoformat()
        }

data_manager = PhishingDataManager()

# ================== Detection Logic ==================

def extract_urls(text):
    url_pattern = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+' 
    urls = re.findall(url_pattern, text, re.IGNORECASE)
    return list(set(urls))

def extract_domain(url):
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except:
        return url.lower()

def check_known_phishing_url(url):
    url_lower = url.lower()
    domain = extract_domain(url)
    
    if url_lower in data_manager.jpcert_urls or domain in data_manager.jpcert_urls:
        return {'is_phishing': True, 'source': 'JPCERT/CC', 'confidence': 100}
    
    if url_lower in data_manager.phishtank_urls or domain in data_manager.phishtank_urls:
        return {'is_phishing': True, 'source': 'PhishTank', 'confidence': 100}
    
    return {'is_phishing': False}

def check_similar_domain(domain):
    if not domain:
        return {'is_suspicious': False}
    
    domain = domain.lower()
    
    for official in OFFICIAL_DOMAINS:
        if domain == official:
            return {'is_suspicious': False, 'is_official': True}
        
        distance = Levenshtein.distance(domain, official)
        max_len = max(len(domain), len(official))
        similarity = (1 - (distance / max_len)) * 100
        
        if similarity >= 80 and domain != official:
            return {
                'is_suspicious': True,
                'similar_to': official,
                'similarity': round(similarity, 1),
                'reason': f'Similar to "{official}" ({similarity:.1f}% match)'
            }
        
        patterns = [
            f"{official.replace('.', '-')}",
            f"{official.replace('.', '')}",
            f"secure-{official}",
            f"login-{official}",
            f"{official}-secure",
            f"{official}-login",
        ]
        
        for pattern in patterns:
            if pattern in domain:
                return {
                    'is_suspicious': True,
                    'similar_to': official,
                    'similarity': 75,
                    'reason': f'Domain pattern mimicking "{official}"'
                }
    
    return {'is_suspicious': False}

def check_dangerous_keywords(text):
    if not text:
        return {'found': [], 'score': 0}
    
    text_lower = text.lower()
    found_keywords = []
    total_score = 0
    
    # English keywords
    for keyword, score in DANGEROUS_KEYWORDS.items():
        if keyword.lower() in text_lower:
            found_keywords.append({'keyword': keyword, 'score': score})
            total_score += score
    
    # Japanese patterns
    for pattern, score in JAPANESE_PATTERNS:
        if re.search(pattern, text):
            found_keywords.append({'keyword': pattern, 'score': score})
            total_score += score
    
    return {
        'found': found_keywords,
        'score': min(total_score, 30)
    }

def check_ip_in_url(url):
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    if re.search(ip_pattern, url):
        return {'has_ip': True, 'score': 15}
    return {'has_ip': False, 'score': 0}

def check_suspicious_tld(domain):
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click']
    for tld in suspicious_tlds:
        if domain.endswith(tld):
            return {'suspicious_tld': True, 'tld': tld, 'score': 10}
    return {'suspicious_tld': False, 'score': 0}

def calculate_risk_score(email_data):
    score = 0
    reasons = []
    details = {}
    
    subject = email_data.get('subject', '')
    body = email_data.get('body', '')
    sender = email_data.get('from', '')
    full_text = f"{subject} {body}"
    
    urls = extract_urls(full_text)
    phishing_urls_found = []
    similar_domains_found = []
    
    for url in urls:
        result = check_known_phishing_url(url)
        if result['is_phishing']:
            score += 50
            phishing_urls_found.append({
                'url': url,
                'source': result['source']
            })
            reasons.append(f"Known phishing URL detected ({result['source']})")
        
        domain = extract_domain(url)
        similar = check_similar_domain(domain)
        if similar.get('is_suspicious'):
            score += 30
            similar_domains_found.append({
                'domain': domain,
                'similar_to': similar['similar_to'],
                'similarity': similar['similarity']
            })
            reasons.append(similar['reason'])
        
        ip_check = check_ip_in_url(url)
        if ip_check['has_ip']:
            score += ip_check['score']
            reasons.append("IP address used in URL")
        
        tld_check = check_suspicious_tld(domain)
        if tld_check['suspicious_tld']:
            score += tld_check['score']
            reasons.append(f"Suspicious TLD: {tld_check['tld']}")
    
    details['phishing_urls'] = phishing_urls_found
    details['similar_domains'] = similar_domains_found
    details['urls_checked'] = len(urls)
    
    keyword_result = check_dangerous_keywords(full_text)
    if keyword_result['found']:
        score += keyword_result['score']
        keywords_list = [k['keyword'] for k in keyword_result['found']]
        reasons.append(f"Dangerous keywords: {', '.join(keywords_list[:5])}")
        details['dangerous_keywords'] = keyword_result['found']
    
    if sender:
        sender_domain = extract_domain(sender.split('@')[-1] if '@' in sender else sender)
        sender_similar = check_similar_domain(sender_domain)
        if sender_similar.get('is_suspicious'):
            score += 20
            reasons.append(f"Sender domain similar to \"{sender_similar['similar_to']}\"")
            details['sender_spoofing'] = sender_similar
    
    score = min(100, max(0, score))
    
    if score >= 70:
        level = 'DANGER'
        level_display = '🔴 Danger'
    elif score >= 50:
        level = 'WARNING'
        level_display = '🟠 Warning'
    elif score >= 30:
        level = 'CAUTION'
        level_display = '🟡 Caution'
    else:
        level = 'SAFE'
        level_display = '🟢 Safe'
    
    return {
        'score': score,
        'level': level,
        'level_display': level_display,
        'reasons': reasons,
        'details': details,
        'recommendation': 'spam' if score >= 50 else 'inbox'
    }

# ================== API Endpoints ==================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'SMAIL Phishing Detector',
        'version': '2.0.0',
        'jpcert_urls': len(data_manager.jpcert_urls),
        'phishtank_urls': len(data_manager.phishtank_urls),
        'last_update': data_manager.last_update.isoformat() if data_manager.last_update else None
    })

@app.route('/', methods=['GET'])
def index():
    """Welcome page"""
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>SMAIL Phishing Detector</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #eee; }
            h1 { color: #00d4ff; }
            .status { background: #16213e; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333; }
            .endpoint { background: #0f3460; padding: 15px; margin: 10px 0; border-radius: 5px; }
            code { background: #000; padding: 2px 8px; border-radius: 3px; color: #00ff88; }
            .ok { color: #00ff88; }
        </style>
    </head>
    <body>
        <h1>🛡️ SMAIL Phishing Detection Service</h1>
        <div class="status">
            <h2>Status: <span class="ok">Running</span></h2>
            <div class="stat"><span>JPCERT/CC URLs:</span><span>''' + str(len(data_manager.jpcert_urls)) + '''</span></div>
            <div class="stat"><span>PhishTank URLs:</span><span>''' + str(len(data_manager.phishtank_urls)) + '''</span></div>
            <div class="stat"><span>Official Domains:</span><span>''' + str(len(OFFICIAL_DOMAINS)) + '''</span></div>
            <div class="stat"><span>Dangerous Keywords:</span><span>''' + str(len(DANGEROUS_KEYWORDS) + len(JAPANESE_PATTERNS)) + '''</span></div>
        </div>
        <h2>API Endpoints</h2>
        <div class="endpoint"><code>GET /health</code> - Health check</div>
        <div class="endpoint"><code>POST /check-email</code> - Check email for phishing</div>
        <div class="endpoint"><code>POST /check-url</code> - Check single URL</div>
        <div class="endpoint"><code>POST /refresh-data</code> - Refresh phishing data</div>
        <div class="endpoint"><code>GET /stats</code> - Get statistics</div>
    </body>
    </html>
    '''
    return html

@app.route('/check-email', methods=['POST'])
def check_email():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        result = calculate_risk_score(data)
        
        return jsonify({
            'success': True,
            'is_phishing': result['score'] >= 50,
            'risk_score': result['score'],
            'risk_level': result['level'],
            'risk_level_display': result['level_display'],
            'reasons': result['reasons'],
            'details': result['details'],
            'recommendation': result['recommendation']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-url', methods=['POST'])
def check_url():
    try:
        data = request.get_json()
        url = data.get('url', '')
        
        if not url:
            return jsonify({'error': 'URL required'}), 400
        
        domain = extract_domain(url)
        known = check_known_phishing_url(url)
        similar = check_similar_domain(domain)
        ip_check = check_ip_in_url(url)
        tld_check = check_suspicious_tld(domain)
        
        score = 0
        if known['is_phishing']:
            score += 50
        if similar.get('is_suspicious'):
            score += 30
        if ip_check['has_ip']:
            score += 15
        if tld_check['suspicious_tld']:
            score += 10
        
        return jsonify({
            'success': True,
            'url': url,
            'domain': domain,
            'is_phishing': known['is_phishing'],
            'phishing_source': known.get('source'),
            'is_similar_to_official': similar.get('is_suspicious', False),
            'similar_details': similar if similar.get('is_suspicious') else None,
            'has_ip_address': ip_check['has_ip'],
            'suspicious_tld': tld_check['suspicious_tld'],
            'risk_score': min(100, score)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/refresh-data', methods=['POST'])
def refresh_data():
    try:
        result = data_manager.refresh_data()
        return jsonify({
            'success': True,
            'message': 'Data refreshed successfully',
            **result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    return jsonify({
        'jpcert_urls_count': len(data_manager.jpcert_urls),
        'phishtank_urls_count': len(data_manager.phishtank_urls),
        'official_domains_count': len(OFFICIAL_DOMAINS),
        'dangerous_keywords_count': len(DANGEROUS_KEYWORDS) + len(JAPANESE_PATTERNS),
        'last_update': data_manager.last_update.isoformat() if data_manager.last_update else None
    })

# ================== Main ==================

if __name__ == '__main__':
    print("=" * 50)
    print("SMAIL Phishing Detection Service")
    print("=" * 50)
    
    data_manager.refresh_data()
    
    print("=" * 50)
    print(f"Stats:")
    print(f"  - JPCERT/CC: {len(data_manager.jpcert_urls)} URLs")
    print(f"  - PhishTank: {len(data_manager.phishtank_urls)} URLs")
    print(f"  - Official domains: {len(OFFICIAL_DOMAINS)}")
    print(f"  - Dangerous keywords: {len(DANGEROUS_KEYWORDS) + len(JAPANESE_PATTERNS)}")
    print("=" * 50)
    print("Server running on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
