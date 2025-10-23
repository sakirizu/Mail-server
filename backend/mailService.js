const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = null;
    this.initializeSMTP();
  }

  async initializeSMTP() {
    try {
      // Use Ethereal Email for testing
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('✅ Ethereal Email SMTP initialized');
      console.log(`📧 Test emails available at: https://ethereal.email`);
      console.log(`👤 Test account: ${testAccount.user}`);
    } catch (error) {
      console.error('❌ SMTP initialization failed:', error.message);
      this.transporter = null;
    }
  }

  async testConnection() {
    try {
      if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ SMTP connection verified');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ SMTP connection test failed:', error);
      return false;
    }
  }

  async sendAndSaveEmail(from, to, subject, text, html = null) {
    try {
      if (!this.transporter) {
        throw new Error('SMTP transporter not initialized');
      }

      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</div>`
      };

      console.log(`📧 Sending email from ${from} to ${to}: ${subject}`);
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: previewUrl
      };
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      throw error;
    }
  }
}

module.exports = MailService;