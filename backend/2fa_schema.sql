-- 2FA Tables for TOTP and FIDO2/WebAuthn support

-- TOTP secrets table
CREATE TABLE IF NOT EXISTS user_totp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_totp (user_id)
);

-- WebAuthn/FIDO2 credentials table
CREATE TABLE IF NOT EXISTS user_webauthn (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  name VARCHAR(100) DEFAULT 'Security Key',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_credential (credential_id(191))
);

-- User 2FA preferences
CREATE TABLE IF NOT EXISTS user_2fa_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  totp_enabled BOOLEAN DEFAULT FALSE,
  webauthn_enabled BOOLEAN DEFAULT FALSE,
  require_2fa BOOLEAN DEFAULT FALSE,
  backup_codes TEXT NULL, -- JSON array of backup codes
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_settings (user_id)
);

-- 2FA challenge sessions (temporary storage for verification)
CREATE TABLE IF NOT EXISTS twofa_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_type ENUM('totp', 'webauthn') NOT NULL,
  challenge_data TEXT NOT NULL, -- For WebAuthn challenge data
  session_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session (session_token)
);

-- Backup codes table
CREATE TABLE IF NOT EXISTS user_backup_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);