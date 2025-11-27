import requests
import json
import gzip
import time
from datetime import datetime

print("=" * 60)
print("PhishTank Data Downloader")
print("=" * 60)
print()

# Try different URLs
urls = [
    ("JSON (plain)", "http://data.phishtank.com/data/online-valid.json"),
    ("JSON (gzip)", "http://data.phishtank.com/data/online-valid.json.gz"),
]

data = None
success = False

for name, url in urls:
    print(f"Trying {name}...")
    print(f"URL: {url}")
    
    try:
        headers = {
            'User-Agent': 'SSMail-PhishingDetector/1.0 (Educational Purpose)'
        }
        
        print("Downloading... (this may take a minute)")
        response = requests.get(url, headers=headers, timeout=60)
        
        if response.status_code == 200:
            print(f"✅ Download successful! ({len(response.content)} bytes)")
            
            # Parse based on URL type
            if url.endswith('.gz'):
                print("Decompressing gzip...")
                content = gzip.decompress(response.content)
                data = json.loads(content)
            else:
                data = response.json()
            
            print(f"✅ Parsed {len(data)} entries")
            success = True
            break
            
        elif response.status_code == 429:
            print(f"⚠️  Rate limited (429). Waiting 60 seconds...")
            time.sleep(60)
            continue
            
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            continue
            
    except requests.exceptions.Timeout:
        print(f"❌ Timeout - server took too long to respond")
        continue
    except Exception as e:
        print(f"❌ Error: {e}")
        continue
    
    print()

if success and data:
    print()
    print("=" * 60)
    print("Processing data...")
    
    # Extract URLs
    urls_list = []
    for entry in data:
        if 'url' in entry:
            urls_list.append(entry['url'].lower().strip())
    
    print(f"✅ Extracted {len(urls_list)} phishing URLs")
    
    # Save to cache
    cache_data = {
        'timestamp': datetime.now().isoformat(),
        'urls': urls_list
    }
    
    with open('phishtank_cache.json', 'w') as f:
        json.dump(cache_data, f, indent=2)
    
    print(f"✅ Saved to phishtank_cache.json")
    print()
    print("=" * 60)
    print(f"SUCCESS! {len(urls_list)} phishing URLs ready to use")
    print("=" * 60)
    
else:
    print()
    print("=" * 60)
    print("❌ FAILED to download PhishTank data")
    print()
    print("Possible reasons:")
    print("  1. Rate limit (try again in 1 hour)")
    print("  2. Network connection issue")
    print("  3. PhishTank server is down")
    print()
    print("Using existing cache or manual URLs for now")
    print("=" * 60)
