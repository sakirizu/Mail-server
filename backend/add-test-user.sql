-- Test user for SSM email system
-- Password: 123456

INSERT INTO users (name, username, email, password) VALUES 
('Test User', 'test', 'test@ssm.com', '$2a$10$bYMMYraB6FBMJNb.1MYGNuJrnYOuz.KInVDAK8rQaXcsUP9bJHukm');

-- Check if user was created
SELECT id, name, username, email, created_at FROM users WHERE username = 'test';