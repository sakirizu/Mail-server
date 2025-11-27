# Phishing Detection Service

AI-powered phishing email detection using PhishTank database.

## Features

- ✅ PhishTank database integration (120,000+ known phishing URLs)
- ✅ Real-time email analysis
- ✅ URL extraction from text and HTML
- ✅ Suspicious keyword detection
- ✅ Sender domain analysis
- ✅ Confidence scoring
- ✅ Auto-cache updates (24 hours)

## Installation

1. Install Python 3.8+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Start the service:
```bash
python phishing_detector.py
```

Or use the batch file:
```bash
start.bat
```

The service runs on `http://localhost:5000`

### API Endpoints

#### Check Email
```bash
POST /check-email
Content-Type: application/json

{
  "from": "sender@example.com",
  "subject": "Urgent: Verify your account",
  "body": "Click here: http://phishing-site.com"
}

Response:
{
  "success": true,
  "is_phishing": true,
  "confidence": 95,
  "score": 12,
  "reasons": ["Known phishing URL found", "Suspicious keywords"],
  "recommendation": "spam"
}
```

#### Health Check
```bash
GET /health

Response:
{
  "status": "healthy",
  "phishing_urls_loaded": 120000,
  "last_update": "2025-11-20T10:30:00"
}
```

#### Refresh Data
```bash
POST /refresh-data

Response:
{
  "success": true,
  "message": "PhishTank data refreshed",
  "urls_loaded": 120000
}
```

## Integration with Mail Server

The Node.js backend automatically checks emails through this service before delivery.

Flow:
1. Email received → Database
2. Python AI checks for phishing
3. If phishing → Spam folder
4. If safe → Inbox folder
