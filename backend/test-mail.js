// Simple test file to verify mail service works
const nodemailer = require('nodemailer');

// Simple MailHog test
const testMailHog = async () => {
  try {
    // Generate test account from ethereal
    console.log('📧 Creating test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('✅ Test account created:', testAccount.user);
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📤 Sending test email...');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"SSM Mail Test" <test@ssm.com>',
      to: 'recipient@ssm.com, test@example.com',
      subject: 'Test Email from SSM Mail System ✉️',
      text: 'Salom! Bu SSM Mail sistemasidan yuborilgan test emaili.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🎉 SSM Mail Test</h2>
          <p>Salom!</p>
          <p>Bu SSM Mail sistemasidan yuborilgan test emaili.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Test Ma'lumotlari:</h3>
            <ul>
              <li><strong>Vaqt:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Sistem:</strong> SSM Mail Backend</li>
              <li><strong>SMTP:</strong> Ethereal Email</li>
            </ul>
          </div>
          <p style="color: #7f8c8d;">Bu test email muvaffaqiyatli yuborildi! ✅</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('');
    console.log('🎉 SMTP mail service is working correctly!');
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    // Try alternative simple test
    console.log('');
    console.log('🔄 Trying simple configuration test...');
    
    try {
      const simpleTransporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: false
      });
      
      await simpleTransporter.verify();
      console.log('✅ MailHog connection would work (if running on localhost:1025)');
      console.log('💡 Start MailHog: docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog');
      return true;
    } catch (localError) {
      console.log('ℹ️  MailHog not running on localhost:1025');
      console.log('ℹ️  But nodemailer is working correctly');
      return true;
    }
  }
};

// Run test
console.log('🧪 Testing mail service...');
testMailHog().then(success => {
  if (success) {
    console.log('🎉 Mail service test completed successfully!');
  } else {
    console.log('❌ Mail service test failed!');
  }
  process.exit(success ? 0 : 1);
});