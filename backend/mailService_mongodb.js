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
    
    this.connectMongoDB();
    this.initializeSMTP();
  }

  // Connect to MongoDB
  async connectMongoDB() {
    try {
      console.log('📧 MailService initialized with MongoDB and SMTP configuration');
      await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/stormysecuritynosql');
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('💡 Using in-memory storage as fallback');
      this.useInMemoryStorage = true;
    }
  }

  // Initialize SMTP configuration
  async initializeSMTP() {
    try {
      // Try MailHog first
      this.smtpTransporter = nodemailer.createTransporter({
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
      console.log('❌ SMTP connection test failed:', error.message);
      console.log('⚠️  MailHog not available, using Ethereal Email fallback');
      
      // Fallback to Ethereal Email
      try {
        const testAccount = await nodemailer.createTestAccount();
        
        this.smtpTransporter = nodemailer.createTransporter({
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

  // Test SMTP connection
  async testConnection() {
    try {
      if (this.smtpTransporter) {
        await this.smtpTransporter.verify();
        return true;
      }
      return false;
    } catch (error) {
      console.error('SMTP test failed:', error.message);
      return false;
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
    const cleanSubject = subject.replace(/^(Re:|Fwd?:|AW:|SV:)\\s*/i, '').trim();
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
      
      // Save to recipient's inbox (if internal @ssm.com email)
      if (to.includes('@ssm.com')) {
        await this.saveEmailToDB(from, to, subject, text, html, 'inbox', threadId);
        console.log(`📥 Email also saved to recipient's inbox: ${to}`);
      }
      
      return sendResult;
    } catch (error) {
      console.error('❌ Send and save error:', error);
      throw error;
    }
  }

  // Get emails by folder
  async getEmailsByFolder(userEmail, folder = 'inbox', page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      if (this.useInMemoryStorage) {
        // In-memory storage
        const filtered = this.inMemoryEmails.filter(email => {
          if (folder === 'inbox') return email.recipient === userEmail && email.folder === 'inbox';
          if (folder === 'sent') return email.sender === userEmail && email.folder === 'sent';
          return (email.sender === userEmail || email.recipient === userEmail) && email.folder === folder;
        });
        
        const paginated = filtered.slice(offset, offset + limit);
        return {
          emails: paginated,
          total: filtered.length,
          page: page,
          pages: Math.ceil(filtered.length / limit)
        };
      } else {
        // MongoDB storage
        let filter = {};
        
        if (folder === 'inbox') {
          filter = { recipient: userEmail, folder: 'inbox' };
        } else if (folder === 'sent') {
          filter = { sender: userEmail, folder: 'sent' };
        } else {
          filter = {
            $and: [
              { $or: [{ sender: userEmail }, { recipient: userEmail }] },
              { folder: folder }
            ]
          };
        }

        const emails = await Email.find(filter)
          .select('sender recipient subject body read_status is_starred sent_at thread_id')
          .sort({ sent_at: -1 })
          .skip(offset)
          .limit(limit)
          .lean();

        const total = await Email.countDocuments(filter);

        return {
          emails: emails.map(email => ({
            ...email,
            snippet: email.body ? email.body.substring(0, 100) : '',
            created_at: email.sent_at
          })),
          total,
          page,
          pages: Math.ceil(total / limit)
        };
      }
    } catch (error) {
      console.error('❌ Get emails error:', error);
      throw error;
    }
  }

  // Get single email by ID
  async getEmailById(emailId, userEmail) {
    try {
      if (this.useInMemoryStorage) {
        const email = this.inMemoryEmails.find(e => 
          e._id === parseInt(emailId) && 
          (e.sender === userEmail || e.recipient === userEmail)
        );
        if (!email) throw new Error('Email not found');
        return email;
      } else {
        const email = await Email.findOne({
          _id: emailId,
          $or: [{ sender: userEmail }, { recipient: userEmail }]
        }).lean();

        if (!email) {
          throw new Error('Email not found or access denied');
        }

        return email;
      }
    } catch (error) {
      console.error('❌ Get email error:', error);
      throw error;
    }
  }

  // Mark email as read
  async markAsRead(emailId, userEmail) {
    try {
      if (this.useInMemoryStorage) {
        const email = this.inMemoryEmails.find(e => 
          e._id === parseInt(emailId) && e.recipient === userEmail
        );
        if (email) email.read_status = true;
      } else {
        await Email.updateOne(
          { _id: emailId, recipient: userEmail },
          { read_status: true }
        );
      }
    } catch (error) {
      console.error('❌ Mark as read error:', error);
      throw error;
    }
  }

  // Search emails
  async searchEmails(userEmail, query, folder = null) {
    try {
      if (this.useInMemoryStorage) {
        let filtered = this.inMemoryEmails.filter(email => 
          (email.sender === userEmail || email.recipient === userEmail) &&
          (email.subject.toLowerCase().includes(query.toLowerCase()) ||
           email.body.toLowerCase().includes(query.toLowerCase()))
        );
        
        if (folder) {
          filtered = filtered.filter(email => email.folder === folder);
        }
        
        return filtered;
      } else {
        let filter = {
          $and: [
            { $or: [{ sender: userEmail }, { recipient: userEmail }] },
            {
              $or: [
                { subject: { $regex: query, $options: 'i' } },
                { body: { $regex: query, $options: 'i' } }
              ]
            }
          ]
        };
        
        if (folder) {
          filter.$and.push({ folder: folder });
        }

        const emails = await Email.find(filter)
          .select('sender recipient subject body read_status is_starred sent_at')
          .sort({ sent_at: -1 })
          .limit(50)
          .lean();

        return emails.map(email => ({
          ...email,
          snippet: email.body ? email.body.substring(0, 100) : '',
          created_at: email.sent_at
        }));
      }
    } catch (error) {
      console.error('❌ Search emails error:', error);
      throw error;
    }
  }

  // Get email statistics
  async getEmailStats(userEmail) {
    try {
      if (this.useInMemoryStorage) {
        const userEmails = this.inMemoryEmails.filter(e => 
          e.sender === userEmail || e.recipient === userEmail
        );
        
        return {
          inbox_count: userEmails.filter(e => e.recipient === userEmail && e.folder === 'inbox').length,
          sent_count: userEmails.filter(e => e.sender === userEmail && e.folder === 'sent').length,
          drafts_count: userEmails.filter(e => e.sender === userEmail && e.folder === 'drafts').length,
          spam_count: userEmails.filter(e => e.recipient === userEmail && e.folder === 'spam').length,
          unread_count: userEmails.filter(e => e.recipient === userEmail && !e.read_status).length
        };
      } else {
        const [inboxCount, sentCount, draftsCount, spamCount, unreadCount] = await Promise.all([
          Email.countDocuments({ recipient: userEmail, folder: 'inbox' }),
          Email.countDocuments({ sender: userEmail, folder: 'sent' }),
          Email.countDocuments({ sender: userEmail, folder: 'drafts' }),
          Email.countDocuments({ recipient: userEmail, folder: 'spam' }),
          Email.countDocuments({ recipient: userEmail, read_status: false })
        ]);

        return {
          inbox_count: inboxCount,
          sent_count: sentCount,
          drafts_count: draftsCount,
          spam_count: spamCount,
          unread_count: unreadCount
        };
      }
    } catch (error) {
      console.error('❌ Get stats error:', error);
      throw error;
    }
  }

  // Move email to folder
  async moveToFolder(emailId, userEmail, folder) {
    try {
      if (this.useInMemoryStorage) {
        const email = this.inMemoryEmails.find(e => 
          e._id === parseInt(emailId) && 
          (e.sender === userEmail || e.recipient === userEmail)
        );
        if (email) email.folder = folder;
      } else {
        await Email.updateOne(
          { 
            _id: emailId, 
            $or: [{ sender: userEmail }, { recipient: userEmail }] 
          },
          { folder: folder }
        );
      }
    } catch (error) {
      console.error('❌ Move to folder error:', error);
      throw error;
    }
  }

  // Toggle star
  async toggleStar(emailId, userEmail) {
    try {
      if (this.useInMemoryStorage) {
        const email = this.inMemoryEmails.find(e => 
          e._id === parseInt(emailId) && 
          (e.sender === userEmail || e.recipient === userEmail)
        );
        if (email) {
          email.is_starred = !email.is_starred;
          return email.is_starred;
        }
      } else {
        const email = await Email.findOne({
          _id: emailId,
          $or: [{ sender: userEmail }, { recipient: userEmail }]
        });
        
        if (email) {
          email.is_starred = !email.is_starred;
          await email.save();
          return email.is_starred;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Toggle star error:', error);
      throw error;
    }
  }
}

module.exports = MailService;