-- Mail Server Database Schema
-- SSMail - Secure Simple Mail System

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE
);

-- Emails table - main mail storage
CREATE TABLE IF NOT EXISTS emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id VARCHAR(255) UNIQUE, -- UUID for tracking same message across recipients
  subject VARCHAR(500) NOT NULL DEFAULT '',
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  cc TEXT, -- Comma-separated emails
  bcc TEXT, -- Comma-separated emails
  body LONGTEXT,
  snippet VARCHAR(200), -- First 200 chars for preview
  html_body LONGTEXT, -- HTML version of email
  folder ENUM('inbox', 'sent', 'drafts', 'spam', 'trash') DEFAULT 'inbox',
  
  -- Email status flags
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  
  -- Threading support
  thread_id VARCHAR(255), -- For conversation threading
  in_reply_to VARCHAR(255), -- Message ID this is replying to
  references TEXT, -- All message IDs in conversation chain
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  
  -- Indexes for performance
  INDEX idx_recipient (recipient),
  INDEX idx_sender (sender),
  INDEX idx_folder (folder),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_is_spam (is_spam),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_thread_id (thread_id),
  INDEX idx_message_id (message_id)
);

-- Email attachments table
CREATE TABLE IF NOT EXISTS email_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size INT, -- in bytes
  file_path VARCHAR(500), -- where file is stored
  is_inline BOOLEAN DEFAULT FALSE, -- for embedded images
  content_id VARCHAR(255), -- for inline attachments
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_email_id (email_id)
);

-- Email labels/tags (like Gmail labels)
CREATE TABLE IF NOT EXISTS email_labels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#808080', -- hex color
  is_system BOOLEAN DEFAULT FALSE, -- system labels vs user-created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_label (user_id, name),
  INDEX idx_user_id (user_id)
);

-- Many-to-many relationship between emails and labels
CREATE TABLE IF NOT EXISTS email_label_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email_id INT NOT NULL,
  label_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES email_labels(id) ON DELETE CASCADE,
  UNIQUE KEY unique_email_label (email_id, label_id),
  INDEX idx_email_id (email_id),
  INDEX idx_label_id (label_id)
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_setting (user_id, setting_key),
  INDEX idx_user_id (user_id)
);

-- Email filters/rules (like auto-move spam, auto-label, etc.)
CREATE TABLE IF NOT EXISTS email_filters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Filter conditions (JSON format)
  conditions TEXT, -- JSON: [{"field": "sender", "operator": "contains", "value": "spam"}]
  
  -- Actions to take (JSON format)
  actions TEXT, -- JSON: [{"action": "move_to_folder", "value": "spam"}]
  
  priority INT DEFAULT 0, -- Higher number = higher priority
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_priority (priority)
);

-- Login sessions and device tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_info TEXT, -- JSON with device details
  ip_address VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at)
);

-- Spam detection training data
CREATE TABLE IF NOT EXISTS spam_training (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email_id INT NOT NULL,
  is_spam BOOLEAN NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  detected_keywords TEXT, -- JSON array of detected spam keywords
  user_feedback BOOLEAN, -- Did user mark it manually?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_email_id (email_id),
  INDEX idx_is_spam (is_spam)
);

-- Contact book/address book
CREATE TABLE IF NOT EXISTS contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_contact (user_id, email),
  INDEX idx_user_id (user_id),
  INDEX idx_email (email)
);

-- Insert some default system labels
INSERT IGNORE INTO email_labels (user_id, name, color, is_system) VALUES
(1, 'Important', '#ff0000', TRUE),
(1, 'Work', '#0066cc', TRUE),
(1, 'Personal', '#00cc66', TRUE),
(1, 'Promotions', '#ff9900', TRUE),
(1, 'Social', '#cc00cc', TRUE);

-- Insert some default user preferences
INSERT IGNORE INTO user_preferences (user_id, setting_key, setting_value) VALUES
(1, 'theme', 'light'),
(1, 'email_notifications', 'true'),
(1, 'push_notifications', 'false'),
(1, 'read_receipts', 'true'),
(1, 'spam_filter_enabled', 'true'),
(1, 'auto_archive_days', '30');

-- Sample data for testing (optional)
INSERT IGNORE INTO emails (
  subject, sender, recipient, body, snippet, folder, is_read, created_at
) VALUES
('Welcome to SSMail!', 'system@ssmail.com', 'user@ssmail.com', 
 'Welcome to SSMail - your secure email solution. We\'re excited to have you!', 
 'Welcome to SSMail - your secure email solution...', 'inbox', FALSE, NOW()),
 
('Test Email', 'friend@example.com', 'user@ssmail.com',
 'This is a test email to check if everything is working correctly.',
 'This is a test email to check if everything...', 'inbox', FALSE, NOW() - INTERVAL 1 HOUR),
 
('Spam Example', 'spam@badsite.com', 'user@ssmail.com',
 'URGENT! Click here for free money! Congratulations, you won!',
 'URGENT! Click here for free money! Congratulations...', 'spam', FALSE, NOW() - INTERVAL 2 HOUR);
