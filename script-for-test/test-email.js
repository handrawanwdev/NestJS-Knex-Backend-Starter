const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const APP_URL = process.env.APP_URL || 'http://localhost:8000';

function validateEnv() {
  if (EMAIL_PROVIDER === 'gmail') {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('❌ Missing required email environment variables:');
      console.error('   - GMAIL_USER');
      console.error('   - GMAIL_APP_PASSWORD\n');
      return false;
    }
  } else {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      console.error('❌ Missing required email environment variables:');
      console.error('   - SMTP_HOST');
      console.error('   - SMTP_USER');
      console.error('   - SMTP_PASSWORD\n');
      return false;
    }
  }
  return true;
}

function getTransporter() {
  if (EMAIL_PROVIDER === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

async function testEmailConnection() {
  console.log('🔍 Testing email configuration...\n');
  console.log(`   Provider:     ${EMAIL_PROVIDER.toUpperCase()}`);
  console.log(`   User:         ${SMTP_USER || GMAIL_USER}`);
  console.log(`   APP URL:      ${APP_URL}\n`);

  const transporter = getTransporter();

  try {
    console.log('📡 Verifying connection to SMTP server...\n');
    await transporter.verify();
    console.log('✅ Email connection successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Email connection failed!');
    console.error(`   Error: ${error.message}\n`);
    
    if (EMAIL_PROVIDER === 'gmail') {
      console.error('   Troubleshooting steps:');
      console.error('   1. Ensure GMAIL_USER is a valid Gmail address');
      console.error('   2. Generate an App Password (not your regular password)');
      console.error('      - Go to: https://myaccount.google.com/apppasswords');
      console.error('      - Enable 2-Step Verification first if not enabled');
      console.error('   3. Check your internet connection\n');
    } else {
      console.error('   Troubleshooting steps:');
      console.error('   1. Verify SMTP_HOST and SMTP_PORT are correct');
      console.error('   2. Check SMTP_USER and SMTP_PASSWORD credentials');
      console.error('   3. Ensure SMTP_SECURE matches your server settings (true/false)');
      console.error('   4. Check your internet connection\n');
    }
    return false;
  }
}

async function sendTestEmail(recipientEmail) {
  if (!recipientEmail) {
    console.error('❌ Please provide a recipient email address');
    console.error('   Usage: node test-email.js user@example.com\n');
    process.exit(1);
  }

  console.log(`📧 Sending test email to: ${recipientEmail}\n`);

  const transporter = getTransporter();

  const testVerificationUrl = `${APP_URL}/email-verification/verify?token=test-token-123`;

  const mailOptions = {
    from: SMTP_USER || GMAIL_USER,
    to: recipientEmail,
    subject: '[TEST] Email Verification Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Email</h2>
        <p>This is a test email to verify the email configuration is working correctly.</p>
        <p style="color: #666; font-size: 14px;">If you received this, the email service is properly configured!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Provider: ${EMAIL_PROVIDER.toUpperCase()}</p>
        <p style="color: #999; font-size: 12px;">Sent from: ${SMTP_USER || GMAIL_USER}</p>
        <p style="color: #999; font-size: 12px;">App URL: ${APP_URL}</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}\n`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email!');
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Main execution
async function main() {
  const recipientEmail = process.argv[2];

  const connectionOk = await testEmailConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  if (recipientEmail) {
    const emailSent = await sendTestEmail(recipientEmail);
    if (!emailSent) {
      process.exit(1);
    }
  } else {
    console.log('💡 Connection test passed!');
    console.log('   To send a test email, run:');
    console.log(`   node script-for-test/test-email.js your-email@example.com\n`);
  }
}

main();

