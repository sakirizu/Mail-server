const { MongoClient } = require('mongodb');

async function testMongoDB() {
  const connections = [
    'mongodb://localhost:27017/stormysecuritynosql',
    'mongodb://localhost:27017/',
    'mongodb://127.0.0.1:27017/stormysecuritynosql'
  ];

  for (const url of connections) {
    try {
      console.log(`🔗 Testing: ${url}`);
      const client = new MongoClient(url, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      
      await client.connect();
      const db = client.db('stormysecuritynosql');
      await db.admin().ping();
      
      console.log('✅ MongoDB connection successful!');
      console.log(`📊 Database: stormysecuritynosql`);
      
      // List collections
      const collections = await db.listCollections().toArray();
      console.log('📁 Collections:', collections.map(c => c.name));
      
      await client.close();
      return true;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('❌ All MongoDB connections failed');
  return false;
}

testMongoDB();