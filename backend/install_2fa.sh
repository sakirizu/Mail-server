#!/bin/bash

echo "Installing 2FA dependencies..."

# Install required packages
npm install speakeasy qrcode @simplewebauthn/server @simplewebauthn/types

echo "Setting up database tables..."

# Run the 2FA schema setup
echo "Please run the following SQL commands in your MySQL database:"
echo ""
cat 2fa_schema.sql
echo ""

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run the SQL commands shown above in your database"
echo "2. Restart your server: node server.js"
echo "3. Update your .env file if needed with any new configuration"
echo ""
echo "Features added:"
echo "✅ TOTP (Google Authenticator/Authy) support"
echo "✅ FIDO2/WebAuthn (YubiKey, etc.) support"
echo "✅ Backup codes for recovery"
echo "✅ 2FA management in profile settings"
echo "✅ Login flow with 2FA verification"