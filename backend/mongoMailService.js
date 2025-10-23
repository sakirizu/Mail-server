const { MongoClient, ObjectId } = require('mongodb');

class MongoMailService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // MongoDB connection URLs with and without authentication
      const mongoUrls = [
        // Try without authentication first
        'mongodb://localhost:27017/stormysecuritynosql',
        'mongodb://127.0.0.1:27017/stormysecuritynosql',
        // Try with common default credentials
        'mongodb://admin:admin@localhost:27017/stormysecuritynosql?authSource=admin',
        'mongodb://root:root@localhost:27017/stormysecuritynosql?authSource=admin',
        'mongodb://user:password@localhost:27017/stormysecuritynosql?authSource=stormysecuritynosql',
        // Try local connections
        'mongodb://localhost:27017/',
        'mongodb://127.0.0.1:27017/'
      ];
      
      console.log('🔄 Attempting MongoDB connection...');
      
      for (const mongoUrl of mongoUrls) {
        try {
          console.log(`🔗 Trying: ${mongoUrl.replace(/\/\/.*@/, '//***:***@')}`);
          
          this.client = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 5000,
            maxPoolSize: 5
          });
          
          await this.client.connect();
          
          // Use stormysecuritynosql database
          this.db = this.client.db('stormysecuritynosql');
          this.isConnected = true;
          
          console.log('✅ MongoDB connected successfully');
          console.log(`📊 Database: stormysecuritynosql`);
          
          // Test the connection with simple database operation
          try {
            const result = await this.db.runCommand({ ping: 1 });
            console.log('🏓 MongoDB ping successful');
          } catch (pingError) {
            console.log('⚠️  Ping failed, but connection established');
          }
          
          // Create collections if they don't exist
          await this.initializeCollections();
          
          return true;
        } catch (error) {
          console.log(`❌ Failed: ${error.message}`);
          if (this.client) {
            await this.client.close().catch(() => {});
            this.client = null;
          }
        }
      }
      
      throw new Error('All MongoDB connection attempts failed');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async initializeCollections() {
    try {
      // Create mails collection with indexes
      let collections = [];
      let collectionNames = [];
      
      try {
        collections = await this.db.listCollections().toArray();
        collectionNames = collections.map(c => c.name);
      } catch (authError) {
        console.log('⚠️  Cannot list collections (auth required), creating collections anyway');
        collectionNames = []; // Assume collections don't exist
      }

      if (!collectionNames.includes('mails')) {
        try {
          await this.db.createCollection('mails');
          console.log('📧 Created mails collection');
        } catch (error) {
          console.log('📧 Mails collection might already exist');
        }
      }

      if (!collectionNames.includes('drafts')) {
        try {
          await this.db.createCollection('drafts');
          console.log('📝 Created drafts collection');
        } catch (error) {
          console.log('📝 Drafts collection might already exist');
        }
      }

      if (!collectionNames.includes('attachments')) {
        try {
          await this.db.createCollection('attachments');
          console.log('📎 Created attachments collection');
        } catch (error) {
          console.log('📎 Attachments collection might already exist');
        }
      }

      // Create indexes for better performance (ignore errors if auth required)
      try {
        await this.db.collection('mails').createIndex({ "to": 1 });
        await this.db.collection('mails').createIndex({ "from": 1 });
        await this.db.collection('mails').createIndex({ "date": -1 });
        await this.db.collection('mails').createIndex({ "subject": "text", "body": "text" });
        await this.db.collection('mails').createIndex({ "isDeleted": 1 });
        await this.db.collection('mails').createIndex({ "isSpam": 1 });
        await this.db.collection('mails').createIndex({ "isDraft": 1 });

        console.log('📚 Database indexes created successfully');
      } catch (indexError) {
        console.log('⚠️  Index creation skipped (might require auth)');
      }
      
      // Insert sample data if collection is empty
      try {
        const mailCount = await this.db.collection('mails').countDocuments();
        if (mailCount === 0) {
          await this.insertSampleData();
        } else {
          console.log(`📧 Found ${mailCount} existing mails`);
        }
      } catch (countError) {
        console.log('⚠️  Cannot access collection data (auth required)');
        console.log('💡 Skipping sample data insertion');
      }

    } catch (error) {
      console.error('Error initializing collections:', error.message);
    }
  }

  async insertSampleData() {
    try {
      const sampleMails = [
        {
          from: "welcome@ssm.com",
          to: ["test@ssm.com"],
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
          threadId: "thread_" + new Date().getTime(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          from: "system@ssm.com",
          to: ["test@ssm.com"],
          cc: [],
          bcc: [],
          subject: "Account Security Notification",
          body: "Hisobingiz xavfsizligi uchun 2FA yoqildi.",
          date: new Date(Date.now() - 86400000),
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
          threadId: "thread_" + (new Date().getTime() - 1),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await this.db.collection('mails').insertMany(sampleMails);
      console.log('✅ Sample mail data inserted successfully');
    } catch (error) {
      console.error('Error inserting sample data:', error);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('MongoDB disconnected');
    }
  }

  // Mail CRUD operations
  async createMail(mailData) {
    if (!this.isConnected) {
      return { success: false, error: 'MongoDB not connected' };
    }
    
    try {
      const now = new Date();
      const result = await this.db.collection('mails').insertOne({
        ...mailData,
        date: mailData.date || now, // Use provided date or current time
        created_at: now,
        createdAt: now,
        updatedAt: now
      });
      return { success: true, mailId: result.insertedId };
    } catch (error) {
      if (error.codeName === 'Unauthorized') {
        console.error('MongoDB auth required for write operations');
        return { success: false, error: 'Database write not authorized' };
      }
      console.error('Error creating mail:', error);
      return { success: false, error: error.message };
    }
  }

  async getMailsByUser(userEmail, options = {}) {
    try {
      const {
        folder = 'inbox',
        limit = 50,
        skip = 0,
        sortBy = 'date',
        sortOrder = -1,
        search = null
      } = options;

      let query = {};
      
      // Folder-based filtering
      switch (folder) {
        case 'inbox':
          query = { 
            to: { $in: [userEmail] },
            isDeleted: { $ne: true },
            isSpam: { $ne: true },
            isDraft: { $ne: true }
          };
          break;
        case 'sent':
          query = { 
            from: userEmail,
            isDeleted: { $ne: true },
            isDraft: { $ne: true }
          };
          break;
        case 'drafts':
          query = { 
            from: userEmail,
            isDraft: true,
            isDeleted: { $ne: true }
          };
          break;
        case 'spam':
          query = { 
            to: { $in: [userEmail] },
            isSpam: true,
            isDeleted: { $ne: true }
          };
          break;
        case 'trash':
          query = {
            $or: [
              { to: { $in: [userEmail] } },
              { from: userEmail }
            ],
            isDeleted: true
          };
          break;
      }

      // Search functionality
      if (search) {
        query.$text = { $search: search };
      }

      const mails = await this.db.collection('mails')
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Normalize read status field
      const normalizedMails = mails.map(mail => ({
        ...mail,
        read_status: mail.read_status || mail.readStatus || mail.isRead || false,
        created_at: mail.created_at || mail.createdAt || mail.date,
        sender: mail.sender || mail.from,
        recipient: mail.recipient || (Array.isArray(mail.to) ? mail.to[0] : mail.to)
      }));

      const totalCount = await this.db.collection('mails').countDocuments(query);

      return {
        success: true,
        mails: normalizedMails,
        totalCount,
        hasMore: (skip + limit) < totalCount
      };
    } catch (error) {
      console.error('Error getting mails:', error);
      return { success: false, error: error.message };
    }
  }

  async getMailById(mailId, userEmail) {
    try {
      const mail = await this.db.collection('mails').findOne({
        _id: new ObjectId(mailId),
        $or: [
          { to: { $in: [userEmail] } },
          { from: userEmail }
        ]
      });

      if (!mail) {
        return { success: false, error: 'Mail not found' };
      }

      return { success: true, mail };
    } catch (error) {
      console.error('Error getting mail by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateMail(mailId, updateData, userEmail) {
    try {
      const result = await this.db.collection('mails').updateOne(
        {
          _id: new ObjectId(mailId),
          $or: [
            { to: { $in: [userEmail] } },
            { from: userEmail }
          ]
        },
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Mail not found' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating mail:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteMail(mailId, userEmail, permanent = false) {
    try {
      if (permanent) {
        const result = await this.db.collection('mails').deleteOne({
          _id: new ObjectId(mailId),
          $or: [
            { to: { $in: [userEmail] } },
            { from: userEmail }
          ]
        });
        
        if (result.deletedCount === 0) {
          return { success: false, error: 'Mail not found' };
        }
      } else {
        // Soft delete
        const result = await this.updateMail(mailId, { isDeleted: true }, userEmail);
        return result;
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting mail:', error);
      return { success: false, error: error.message };
    }
  }

  // Draft operations
  async saveDraft(draftData) {
    try {
      const result = await this.db.collection('mails').insertOne({
        ...draftData,
        isDraft: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, draftId: result.insertedId };
    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDraft(draftId, draftData, userEmail) {
    try {
      const result = await this.db.collection('mails').updateOne(
        {
          _id: new ObjectId(draftId),
          from: userEmail,
          isDraft: true
        },
        {
          $set: {
            ...draftData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Draft not found' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating draft:', error);
      return { success: false, error: error.message };
    }
  }

  // Statistics
  async getMailStatistics(userEmail, dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const pipeline = [
        {
          $match: {
            $or: [
              { to: { $in: [userEmail] } },
              { from: userEmail }
            ],
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              type: {
                $cond: [
                  { $eq: ["$from", userEmail] },
                  "sent",
                  "received"
                ]
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ];

      const stats = await this.db.collection('mails').aggregate(pipeline).toArray();

      // Total counts
      const totalReceived = await this.db.collection('mails').countDocuments({
        to: { $in: [userEmail] },
        isDraft: { $ne: true },
        isDeleted: { $ne: true }
      });

      const totalSent = await this.db.collection('mails').countDocuments({
        from: userEmail,
        isDraft: { $ne: true },
        isDeleted: { $ne: true }
      });

      const totalDrafts = await this.db.collection('mails').countDocuments({
        from: userEmail,
        isDraft: true,
        isDeleted: { $ne: true }
      });

      // Unread count only for inbox emails (received emails that are not read)
      const unreadCount = await this.db.collection('mails').countDocuments({
        to: { $in: [userEmail] },
        $and: [
          {
            $or: [
              { folder: 'inbox' },
              { folder: { $exists: false } } // Default to inbox if no folder specified
            ]
          },
          {
            $or: [
              { readStatus: { $ne: true } },
              { read_status: { $ne: true } },
              { isRead: { $ne: true } },
              { readStatus: { $exists: false } },
              { read_status: { $exists: false } },
              { isRead: { $exists: false } }
            ]
          }
        ],
        isDeleted: { $ne: true },
        isDraft: { $ne: true }
      });

      return {
        success: true,
        statistics: {
          daily: stats,
          totals: {
            received: totalReceived,
            sent: totalSent,
            drafts: totalDrafts
          },
          unread_count: unreadCount
        }
      };
    } catch (error) {
      console.error('Error getting mail statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Search functionality
  async searchMails(userEmail, searchQuery, options = {}) {
    try {
      const { limit = 20, skip = 0 } = options;

      const query = {
        $and: [
          {
            $or: [
              { to: { $in: [userEmail] } },
              { from: userEmail }
            ]
          },
          {
            isDeleted: { $ne: true }
          },
          {
            $or: [
              { subject: { $regex: searchQuery, $options: 'i' } },
              { body: { $regex: searchQuery, $options: 'i' } },
              { from: { $regex: searchQuery, $options: 'i' } }
            ]
          }
        ]
      };

      const mails = await this.db.collection('mails')
        .find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.db.collection('mails').countDocuments(query);

      return {
        success: true,
        mails,
        totalCount,
        hasMore: (skip + limit) < totalCount
      };
    } catch (error) {
      console.error('Error searching mails:', error);
      return { success: false, error: error.message };
    }
  }

  async markAsRead(mailId, userEmail) {
    try {
      if (!this.isConnected) {
        return { success: false, error: 'Not connected to MongoDB' };
      }

      const query = {
        _id: ObjectId.isValid(mailId) ? new ObjectId(mailId) : mailId,
        $or: [
          { to: { $in: [userEmail] } },
          { from: userEmail }
        ]
      };

      const result = await this.db.collection('mails').updateOne(
        query,
        { 
          $set: { 
            isRead: true,
            read_status: true,
            readStatus: true,
            readAt: new Date()
          } 
        }
      );

      return {
        success: result.matchedCount > 0,
        error: result.matchedCount === 0 ? 'Email not found or access denied' : null
      };
    } catch (error) {
      console.error('❌ MongoDB mark as read error:', error);
      return { 
        success: false, 
        error: 'Failed to mark email as read in MongoDB' 
      };
    }
  }

  // Clear all drafts for a user
  async clearDrafts(userEmail) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.db.collection('mails').deleteMany({
        from: userEmail,
        isDraft: true,
        isDeleted: { $ne: true }
      });

      console.log(`✅ Cleared ${result.deletedCount} drafts for ${userEmail}`);
      
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('❌ MongoDB clear drafts error:', error);
      return { 
        success: false, 
        error: 'Failed to clear drafts in MongoDB' 
      };
    }
  }
}

module.exports = MongoMailService;