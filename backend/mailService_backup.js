const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Email Schema for MongoDB
const emailSchema = new mongoose.Schema({
  sender: { type: String, required: true, index: true },
  recipient: { type: String, required: true, index: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  html_body: { type: String },
  sent_at: { type: Date, default: Date.now, index: true },
  read_status: { type: Boolean, default: false },
  folder: { 
    type: String, 
    enum: ['inbox', 'sent', 'drafts', 'spam', 'trash'], 
    default: 'inbox',
    index: true
  },
  attachments: [{ 
    filename: String,
    contentType: String,
    size: Number,
    data: Buffer
  }],
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high'], 
    default: 'normal' 
  },
  is_starred: { type: Boolean, default: false },
  thread_id: { type: String },
  labels: [String]
}, {
  timestamps: true
});

// Indexes for better performance
emailSchema.index({ recipient: 1, folder: 1 });
emailSchema.index({ sender: 1, folder: 1 });
emailSchema.index({ sent_at: -1 });

const Email = mongoose.model('Email', emailSchema);

class MailService {
  constructor() {
    this.useInMemoryStorage = false;
    this.inMemoryEmails = [];
    this.emailCounter = 1;
    this.smtpProvider = null;
    this.etherealUser = null;
    
    // MySQL database connection
    this.db = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    
    this.initializeDatabase();
    this.initializeSMTP();
  }

  // Initialize MySQL database tables
  async initializeDatabase() {
    try {
      // Test MySQL connection
      await this.db.query('SELECT 1');
      console.log('✅ MySQL database connected successfully');
      
      // Create emails table if not exists
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS emails (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender VARCHAR(255) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          subject VARCHAR(500) NOT NULL,
          body TEXT,
          html_body TEXT,
          folder ENUM('inbox', 'sent', 'drafts', 'spam', 'trash') DEFAULT 'inbox',
          read_status BOOLEAN DEFAULT FALSE,
          is_starred BOOLEAN DEFAULT FALSE,
          priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
          thread_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_recipient_folder (recipient, folder),
          INDEX idx_sender_folder (sender, folder),
          INDEX idx_thread (thread_id),
          INDEX idx_created (created_at)
        )
      `);
      
      console.log('✅ Email tables initialized');
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      console.log('💡 Using in-memory storage as fallback');
      this.useInMemoryStorage = true;
    }
  }
    
    // Initialize connections
    this.connectMongoDB();
    this.initializeSMTP();
    
    console.log('📧 MailService initialized with MongoDB and SMTP configuration');
  }

  async connectMongoDB() {
    try {
      // MongoDB with authentication for Docker
      const mongoUrl = process.env.MONGODB_URL || 'mongodb://root:password123@localhost:27017/ssm_mail?authSource=admin';
      
      await mongoose.connect(mongoUrl);
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('💡 Using in-memory storage as fallback');
      
      // Use fallback in-memory storage
      this.useInMemoryStorage = true;
      this.inMemoryEmails = [];
    }
  }

  // Initialize SMTP with fallback
  async initializeSMTP() {
    try {
      // Try MailHog first
      this.smtpTransporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: false,
        tls: { rejectUnauthorized: false }
      });

      await this.smtpTransporter.verify();
      console.log('✅ MailHog SMTP connected successfully');
      this.smtpProvider = 'mailhog';
    } catch (error) {
      console.log('⚠️  MailHog not available, using Ethereal Email fallback');
      
      // Fallback to Ethereal Email
      try {
        const testAccount = await nodemailer.createTestAccount();
        
        this.smtpTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        this.smtpProvider = 'ethereal';
        this.etherealUser = testAccount.user;
        console.log('✅ Ethereal Email SMTP connected successfully');
        console.log(`📧 Test emails will be sent to: ${testAccount.user}`);
      } catch (etherealError) {
        console.error('❌ All SMTP options failed:', etherealError.message);
        this.smtpTransporter = null;
      }
    }
  }

  // Send email via SMTP
  async sendEmail(from, to, subject, text, html = null) {
    try {
      if (!this.smtpTransporter) {
        throw new Error('SMTP transporter not initialized');
      }

      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</div>`
      };

      console.log(`📧 Sending email from ${from} to ${to}: ${subject}`);
      
      const info = await this.smtpTransporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      let previewUrl = '';
      if (this.smtpProvider === 'mailhog') {
        previewUrl = 'http://localhost:8025';
      } else if (this.smtpProvider === 'ethereal') {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: previewUrl,
        provider: this.smtpProvider
      };
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  // Save email to MongoDB or in-memory
  async saveEmailToDB(from, to, subject, text, html, folder = 'sent', threadId = null) {
    try {
      if (this.useInMemoryStorage) {
        // In-memory storage fallback
        const email = {
          _id: this.emailCounter++,
          sender: from,
          recipient: to,
          subject: subject,
          body: text,
          html_body: html,
          folder: folder,
          read_status: folder === 'inbox' ? false : true,
          thread_id: threadId || this.generateThreadId(subject),
          sent_at: new Date(),
          is_starred: false,
          priority: 'normal'
        };
        
        this.inMemoryEmails.push(email);
        console.log(`💾 Email saved to memory: ID ${email._id}`);
        return email._id;
      } else {
        // MongoDB storage
        const email = new Email({
          sender: from,
          recipient: to,
          subject: subject,
          body: text,
          html_body: html,
          folder: folder,
          read_status: folder === 'inbox' ? false : true,
          thread_id: threadId || this.generateThreadId(subject)
        });
        
        const savedEmail = await email.save();
        console.log(`💾 Email saved to MongoDB: ID ${savedEmail._id}`);
        return savedEmail._id;
      }
    } catch (error) {
      console.error('❌ Save email error:', error);
      throw error;
    }
  }

  // Generate thread ID for email grouping
  generateThreadId(subject) {
    // Remove "Re:", "Fwd:" etc and create consistent thread ID
    const cleanSubject = subject.replace(/^(Re:|Fwd?:|AW:|SV:)\s*/i, '').trim();
    return Buffer.from(cleanSubject).toString('base64').substring(0, 16);
  }

  // Send and save email
  async sendAndSaveEmail(from, to, subject, text, html = null) {
    try {
      // Send email via SMTP
      const sendResult = await this.sendEmail(from, to, subject, text, html);
      
      const threadId = this.generateThreadId(subject);
      
      // Save to sender's sent folder
      await this.saveEmailToDB(from, to, subject, text, html, 'sent', threadId);
      
      // Save to recipient's inbox (if recipient exists in our system)
      await this.saveEmailToDB(from, to, subject, text, html, 'inbox', threadId);
      console.log(`📥 Email also saved to recipient's inbox: ${to}`);
      
      return sendResult;
    } catch (error) {
      console.error('❌ Send and save error:', error);
      throw error;
    }
  }

  // Get emails by folder for user
  async getEmailsByFolder(userEmail, folder = 'inbox', page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      let query;
      
      if (folder === 'sent') {
        query = { sender: userEmail, folder: folder };
      } else {
        query = { recipient: userEmail, folder: folder };
      }
      
      const emails = await Email.find(query)
        .sort({ sent_at: -1 })
        .skip(skip)
        .limit(limit)
        .select('-html_body -attachments') // Exclude large fields in list view
        .lean();
      
      const total = await Email.countDocuments(query);
      
      console.log(`📬 Retrieved ${emails.length}/${total} emails from ${folder} for ${userEmail}`);
      return {
        emails: emails,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_emails: total,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Get emails error:', error);
      throw error;
    }
  }

  // Get single email by ID
  async getEmailById(emailId, userEmail) {
    try {
      const email = await Email.findOne({
        _id: emailId,
        $or: [
          { sender: userEmail },
          { recipient: userEmail }
        ]
      }).lean();
      
      if (!email) {
        throw new Error('Email not found or access denied');
      }
      
      return email;
    } catch (error) {
      console.error('❌ Get email by ID error:', error);
      throw error;
    }
  }

  // Search emails
  async searchEmails(userEmail, query, folder = null) {
    try {
      const searchQuery = {
        $or: [
          { sender: userEmail },
          { recipient: userEmail }
        ],
        $and: [
          {
            $or: [
              { subject: { $regex: query, $options: 'i' } },
              { body: { $regex: query, $options: 'i' } },
              { sender: { $regex: query, $options: 'i' } },
              { recipient: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      };
      
      if (folder) {
        searchQuery.folder = folder;
      }
      
      const emails = await Email.find(searchQuery)
        .sort({ sent_at: -1 })
        .limit(50)
        .select('-html_body -attachments')
        .lean();
      
      console.log(`🔍 Found ${emails.length} emails matching "${query}" for ${userEmail}`);
      return emails;
    } catch (error) {
      console.error('❌ Search emails error:', error);
      throw error;
    }
  }

  // Mark email as read
  async markAsRead(emailId, userEmail) {
    try {
      const result = await Email.updateOne(
        { 
          _id: emailId, 
          recipient: userEmail 
        },
        { read_status: true }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Email ${emailId} marked as read for ${userEmail}`);
        return true;
      } else {
        throw new Error('Email not found or already read');
      }
    } catch (error) {
      console.error('❌ Mark as read error:', error);
      throw error;
    }
  }

  // Move email to folder
  async moveToFolder(emailId, userEmail, folder) {
    try {
      const result = await Email.updateOne(
        { 
          _id: emailId,
          $or: [
            { sender: userEmail },
            { recipient: userEmail }
          ]
        },
        { folder: folder }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`📁 Email ${emailId} moved to ${folder} for ${userEmail}`);
        return true;
      } else {
        throw new Error('Email not found or access denied');
      }
    } catch (error) {
      console.error('❌ Move to folder error:', error);
      throw error;
    }
  }

  // Star/unstar email
  async toggleStar(emailId, userEmail) {
    try {
      const email = await Email.findOne({
        _id: emailId,
        $or: [
          { sender: userEmail },
          { recipient: userEmail }
        ]
      });
      
      if (!email) {
        throw new Error('Email not found or access denied');
      }
      
      email.is_starred = !email.is_starred;
      await email.save();
      
      console.log(`⭐ Email ${emailId} ${email.is_starred ? 'starred' : 'unstarred'} for ${userEmail}`);
      return email.is_starred;
    } catch (error) {
      console.error('❌ Toggle star error:', error);
      throw error;
    }
  }

  // Delete email
  async deleteEmail(emailId, userEmail) {
    try {
      const result = await Email.deleteOne({
        _id: emailId,
        $or: [
          { sender: userEmail },
          { recipient: userEmail }
        ]
      });
      
      if (result.deletedCount > 0) {
        console.log(`🗑️ Email ${emailId} deleted for ${userEmail}`);
        return true;
      } else {
        throw new Error('Email not found or access denied');
      }
    } catch (error) {
      console.error('❌ Delete email error:', error);
      throw error;
    }
  }

  // Get email thread
  async getEmailThread(threadId, userEmail) {
    try {
      const emails = await Email.find({
        thread_id: threadId,
        $or: [
          { sender: userEmail },
          { recipient: userEmail }
        ]
      })
      .sort({ sent_at: 1 })
      .lean();
      
      console.log(`🧵 Retrieved ${emails.length} emails in thread ${threadId} for ${userEmail}`);
      return emails;
    } catch (error) {
      console.error('❌ Get email thread error:', error);
      throw error;
    }
  }

  // Test SMTP connection
  async testConnection() {
    try {
      if (!this.smtpTransporter) {
        console.log('❌ No SMTP transporter available');
        return false;
      }

      await this.smtpTransporter.verify();
      console.log(`✅ SMTP server connection successful (${this.smtpProvider})`);
      
      if (this.smtpProvider === 'ethereal') {
        console.log(`📧 Ethereal Email user: ${this.etherealUser}`);
        console.log('💡 All sent emails will be available at: https://ethereal.email');
      }
      
      return true;
    } catch (error) {
      console.error('❌ SMTP connection test failed:', error.message);
      return false;
    }
  }

  // Get email statistics
  async getEmailStats(userEmail) {
    try {
      const stats = await Email.aggregate([
        {
          $match: {
            $or: [
              { recipient: userEmail },
              { sender: userEmail }
            ]
          }
        },
        {
          $group: {
            _id: null,
            inbox_count: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$recipient', userEmail] }, { $eq: ['$folder', 'inbox'] }] },
                  1,
                  0
                ]
              }
            },
            unread_count: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$recipient', userEmail] }, 
                      { $eq: ['$folder', 'inbox'] },
                      { $eq: ['$read_status', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            sent_count: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$sender', userEmail] }, { $eq: ['$folder', 'sent'] }] },
                  1,
                  0
                ]
              }
            },
            spam_count: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$recipient', userEmail] }, { $eq: ['$folder', 'spam'] }] },
                  1,
                  0
                ]
              }
            },
            trash_count: {
              $sum: {
                $cond: [
                  { $eq: ['$folder', 'trash'] },
                  1,
                  0
                ]
              }
            },
            starred_count: {
              $sum: {
                $cond: [
                  { $eq: ['$is_starred', true] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      
      return stats[0] || {
        inbox_count: 0,
        unread_count: 0,
        sent_count: 0,
        spam_count: 0,
        trash_count: 0,
        starred_count: 0
      };
    } catch (error) {
      console.error('❌ Get email stats error:', error);
      throw error;
    }
  }

  // Create sample emails for testing
  async createSampleEmails(userEmail) {
    try {
      const sampleEmails = [
        {
          sender: 'admin@ssm.com',
          recipient: userEmail,
          subject: 'Welcome to SSM Mail! 🎉',
          body: 'Welcome to our secure email system. Your account has been successfully created and is ready to use.',
          folder: 'inbox',
          read_status: false
        },
        {
          sender: 'security@ssm.com',
          recipient: userEmail,
          subject: 'Security Notice: 2FA Enabled 🔐',
          body: 'Two-factor authentication has been successfully enabled for your account. Your emails are now more secure.',
          folder: 'inbox',
          read_status: false
        },
        {
          sender: userEmail,
          recipient: 'test@example.com',
          subject: 'Test Email from SSM Mail',
          body: 'This is a test email sent from the SSM Mail system to verify functionality.',
          folder: 'sent',
          read_status: true
        }
      ];

      for (const emailData of sampleEmails) {
        const email = new Email({
          ...emailData,
          thread_id: this.generateThreadId(emailData.subject),
          html_body: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${emailData.body.replace(/\n/g, '<br>')}</div>`
        });
        await email.save();
      }

      console.log(`✅ Created ${sampleEmails.length} sample emails for ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Create sample emails error:', error);
      throw error;
    }
  }
}

module.exports = MailService;