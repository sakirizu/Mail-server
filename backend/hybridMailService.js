const MongoMailService = require('./mongoMailService');

class HybridMailService {
  constructor(mysqlDb) {
    this.mongoService = new MongoMailService();
    this.mysqlDb = mysqlDb;
    this.useMySQL = false;
  }

  async initialize() {
    try {
      // Try to connect to MongoDB first
      const mongoConnected = await this.mongoService.connect();
      
      if (mongoConnected) {
        // Test if we can write to MongoDB
        const testResult = await this.mongoService.createMail({
          from: 'test@system.com',
          to: ['test@system.com'],
          subject: 'Connection Test',
          body: 'Testing MongoDB write access',
          date: new Date(),
          isDeleted: true // Mark for immediate deletion
        });

        if (testResult.success) {
          // Delete the test mail
          await this.mongoService.deleteMail(testResult.mailId, 'test@system.com', true);
          console.log('✅ MongoDB write access confirmed - using MongoDB for mails');
          this.useMySQL = false;
        } else {
          console.log('⚠️  MongoDB read-only - switching to MySQL for mails');
          this.useMySQL = true;
          await this.initializeMySQL();
        }
      } else {
        console.log('❌ MongoDB unavailable - using MySQL for mails');
        this.useMySQL = true;
        await this.initializeMySQL();
      }

      return true;
    } catch (error) {
      console.error('Error initializing mail service:', error);
      this.useMySQL = true;
      await this.initializeMySQL();
      return false;
    }
  }

  async initializeMySQL() {
    try {
      // Create mail tables in MySQL
      const schema = require('fs').readFileSync('./mail_schema_mysql.sql', 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.mysqlDb.query(statement);
        }
      }
      
      console.log('📊 MySQL mail tables initialized');
    } catch (error) {
      console.error('Error initializing MySQL mail schema:', error);
    }
  }

  async createMail(mailData) {
    if (this.useMySQL) {
      return await this.createMailMySQL(mailData);
    } else {
      return await this.mongoService.createMail(mailData);
    }
  }

  async createMailMySQL(mailData) {
    try {
      const {
        from, to, cc = [], bcc = [], subject = '', body = '',
        date, isRead = false, isStarred = false, isDeleted = false,
        isSpam = false, isDraft = false, hasAttachments = false,
        attachments = [], labels = [], priority = 'normal',
        messageId, inReplyTo, threadId
      } = mailData;

      // Ensure body is always a string for MySQL
      const mailBody = body || '';

      const [result] = await this.mysqlDb.query(
        `INSERT INTO mails (
          from_email, to_emails, cc_emails, bcc_emails, subject, body, date,
          is_read, is_starred, is_deleted, is_spam, is_draft, has_attachments,
          attachments, labels, priority, message_id, in_reply_to, thread_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          from, JSON.stringify(to), JSON.stringify(cc), JSON.stringify(bcc),
          subject, mailBody, date, isRead, isStarred, isDeleted, isSpam, isDraft,
          hasAttachments, JSON.stringify(attachments), JSON.stringify(labels),
          priority, messageId, inReplyTo, threadId
        ]
      );

      return { success: true, mailId: result.insertId };
    } catch (error) {
      console.error('Error creating mail in MySQL:', error);
      return { success: false, error: error.message };
    }
  }

  async getMailsByUser(userEmail, options = {}) {
    if (this.useMySQL) {
      return await this.getMailsByUserMySQL(userEmail, options);
    } else {
      return await this.mongoService.getMailsByUser(userEmail, options);
    }
  }

  async getMailsByUserMySQL(userEmail, options = {}) {
    try {
      const {
        folder = 'inbox',
        limit = 50,
        skip = 0,
        sortBy = 'date',
        sortOrder = -1,
        search = null
      } = options;

      let whereClause = '';
      let params = [];

      // Folder-based filtering
      switch (folder) {
        case 'inbox':
          whereClause = `JSON_CONTAINS(to_emails, ?) AND is_deleted = FALSE AND is_spam = FALSE AND is_draft = FALSE`;
          params.push(JSON.stringify(userEmail));
          break;
        case 'sent':
          whereClause = `from_email = ? AND is_deleted = FALSE AND is_draft = FALSE`;
          params.push(userEmail);
          break;
        case 'drafts':
          whereClause = `from_email = ? AND is_draft = TRUE AND is_deleted = FALSE`;
          params.push(userEmail);
          break;
        case 'spam':
          whereClause = `JSON_CONTAINS(to_emails, ?) AND is_spam = TRUE AND is_deleted = FALSE`;
          params.push(JSON.stringify(userEmail));
          break;
        case 'trash':
          whereClause = `(JSON_CONTAINS(to_emails, ?) OR from_email = ?) AND is_deleted = TRUE`;
          params.push(JSON.stringify(userEmail), userEmail);
          break;
      }

      // Search functionality
      if (search) {
        whereClause += ` AND (MATCH(subject, body) AGAINST(?) OR from_email LIKE ?)`;
        params.push(search, `%${search}%`);
      }

      const orderDirection = sortOrder === -1 ? 'DESC' : 'ASC';
      const query = `
        SELECT * FROM mails 
        WHERE ${whereClause} 
        ORDER BY ${sortBy} ${orderDirection} 
        LIMIT ? OFFSET ?
      `;
      params.push(limit, skip);

      const [mails] = await this.mysqlDb.query(query, params);

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM mails WHERE ${whereClause}`;
      const [countResult] = await this.mysqlDb.query(countQuery, params.slice(0, -2));
      const totalCount = countResult[0].count;

      // Parse JSON fields and normalize
      const parsedMails = mails.map(mail => ({
        ...mail,
        _id: mail.id,
        to: JSON.parse(mail.to_emails),
        cc: JSON.parse(mail.cc_emails || '[]'),
        bcc: JSON.parse(mail.bcc_emails || '[]'),
        attachments: JSON.parse(mail.attachments || '[]'),
        labels: JSON.parse(mail.labels || '[]'),
        read_status: Boolean(mail.is_read),
        sender: mail.from_email,
        recipient: JSON.parse(mail.to_emails)[0],
        created_at: mail.created_at || mail.date
      }));

      return {
        success: true,
        mails: parsedMails,
        totalCount,
        hasMore: (skip + limit) < totalCount
      };
    } catch (error) {
      console.error('Error getting mails from MySQL:', error);
      return { success: false, error: error.message };
    }
  }

  async getMailById(mailId, userEmail) {
    if (this.useMySQL) {
      return await this.getMailByIdMySQL(mailId, userEmail);
    } else {
      return await this.mongoService.getMailById(mailId, userEmail);
    }
  }

  async getMailByIdMySQL(mailId, userEmail) {
    try {
      const [mails] = await this.mysqlDb.query(
        `SELECT * FROM mails 
         WHERE id = ? AND (JSON_CONTAINS(to_emails, ?) OR from_email = ?)`,
        [mailId, JSON.stringify(userEmail), userEmail]
      );

      if (mails.length === 0) {
        return { success: false, error: 'Mail not found' };
      }

      const mail = mails[0];
      const parsedMail = {
        ...mail,
        _id: mail.id,
        to: JSON.parse(mail.to_emails),
        cc: JSON.parse(mail.cc_emails || '[]'),
        bcc: JSON.parse(mail.bcc_emails || '[]'),
        attachments: JSON.parse(mail.attachments || '[]'),
        labels: JSON.parse(mail.labels || '[]')
      };

      return { success: true, mail: parsedMail };
    } catch (error) {
      console.error('Error getting mail by ID from MySQL:', error);
      return { success: false, error: error.message };
    }
  }

  // Delegate other methods to appropriate service
  async updateMail(mailId, updateData, userEmail) {
    if (this.useMySQL) {
      // Implement MySQL update
      return { success: false, error: 'MySQL update not implemented yet' };
    } else {
      return await this.mongoService.updateMail(mailId, updateData, userEmail);
    }
  }

  async deleteMail(mailId, userEmail, permanent = false) {
    if (this.useMySQL) {
      // Implement MySQL delete
      return { success: false, error: 'MySQL delete not implemented yet' };
    } else {
      return await this.mongoService.deleteMail(mailId, userEmail, permanent);
    }
  }

  async searchMails(userEmail, searchQuery, options = {}) {
    if (this.useMySQL) {
      // Use MySQL fulltext search
      return await this.getMailsByUserMySQL(userEmail, { ...options, search: searchQuery });
    } else {
      return await this.mongoService.searchMails(userEmail, searchQuery, options);
    }
  }

  async getMailStatistics(userEmail, dateRange = 30) {
    if (this.useMySQL) {
      return await this.getMailStatisticsMySQL(userEmail, dateRange);
    } else {
      return await this.mongoService.getMailStatistics(userEmail, dateRange);
    }
  }

  async getMailStatisticsMySQL(userEmail, dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Count unread emails only in inbox folder
      const [unreadResult] = await this.mysqlDb.query(
        `SELECT COUNT(*) as unread_count FROM mails 
         WHERE JSON_CONTAINS(to_emails, ?) 
         AND folder = 'inbox' 
         AND is_read = 0 
         AND is_deleted = 0`,
        [JSON.stringify(userEmail)]
      );

      // Other statistics
      const [receivedResult] = await this.mysqlDb.query(
        `SELECT COUNT(*) as received_count FROM mails 
         WHERE JSON_CONTAINS(to_emails, ?) 
         AND is_deleted = 0 
         AND is_draft = 0`,
        [JSON.stringify(userEmail)]
      );

      const [sentResult] = await this.mysqlDb.query(
        `SELECT COUNT(*) as sent_count FROM mails 
         WHERE from_email = ? 
         AND is_deleted = 0 
         AND is_draft = 0`,
        [userEmail]
      );

      const [draftsResult] = await this.mysqlDb.query(
        `SELECT COUNT(*) as drafts_count FROM mails 
         WHERE from_email = ? 
         AND is_draft = 1 
         AND is_deleted = 0`,
        [userEmail]
      );

      return {
        success: true,
        statistics: {
          daily: [], // Could implement daily stats if needed
          totals: {
            received: receivedResult[0].received_count,
            sent: sentResult[0].sent_count,
            drafts: draftsResult[0].drafts_count
          },
          unread_count: unreadResult[0].unread_count
        }
      };
    } catch (error) {
      console.error('❌ MySQL statistics error:', error);
      return { 
        success: false, 
        error: 'Failed to get statistics from MySQL' 
      };
    }
  }

  async markAsRead(mailId, userEmail) {
    if (this.useMySQL) {
      return await this.markAsReadMySQL(mailId, userEmail);
    } else {
      return await this.mongoService.markAsRead(mailId, userEmail);
    }
  }

  async markAsReadMySQL(mailId, userEmail) {
    try {
      const [result] = await this.mysqlDb.query(
        `UPDATE mails SET is_read = 1, read_at = NOW() 
         WHERE id = ? AND (JSON_CONTAINS(to_emails, ?) OR from_email = ?)`,
        [mailId, JSON.stringify(userEmail), userEmail]
      );

      return {
        success: result.affectedRows > 0,
        error: result.affectedRows === 0 ? 'Email not found or access denied' : null
      };
    } catch (error) {
      console.error('❌ MySQL mark as read error:', error);
      return { 
        success: false, 
        error: 'Failed to mark email as read in MySQL' 
      };
    }
  }
}

module.exports = HybridMailService;