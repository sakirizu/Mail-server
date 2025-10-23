require('dotenv').config();
const MailServer = require('./mailServer');

// Bosh server (auth va profile uchun)
const mainServer = require('./server');

// Mail Server ni ishga tushirish
const mailServer = new MailServer();
mailServer.start(5000);

console.log('✅ Main Server: http://localhost:4000');
console.log('📧 Mail Server: http://localhost:5000');
console.log('🔍 Mail Health: http://localhost:5000/api/mail/health');
console.log('📊 Mail Stats: http://localhost:5000/api/mail/stats');
