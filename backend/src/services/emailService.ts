import nodemailer from 'nodemailer';

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

// Create test account for development if no credentials are provided
const createTestAccount = async () => {
  console.log('Starting email configuration...');
  console.log('Email credentials:', {
    user: process.env.EMAIL_USER ? 'Set' : 'Not set',
    pass: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set'
  });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('No email credentials found, creating test account...');
    const testAccount = await nodemailer.createTestAccount();
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false
    };
  }
  return {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false
  };
};

// Initialize transporter
let transporter: nodemailer.Transporter;

const initializeTransporter = async () => {
  const config = await createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    debug: true
  });

  // Verify transporter configuration
  try {
    const success = await transporter.verify();
    if (success) {
      console.log('Email server connection verified and ready to send messages');
    }
  } catch (error) {
    console.log('Email service error:', error);
    console.log('Credentials being used:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      // Don't log the actual password
      passLength: config.pass ? config.pass.length : 0
    });
  }
};

// Initialize the transporter
initializeTransporter();

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

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Verify Your Email - MedHome',
      html
    });

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

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Reset Your Password - MedHome',
      html
    });

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

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Password Changed - MedHome',
      html
    });

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending password change notification email:', error);
    throw error;
  }
};
