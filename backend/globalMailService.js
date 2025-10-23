const nodemailer = require('nodemailer');
const imap = require('imap');
const { simpleParser } = require('mailparser');

class GlobalMailService {
  constructor() {
    this.smtpTransporters = new Map();
    this.imapConnections = new Map();
    this.hybridMailService = null;
    this.setupComplete = false;
  }

  // Initialize global mail service
  async initialize(hybridMailService) {
    console.log('🌍 Initializing Global Mail Service...');
    this.hybridMailService = hybridMailService;
    
    await this.setupSMTPProviders();
    await this.setupIMAPConnections();
    
    this.setupComplete = true;
    console.log('✅ Global Mail Service initialized');
  }

  // Setup multiple SMTP providers (Gmail, Outlook, etc.)
  async setupSMTPProviders() {
    const providers = [
      {
        name: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      },
      {
        name: 'outlook',
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.OUTLOOK_USER,
          pass: process.env.OUTLOOK_PASS
        }
      },
      {
        name: 'ethereal',
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: null // Will be set up dynamically
      }
    ];

    for (const provider of providers) {
      try {
        if (provider.name === 'ethereal') {
          // Setup Ethereal for testing
          const testAccount = await nodemailer.createTestAccount();
          provider.auth = {
            user: testAccount.user,
            pass: testAccount.pass
          };
          console.log(`📧 Ethereal test account: ${testAccount.user}`);
        }

        if (provider.auth && provider.auth.user && provider.auth.pass) {
          const transporter = nodemailer.createTransport(provider);
          await transporter.verify();
          
          this.smtpTransporters.set(provider.name, transporter);
          console.log(`✅ ${provider.name.toUpperCase()} SMTP configured`);
          
          if (provider.name === 'ethereal') {
            console.log('🔗 Preview emails at: https://ethereal.email');
          }
        } else {
          console.log(`⚠️  ${provider.name.toUpperCase()} credentials not provided`);
        }
      } catch (error) {
        console.log(`❌ ${provider.name.toUpperCase()} SMTP failed:`, error.message);
      }
    }
  }

  // Setup IMAP connections for receiving emails
  async setupIMAPConnections() {
    const imapConfigs = [
      {
        name: 'gmail',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
      {
        name: 'outlook',
        host: 'imap-mail.outlook.com',
        port: 993,
        tls: true,
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASS
      }
    ];

    for (const config of imapConfigs) {
      if (config.user && config.pass) {
        try {
          console.log(`📬 Setting up ${config.name.toUpperCase()} IMAP...`);
          // IMAP setup will be done when needed
          console.log(`✅ ${config.name.toUpperCase()} IMAP configured`);
        } catch (error) {
          console.log(`❌ ${config.name.toUpperCase()} IMAP failed:`, error.message);
        }
      }
    }
  }

  // Send email to external addresses (Gmail, Outlook, etc.)
  async sendExternalEmail(from, to, subject, body, options = {}) {
    try {
      // Determine best SMTP provider based on sender's domain
      let transporter = this.getBestSMTPProvider(from);
      
      if (!transporter) {
        console.log('⚠️  No external SMTP available, using Ethereal');
        transporter = this.smtpTransporters.get('ethereal');
      }

      if (!transporter) {
        throw new Error('No SMTP provider available');
      }

      const mailOptions = {
        from: `${process.env.MAIL_FROM_NAME} <${from}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        text: body,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${body.replace(/\\n/g, '<br>')}</div>`,
        ...options
      };

      console.log(`📧 Sending external email from ${from} to ${mailOptions.to}: ${subject}`);
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ External email sent:', info.messageId);

      // Also save to our database
      await this.hybridMailService.createMail({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        body,
        date: new Date(),
        isDraft: false,
        messageId: info.messageId
      });

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('External email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get best SMTP provider based on email domain
  getBestSMTPProvider(fromEmail) {
    const domain = fromEmail.split('@')[1];
    
    if (domain === 'gmail.com' && this.smtpTransporters.has('gmail')) {
      return this.smtpTransporters.get('gmail');
    }
    
    if ((domain === 'outlook.com' || domain === 'hotmail.com') && this.smtpTransporters.has('outlook')) {
      return this.smtpTransporters.get('outlook');
    }
    
    // Default to Gmail if available
    if (this.smtpTransporters.has('gmail')) {
      return this.smtpTransporters.get('gmail');
    }
    
    // Fallback to Outlook
    if (this.smtpTransporters.has('outlook')) {
      return this.smtpTransporters.get('outlook');
    }
    
    return null;
  }

  // Receive emails from external accounts
  async fetchExternalEmails(userEmail) {
    const results = [];
    
    // Determine which external accounts to check based on user's linked accounts
    const linkedAccounts = await this.getLinkedAccounts(userEmail);
    
    for (const account of linkedAccounts) {
      try {
        console.log(`📬 Fetching emails from ${account.provider} for ${account.email}`);
        const emails = await this.fetchFromProvider(account);
        results.push(...emails);
      } catch (error) {
        console.error(`Failed to fetch from ${account.provider}:`, error.message);
      }
    }
    
    return results;
  }

  // Get linked external accounts for a user
  async getLinkedAccounts(userEmail) {
    // This would typically come from a database
    const linkedAccounts = [];
    
    if (process.env.GMAIL_USER) {
      linkedAccounts.push({
        provider: 'gmail',
        email: process.env.GMAIL_USER,
        host: 'imap.gmail.com',
        port: 993,
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      });
    }
    
    if (process.env.OUTLOOK_USER) {
      linkedAccounts.push({
        provider: 'outlook',
        email: process.env.OUTLOOK_USER,
        host: 'imap-mail.outlook.com',
        port: 993,
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASS
      });
    }
    
    return linkedAccounts;
  }

  // Fetch emails from a specific provider
  async fetchFromProvider(account) {
    return new Promise((resolve, reject) => {
      const imapConnection = new imap({
        host: account.host,
        port: account.port,
        tls: true,
        user: account.user,
        password: account.pass,
        tlsOptions: { rejectUnauthorized: false }
      });

      const emails = [];

      imapConnection.once('ready', () => {
        imapConnection.openBox('INBOX', true, (err, box) => {
          if (err) {
            reject(err);
            return;
          }

          // Fetch recent emails (last 10)
          const fetch = imapConnection.seq.fetch('1:10', {
            bodies: '',
            struct: true
          });

          fetch.on('message', (msg, seqno) => {
            let emailData = {};

            msg.on('body', (stream, info) => {
              simpleParser(stream, (err, parsed) => {
                if (!err) {
                  emailData = {
                    from: parsed.from.text,
                    to: parsed.to ? parsed.to.text : account.email,
                    subject: parsed.subject,
                    body: parsed.text || parsed.html,
                    date: parsed.date,
                    messageId: parsed.messageId,
                    provider: account.provider
                  };
                  emails.push(emailData);
                }
              });
            });
          });

          fetch.once('end', () => {
            imapConnection.end();
            resolve(emails);
          });

          fetch.once('error', (err) => {
            imapConnection.end();
            reject(err);
          });
        });
      });

      imapConnection.once('error', (err) => {
        reject(err);
      });

      imapConnection.connect();
    });
  }

  // Check if email is internal (same domain) or external
  isInternalEmail(email) {
    const domain = email.split('@')[1];
    return domain === process.env.MAIL_DOMAIN || domain === 'ssm.com';
  }

  // Route email to appropriate handler
  async routeEmail(from, to, subject, body, options = {}) {
    const recipients = Array.isArray(to) ? to : [to];
    const internalRecipients = recipients.filter(email => this.isInternalEmail(email));
    const externalRecipients = recipients.filter(email => !this.isInternalEmail(email));

    const results = [];

    // Send to internal recipients via hybrid service
    if (internalRecipients.length > 0) {
      console.log(`📧 Sending to internal recipients: ${internalRecipients.join(', ')}`);
      const result = await this.hybridMailService.createMail({
        from,
        to: internalRecipients,
        subject,
        body,
        date: new Date(),
        isDraft: false,
        ...options
      });
      results.push({ type: 'internal', result });
    }

    // Send to external recipients via SMTP
    if (externalRecipients.length > 0) {
      console.log(`📧 Sending to external recipients: ${externalRecipients.join(', ')}`);
      const result = await this.sendExternalEmail(from, externalRecipients, subject, body, options);
      results.push({ type: 'external', result });
    }

    return results;
  }
}

module.exports = GlobalMailService;