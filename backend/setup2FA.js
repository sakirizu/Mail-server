const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log('Setting up 2FA database tables...');

  try {
    // TOTP secrets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_totp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        secret VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_totp (user_id)
      )
    `);
    console.log('✅ user_totp table created');

    // User 2FA preferences
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_2fa_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        totp_enabled BOOLEAN DEFAULT FALSE,
        webauthn_enabled BOOLEAN DEFAULT FALSE,
        require_2fa BOOLEAN DEFAULT FALSE,
        backup_codes TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_settings (user_id)
      )
    `);
    console.log('✅ user_2fa_settings table created');

    // Backup codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_backup_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ user_backup_codes table created');

    // 2FA challenge sessions (temporary storage for verification)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS twofa_challenges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        challenge_type ENUM('totp', 'webauthn') NOT NULL,
        challenge_data TEXT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_session (session_token)
      )
    `);
    console.log('✅ twofa_challenges table created');

    console.log('\n🎉 2FA database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your server: node server.js');
    console.log('2. Test signup with 2FA');
    console.log('3. Test login with 2FA verification');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();