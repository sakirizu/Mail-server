import os
import json
import re
import requests
import time
from datetime import datetime, timedelta
from urllib.parse import urlparse
import validators
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
PHISHTANK_JSON_URL = "http://data.phishtank.com/data/online-valid.json"
PHISHTANK_CACHE_FILE = "phishtank_cache.json"
CACHE_EXPIRY_HOURS = 24

class PhishingDetector:
    def __init__(self):
        self.phishing_urls = set()
        self.last_update = None
        self.load_phishtank_data()
    
    def load_phishtank_data(self):
        """Load PhishTank data from cache or download fresh data"""
        try:
            # Check if cache exists and is valid
            if os.path.exists(PHISHTANK_CACHE_FILE):
                with open(PHISHTANK_CACHE_FILE, 'r') as f:
                    cache_data = json.load(f)
                    cache_time = datetime.fromisoformat(cache_data['timestamp'])
                    
                    # Use cache if less than CACHE_EXPIRY_HOURS old
                    if datetime.now() - cache_time < timedelta(hours=CACHE_EXPIRY_HOURS):
                        self.phishing_urls = set(cache_data['urls'])
                        self.last_update = cache_time
                        print(f"✅ Loaded {len(self.phishing_urls)} phishing URLs from cache")
                        return
                    else:
                        # Cache expired but still use it while trying to update
                        print(f"⚠️  Cache expired, using old data while updating...")
                        self.phishing_urls = set(cache_data['urls'])
                        self.last_update = cache_time
            
            # Download fresh data
            print("⬇️ Downloading fresh PhishTank data...")
            response = requests.get(PHISHTANK_JSON_URL, timeout=30, headers={'User-Agent': 'SSMail-PhishingDetector/1.0'})
            response.raise_for_status()
            
            phishtank_data = response.json()
            self.phishing_urls = set()
            
            for entry in phishtank_data:
                if 'url' in entry:
                    self.phishing_urls.add(entry['url'].lower().strip())
            
            # Save to cache
            cache_data = {
                'timestamp': datetime.now().isoformat(),
                'urls': list(self.phishing_urls)
            }
            with open(PHISHTANK_CACHE_FILE, 'w') as f:
                json.dump(cache_data, f)
            
            self.last_update = datetime.now()
            print(f"✅ Downloaded and cached {len(self.phishing_urls)} phishing URLs")
            
        except Exception as e:
            print(f"❌ Error loading PhishTank data: {e}")
            # If download fails but we have cache, use it
            if os.path.exists(PHISHTANK_CACHE_FILE) and len(self.phishing_urls) > 0:
                print(f"✅ Using cached data ({len(self.phishing_urls)} URLs) - will retry later")
            else:
                print("⚠️  No PhishTank data available - detection will use keyword/pattern analysis only")
                self.phishing_urls = set()
    
    def extract_urls_from_text(self, text):
        """Extract URLs from email body"""
        if not text:
            return []
        
        # Regex pattern for URLs
        url_pattern = r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)'
        urls = re.findall(url_pattern, text)
        return [url.lower().strip() for url in urls]
    
    def extract_urls_from_html(self, html):
        """Extract URLs from HTML email"""
        if not html:
            return []
        
        # Check if it looks like HTML
        if not ('<' in html and '>' in html):
            return []
        
        try:
            soup = BeautifulSoup(html, 'lxml')
            urls = []
            
            # Extract from <a> tags
            for link in soup.find_all('a', href=True):
                href = link['href']
                if href.startswith('http'):
                    urls.append(href.lower().strip())
            
            # Extract from <img> tags (tracking pixels)
            for img in soup.find_all('img', src=True):
                src = img['src']
                if src.startswith('http'):
                    urls.append(src.lower().strip())
            
            return urls
        except Exception as e:
            print(f"Error parsing HTML: {e}")
            return []
    
    def check_url_against_phishtank(self, url):
        """Check if URL is in PhishTank database"""
        if not url:
            return False
        
        # Normalize URL
        url_lower = url.lower().strip()
        
        # Remove protocol for comparison
        url_no_protocol = url_lower.replace('https://', '').replace('http://', '').replace('www.', '')
        
        # Direct match
        if url_lower in self.phishing_urls:
            return True
        
        # Check without protocol
        for phish_url in self.phishing_urls:
            phish_no_protocol = phish_url.replace('https://', '').replace('http://', '').replace('www.', '')
            
            # Exact match or contains
            if phish_no_protocol in url_no_protocol or url_no_protocol in phish_no_protocol:
                return True
            
            # Check if domain matches
            try:
                # Extract domain from phish_url
                phish_domain = phish_no_protocol.split('/')[0]
                url_domain = url_no_protocol.split('/')[0]
                
                if phish_domain == url_domain:
                    return True
                
                # Check if any part of the path matches
                if '/' in phish_no_protocol and '/' in url_no_protocol:
                    phish_path = phish_no_protocol.split('/', 1)[1] if '/' in phish_no_protocol else ''
                    url_path = url_no_protocol.split('/', 1)[1] if '/' in url_no_protocol else ''
                    
                    if phish_path and url_path and phish_path in url_path:
                        return True
            except:
                pass
        
        return False
    
    def analyze_email_content(self, email_data):
        """Analyze email content for phishing indicators"""
        suspicious_score = 0
        reasons = []
        
        subject = email_data.get('subject', '').lower()
        body = email_data.get('body', '')
        sender = email_data.get('from', '').lower()
        
        # Check for suspicious keywords in subject and body
        suspicious_keywords = [
            'urgent', 'verify', 'suspend', 'confirm', 'account', 'security',
            'click here', 'act now', 'limited time', 'expire',
            'congratulations', 'winner', 'prize', 'lottery',
            'password', 'credit card', 'bank', 'paypal',
            'invoice', 'payment', 'refund', 'tax',
            'wallet', 'crypto', 'bitcoin', 'blockchain', 'nft',
            'metamask', 'trust wallet', 'coinbase', 'binance',
            'claim', 'airdrop', 'token', 'seed phrase', 'private key'
        ]
        
        body_lower = body.lower()
        for keyword in suspicious_keywords:
            if keyword in subject:
                suspicious_score += 1
                reasons.append(f"Suspicious keyword in subject: {keyword}")
            elif keyword in body_lower:
                suspicious_score += 0.5
                if keyword not in ['account', 'payment', 'security']:  # Common legitimate words
                    reasons.append(f"Suspicious keyword in body: {keyword}")
        
        # Check sender domain
        if sender:
            # Common phishing domains
            suspicious_domains = [
                'temporary', 'temp', 'disposable', 'fake',
                'scam', 'phish', 'suspicious'
            ]
            for domain in suspicious_domains:
                if domain in sender:
                    suspicious_score += 2
                    reasons.append(f"Suspicious sender domain: {domain}")
        
        # Extract and check URLs
        all_urls = set()
        all_urls.update(self.extract_urls_from_text(body))
        all_urls.update(self.extract_urls_from_html(body))
        
        phishing_urls_found = []
        for url in all_urls:
            if self.check_url_against_phishtank(url):
                phishing_urls_found.append(url)
                suspicious_score += 10  # High score for known phishing URL
        
        if phishing_urls_found:
            reasons.append(f"Known phishing URLs found: {', '.join(phishing_urls_found[:3])}")
        
        # Check for suspicious URL patterns
        for url in all_urls:
            # Check for IP addresses instead of domains
            if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
                suspicious_score += 2
                reasons.append("URL uses IP address instead of domain")
            
            # Check for suspicious URL shorteners
            shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co']
            if any(shortener in url for shortener in shorteners):
                suspicious_score += 1
                reasons.append("URL shortener detected")
        
        # Determine if phishing
        is_phishing = suspicious_score >= 5 or len(phishing_urls_found) > 0
        confidence = min(suspicious_score * 10, 100)
        
        return {
            'is_phishing': is_phishing,
            'confidence': confidence,
            'score': suspicious_score,
            'reasons': reasons,
            'urls_checked': len(all_urls),
            'phishing_urls': phishing_urls_found
        }

# Initialize detector
detector = PhishingDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'phishing_urls_loaded': len(detector.phishing_urls),
        'last_update': detector.last_update.isoformat() if detector.last_update else None
    })

@app.route('/check-email', methods=['POST'])
def check_email():
    """Check if email is phishing"""
    try:
        email_data = request.json
        
        if not email_data:
            return jsonify({'error': 'No email data provided'}), 400
        
        # Analyze email
        result = detector.analyze_email_content(email_data)
        
        return jsonify({
            'success': True,
            'is_phishing': result['is_phishing'],
            'confidence': result['confidence'],
            'score': result['score'],
            'reasons': result['reasons'],
            'urls_checked': result['urls_checked'],
            'phishing_urls': result['phishing_urls'],
            'recommendation': 'spam' if result['is_phishing'] else 'inbox'
        })
        
    except Exception as e:
        print(f"Error checking email: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'is_phishing': False,
            'recommendation': 'inbox'  # Default to inbox on error
        }), 500

@app.route('/refresh-data', methods=['POST'])
def refresh_data():
    """Manually refresh PhishTank data"""
    try:
        # Delete cache to force refresh
        if os.path.exists(PHISHTANK_CACHE_FILE):
            os.remove(PHISHTANK_CACHE_FILE)
        
        detector.load_phishtank_data()
        
        return jsonify({
            'success': True,
            'message': 'PhishTank data refreshed',
            'urls_loaded': len(detector.phishing_urls)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Phishing Detection Service...")
    print(f"📊 PhishTank URLs loaded: {len(detector.phishing_urls)}")
    app.run(host='0.0.0.0', port=5000, debug=False)
