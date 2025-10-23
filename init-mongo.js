// MongoDB initialization script
db = db.getSiblingDB('ssm_mail');

// Create users collection with index
db.createCollection('users');
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Create emails collection with indexes
db.createCollection('emails');
db.emails.createIndex({ "sender": 1, "folder": 1 });
db.emails.createIndex({ "recipient": 1, "folder": 1 });
db.emails.createIndex({ "sent_at": -1 });
db.emails.createIndex({ "read_status": 1 });
db.emails.createIndex({ "thread_id": 1 });

// Create sample admin user
db.users.insertOne({
  name: "SSM Admin",
  username: "admin",
  email: "admin@ssm.com",
  password: "$2a$10$dummy.hash.for.admin.user.password",
  created_at: new Date()
});

// Create sample emails
db.emails.insertMany([
  {
    sender: "system@ssm.com",
    recipient: "admin@ssm.com",
    subject: "Welcome to SSM Mail System! 🎉",
    body: "Welcome to the SSM Mail system. Your account has been successfully created and is ready to use. Enjoy secure email communication!",
    html_body: "<div style='font-family: Arial, sans-serif;'><h2>Welcome to SSM Mail! 🎉</h2><p>Your account is ready to use.</p></div>",
    sent_at: new Date(),
    read_status: false,
    folder: "inbox",
    priority: "normal",
    is_starred: false,
    thread_id: "welcome_thread_001"
  },
  {
    sender: "security@ssm.com", 
    recipient: "admin@ssm.com",
    subject: "Security Notice: MongoDB Database Connected 🔐",
    body: "Your SSM Mail system is now connected to MongoDB database. All emails will be securely stored and managed.",
    html_body: "<div style='font-family: Arial, sans-serif;'><h2>🔐 Security Notice</h2><p>MongoDB database connection established successfully.</p></div>",
    sent_at: new Date(),
    read_status: false,
    folder: "inbox", 
    priority: "high",
    is_starred: true,
    thread_id: "security_thread_001"
  }
]);

print("✅ SSM Mail database initialized successfully!");
print("📧 Sample emails created for admin@ssm.com");
print("🔐 Admin user created: admin@ssm.com");