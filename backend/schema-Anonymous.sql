CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  whitelist_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whitelist domains table
CREATE TABLE IF NOT EXISTS whitelist_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  domain VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_domain (user_id, domain)
);

-- Insert default whitelist domains for existing users
INSERT IGNORE INTO whitelist_domains (user_id, domain) 
SELECT u.id, 'company.com' FROM users u;

INSERT IGNORE INTO whitelist_domains (user_id, domain) 
SELECT u.id, 'gmail.com' FROM users u;
