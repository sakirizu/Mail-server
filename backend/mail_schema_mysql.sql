-- MySQL Mail Storage Schema (Fallback when MongoDB auth required)

CREATE TABLE IF NOT EXISTS mails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_email VARCHAR(255) NOT NULL,
    to_emails JSON NOT NULL,
    cc_emails JSON DEFAULT NULL,
    bcc_emails JSON DEFAULT NULL,
    subject VARCHAR(500) DEFAULT '',
    body LONGTEXT NOT NULL,
    date DATETIME NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachments JSON DEFAULT NULL,
    labels JSON DEFAULT NULL,
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    message_id VARCHAR(255) UNIQUE,
    in_reply_to VARCHAR(255) DEFAULT NULL,
    thread_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_from_email (from_email),
    INDEX idx_date (date),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_is_spam (is_spam),
    INDEX idx_is_draft (is_draft),
    INDEX idx_thread_id (thread_id),
    FULLTEXT idx_subject_body (subject, body)
);

CREATE TABLE IF NOT EXISTS mail_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mail_id INT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type ENUM('to', 'cc', 'bcc') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (mail_id) REFERENCES mails(id) ON DELETE CASCADE,
    INDEX idx_mail_recipient (mail_id, recipient_email),
    INDEX idx_recipient_email (recipient_email)
);

CREATE TABLE IF NOT EXISTS mail_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mail_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size INT,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (mail_id) REFERENCES mails(id) ON DELETE CASCADE,
    INDEX idx_mail_id (mail_id)
);

-- Insert sample data
INSERT IGNORE INTO mails (
    from_email, to_emails, subject, body, date, message_id, thread_id
) VALUES 
(
    'welcome@ssm.com', 
    '["test@ssm.com"]', 
    'Welcome to SSMail!',
    'Bu sizning birinchi xabaringiz. SSMail ga xush kelibsiz!',
    NOW(),
    CONCAT('msg_', UNIX_TIMESTAMP(), '_', SUBSTRING(MD5(RAND()), 1, 8)),
    CONCAT('thread_', UNIX_TIMESTAMP(), '_', SUBSTRING(MD5(RAND()), 1, 8))
),
(
    'system@ssm.com',
    '["test@ssm.com"]',
    'Account Security Notification', 
    'Hisobingiz xavfsizligi uchun 2FA yoqildi.',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    CONCAT('msg_', UNIX_TIMESTAMP()-1, '_', SUBSTRING(MD5(RAND()), 1, 8)),
    CONCAT('thread_', UNIX_TIMESTAMP()-1, '_', SUBSTRING(MD5(RAND()), 1, 8))
);