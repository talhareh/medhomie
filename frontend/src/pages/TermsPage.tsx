import React from 'react';
import MedicMenu from './medicMaterial/MedicMenu';
import MedicFooter from './medicMaterial/MedicFooter';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MedicMenu />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">Terms &amp; Conditions</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Last updated: April 2026</p>
        <div className="bg-white rounded-lg shadow p-6 prose max-w-none">

          <p>Welcome to MedHOME. By accessing or using our website at <a href="https://medhome.courses">medhome.courses</a>, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before using our platform.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">1. Acceptance of Terms</h2>
          <p>By registering an account, enrolling in a course, or using any part of the MedHOME platform, you confirm that you are at least 16 years of age and agree to these Terms &amp; Conditions in full. If you do not agree, you must not use our platform.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">2. Account Registration</h2>
          <ul>
            <li>You must provide accurate, complete, and current information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must notify us immediately at <a href="mailto:support@medhome.org">support@medhome.org</a> if you suspect any unauthorised access to your account.</li>
            <li>MedHOME reserves the right to suspend or terminate accounts that violate these terms.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">3. Course Enrolment and Access</h2>
          <ul>
            <li>Upon successful payment, you are granted a limited, non-transferable, non-exclusive licence to access the enrolled course content for personal, non-commercial educational use.</li>
            <li>Course access is restricted to the number of devices permitted under your account (currently up to 3 devices).</li>
            <li>You may not share your login credentials or course materials with others.</li>
            <li>MedHOME reserves the right to modify, update, or discontinue course content at any time.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">4. Payments and Pricing</h2>
          <ul>
            <li>All course fees are displayed on the platform and are subject to change without notice.</li>
            <li>Payments are processed securely via Kuickpay, Stripe, EasyPaisa, or JazzCash.</li>
            <li>Enrolment is confirmed only after successful payment verification.</li>
            <li>For refund eligibility, please refer to our <a href="/refund-policy">Refund Policy</a>.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">5. Intellectual Property</h2>
          <p>All content on the MedHOME platform — including but not limited to videos, slides, PDFs, quiz questions, blog posts, and course materials — is the exclusive intellectual property of MedHOME or its content partners.</p>
          <ul>
            <li>You may not copy, reproduce, distribute, record, or share any course content without written permission from MedHOME.</li>
            <li>Unauthorised distribution of course materials may result in immediate account termination and legal action.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for any unlawful purpose.</li>
            <li>Attempt to gain unauthorised access to any part of the platform or its systems.</li>
            <li>Upload or transmit malicious code, spam, or harmful content.</li>
            <li>Impersonate another user or MedHOME staff.</li>
            <li>Scrape, crawl, or extract data from the platform without authorisation.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">7. Device Limits and Security</h2>
          <p>To protect course content integrity, MedHOME tracks device access. Accounts found to be sharing access across an unusual number of devices may be suspended pending review. You agree to this monitoring as a condition of use.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">8. Disclaimers</h2>
          <ul>
            <li>Course content is provided for <strong>educational purposes only</strong> and does not constitute medical advice.</li>
            <li>MedHOME does not guarantee any specific exam results or career outcomes.</li>
            <li>The platform is provided "as is" without warranties of any kind, express or implied.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, MedHOME shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform, including loss of data or interruption of service.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">10. Changes to These Terms</h2>
          <p>MedHOME reserves the right to update these Terms &amp; Conditions at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We will notify registered users of significant changes by email.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">11. Governing Law</h2>
          <p>These Terms &amp; Conditions are governed by and construed in accordance with the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Pakistan.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">12. Contact Us</h2>
          <ul>
            <li>📧 Email: <a href="mailto:support@medhome.org">support@medhome.org</a></li>
            <li>📲 WhatsApp: +92 301 4843695</li>
            <li>🌐 Website: <a href="https://medhome.courses" target="_blank" rel="noopener noreferrer">medhome.courses</a></li>
          </ul>
        </div>
      </div>
      <MedicFooter />
    </div>
  );
};

export default TermsPage;
