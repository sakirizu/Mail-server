const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  const urls = [
    'mongodb://localhost:27017/stormysecuritynosql',
    'mongodb://127.0.0.1:27017/stormysecuritynosql',
    'mongodb://localhost:27017/',
    'mongodb://127.0.0.1:27017/'
  ];

  for (const url of urls) {
    try {
      console.log(`🔗 Testing: ${url}`);
      
      const client = new MongoClient(url, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000
      });
      
      await client.connect();
      const db = client.db('stormysecuritynosql');
      
      // Test basic operations
      const adminDb = client.db('admin');
      await adminDb.command({ ping: 1 });
      console.log('✅ Connection successful!');
      
      // Try to list collections
      try {
        const collections = await db.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections`);
        
        // Try to create a test collection
        const testCollection = db.collection('test_connection');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        console.log('📝 Write operation successful!');
        
        // Clean up
        await testCollection.deleteOne({ test: true });
        console.log('🧹 Cleanup successful!');
        
      } catch (err) {
        console.log('⚠️  Limited access, but basic connection works');
      }
      
      await client.close();
      return true;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('❌ All connection attempts failed');
  return false;
}

// Run the test
testMongoConnection().then(success => {
  if (success) {
    console.log('🎉 MongoDB is ready for use!');
  } else {
    console.log('💡 MongoDB might need configuration:');
    console.log('   1. Check if MongoDB is running: net start MongoDB');
    console.log('   2. Try disabling authentication');
    console.log('   3. Check MongoDB logs for errors');
  }
  process.exit(success ? 0 : 1);
});