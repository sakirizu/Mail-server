require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');
const TwoFactorAuth = require('./twoFactorAuth');
const MailService = require('./mailService');
const MongoMailService = require('./mongoMailService');
const HybridMailService = require('./hybridMailService');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL for user data
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ssmail',
});

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const twoFA = new TwoFactorAuth(db);
const mailService = new MailService();
const mongoMailService = new MongoMailService();
const hybridMailService = new HybridMailService(db);

// Phishing Detection Service Configuration
const PHISHING_DETECTOR_URL = process.env.PHISHING_DETECTOR_URL || 'http://localhost:5000';
const ENABLE_PHISHING_DETECTION = process.env.ENABLE_PHISHING_DETECTION !== 'false'; // Enabled by default

// Phishing Detection Function
async function checkEmailForPhishing(emailData) {
  if (!ENABLE_PHISHING_DETECTION) {
    console.log('⚠️  Phishing detection disabled');
    return { is_phishing: false, confidence: 0, reasons: [] };
  }

  console.log(`🔍 Sending to phishing detector: ${PHISHING_DETECTOR_URL}/check-email`);
  console.log('   Email data:', { 
    from: emailData.from, 
    subject: emailData.subject?.substring(0, 50),
    bodyLength: emailData.body?.length 
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${PHISHING_DETECTOR_URL}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: emailData.from,
        subject: emailData.subject,
        body: emailData.body
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Phishing check result:', {
        is_phishing: result.is_phishing,
        confidence: result.confidence,
        score: result.score,
        reasons: result.reasons?.slice(0, 3)
      });
      return result;
    } else {
      const errorText = await response.text();
      console.error('❌ Phishing detection service error:', response.status, errorText);
      return { is_phishing: false, confidence: 0, reasons: ['Service unavailable'] };
    }
  } catch (error) {
    console.error('❌ Phishing detection error:', error.message);
    console.error('   Make sure Python service is running on', PHISHING_DETECTOR_URL);
    // Default to safe on error
    return { is_phishing: false, confidence: 0, reasons: ['Service error: ' + error.message] };
  }
}

// Initialize connections
async function initializeServices() {
  try {
    // Test MySQL connection (faqat user authentication uchun)
    const [rows] = await db.query('SELECT 1');
    console.log('✅ MySQL connected successfully (users only)');

    // Connect to MongoDB (email storage uchun)
    const mongoConnected = await mongoMailService.connect();
    if (!mongoConnected) {
      console.error('⚠️  MongoDB connection failed - email features may not work');
      console.log('💡 Please make sure MongoDB is running on localhost:27017');
      console.log('   You can start MongoDB with: mongod --dbpath=/data/db');
    } else {
      console.log('✅ MongoDB connected - email storage ready');
      
      // Test if we can query mails
      try {
        const testResult = await mongoMailService.getMailsByUser('test@ssm.com', { 
          folder: 'inbox', 
          limit: 1 
        });
        if (testResult.success) {
          console.log('✅ MongoDB query test successful');
        } else {
          console.log('⚠️  MongoDB query test failed:', testResult.error);
        }
      } catch (testError) {
        console.log('⚠️  MongoDB query test error:', testError.message);
      }
    }
    
    // Test phishing detection service
    console.log('🔌 Testing phishing detection service...');
    try {
      const healthResponse = await fetch(`${PHISHING_DETECTOR_URL}/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Phishing detector connected:', healthData.phishing_urls_loaded, 'URLs loaded');
      } else {
        console.log('⚠️  Phishing detector not responding - emails will be delivered to inbox by default');
      }
    } catch (phishError) {
      console.log('⚠️  Phishing detector not available:', phishError.message);
      console.log('   Start it with: cd backend/phishing-detector && python phishing_detector.py');
    }
    
    // Test mail connection
    await mailService.testConnection();
    
    console.log('🚀 All services initialized');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
  }
}

initializeServices();

// Signup (multi-step, auto @ssm.com email with 2FA setup)
app.post('/api/auth/signup', async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  const email = username + '@ssm.com';
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (rows.length > 0) return res.status(409).json({ error: 'Foydalanuvchi allaqachon mavjud' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, hash]);
    
    const userId = result.insertId;
    
    // Initialize 2FA settings
    await db.query('INSERT INTO user_2fa_settings (user_id, require_2fa) VALUES (?, TRUE)', [userId]);
    
    // Generate TOTP secret automatically
    const totpSetup = await twoFA.generateTOTPSecret(userId, username);
    
    // Generate backup codes
    const backupCodes = await twoFA.generateBackupCodes(userId);
    
    res.json({ 
      success: true, 
      email, 
      userId,
      twoFASetup: {
        qrCode: totpSetup.qrCode,
        secret: totpSetup.secret,
        backupCodes: backupCodes
      },
      message: '2FA majburiy! QR kodni skaner qiling va backup kodlarni saqlang.'
    });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

// Confirm TOTP setup during signup
app.post('/api/auth/signup/confirm-2fa', async (req, res) => {
  const { userId, totpCode } = req.body;
  if (!userId || !totpCode) return res.status(400).json({ error: 'User ID va TOTP kod kerak' });
  
  try {
    // Enable TOTP
    const result = await twoFA.enableTOTP(userId, totpCode);
    if (result.success) {
      // Login the user directly after successful setup
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      const user = rows[0];
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        success: true, 
        token, 
        user: { id: user.id, username: user.username, email: user.email, name: user.name },
        message: '2FA muvaffaqiyatli sozlandi!'
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (e) {
    console.error('2FA confirmation error:', e);
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

// Step 1: Primary login (username/password)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username va parol kerak' });
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Noto\'g\'ri login ma\'lumotlari' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Noto\'g\'ri login ma\'lumotlari' });

    // Check if 2FA is required (always required for new system)
    const twoFAStatus = await twoFA.get2FAStatus(user.id);
    
    if (twoFAStatus.totpEnabled || twoFAStatus.require2FA) {
      // Generate 2FA challenge token (temporary token for 2FA verification)
      const tempToken = jwt.sign({ id: user.id, temp: true }, JWT_SECRET, { expiresIn: '10m' });
      
      res.json({ 
        requires2FA: true, 
        tempToken,
        availableMethods: {
          totp: twoFAStatus.totpEnabled,
          backup: twoFAStatus.backupCodesTotal > twoFAStatus.backupCodesUsed
        }
      });
    } else {
      // This shouldn't happen in new system, but fallback
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ 
        token, 
        user: { id: user.id, username: user.username, email: user.email, name: user.name },
        warning: '2FA sozlanmagan! Iltimos profilingizda 2FA ni yoqing.'
      });
    }
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

// Step 2: Verify 2FA (TOTP, WebAuthn, or Backup code)
app.post('/api/auth/verify-2fa', async (req, res) => {
  const { tempToken, method, code, webauthnResponse, sessionToken } = req.body;
  
  try {
    // Verify temp token
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.temp) return res.status(401).json({ error: 'Invalid token' });
    
    const userId = decoded.id;
    let verified = false;
    
    switch (method) {
      case 'totp':
        if (!code) return res.status(400).json({ error: 'TOTP code required' });
        const totpResult = await twoFA.verifyTOTP(userId, code);
        verified = totpResult.verified;
        if (!verified) return res.status(401).json({ error: totpResult.error || 'Invalid TOTP code' });
        break;
        
      case 'webauthn':
        if (!webauthnResponse || !sessionToken) return res.status(400).json({ error: 'WebAuthn response required' });
        const webauthnResult = await twoFA.verifyWebAuthnAuthentication(userId, sessionToken, webauthnResponse);
        verified = webauthnResult.verified;
        if (!verified) return res.status(401).json({ error: webauthnResult.error || 'WebAuthn verification failed' });
        break;
        
      case 'backup':
        if (!code) return res.status(400).json({ error: 'Backup code required' });
        const backupResult = await twoFA.verifyBackupCode(userId, code);
        verified = backupResult.verified;
        if (!verified) return res.status(401).json({ error: backupResult.error || 'Invalid backup code' });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid 2FA method' });
    }
    
    if (verified) {
      // Get user data and generate full token
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      const user = rows[0];
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, name: user.name } });
    }
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Verify token endpoint
app.get('/api/auth/verify', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, username, email FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    res.json({ 
      valid: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile endpoint: get profile by JWT (email from token)
app.get('/api/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit profile endpoint
app.put('/api/profile', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    const [rows] = await db.query('SELECT id, name, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Inbox endpoint: fetch emails from MongoDB for the logged-in user
app.get('/mail/inbox', auth, async (req, res) => {
  try {
    const result = await mongoMailService.getMailsByUser(req.user.email, {
      folder: 'inbox',
      limit: 50,
      skip: 0
    });
    
    if (result.success) {
      // Transform for simple response
      const emails = result.emails.map(email => ({
        id: email._id,
        subject: email.subject,
        sender: email.from,
        snippet: email.body ? email.body.substring(0, 200) : ''
      }));
      res.json(emails);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (e) {
    console.error('Inbox error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== 2FA ENDPOINTS =====

// Get 2FA status
app.get('/api/2fa/status', auth, async (req, res) => {
  try {
    const status = await twoFA.get2FAStatus(req.user.id);
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate TOTP secret and QR code
app.post('/api/2fa/totp/generate', auth, async (req, res) => {
  try {
    const result = await twoFA.generateTOTPSecret(req.user.id, req.user.username);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate TOTP secret' });
  }
});

// Enable TOTP
app.post('/api/2fa/totp/enable', auth, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'TOTP token required' });
  
  try {
    const result = await twoFA.enableTOTP(req.user.id, token);
    if (result.success) {
      res.json({ success: true, backupCodes: result.backupCodes });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to enable TOTP' });
  }
});

// Disable TOTP
app.post('/api/2fa/totp/disable', auth, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  
  try {
    // Verify password
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });
    
    await db.query('UPDATE user_totp SET enabled = FALSE WHERE user_id = ?', [req.user.id]);
    await db.query('UPDATE user_2fa_settings SET totp_enabled = FALSE WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to disable TOTP' });
  }
});

// Generate WebAuthn registration options
app.post('/api/2fa/webauthn/register/begin', auth, async (req, res) => {
  try {
    const result = await twoFA.generateWebAuthnRegistration(req.user.id, req.user.username);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate WebAuthn registration' });
  }
});

// Complete WebAuthn registration
app.post('/api/2fa/webauthn/register/complete', auth, async (req, res) => {
  const { sessionToken, response, keyName } = req.body;
  if (!sessionToken || !response) return res.status(400).json({ error: 'Session token and response required' });
  
  try {
    const result = await twoFA.verifyWebAuthnRegistration(req.user.id, sessionToken, response, keyName);
    if (result.verified) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to complete WebAuthn registration' });
  }
});

// Generate WebAuthn authentication options (for 2FA during login)
app.post('/api/2fa/webauthn/auth/begin', async (req, res) => {
  const { tempToken } = req.body;
  if (!tempToken) return res.status(400).json({ error: 'Temp token required' });
  
  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.temp) return res.status(401).json({ error: 'Invalid token' });
    
    const result = await twoFA.generateWebAuthnAuthentication(decoded.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate WebAuthn authentication' });
  }
});

// Get user's WebAuthn keys
app.get('/api/2fa/webauthn/keys', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, created_at, last_used FROM user_webauthn WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove WebAuthn key
app.delete('/api/2fa/webauthn/keys/:keyId', auth, async (req, res) => {
  const { keyId } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  
  try {
    // Verify password
    const [userRows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(password, userRows[0].password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });
    
    await db.query('DELETE FROM user_webauthn WHERE id = ? AND user_id = ?', [keyId, req.user.id]);
    
    // Check if any WebAuthn keys remain
    const [remaining] = await db.query('SELECT COUNT(*) as count FROM user_webauthn WHERE user_id = ?', [req.user.id]);
    if (remaining[0].count === 0) {
      await db.query('UPDATE user_2fa_settings SET webauthn_enabled = FALSE WHERE user_id = ?', [req.user.id]);
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove key' });
  }
});

// Generate new backup codes
app.post('/api/2fa/backup-codes/generate', auth, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  
  try {
    // Verify password
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });
    
    // Delete old backup codes
    await db.query('DELETE FROM user_backup_codes WHERE user_id = ?', [req.user.id]);
    
    // Generate new codes
    const codes = await twoFA.generateBackupCodes(req.user.id);
    res.json({ backupCodes: codes });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate backup codes' });
  }
});

// Update 2FA requirement setting
app.post('/api/2fa/require', auth, async (req, res) => {
  const { require2FA, password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  
  try {
    // Verify password
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });
    
    await db.query(
      'UPDATE user_2fa_settings SET require_2fa = ? WHERE user_id = ?',
      [require2FA, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update 2FA requirement' });
  }
});

// Initiate account deletion (requires authentication)
app.post('/api/auth/account/delete/initiate', auth, async (req, res) => {
  try {
    // Check if user has 2FA enabled
    const status = await twoFA.get2FAStatus(req.user.id);
    if (!status.require2FA) {
      return res.status(400).json({ 
        error: '2FA sozlanmagan. Hisobni o\'chirish uchun 2FA yoqilgan bo\'lishi kerak.' 
      });
    }

    const result = await twoFA.initiateAccountDeletion(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Account deletion initiation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm account deletion with 2FA
app.post('/api/auth/account/delete/confirm', auth, async (req, res) => {
  try {
    const { totpCode, backupCode, challengeToken } = req.body;
    
    if (!challengeToken) {
      return res.status(400).json({ error: 'Challenge token kerak' });
    }
    
    if (!totpCode && !backupCode) {
      return res.status(400).json({ error: '2FA kod yoki backup kod kerak' });
    }

    // Verify challenge token
    const [challengeRows] = await db.query(
      'SELECT * FROM twofa_challenges WHERE user_id = ? AND challenge_token = ? AND challenge_type = ? AND expires_at > NOW()',
      [req.user.id, challengeToken, 'account_deletion']
    );

    if (challengeRows.length === 0) {
      return res.status(400).json({ error: 'Noto\'g\'ri yoki muddati tugagan challenge token' });
    }

    // Delete the challenge token
    await db.query('DELETE FROM twofa_challenges WHERE id = ?', [challengeRows[0].id]);

    // Delete account with 2FA verification
    const result = await twoFA.deleteUserAccount(req.user.id, totpCode, backupCode);
    
    res.json({ 
      success: true, 
      message: 'Hisob muvaffaqiyatli o\'chirildi' 
    });
  } catch (error) {
    console.error('Account deletion confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint with 2FA verification
app.post('/api/auth/logout', auth, async (req, res) => {
  const { totpCode, backupCode, method } = req.body;
  
  try {
    // Verify 2FA before logout
    let verified = false;
    
    switch (method) {
      case 'totp':
        if (!totpCode) return res.status(400).json({ error: 'TOTP code required' });
        const totpResult = await twoFA.verifyTOTP(req.user.id, totpCode);
        verified = totpResult.verified;
        if (!verified) return res.status(401).json({ error: totpResult.error || 'Invalid TOTP code' });
        break;
        
      case 'backup':
        if (!backupCode) return res.status(400).json({ error: 'Backup code required' });
        const backupResult = await twoFA.verifyBackupCode(req.user.id, backupCode);
        verified = backupResult.verified;
        if (!verified) return res.status(401).json({ error: backupResult.error || 'Invalid backup code' });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid 2FA method' });
    }
    
    if (verified) {
      // Log the logout action
      console.log(`User ${req.user.username} logged out successfully with 2FA verification`);
      
      // In a real app, you might want to blacklist the token or store logout timestamp
      res.json({ 
        success: true, 
        message: 'Successfully logged out' 
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ===== MAIL ENDPOINTS =====

// Test email endpoint (no auth for testing)
app.post('/api/mail/test', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'To, subject, and text are required' });
    }

    // Send test email via mailService
    const result = await mailService.sendAndSaveEmail(
      'admin@ssm.com', // from
      to,
      subject,
      text
    );

    console.log('✅ Test email sent successfully:', result);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      provider: result.provider
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get emails by folder
app.get('/api/mail/:folder', auth, async (req, res) => {
  const { folder } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const validFolders = ['inbox', 'sent', 'drafts', 'spam', 'trash'];
  
  if (!validFolders.includes(folder)) {
    return res.status(400).json({ error: 'Invalid folder' });
  }

  try {
    const result = await mailService.getEmailsByFolder(
      req.user.email, 
      folder, 
      parseInt(page), 
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    console.error(`Get ${folder} emails error:`, error);
    res.status(500).json({ error: `Failed to get ${folder} emails` });
  }
});

// Get single email by ID
app.get('/api/mail/email/:emailId', auth, async (req, res) => {
  const { emailId } = req.params;
  
  try {
    const email = await mailService.getEmailById(emailId, req.user.email);
    
    // Mark as read if it's in inbox
    if (email.recipient === req.user.email && email.folder === 'inbox' && !email.read_status) {
      await mailService.markAsRead(emailId, req.user.email);
      email.read_status = true;
    }
    
    res.json(email);
  } catch (error) {
    console.error('Get email error:', error);
    res.status(404).json({ error: 'Email not found or access denied' });
  }
});

// Search emails
app.get('/api/mail/search/:query', auth, async (req, res) => {
  const { query } = req.params;
  const { folder } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    const emails = await mailService.searchEmails(req.user.email, query, folder);
    res.json(emails);
  } catch (error) {
    console.error('Search emails error:', error);
    res.status(500).json({ error: 'Failed to search emails' });
  }
});

// Get email thread
app.get('/api/mail/thread/:threadId', auth, async (req, res) => {
  const { threadId } = req.params;
  
  try {
    const thread = await mailService.getEmailThread(threadId, req.user.email);
    res.json(thread);
  } catch (error) {
    console.error('Get email thread error:', error);
    res.status(500).json({ error: 'Failed to get email thread' });
  }
});

// Mark email as read (MongoDB)
app.put('/api/mails/:emailId/read', auth, async (req, res) => {
  const { emailId } = req.params;
  
  try {
    const result = await mongoMailService.updateMail(emailId, { isRead: true }, req.user.email);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Email not found' });
    }
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Move email to folder
app.put('/api/mail/:emailId/move', auth, async (req, res) => {
  const { emailId } = req.params;
  const { folder } = req.body;
  const validFolders = ['inbox', 'sent', 'drafts', 'spam', 'trash'];
  
  if (!validFolders.includes(folder)) {
    return res.status(400).json({ error: 'Invalid folder' });
  }

  try {
    await mailService.moveToFolder(emailId, req.user.email, folder);
    res.json({ success: true });
  } catch (error) {
    console.error('Move email error:', error);
    res.status(500).json({ error: 'Failed to move email' });
  }
});

// Star/unstar email
app.put('/api/mail/:emailId/star', auth, async (req, res) => {
  const { emailId } = req.params;
  
  try {
    const isStarred = await mailService.toggleStar(emailId, req.user.email);
    res.json({ success: true, is_starred: isStarred });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ error: 'Failed to toggle star' });
  }
});

// MongoDB Mail API Endpoints

// Get mails by folder
app.get('/api/mails/:folder', auth, async (req, res) => {
  try {
    const { folder } = req.params;
    const { page = 1, limit = 50, search } = req.query;

    console.log(`📧 GET /api/mails/${folder} - User: ${req.user.email}, Page: ${page}`);

    // Check if MongoDB service is connected
    if (!mongoMailService.isConnected) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({ 
        error: 'Database service unavailable',
        mails: [],
        totalCount: 0,
        hasMore: false
      });
    }

    const result = await mongoMailService.getMailsByUser(req.user.email, {
      folder,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      search
    });

    if (result.success) {
      console.log(`✅ Retrieved ${result.mails.length} mails from ${folder}`);
      res.json(result);
    } else {
      console.error(`❌ Failed to get mails: ${result.error}`);
      res.status(500).json({ 
        error: result.error,
        mails: [],
        totalCount: 0,
        hasMore: false
      });
    }
  } catch (error) {
    console.error('❌ Get mails error:', error);
    res.status(500).json({ 
      error: 'Failed to get mails',
      details: error.message,
      mails: [],
      totalCount: 0,
      hasMore: false
    });
  }
});

// Get single mail by ID
app.get('/api/mail/:mailId', auth, async (req, res) => {
  try {
    const { mailId } = req.params;
    const result = await mongoMailService.getMailById(mailId, req.user.email);

    if (result.success) {
      // Mark as read when fetched
      await mongoMailService.updateMail(mailId, { isRead: true }, req.user.email);
      res.json(result);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get mail error:', error);
    res.status(500).json({ error: 'Failed to get mail' });
  }
});

// Send new mail
app.post('/api/mail/send', auth, async (req, res) => {
  try {
    const { to, cc = [], bcc = [], subject, body, attachments = [] } = req.body;
    
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ error: 'Recipient email(s) required' });
    }

    const mailData = {
      from: req.user.email,
      to,
      cc,
      bcc,
      subject: subject || '(No Subject)',
      body: body || '',
      date: new Date(),
      isRead: false,
      isStarred: false,
      isDeleted: false,
      isSpam: false,
      isDraft: false,
      hasAttachments: attachments.length > 0,
      attachments,
      labels: ['sent'],
      priority: 'normal',
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inReplyTo: null,
      threadId: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Create mail for each recipient (excluding sender to avoid duplicates)
    const results = [];
    for (const recipient of [...to, ...cc, ...bcc]) {
      if (recipient !== req.user.email) {
        const recipientMailData = {
          ...mailData,
          to: [recipient],
          labels: ['inbox']
        };
        
        const result = await mongoMailService.createMail(recipientMailData);
        results.push(result);
      }
    }

    // Create copy in sender's sent folder (only one copy)
    const senderCopy = {
      ...mailData,
      labels: ['sent'],
      isRead: true // Sender has "read" their own sent email
    };
    const senderResult = await mongoMailService.createMail(senderCopy);
    results.push(senderResult);

    res.json({ 
      success: true, 
      message: 'Mail sent successfully',
      mailId: results[0]?.mailId 
    });
  } catch (error) {
    console.error('Send mail error:', error);
    res.status(500).json({ error: 'Failed to send mail' });
  }
});

// Save draft
app.post('/api/mail/draft', auth, async (req, res) => {
  try {
    const { to = [], cc = [], bcc = [], subject = '', body = '', draftId } = req.body;

    const draftData = {
      from: req.user.email,
      to,
      cc,
      bcc,
      subject,
      body,
      date: new Date(),
      isRead: false,
      isStarred: false,
      isDeleted: false,
      isSpam: false,
      isDraft: true,
      hasAttachments: false,
      attachments: [],
      labels: ['drafts'],
      priority: 'normal'
    };

    let result;
    if (draftId) {
      // Update existing draft
      result = await mongoMailService.updateDraft(draftId, draftData, req.user.email);
    } else {
      // Create new draft
      result = await mongoMailService.saveDraft(draftData);
    }

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Update mail (mark read/unread, star/unstar, etc.)
app.patch('/api/mail/:mailId', auth, async (req, res) => {
  try {
    const { mailId } = req.params;
    const updateData = req.body;

    // Remove protected fields
    delete updateData._id;
    delete updateData.from;
    delete updateData.messageId;

    const result = await mongoMailService.updateMail(mailId, updateData, req.user.email);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Update mail error:', error);
    res.status(500).json({ error: 'Failed to update mail' });
  }
});

// Delete mail
app.delete('/api/mail/:mailId', auth, async (req, res) => {
  try {
    const { mailId } = req.params;
    const { permanent = false } = req.query;

    const result = await mongoMailService.deleteMail(mailId, req.user.email, permanent === 'true');

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Delete mail error:', error);
    res.status(500).json({ error: 'Failed to delete mail' });
  }
});

// Search mails
app.get('/api/mails/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const result = await mongoMailService.searchMails(req.user.email, query, {
      limit: parseInt(limit),
      skip
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Search mails error:', error);
    res.status(500).json({ error: 'Failed to search mails' });
  }
});

// Get mail statistics
app.get('/api/mails/stats', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = await mongoMailService.getMailStatistics(req.user.email, parseInt(days));

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get mail stats error:', error);
    res.status(500).json({ error: 'Failed to get mail statistics' });
  }
});

// Create sample mails (for testing)
app.post('/api/mails/sample', auth, async (req, res) => {
  try {
    const sampleMails = [
      {
        from: 'welcome@ssm.com',
        to: [req.user.email],
        cc: [],
        bcc: [],
        subject: 'Welcome to SSMail!',
        body: 'Welcome to SSMail! Your secure email platform is ready to use.',
        date: new Date(),
        isRead: false,
        isStarred: false,
        isDeleted: false,
        isSpam: false,
        isDraft: false,
        hasAttachments: false,
        attachments: [],
        labels: ['inbox'],
        priority: 'normal',
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threadId: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      {
        from: 'security@ssm.com',
        to: [req.user.email],
        cc: [],
        bcc: [],
        subject: 'Security Alert: 2FA Enabled',
        body: 'Two-factor authentication has been enabled for your account for enhanced security.',
        date: new Date(Date.now() - 86400000), // Yesterday
        isRead: true,
        isStarred: false,
        isDeleted: false,
        isSpam: false,
        isDraft: false,
        hasAttachments: false,
        attachments: [],
        labels: ['inbox'],
        priority: 'high',
        messageId: `msg_${Date.now() - 1}_${Math.random().toString(36).substr(2, 9)}`,
        threadId: `thread_${Date.now() - 1}_${Math.random().toString(36).substr(2, 9)}`
      }
    ];

    const results = [];
    for (const mailData of sampleMails) {
      const result = await mongoMailService.createMail(mailData);
      results.push(result);
    }

    res.json({ 
      success: true, 
      message: 'Sample mails created successfully',
      created: results.filter(r => r.success).length
    });
  } catch (error) {
    console.error('Create sample mails error:', error);
    res.status(500).json({ error: 'Failed to create sample mails' });
  }
});

// Clear all drafts
app.delete('/api/mails/drafts/clear', auth, async (req, res) => {
  try {
    const result = await mongoMailService.clearDrafts(req.user.email);
    
    if (result.success) {
      res.json({ success: true, message: 'All drafts cleared' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Clear drafts error:', error);
    res.status(500).json({ error: 'Failed to clear drafts' });
  }
});

// Save draft
app.post('/api/mails/draft', auth, async (req, res) => {
  try {
    const { to, cc, bcc, subject, body } = req.body;
    
    const draftData = {
      from: req.user.email,
      sender: req.user.email,
      to: Array.isArray(to) ? to : (to ? [to] : []),
      cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
      bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
      subject: subject || '(No Subject)',
      body: body || '',
      date: new Date(),
      isRead: true,
      isStarred: false,
      isDeleted: false,
      isSpam: false,
      isDraft: true,
      folder: 'drafts',
      labels: ['drafts'],
      messageId: `draft-${Date.now()}@ssm.com`
    };

    const result = await mongoMailService.createMail(draftData);
    
    if (result.success) {
      res.json({ success: true, draft: result.mail });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Delete email
app.delete('/api/mail/:emailId', auth, async (req, res) => {
  const { emailId } = req.params;
  
  try {
    await mailService.deleteEmail(emailId, req.user.email);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// Get email statistics
app.get('/api/mail/stats', auth, async (req, res) => {
  try {
    const stats = await mailService.getEmailStats(req.user.email);
    res.json(stats);
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Failed to get email stats' });
  }
});

// Create sample emails (for testing)
app.post('/api/mail/sample', auth, async (req, res) => {
  try {
    await mailService.createSampleEmails(req.user.email);
    res.json({ success: true, message: 'Sample emails created' });
  } catch (error) {
    console.error('Create sample emails error:', error);
    res.status(500).json({ error: 'Failed to create sample emails' });
  }
});

// Mail API Routes

// Get inbox emails
app.get('/api/mails/inbox', auth, async (req, res) => {
  try {
    console.log('📥 Fetching inbox for:', req.user.email);
    const result = await mongoMailService.getMailsByUser(req.user.email, {
      folder: 'inbox',
      limit: 50
    });
    
    console.log('📥 Inbox result:', result.success ? `${result.mails?.length || 0} mails found` : result.error);
    
    if (result.success) {
      res.json({ 
        success: true, 
        mails: result.mails || [],
        total: result.totalCount || 0
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to fetch inbox' });
    }
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

// Get sent emails
app.get('/api/mails/sent', auth, async (req, res) => {
  try {
    console.log('📤 Fetching sent emails for:', req.user.email);
    const result = await mongoMailService.getMailsByUser(req.user.email, {
      folder: 'sent',
      limit: 50
    });
    
    console.log('📤 Sent result:', result.success ? `${result.mails?.length || 0} mails found` : result.error);
    
    if (result.success) {
      res.json({ 
        success: true, 
        mails: result.mails || [],
        total: result.totalCount || 0
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to fetch sent emails' });
    }
  } catch (error) {
    console.error('Get sent emails error:', error);
    res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
});

// Get draft emails
app.get('/api/mails/drafts', auth, async (req, res) => {
  try {
    console.log('📝 Fetching drafts for:', req.user.email);
    const result = await mongoMailService.getMailsByUser(req.user.email, {
      folder: 'drafts',
      limit: 50
    });
    
    console.log('📝 Drafts result:', result.success ? `${result.mails?.length || 0} drafts found` : result.error);
    
    if (result.success) {
      res.json({ 
        success: true, 
        mails: result.mails || [],
        total: result.totalCount || 0
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to fetch drafts' });
    }
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Send email with confirmation
app.post('/api/mails/send', auth, async (req, res) => {
  try {
    console.log('📧 Send email request received from:', req.user.email);
    
    let { to, subject, body, cc = [], bcc = [], confirmSend = true } = req.body;
    
    // Validate input
    if (!to || !subject || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'to, subject, and body are required'
      });
    }
    
    // Normalize email addresses - add @ssm.com if not present
    const normalizeEmail = (email) => {
      if (!email) return '';
      email = email.toString().trim();
      if (!email.includes('@')) {
        return `${email}@ssm.com`;
      }
      return email;
    };
    
    // Ensure to is array and normalize all emails
    if (!Array.isArray(to)) {
      to = [to];
    }
    to = to.map(normalizeEmail).filter(email => email);
    cc = cc.map(normalizeEmail).filter(email => email);
    bcc = bcc.map(normalizeEmail).filter(email => email);
    
    if (to.length === 0) {
      return res.status(400).json({ error: 'At least one valid recipient required' });
    }
    
    console.log('📧 Sending email:', { from: req.user.email, to, cc, bcc, subject });
    
    // If no confirmation yet, save as draft and return confirmation prompt
    if (!confirmSend) {
      console.log('📧 No confirmation, saving as draft...');
      
      const draftData = {
        from: req.user.email,
        to: to,
        cc: cc,
        bcc: bcc,
        subject: subject || '',
        body: body || '',
        isDraft: true,
        createdAt: new Date()
      };
      
      console.log('📧 Saving draft data:', draftData);
      const result = await mongoMailService.saveDraft(draftData);
      console.log('📧 Draft save result:', result);
      
      const response = {
        success: true,
        requiresConfirmation: true,
        draftId: result.draftId,
        message: 'Email preview saved. Please confirm to send.',
        preview: {
          to: draftData.to,
          cc: draftData.cc,
          bcc: draftData.bcc,
          subject: draftData.subject,
          body: draftData.body
        }
      };
      
      console.log('📧 Sending response:', response);
      return res.json(response);
    }
    
    // If confirmed, send the email
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ssm.com`;
    const now = new Date();
    
    const mailData = {
      from: req.user.email,
      sender: req.user.email,
      to: to,
      cc: cc,
      bcc: bcc,
      subject: subject || '',
      body: body || '',
      isDraft: false,
      isRead: true, // Sender has "read" their own sent email
      isStarred: false,
      isDeleted: false,
      isSpam: false,
      messageId: messageId,
      sentAt: now,
      date: now,
      folder: 'sent',
      labels: ['sent']
    };
    
    console.log('📧 Creating sent copy for sender:', req.user.email);
    // Save to MongoDB - sent copy for sender
    const result = await mongoMailService.createMail(mailData);
    
    // Create inbox copy for each recipient (excluding sender to avoid duplicates)
    const allRecipients = [...to, ...cc, ...bcc].filter(email => email && email !== req.user.email);
    console.log('📧 Creating inbox copies for recipients:', allRecipients);
    
    // Check for phishing before delivering to recipients
    console.log('🔍 Checking email for phishing...');
    const phishingCheck = await checkEmailForPhishing({
      from: req.user.email,
      subject: mailData.subject,
      body: mailData.body
    });
    
    // Determine folder based on phishing detection
    const deliveryFolder = phishingCheck.is_phishing ? 'spam' : 'inbox';
    const deliveryLabels = phishingCheck.is_phishing ? ['spam'] : ['inbox'];
    
    if (phishingCheck.is_phishing) {
      console.log(`⚠️  PHISHING DETECTED (confidence: ${phishingCheck.confidence}%)`);
      console.log('   Reasons:', phishingCheck.reasons?.join(', '));
      console.log('   → Delivering to SPAM folder');
    } else {
      console.log('✅ Email appears safe → Delivering to INBOX');
    }
    
    for (const recipient of allRecipients) {
      const inboxCopy = {
        from: req.user.email,
        sender: req.user.email,
        to: [recipient],
        cc: cc,
        bcc: bcc,
        subject: mailData.subject,
        body: mailData.body,
        isDraft: false,
        isRead: false,
        isStarred: false,
        isDeleted: false,
        isSpam: phishingCheck.is_phishing,
        messageId: messageId,
        sentAt: now,
        date: now,
        folder: deliveryFolder,
        labels: deliveryLabels,
        phishingScore: phishingCheck.confidence,
        phishingReasons: phishingCheck.reasons
      };
      const inboxResult = await mongoMailService.createMail(inboxCopy);
      console.log(`📧 Created ${deliveryFolder} copy for recipient: ${recipient}, mailId: ${inboxResult.mailId}`);
    }
    
    // Don't send via SMTP to avoid double creation
    console.log('📧 Email saved to database without SMTP to prevent duplicates');
    
    // Clear drafts after successful send to prevent duplicates in inbox
    await mongoMailService.clearDrafts(req.user.email);
    console.log('📧 Cleared drafts after successful send');
    
    res.json({ 
      success: true, 
      mailId: result.mailId,
      message: '✅ Email sent successfully!',
      notification: {
        type: 'success',
        title: 'Email Sent',
        message: `Your email "${mailData.subject}" has been sent successfully to ${allRecipients.length} recipient(s).`,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      notification: {
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send email. Please try again.',
        timestamp: new Date()
      }
    });
  }
});

// Create sample emails (for testing)
app.post('/api/mails/sample', auth, async (req, res) => {
  try {
    // Create some sample emails for testing
    const sampleEmails = [
      {
        from: 'admin@ssm.com',
        to: [req.user.email],
        sender: 'admin@ssm.com',
        recipient: req.user.email,
        subject: 'Welcome to SSM Mail!',
        body: 'Thank you for joining SSM Mail. Your secure email system is ready to use.',
        snippet: 'Thank you for joining SSM Mail. Your secure email system...',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        folder: 'inbox',
        read_status: false,
        readStatus: false,
        isRead: false,
        isDraft: false,
        messageId: `welcome-${Date.now()}@ssm.com`
      },
      {
        from: 'security@ssm.com',
        to: [req.user.email],
        sender: 'security@ssm.com',
        recipient: req.user.email,
        subject: 'Security Alert: 2FA Enabled',
        body: 'Your two-factor authentication has been successfully enabled for enhanced security.',
        snippet: 'Your two-factor authentication has been successfully enabled...',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
        folder: 'inbox',
        read_status: false,
        readStatus: false,
        isRead: false,
        isDraft: false,
        messageId: `security-${Date.now()}@ssm.com`
      },
      {
        from: 'newsletter@ssm.com',
        to: [req.user.email],
        sender: 'newsletter@ssm.com',
        recipient: req.user.email,
        subject: 'Weekly Newsletter - New Features',
        body: 'Check out the latest features and improvements in SSM Mail this week.',
        snippet: 'Check out the latest features and improvements in SSM...',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        folder: 'inbox',
        read_status: false,
        readStatus: false,
        isRead: false,
        isDraft: false,
        messageId: `newsletter-${Date.now()}@ssm.com`
      },
      {
        from: 'support@ssm.com',
        to: [req.user.email],
        sender: 'support@ssm.com',
        recipient: req.user.email,
        subject: 'Your Ticket Has Been Resolved',
        body: 'Good news! Your support ticket #12345 has been resolved. Thank you for using SSM Mail.',
        snippet: 'Good news! Your support ticket #12345 has been resolved...',
        date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        created_at: new Date(Date.now() - 30 * 60 * 1000),
        folder: 'inbox',
        read_status: false,
        readStatus: false,
        isRead: false,
        isDraft: false,
        messageId: `support-${Date.now()}@ssm.com`
      }
    ];
    
    let created = 0;
    for (const email of sampleEmails) {
      const result = await mailService.createMail(email);
      if (result.success) created++;
    }
    
    res.json({ 
      success: true, 
      message: `${created} sample emails created`,
      created 
    });
  } catch (error) {
    console.error('Create sample emails error:', error);
    res.status(500).json({ error: 'Failed to create sample emails' });
  }
});

// Create test user endpoint  
app.post('/api/create-test-user', async (req, res) => {
  try {
    const username = 'test';
    const password = '123456';
    const name = 'Test User';
    const email = 'test@ssm.com';
    
    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.json({ success: true, message: 'Test user already exists' });
    }
    
    // Create user
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, hash]);
    
    res.json({ 
      success: true, 
      message: 'Test user created successfully',
      user: { id: result.insertId, username, email, name }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ error: 'Failed to create test user: ' + error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log('Server running on port', PORT));
