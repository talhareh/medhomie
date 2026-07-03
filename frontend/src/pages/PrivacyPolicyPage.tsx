import React from 'react';
import MedicMenu from './medicMaterial/MedicMenu';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MedicMenu />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">Privacy Policy</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Last updated: April 2026</p>
        <div className="bg-white rounded-lg shadow p-6 prose max-w-none">

          <p>MedHOME ("we", "our", or "us") operates the website <a href="https://medhome.courses">medhome.courses</a>. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform.</p>
          <p>By using MedHOME, you agree to the collection and use of information in accordance with this policy.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">1. Information We Collect</h2>
          <p>We collect the following types of personal information:</p>
          <ul>
            <li><strong>Account Information:</strong> Full name, email address, WhatsApp number, and password (stored as a secure hash).</li>
            <li><strong>Payment Information:</strong> Transaction records and payment method details processed via Kuickpay/Stripe. We do not store full card numbers.</li>
            <li><strong>Usage Data:</strong> Pages visited, courses accessed, lesson progress, quiz results, and login timestamps.</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device fingerprint for security purposes.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process payments and issue receipts.</li>
            <li>Provide access to enrolled courses and track your learning progress.</li>
            <li>Send you important updates, such as email verification, password resets, and course notifications.</li>
            <li>Prevent fraud, detect security incidents, and protect platform integrity.</li>
            <li>Improve our platform and personalize your experience.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">3. Data Storage and Security</h2>
          <p>Your data is stored on secured servers. We implement industry-standard security measures including:</p>
          <ul>
            <li>HTTPS encryption for all data in transit.</li>
            <li>Bcrypt hashing for passwords.</li>
            <li>JWT-based session management with refresh token rotation.</li>
            <li>Device-level session tracking to prevent unauthorized access.</li>
          </ul>
          <p>While we take reasonable precautions, no method of internet transmission is 100% secure. We encourage you to use a strong, unique password.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">4. Cookies and Local Storage</h2>
          <p>MedHOME uses browser local storage to store your authentication tokens and session preferences. We may also use cookies for analytics purposes. You can disable cookies in your browser settings, though some platform features may not function correctly.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">5. Third-Party Services</h2>
          <p>We work with the following third-party services that may process your data:</p>
          <ul>
            <li><strong>Kuickpay / Stripe:</strong> For payment processing. Subject to their respective privacy policies.</li>
            <li><strong>Cloudflare:</strong> For video and content delivery.</li>
            <li><strong>Email Service Provider:</strong> For sending transactional emails.</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">6. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., payment records).</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate or incomplete data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Object to or restrict certain types of processing.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:support@medhome.org">support@medhome.org</a>.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">8. Children's Privacy</h2>
          <p>MedHOME is intended for users aged 16 and above. We do not knowingly collect personal data from children under 16. If you believe a child has provided us with their data, please contact us immediately.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or a prominent notice on our website. Your continued use of MedHOME after changes take effect constitutes acceptance of the updated policy.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">10. Contact Us</h2>
          <ul>
            <li>📧 Email: <a href="mailto:support@medhome.org">support@medhome.org</a></li>
            <li>📲 WhatsApp: +92 301 4843695</li>
            <li>🌐 Website: <a href="https://medhome.courses" target="_blank" rel="noopener noreferrer">medhome.courses</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
