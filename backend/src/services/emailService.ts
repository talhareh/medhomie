import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { config } from 'dotenv';

config();

// Define email colors
const colors = {
  primary: {
    600: '#2563eb' // Blue
  },
  gray: {
    100: '#f3f4f6',
    700: '#374151',
    800: '#1a1d23'
  }
};

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: 'https://api.eu.mailgun.net'
});

const domain = process.env.MAILGUN_DOMAIN || '';
const fromEmail = process.env.MAILGUN_FROM_EMAIL || '';

// Validate Mailgun configuration
const validateMailgunConfig = () => {
  console.log('Starting email configuration...');
  console.log('Mailgun credentials:', {
    apiKey: process.env.MAILGUN_API_KEY ? 'Set' : 'Not set',
    domain: process.env.MAILGUN_DOMAIN ? 'Set' : 'Not set',
    fromEmail: process.env.MAILGUN_FROM_EMAIL ? 'Set' : 'Not set'
  });

  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_FROM_EMAIL) {
    console.error('Missing Mailgun configuration. Please set MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM_EMAIL');
    return false;
  }
  return true;
};

// Validate configuration on startup
validateMailgunConfig();

const emailStyles = {
  button: `
    display: inline-block;
    padding: 10px 20px;
    background-color: ${colors.primary[600]};
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin: 20px 0;
  `,
  container: `
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: ${colors.gray[100]};
    color: ${colors.gray[700]};
    font-family: Arial, sans-serif;
  `,
  heading: `
    color: ${colors.primary[600]};
    font-size: 24px;
    margin-bottom: 20px;
  `
};

export const sendVerificationEmail = async (
  to: string,
  fullName: string,
  token: string
) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    console.log('Attempting to send verification email to:', to);
    console.log('Verification URL:', verificationUrl);

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Verify Your Email</h1>
        <p>Hi ${fullName},</p>
        <p>Welcome to MedHome! Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="${emailStyles.button}">Verify Email</a>
        <p>This link will expire in 72 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'Verify Your Email - MedHome',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  fullName: string,
  token: string
) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    console.log('Attempting to send password reset email to:', to);
    console.log('Reset URL:', resetUrl);

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Reset Your Password</h1>
        <p>Hi ${fullName},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="${emailStyles.button}">Reset Password</a>
        <p>This link will expire in 72 hours.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'Reset Your Password - MedHome',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendPasswordChangeNotification = async (
  to: string,
  fullName: string
) => {
  try {
    console.log('Attempting to send password change notification email to:', to);

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Password Changed</h1>
        <p>Hi ${fullName},</p>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'Password Changed - MedHome',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending password change notification email:', error);
    throw error;
  }
};

export const sendAdminCreatedUserEmail = async (
  to: string,
  fullName: string,
  username: string,
  password: string
) => {
  try {
    console.log('Attempting to send admin-created user email to:', to);

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Welcome to MedHome!</h1>
        <p>Hi ${fullName},</p>
        <p>Your account has been created by an administrator in MedHome - our medical education platform.</p>
        <p>Here are your login credentials:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please log in to your account and change your password for security purposes.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="${emailStyles.button}">Login to MedHome</a>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'Your MedHome Account - Welcome!',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('Admin-created user email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending admin-created user email:', error);
    throw error;
  }
};

export const sendEnrollmentNotification = async (
  to: string,
  fullName: string,
  courseTitle: string,
  action: 'enrolled' | 'removed'
) => {
  try {
    console.log(`Attempting to send enrollment ${action} notification email to:`, to);

    const actionText = action === 'enrolled' ? 'enrolled in' : 'removed from';
    const subjectText = action === 'enrolled' ? 'Enrolled' : 'Removed from';
    const buttonText = action === 'enrolled' ? 'Access Course' : 'Browse Courses';

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Course ${subjectText}</h1>
        <p>Hi ${fullName},</p>
        <p>You have been ${actionText} the course: <strong>${courseTitle}</strong></p>
        ${action === 'enrolled' ?
        '<p>You can now access all course materials and start learning!</p>' :
        '<p>You no longer have access to this course. If this was done in error, please contact our support team.</p>'
      }
        <a href="${process.env.FRONTEND_URL}/courses" style="${emailStyles.button}">${buttonText}</a>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: `Course ${subjectText} - MedHome`,
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log(`Enrollment ${action} notification email sent successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error sending enrollment ${action} notification email:`, error);
    throw error;
  }
};

export const sendVoucherAppliedEmail = async (
  to: string,
  fullName: string,
  voucherCode: string,
  courseTitle: string,
  discountAmount: number,
  finalPrice: number
) => {
  try {
    console.log('Attempting to send voucher applied email to:', to);

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Voucher Applied</h1>
        <p>Hi ${fullName},</p>
        <p>A voucher has been applied to your enrollment for the course: <strong>${courseTitle}</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Voucher Code:</strong> ${voucherCode}</p>
          <p><strong>Discount Amount:</strong> $${discountAmount.toFixed(2)}</p>
          <p><strong>Final Price:</strong> $${finalPrice.toFixed(2)}</p>
        </div>
        <p>This voucher has been retroactively applied to your enrollment by an administrator.</p>
        <a href="${process.env.FRONTEND_URL}/courses" style="${emailStyles.button}">View Courses</a>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'Voucher Applied - MedHome',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('Voucher applied email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending voucher applied email:', error);
    throw error;
  }
};

export const sendNewDeviceEmail = async (
  to: string,
  fullName: string,
  deviceName: string,
  deviceCount: number,
  maxDevices: number
) => {
  try {
    console.log('Attempting to send new device email to:', to);

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">New Device Login</h1>
        <p>Hi ${fullName},</p>
        <p>Your account was just accessed from a new device:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Device:</strong> ${deviceName}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>You are now logged in on <strong>${deviceCount} out of ${maxDevices}</strong> allowed devices.</p>
        <p>If this wasn't you, please reset your password immediately.</p>
        <a href="${process.env.FRONTEND_URL}/auth/request-password-reset" style="${emailStyles.button}">Secure My Account</a>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'New Device Login - MedHome',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('New device email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending new device email:', error);
    // Don't throw error to prevent blocking login
  }
};

export const sendDeviceLimitReachedEmail = async (
  to: string,
  fullName: string,
  deviceName: string,
  currentDevices: string[]
) => {
  try {
    console.log('Attempting to send device limit reached email to:', to);

    const deviceListHtml = currentDevices.map(d => `<li>${d}</li>`).join('');

    const html = `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.heading}">Login Blocked - Device Limit Reached</h1>
        <p>Hi ${fullName},</p>
        <p>We blocked a login attempt from a new device because you have reached your device limit (3 devices).</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Attempted Device:</strong> ${deviceName}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Your current active devices:</p>
        <ul>${deviceListHtml}</ul>
        <p>To use this new device, please remove one of your existing devices.</p>
        <p>If this attempt wasn't you, please reset your password immediately.</p>
      </div>
    `;

    const messageData = {
      from: fromEmail,
      to: [to],
      subject: 'Login Blocked: Device Limit Reached - MedHome',
      html
    };

    const result = await mg.messages.create(domain, messageData);
    console.log('Device limit email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending device limit email:', error);
  }
};
