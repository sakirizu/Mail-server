-- Create emails table for mail functionality
CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT,
  html_body TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_status BOOLEAN DEFAULT FALSE,
  folder ENUM('inbox', 'sent', 'drafts', 'spam', 'trash') DEFAULT 'inbox',
  attachments JSON,
  priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
  is_starred BOOLEAN DEFAULT FALSE,
  
  INDEX idx_recipient_folder (recipient, folder),
  INDEX idx_sender_folder (sender, folder),
  INDEX idx_sent_at (sent_at),
  INDEX idx_read_status (read_status)
);

-- Insert sample emails for testing
INSERT INTO emails (sender, recipient, subject, body, folder, read_status) VALUES
('admin@ssm.com', 'test@ssm.com', 'Welcome to SSM Mail!', 'Welcome to our secure email system. Your account has been successfully created.', 'inbox', FALSE),
('noreply@ssm.com', 'test@ssm.com', 'Security Notice', 'Two-factor authentication has been enabled for your account.', 'inbox', FALSE),
('test@ssm.com', 'user@ssm.com', 'Test Email', 'This is a test email sent from SSM Mail system.', 'sent', TRUE);

-- Show table structure
DESCRIBE emails;