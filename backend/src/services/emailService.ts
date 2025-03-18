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
