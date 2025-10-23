const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');

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

  // Initialize SMTP configuration
  async initializeSMTP() {
    try {
      console.log('📧 MailService initialized with MySQL and SMTP configuration');
      
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

  // Save email to MySQL or in-memory
  async saveEmailToDB(from, to, subject, text, html, folder = 'sent', threadId = null) {
    try {
      if (this.useInMemoryStorage) {
        // In-memory storage fallback
        const email = {
          id: this.emailCounter++,
          sender: from,
          recipient: to,
          subject: subject,
          body: text,
          html_body: html,
          folder: folder,
          read_status: folder === 'inbox' ? false : true,
          thread_id: threadId || this.generateThreadId(subject),
          created_at: new Date(),
          is_starred: false,
          priority: 'normal'
        };
        
        this.inMemoryEmails.push(email);
        console.log(`💾 Email saved to memory: ID ${email.id}`);
        return email.id;
      } else {
        // MySQL storage
        const [result] = await this.db.query(`
          INSERT INTO emails (
            sender, recipient, subject, body, html_body, folder, 
            read_status, thread_id, priority
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          from, to, subject, text, html, folder,
          folder === 'inbox' ? false : true,
          threadId || this.generateThreadId(subject),
          'normal'
        ]);
        
        console.log(`💾 Email saved to MySQL: ID ${result.insertId}`);
        return result.insertId;
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
        // MySQL storage
        let whereClause = '';
        let params = [];
        
        if (folder === 'inbox') {
          whereClause = 'WHERE recipient = ? AND folder = ?';
          params = [userEmail, folder];
        } else if (folder === 'sent') {
          whereClause = 'WHERE sender = ? AND folder = ?';
          params = [userEmail, folder];
        } else {
          whereClause = 'WHERE (sender = ? OR recipient = ?) AND folder = ?';
          params = [userEmail, userEmail, folder];
        }

        const [emails] = await this.db.query(`
          SELECT id, sender, recipient, subject, 
                 LEFT(body, 100) as snippet, 
                 read_status, is_starred, created_at, thread_id
          FROM emails 
          ${whereClause}
          ORDER BY created_at DESC 
          LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // Get total count
        const [countResult] = await this.db.query(`
          SELECT COUNT(*) as total 
          FROM emails 
          ${whereClause}
        `, params);

        return {
          emails,
          total: countResult[0].total,
          page,
          pages: Math.ceil(countResult[0].total / limit)
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
          e.id === parseInt(emailId) && 
          (e.sender === userEmail || e.recipient === userEmail)
        );
        if (!email) throw new Error('Email not found');
        return email;
      } else {
        const [rows] = await this.db.query(`
          SELECT * FROM emails 
          WHERE id = ? AND (sender = ? OR recipient = ?)
        `, [emailId, userEmail, userEmail]);

        if (rows.length === 0) {
          throw new Error('Email not found or access denied');
        }

        return rows[0];
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
          e.id === parseInt(emailId) && e.recipient === userEmail
        );
        if (email) email.read_status = true;
      } else {
        await this.db.query(`
          UPDATE emails 
          SET read_status = true 
          WHERE id = ? AND recipient = ?
        `, [emailId, userEmail]);
      }
    } catch (error) {
      console.error('❌ Mark as read error:', error);
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
        const [stats] = await this.db.query(`
          SELECT 
            COUNT(CASE WHEN folder = 'inbox' AND recipient = ? THEN 1 END) as inbox_count,
            COUNT(CASE WHEN folder = 'sent' AND sender = ? THEN 1 END) as sent_count,
            COUNT(CASE WHEN folder = 'drafts' AND sender = ? THEN 1 END) as drafts_count,
            COUNT(CASE WHEN folder = 'spam' AND recipient = ? THEN 1 END) as spam_count,
            COUNT(CASE WHEN read_status = false AND recipient = ? THEN 1 END) as unread_count
          FROM emails
        `, [userEmail, userEmail, userEmail, userEmail, userEmail]);

        return stats[0];
      }
    } catch (error) {
      console.error('❌ Get stats error:', error);
      throw error;
    }
  }
}

module.exports = MailService;