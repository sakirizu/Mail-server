// MongoDB initialization script for SSMail
// This script creates collections and indexes for mail data

db = db.getSiblingDB('ssmail_db');

// Create mail collection with indexes
db.createCollection('mails');

// Create indexes for better performance
db.mails.createIndex({ "to": 1 });
db.mails.createIndex({ "from": 1 });
db.mails.createIndex({ "date": -1 });
db.mails.createIndex({ "subject": "text", "body": "text" });
db.mails.createIndex({ "isDeleted": 1 });
db.mails.createIndex({ "isSpam": 1 });
db.mails.createIndex({ "isDraft": 1 });

// Create drafts collection
db.createCollection('drafts');
db.drafts.createIndex({ "userId": 1 });
db.drafts.createIndex({ "createdAt": -1 });

// Create attachments collection
db.createCollection('attachments');
db.attachments.createIndex({ "mailId": 1 });
db.attachments.createIndex({ "filename": 1 });

// Create mail_statistics collection
db.createCollection('mail_statistics');
db.mail_statistics.createIndex({ "userId": 1 });
db.mail_statistics.createIndex({ "date": -1 });

print("SSMail MongoDB collections and indexes created successfully!");

// Insert sample mail data for testing
db.mails.insertMany([
  {
    _id: ObjectId(),
    from: "test@ssm.com",
    to: ["admin@ssm.com"],
    cc: [],
    bcc: [],
    subject: "Welcome to SSMail!",
    body: "Bu sizning birinchi xabaringiz. SSMail ga xush kelibsiz!",
    date: new Date(),
    isRead: false,
    isStarred: false,
    isDeleted: false,
    isSpam: false,
    isDraft: false,
    hasAttachments: false,
    attachments: [],
    labels: ["inbox"],
    priority: "normal",
    messageId: "msg_" + new Date().getTime(),
    inReplyTo: null,
    threadId: "thread_" + new Date().getTime()
  },
  {
    _id: ObjectId(),
    from: "system@ssm.com",
    to: ["test@ssm.com"],
    cc: [],
    bcc: [],
    subject: "Account Security Notification",
    body: "Hisobingiz xavfsizligi uchun 2FA yoqildi.",
    date: new Date(Date.now() - 86400000), // Yesterday
    isRead: true,
    isStarred: false,
    isDeleted: false,
    isSpam: false,
    isDraft: false,
    hasAttachments: false,
    attachments: [],
    labels: ["inbox"],
    priority: "high",
    messageId: "msg_" + (new Date().getTime() - 1),
    inReplyTo: null,
    threadId: "thread_" + (new Date().getTime() - 1)
  }
]);

print("Sample mail data inserted successfully!");