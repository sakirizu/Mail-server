const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDevicesTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'smail_db'
    });

    console.log('Connected to database...');

    // Create user_devices table
    const deviceTableSQL = `
      CREATE TABLE IF NOT EXISTS user_devices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          device_fingerprint VARCHAR(255) NOT NULL,
          browser_name VARCHAR(100) DEFAULT 'Unknown',
          browser_version VARCHAR(50) DEFAULT 'Unknown',
          os_name VARCHAR(100) DEFAULT 'Unknown',
          os_version VARCHAR(50) DEFAULT 'Unknown',
          device_type VARCHAR(50) DEFAULT 'Unknown',
          ip_address VARCHAR(45) DEFAULT 'Unknown',
          timezone VARCHAR(100) DEFAULT 'Unknown',
          language VARCHAR(10) DEFAULT 'Unknown',
          user_agent TEXT,
          screen_info JSON,
          location_info JSON,
          last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_device (user_id, device_fingerprint),
          INDEX idx_user_devices_user_id (user_id),
          INDEX idx_user_devices_last_used (last_used)
      )
    `;

    await connection.execute(deviceTableSQL);
    console.log('✅ user_devices table created/verified');

    // Create login logs table
    const loginLogsSQL = `
      CREATE TABLE IF NOT EXISTS user_login_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          device_fingerprint VARCHAR(255),
          ip_address VARCHAR(45),
          location_country VARCHAR(100),
          location_city VARCHAR(100),
          login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          login_method VARCHAR(50) DEFAULT 'password',
          success BOOLEAN DEFAULT TRUE,
          user_agent TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_login_logs_user_id (user_id),
          INDEX idx_login_logs_time (login_time)
      )
    `;

    await connection.execute(loginLogsSQL);
    console.log('✅ user_login_logs table created/verified');

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDevicesTable();