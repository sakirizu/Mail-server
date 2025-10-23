-- User devices tracking table
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
);

-- Add location tracking table (optional, for more detailed tracking)
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
);