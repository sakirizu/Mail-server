-- SSMail Database Setup Script
-- Run this script to create the database and tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ssmail;
USE ssmail;

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
  message_id VARCHAR(255) UNIQUE,
  subject VARCHAR(500) NOT NULL DEFAULT '',
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  cc TEXT,
  bcc TEXT,
  body LONGTEXT,
  snippet VARCHAR(200),
  html_body LONGTEXT,
  folder ENUM('inbox', 'sent', 'drafts', 'spam', 'trash') DEFAULT 'inbox',
  
  -- Email status flags
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  
  -- Threading support
  thread_id VARCHAR(255),
  in_reply_to VARCHAR(255),
  references TEXT,
  
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

-- Insert sample user for testing
INSERT IGNORE INTO users (name, username, email, password) VALUES 
('Test User', 'testuser', 'user@ssmail.com', '$2a$10$example.hash.here');

-- Insert sample emails for testing
INSERT IGNORE INTO emails (
  subject, sender, recipient, body, snippet, folder, is_read, created_at
) VALUES
('Welcome to SSMail!', 'system@ssmail.com', 'user@ssmail.com', 
 'Welcome to SSMail - your secure email solution. We are excited to have you!', 
 'Welcome to SSMail - your secure email solution...', 'inbox', FALSE, NOW()),
 
('Test Email', 'friend@example.com', 'user@ssmail.com',
 'This is a test email to check if everything is working correctly.',
 'This is a test email to check if everything...', 'inbox', FALSE, NOW() - INTERVAL 1 HOUR);

SELECT 'Database and tables created successfully!' as status;
