# SSMail - Secure Simple Mail System

## Mail Server Features

### 📧 Complete Email Management
- **Send Emails**: Full email composition with TO, CC, BCC support
- **Receive Emails**: Real-time email reception and storage
- **Folders**: Inbox, Sent, Drafts, Spam organization
- **Threading**: Email conversation support
- **Attachments**: File attachment handling (ready for implementation)

### 🛡️ Security Features
- **Spam Detection**: Automatic spam filtering with keyword detection
- **Authentication**: JWT-based secure access
- **Session Tracking**: Device and location monitoring
- **Read Receipts**: Email read status tracking

### 🎯 Advanced Features
- **Real-time Statistics**: Email usage analytics
- **Search & Filter**: Advanced email search capabilities
- **Labels/Tags**: Gmail-like labeling system
- **Auto-Archive**: Automatic email archiving
- **Bulk Operations**: Mass email management

## Quick Start

### 1. Database Setup
```sql
-- Run the SQL schema
mysql -u root -p < backend/mailSchema.sql
```

### 2. Environment Configuration
```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Start Servers
```bash
# Start all servers (Auth + Mail)
npm run start-all

# Or start individually
npm run server        # Auth server (port 4000)
npm run mail-server    # Mail server (port 5000)
```

### 4. API Endpoints

#### Mail Server (Port 5000)
```
GET    /api/mail/inbox      - Get inbox emails
GET    /api/mail/sent       - Get sent emails
GET    /api/mail/drafts     - Get draft emails
GET    /api/mail/spam       - Get spam emails
GET    /api/mail/:id        - Get single email
POST   /api/mail/send       - Send new email
POST   /api/mail/draft      - Save draft
DELETE /api/mail/:id        - Delete email
PATCH  /api/mail/:id/star   - Star/unstar email
PATCH  /api/mail/:id/read   - Mark read/unread
PATCH  /api/mail/:id/spam   - Move to spam/inbox
GET    /api/mail/stats      - Get statistics
GET    /api/mail/health     - Health check
```

## API Usage Examples

### Send Email
```javascript
const emailData = {
  to: "recipient@example.com",
  subject: "Hello World",
  body: "This is a test email",
  cc: "cc@example.com",
  bcc: "bcc@example.com"
};

const response = await sendEmail(emailData);
```

### Get Statistics
```javascript
const stats = await fetchEmailStatistics();
console.log(stats.stats.totalReceived); // Total received emails
console.log(stats.stats.spamDetected);  // Spam emails caught
```

## Database Schema

### Core Tables
- `emails` - Main email storage
- `email_attachments` - File attachments
- `email_labels` - Custom labels/tags
- `user_preferences` - User settings
- `spam_training` - Spam detection data

### Security Tables
- `user_sessions` - Login tracking
- `email_filters` - Auto-filter rules

## Configuration

### Spam Detection
The system includes basic keyword-based spam detection. Keywords can be customized in the mail server code:

```javascript
const spamKeywords = ['spam', 'free money', 'click here', 'urgent', 'congratulations'];
```

### Email Storage
- Emails are stored in MySQL database
- Soft deletion (emails marked as deleted, not actually removed)
- Full-text search support (ready for implementation)

## Development

### Adding New Features
1. Update database schema in `mailSchema.sql`
2. Add API endpoints in `mailServer.js`
3. Add frontend service calls in `mailService.js`
4. Update UI components as needed

### Testing
```bash
# Health check
curl http://localhost:5000/api/mail/health

# Get stats (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/mail/stats
```

## Production Deployment

### Security Considerations
1. Change JWT_SECRET in production
2. Use HTTPS for all API calls
3. Implement rate limiting
4. Add input validation and sanitization
5. Use environment variables for sensitive data

### Performance Optimization
1. Add database indexes for large datasets
2. Implement email pagination
3. Use Redis for session storage
4. Add CDN for attachments

## Future Enhancements
- Real SMTP integration
- Email templates
- Advanced spam detection (ML-based)
- Email encryption
- Mobile push notifications
- Email scheduling
