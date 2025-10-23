require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔧 Setting up SSMail database...');
  
  try {
    // First connect without specifying database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute the setup SQL
    const sqlFile = fs.readFileSync(path.join(__dirname, 'setup_database.sql'), 'utf8');
    const queries = sqlFile.split(';').filter(query => query.trim());

    for (const query of queries) {
      if (query.trim()) {
        await connection.execute(query);
      }
    }

    console.log('✅ Database and tables created successfully!');
    
    // Test the connection to ssmail database
    await connection.execute('USE ssmail');
    const [rows] = await connection.execute('SHOW TABLES');
    
    console.log('📋 Created tables:');
    rows.forEach(row => {
      console.log(`  - ${Object.values(row)[0]}`);
    });

    // Check if emails table exists and has correct structure
    const [emailsStructure] = await connection.execute('DESCRIBE emails');
    console.log(`\n📧 Emails table structure: ${emailsStructure.length} columns`);

    await connection.end();
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('💡 Make sure MySQL is running and credentials are correct in .env file');
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
