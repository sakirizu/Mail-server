# SSMail Backend - Phishing Detection Integration

## Overview

This backend integrates AI-powered phishing detection using PhishTank database.

## Mail Flow with Phishing Detection

```
1. Sender composes email
   ↓
2. Email saved to database (sent folder for sender)
   ↓
3. Before delivery to recipient:
   → Python AI checks email for phishing
   → Checks URLs against PhishTank database (120,000+ known phishing URLs)
   → Analyzes suspicious keywords and patterns
   → Calculates confidence score
   ↓
4. Decision:
   ├─ If phishing detected → Delivered to SPAM folder
   └─ If safe → Delivered to INBOX folder
```

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- MongoDB running on localhost:27017
- MySQL running on localhost:3306

### Installation

1. **Start all services automatically:**
   ```bash
   cd backend
   start-all-services.bat
   ```

   This will:
   - Install Python dependencies
   - Install Node.js dependencies
   - Start Phishing Detection Service (port 5000)
   - Start Mail Server (port 3001)

2. **Or start services manually:**

   **Terminal 1 - Phishing Detection Service:**
   ```bash
   cd backend/phishing-detector
   pip install -r requirements.txt
   python phishing_detector.py
   ```

   **Terminal 2 - Mail Server:**
   ```bash
   cd backend
   npm install
   node server.js
   ```

## Configuration

### Environment Variables (.env)

```env
# Phishing Detection
PHISHING_DETECTOR_URL=http://localhost:5000
ENABLE_PHISHING_DETECTION=true

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=ssmail

# MongoDB
MONGO_URI=mongodb://localhost:27017/stormysecuritynosql

# JWT
JWT_SECRET=your-secret-key
```

### Disable Phishing Detection

If you want to temporarily disable phishing detection:

```env
ENABLE_PHISHING_DETECTION=false
```

Or in server.js:
```javascript
const ENABLE_PHISHING_DETECTION = false;
```

## API Integration

### Phishing Detection Endpoints

#### Check Email
```bash
POST http://localhost:5000/check-email
Content-Type: application/json

{
  "from": "sender@example.com",
  "subject": "Urgent: Verify your account",
  "body": "Click here: http://phishing-site.com"
}
```

Response:
```json
{
  "success": true,
  "is_phishing": true,
  "confidence": 95,
  "score": 12,
  "reasons": [
    "Known phishing URL found: http://phishing-site.com",
    "Suspicious keyword in subject: urgent",
    "Suspicious keyword in subject: verify"
  ],
  "urls_checked": 1,
  "phishing_urls": ["http://phishing-site.com"],
  "recommendation": "spam"
}
```

#### Health Check
```bash
GET http://localhost:5000/health
```

#### Refresh PhishTank Data
```bash
POST http://localhost:5000/refresh-data
```

## Phishing Detection Features

### URL Detection
- Checks against PhishTank database (120,000+ known phishing URLs)
- Extracts URLs from text and HTML content
- Detects suspicious URL patterns (IP addresses, URL shorteners)

### Content Analysis
- **Suspicious Keywords:** urgent, verify, suspend, confirm, account, security, password, etc.
- **Sender Analysis:** Checks for suspicious domain patterns
- **Scoring System:** Calculates confidence score (0-100%)

### Decision Criteria
- **Score ≥ 5 OR Known phishing URL found** → Mark as phishing → Deliver to SPAM
- **Score < 5 AND No known phishing URLs** → Mark as safe → Deliver to INBOX

## Database Schema Updates

Emails now include phishing detection metadata:

```javascript
{
  // ... existing fields ...
  isSpam: true/false,
  folder: 'inbox' or 'spam',
  labels: ['inbox'] or ['spam'],
  phishingScore: 0-100,
  phishingReasons: ["reason1", "reason2", ...]
}
```

## Monitoring

### Logs to Watch

**Mail Server (server.js):**
```
🔍 Checking email for phishing...
⚠️  PHISHING DETECTED (confidence: 95%)
   Reasons: Known phishing URL found, Suspicious keywords
   → Delivering to SPAM folder
```

**Phishing Detector (phishing_detector.py):**
```
✅ Loaded 120000 phishing URLs from cache
🚀 Starting Phishing Detection Service...
```

## Troubleshooting

### Phishing Detection Service Not Working

1. **Check if Python service is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Check logs:**
   - Python service logs in phishing-detector terminal
   - Node.js logs in server terminal

### PhishTank Data Not Loading

1. **Manual refresh:**
   ```bash
   curl -X POST http://localhost:5000/refresh-data
   ```

2. **Delete cache and restart:**
   ```bash
   cd phishing-detector
   del phishtank_cache.json
   python phishing_detector.py
   ```

### Emails Not Being Filtered

1. Check if `ENABLE_PHISHING_DETECTION=true` in .env
2. Verify Python service is responding
3. Check server.js logs for phishing check results

## Performance

- **PhishTank Data:** Cached for 24 hours
- **Cache Size:** ~15-20 MB (JSON format)
- **Check Speed:** < 100ms per email
- **Database:** 120,000+ phishing URLs

## Security Notes

- Phishing detection runs on localhost by default
- No external API calls during email checking (uses cached data)
- PhishTank data updates automatically every 24 hours
- Failed phishing checks default to "safe" (deliver to inbox)

## Testing

### Test Phishing Detection

Send an email with known phishing URL:
```
Subject: Urgent Account Verification
Body: Please verify your account: http://phishing-example.com
```

Expected: Email delivered to SPAM folder

### Test Normal Email

Send a regular email:
```
Subject: Hello
Body: Just saying hi!
```

Expected: Email delivered to INBOX folder
