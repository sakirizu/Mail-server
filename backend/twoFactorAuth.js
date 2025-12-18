// 2FA Module for TOTP support (simplified version)
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class TwoFactorAuth {
  constructor(db) {
    this.db = db;
    this.rpName = 'SMAIL';
    this.rpID = 'localhost';
    // Match frontend port
    this.origin = 'http://localhost:8081';
  }

  // Generate TOTP secret and QR code
  async generateTOTPSecret(userId, username) {
    try {
      const secret = speakeasy.generateSecret({
        name: `${this.rpName} (${username})`,
        issuer: this.rpName,
        length: 32
      });

      // Store secret in database (not enabled yet)
      await this.db.query(
        'INSERT INTO user_totp (user_id, secret, enabled) VALUES (?, ?, FALSE) ON DUPLICATE KEY UPDATE secret = VALUES(secret)',
        [userId, secret.base32]
      );

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32
      };
    } catch (error) {
      throw new Error('TOTP secret generation failed');
    }
  }

  // Verify TOTP token
  async verifyTOTP(userId, token) {
    try {
      const [rows] = await this.db.query(
        'SELECT secret FROM user_totp WHERE user_id = ? AND enabled = TRUE',
        [userId]
      );

      if (rows.length === 0) {
        return { verified: false, error: 'TOTP not enabled' };
      }

      const secret = rows[0].secret;
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time steps (60 seconds) tolerance
      });

      return { verified };
    } catch (error) {
      return { verified: false, error: 'TOTP verification failed' };
    }
  }

  // Enable TOTP after verification
  async enableTOTP(userId, token) {
    try {
      const [rows] = await this.db.query(
        'SELECT secret FROM user_totp WHERE user_id = ? AND enabled = FALSE',
        [userId]
      );

      if (rows.length === 0) {
        return { success: false, error: 'No TOTP secret found' };
      }

      const secret = rows[0].secret;
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (verified) {
        // Enable TOTP
        await this.db.query(
          'UPDATE user_totp SET enabled = TRUE WHERE user_id = ?',
          [userId]
        );

        // Update user 2FA settings
        await this.db.query(
          'INSERT INTO user_2fa_settings (user_id, totp_enabled) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE totp_enabled = TRUE',
          [userId]
        );

        // Generate backup codes
        const backupCodes = await this.generateBackupCodes(userId);

        return { success: true, backupCodes };
      } else {
        return { success: false, error: 'Invalid TOTP code' };
      }
    } catch (error) {
      console.error('enableTOTP error:', error);
      return { success: false, error: 'Failed to enable TOTP' };
    }
  }

  // Generate WebAuthn registration options (placeholder)
  async generateWebAuthnRegistration(userId, username) {
    throw new Error('WebAuthn not implemented yet');
  }

  // Verify WebAuthn registration (placeholder)
  async verifyWebAuthnRegistration(userId, sessionToken, response, keyName = 'Security Key') {
    return { verified: false, error: 'WebAuthn not implemented yet' };
  }

  // Generate WebAuthn authentication options (placeholder)
  async generateWebAuthnAuthentication(userId) {
    return { error: 'WebAuthn not implemented yet' };
  }

  // Verify WebAuthn authentication (placeholder)
  async verifyWebAuthnAuthentication(userId, sessionToken, response) {
    return { verified: false, error: 'WebAuthn not implemented yet' };
  }

  // Generate backup codes
  async generateBackupCodes(userId) {
    try {
      const codes = [];
      for (let i = 0; i < 10; i++) {
        codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      // Hash and store codes
      for (const code of codes) {
        const hash = await bcrypt.hash(code, 10);
        await this.db.query(
          'INSERT INTO user_backup_codes (user_id, code_hash) VALUES (?, ?)',
          [userId, hash]
        );
      }

      return codes;
    } catch (error) {
      console.error('Backup code generation error:', error);
      throw new Error('Backup code generation failed');
    }
  }

  // Verify backup code
  async verifyBackupCode(userId, code) {
    try {
      const [rows] = await this.db.query(
        'SELECT id, code_hash FROM user_backup_codes WHERE user_id = ? AND used = FALSE',
        [userId]
      );

      for (const row of rows) {
        const isValid = await bcrypt.compare(code.toUpperCase(), row.code_hash);
        if (isValid) {
          // Mark code as used
          await this.db.query(
            'UPDATE user_backup_codes SET used = TRUE, used_at = NOW() WHERE id = ?',
            [row.id]
          );
          return { verified: true };
        }
      }

      return { verified: false, error: 'Invalid backup code' };
    } catch (error) {
      console.error('Backup code verification error:', error);
      return { verified: false, error: 'Backup code verification failed' };
    }
  }

  // Get user's 2FA status
  async get2FAStatus(userId) {
    try {
      const [settingsRows] = await this.db.query(
        'SELECT totp_enabled, webauthn_enabled, require_2fa FROM user_2fa_settings WHERE user_id = ?',
        [userId]
      );

      const [backupCodeRows] = await this.db.query(
        'SELECT COUNT(*) as total, SUM(used) as used FROM user_backup_codes WHERE user_id = ?',
        [userId]
      );

      const settings = settingsRows.length > 0 ? settingsRows[0] : {
        totp_enabled: false,
        webauthn_enabled: false,
        require_2fa: false
      };

      return {
        totpEnabled: !!settings.totp_enabled,
        webauthnEnabled: false, // WebAuthn disabled for now
        require2FA: !!settings.require_2fa,
        webauthnKeysCount: 0,
        backupCodesTotal: backupCodeRows[0].total || 0,
        backupCodesUsed: backupCodeRows[0].used || 0
      };
    } catch (error) {
      console.error('get2FAStatus error:', error);
      return {
        totpEnabled: false,
        webauthnEnabled: false,
        require2FA: false,
        webauthnKeysCount: 0,
        backupCodesTotal: 0,
        backupCodesUsed: 0
      };
    }
  }

  // Check if 2FA is required for user
  async is2FARequired(userId) {
    try {
      const status = await this.get2FAStatus(userId);
      return status.require2FA && (status.totpEnabled || status.webauthnEnabled);
    } catch (error) {
      return false;
    }
  }

  // Delete user account with 2FA verification
  async deleteUserAccount(userId, totpCode, backupCode = null) {
    try {
      let isValidData = { verified: false };

      if (totpCode) {
        isValidData = await this.verifyTOTP(userId, totpCode);
      } else if (backupCode) {
        isValidData = await this.verifyBackupCode(userId, backupCode);
      }

      if (!isValidData.verified) {
        throw new Error('Invalid 2FA code');
      }

      await this.db.query('START TRANSACTION');

      try {
        await this.db.query('DELETE FROM user_totp WHERE user_id = ?', [userId]);
        await this.db.query('DELETE FROM user_2fa_settings WHERE user_id = ?', [userId]);
        await this.db.query('DELETE FROM user_backup_codes WHERE user_id = ?', [userId]);
        await this.db.query('DELETE FROM twofa_challenges WHERE user_id = ?', [userId]);
        await this.db.query('DELETE FROM emails WHERE sender_id = ? OR recipient_id = ?', [userId, userId]);
        const [result] = await this.db.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
          throw new Error('User not found');
        }

        await this.db.query('COMMIT');
        return { success: true, message: 'Account deleted successfully' };
      } catch (error) {
        await this.db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('deleteUserAccount error:', error);
      throw new Error('Failed to delete account: ' + error.message);
    }
  }

  async initiateAccountDeletion(userId) {
    try {
      const status = await this.get2FAStatus(userId);
      if (!status.require2FA) {
        throw new Error('2FA is not enabled for this account');
      }

      const challengeToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.db.query(
        'INSERT INTO twofa_challenges (user_id, session_token, challenge_type, expires_at, challenge_data) VALUES (?, ?, ?, ?, ?)',
        [userId, challengeToken, 'totp', expiresAt, 'account_deletion']
      );

      return {
        challengeToken,
        message: 'Account deletion initiated. Please verify with 2FA code.',
        backupCodesAvailable: status.backupCodesTotal - status.backupCodesUsed
      };
    } catch (error) {
      console.error('initiateAccountDeletion error:', error);
      throw new Error('Failed to initiate account deletion: ' + error.message);
    }
  }
}

module.exports = TwoFactorAuth;