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
      // Create separate collections for different mail types
      let collections = [];
      let collectionNames = [];
      
      try {
        collections = await this.db.listCollections().toArray();
        collectionNames = collections.map(c => c.name);
      } catch (authError) {
        console.log('⚠️  Cannot list collections (auth required), creating collections anyway');
        collectionNames = []; // Assume collections don't exist
      }

      // Create collections for different mail folders
      const requiredCollections = [
        { name: 'mails_inbox', description: '📥 Inbox mails' },
        { name: 'mails_sent', description: '📤 Sent mails' },
        { name: 'mails_drafts', description: '📝 Draft mails' },
        { name: 'mails_spam', description: '🚫 Spam mails' },
        { name: 'mails_trash', description: '🗑️ Deleted mails' },
        { name: 'mails_archive', description: '📦 Archived mails' },
        { name: 'attachments', description: '📎 Mail attachments' }
      ];

      for (const collection of requiredCollections) {
        if (!collectionNames.includes(collection.name)) {
          try {
            await this.db.createCollection(collection.name);
            console.log(`${collection.description} collection created`);
          } catch (error) {
            console.log(`${collection.description} collection might already exist`);
          }
        }
      }

      // Create indexes for better performance
      try {
        // Inbox indexes
        await this.db.collection('mails_inbox').createIndex({ "to": 1 });
        await this.db.collection('mails_inbox').createIndex({ "from": 1 });
        await this.db.collection('mails_inbox').createIndex({ "date": -1 });
        await this.db.collection('mails_inbox').createIndex({ "isRead": 1 });
        await this.db.collection('mails_inbox').createIndex({ "subject": "text", "body": "text" });

        // Sent indexes
        await this.db.collection('mails_sent').createIndex({ "from": 1 });
        await this.db.collection('mails_sent').createIndex({ "to": 1 });
        await this.db.collection('mails_sent').createIndex({ "date": -1 });
        await this.db.collection('mails_sent').createIndex({ "subject": "text", "body": "text" });

        // Drafts indexes
        await this.db.collection('mails_drafts').createIndex({ "from": 1 });
        await this.db.collection('mails_drafts').createIndex({ "updatedAt": -1 });

        // Spam indexes
        await this.db.collection('mails_spam').createIndex({ "to": 1 });
        await this.db.collection('mails_spam').createIndex({ "date": -1 });

        // Trash indexes
        await this.db.collection('mails_trash').createIndex({ "deletedAt": -1 });
        await this.db.collection('mails_trash').createIndex({ "from": 1 });
        await this.db.collection('mails_trash').createIndex({ "to": 1 });

        console.log('📚 Database indexes created successfully');
      } catch (indexError) {
        console.log('⚠️  Index creation skipped (might require auth)');
      }
      
      // Insert sample data if collections are empty
      try {
        const inboxCount = await this.db.collection('mails_inbox').countDocuments();
        if (inboxCount === 0) {
          await this.insertSampleData();
        } else {
          console.log(`📧 Found ${inboxCount} existing inbox mails`);
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
      
      // Determine which collection to use based on folder
      let collectionName = 'mails_inbox'; // default
      
      if (mailData.folder === 'sent') {
        collectionName = 'mails_sent';
      } else if (mailData.folder === 'drafts' || mailData.isDraft) {
        collectionName = 'mails_drafts';
      } else if (mailData.folder === 'spam' || mailData.isSpam) {
        collectionName = 'mails_spam';
      } else if (mailData.folder === 'trash' || mailData.isDeleted) {
        collectionName = 'mails_trash';
      } else if (mailData.folder === 'archive') {
        collectionName = 'mails_archive';
      } else if (mailData.folder === 'inbox') {
        collectionName = 'mails_inbox';
      }
      
      console.log(`📧 Saving mail to collection: ${collectionName}`);
      
      const result = await this.db.collection(collectionName).insertOne({
        ...mailData,
        date: mailData.date || now,
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
      // Check if MongoDB is connected
      if (!this.isConnected || !this.db) {
        console.error('❌ MongoDB not connected');
        return { 
          success: false, 
          error: 'Database connection not available',
          mails: [],
          totalCount: 0,
          hasMore: false
        };
      }

      const {
        folder = 'inbox',
        limit = 50,
        skip = 0,
        sortBy = 'date',
        sortOrder = -1,
        search = null
      } = options;

      // Determine which collection to query
      let collectionName = 'mails_inbox';
      let query = {};
      
      switch (folder) {
        case 'inbox':
          collectionName = 'mails_inbox';
          query = { 
            to: { $in: [userEmail] }
          };
          break;
        case 'sent':
          collectionName = 'mails_sent';
          query = { 
            from: userEmail
          };
          break;
        case 'drafts':
          collectionName = 'mails_drafts';
          query = { 
            from: userEmail
          };
          break;
        case 'spam':
          collectionName = 'mails_spam';
          query = { 
            to: { $in: [userEmail] }
          };
          break;
        case 'trash':
          collectionName = 'mails_trash';
          query = {
            $or: [
              { to: { $in: [userEmail] } },
              { from: userEmail }
            ]
          };
          break;
        case 'archive':
          collectionName = 'mails_archive';
          query = {
            $or: [
              { to: { $in: [userEmail] } },
              { from: userEmail }
            ]
          };
          break;
      }

      // Search functionality
      if (search) {
        query.$text = { $search: search };
      }

      console.log(`📧 Querying collection: ${collectionName} for user: ${userEmail}`);

      const mails = await this.db.collection(collectionName)
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

      const totalCount = await this.db.collection(collectionName).countDocuments(query);

      console.log(`📧 Found ${normalizedMails.length} mails in ${collectionName}`);

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
      // Search in all collections
      const collections = ['mails_inbox', 'mails_sent', 'mails_drafts', 'mails_spam', 'mails_trash', 'mails_archive'];
      
      for (const collectionName of collections) {
        const mail = await this.db.collection(collectionName).findOne({
          _id: new ObjectId(mailId),
          $or: [
            { to: { $in: [userEmail] } },
            { from: userEmail }
          ]
        });
        
        if (mail) {
          return { success: true, mail, collection: collectionName };
        }
      }

      return { success: false, error: 'Mail not found' };
    } catch (error) {
      console.error('Error getting mail by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateMail(mailId, updateData, userEmail) {
    try {
      // First find which collection the mail is in
      const mailResult = await this.getMailById(mailId, userEmail);
      if (!mailResult.success) {
        return { success: false, error: 'Mail not found' };
      }
      
      const collectionName = mailResult.collection;
      
      const result = await this.db.collection(collectionName).updateOne(
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
      // First find which collection the mail is in
      const mailResult = await this.getMailById(mailId, userEmail);
      if (!mailResult.success) {
        return { success: false, error: 'Mail not found' };
      }
      
      const sourceCollection = mailResult.collection;
      
      if (permanent) {
        const result = await this.db.collection(sourceCollection).deleteOne({
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
        // Move to trash collection
        const mail = mailResult.mail;
        
        // Delete from source collection
        await this.db.collection(sourceCollection).deleteOne({
          _id: new ObjectId(mailId)
        });
        
        // Insert into trash collection
        await this.db.collection('mails_trash').insertOne({
          ...mail,
          deletedAt: new Date(),
          previousFolder: sourceCollection
        });
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
      const result = await this.db.collection('mails_drafts').insertOne({
        ...draftData,
        isDraft: true,
        folder: 'drafts',
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
      const result = await this.db.collection('mails_drafts').updateOne(
        {
          _id: new ObjectId(draftId),
          from: userEmail
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

      // Count from separate collections
      const totalReceived = await this.db.collection('mails_inbox').countDocuments({
        to: { $in: [userEmail] }
      });

      const totalSent = await this.db.collection('mails_sent').countDocuments({
        from: userEmail
      });

      const totalDrafts = await this.db.collection('mails_drafts').countDocuments({
        from: userEmail
      });
      
      const totalSpam = await this.db.collection('mails_spam').countDocuments({
        to: { $in: [userEmail] }
      });
      
      const totalTrash = await this.db.collection('mails_trash').countDocuments({
        $or: [
          { to: { $in: [userEmail] } },
          { from: userEmail }
        ]
      });

      // Unread count only for inbox emails
      const unreadCount = await this.db.collection('mails_inbox').countDocuments({
        to: { $in: [userEmail] },
        $or: [
          { readStatus: { $ne: true } },
          { read_status: { $ne: true } },
          { isRead: { $ne: true } },
          { readStatus: { $exists: false } },
          { read_status: { $exists: false } },
          { isRead: { $exists: false } }
        ]
      });

      // Get daily statistics from all collections
      const collections = ['mails_inbox', 'mails_sent'];
      let dailyStats = [];
      
      for (const collectionName of collections) {
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

        const stats = await this.db.collection(collectionName).aggregate(pipeline).toArray();
        dailyStats = [...dailyStats, ...stats];
      }

      return {
        success: true,
        statistics: {
          daily: dailyStats,
          totals: {
            received: totalReceived,
            sent: totalSent,
            drafts: totalDrafts,
            spam: totalSpam,
            trash: totalTrash
          },
          unread_count: unreadCount
        }
      };
    } catch (error) {
      console.error('Error getting mail statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Search functionality - search across all collections
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
            $or: [
              { subject: { $regex: searchQuery, $options: 'i' } },
              { body: { $regex: searchQuery, $options: 'i' } },
              { from: { $regex: searchQuery, $options: 'i' } }
            ]
          }
        ]
      };

      // Search across all collections
      const collections = ['mails_inbox', 'mails_sent', 'mails_drafts', 'mails_spam', 'mails_archive'];
      let allMails = [];
      
      for (const collectionName of collections) {
        const mails = await this.db.collection(collectionName)
          .find(query)
          .sort({ date: -1 })
          .toArray();
        
        allMails = [...allMails, ...mails];
      }
      
      // Sort by date and apply pagination
      allMails.sort((a, b) => new Date(b.date) - new Date(a.date));
      const paginatedMails = allMails.slice(skip, skip + limit);
      
      return {
        success: true,
        mails: paginatedMails,
        totalCount: allMails.length,
        hasMore: (skip + limit) < allMails.length
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

      // First find which collection the mail is in
      const mailResult = await this.getMailById(mailId, userEmail);
      if (!mailResult.success) {
        return { success: false, error: 'Mail not found' };
      }
      
      const collectionName = mailResult.collection;

      const query = {
        _id: ObjectId.isValid(mailId) ? new ObjectId(mailId) : mailId,
        $or: [
          { to: { $in: [userEmail] } },
          { from: userEmail }
        ]
      };

      const result = await this.db.collection(collectionName).updateOne(
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
      
      const result = await this.db.collection('mails_drafts').deleteMany({
        from: userEmail
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