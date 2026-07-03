import React from 'react';
import MedicMenu from './medicMaterial/MedicMenu';
import MedicFooter from './medicMaterial/MedicFooter';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MedicMenu />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">Cookie Policy</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Last updated: April 2026</p>
        <div className="bg-white rounded-lg shadow p-6 prose max-w-none">

          <p>This Cookie Policy explains how MedHOME ("we", "our", or "us") uses cookies and similar technologies when you visit <a href="https://medhome.courses">medhome.courses</a>. By continuing to use our website, you consent to the use of cookies as described in this policy.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">1. What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work more efficiently and to provide information to website owners. MedHOME also uses browser <strong>local storage</strong> — a similar technology that stores data in your browser without an expiry date.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">2. What We Store and Why</h2>
          <p>MedHOME uses browser local storage (not traditional cookies) to manage your session. The following data is stored:</p>
          <ul>
            <li><strong>Authentication token</strong> — keeps you logged in during your session.</li>
            <li><strong>Refresh token</strong> — allows your session to be renewed automatically without requiring you to log in again.</li>
            <li><strong>Token expiry</strong> — used to determine when your session should be refreshed.</li>
          </ul>
          <p>This data is stored locally in your browser and is never shared with third parties for marketing purposes.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">3. Third-Party Cookies</h2>
          <p>Some third-party services integrated into our platform may set their own cookies:</p>
          <ul>
            <li><strong>Kuickpay / Stripe:</strong> Payment processing services may set cookies to manage secure payment sessions.</li>
            <li><strong>Cloudflare:</strong> Used for content delivery and security. Cloudflare may set cookies to distinguish legitimate users from bots.</li>
          </ul>
          <p>We do not control these third-party cookies. Please refer to the respective privacy policies of these providers for more information.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">4. How Long Is Data Stored?</h2>
          <ul>
            <li><strong>Access token:</strong> Valid for 24 hours.</li>
            <li><strong>Refresh token:</strong> Valid for 7 days.</li>
            <li>Both are automatically cleared when you log out.</li>
          </ul>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">5. Your Choices</h2>
          <p>You can control or delete data stored by your browser at any time:</p>
          <ul>
            <li>In <strong>Chrome</strong>: Settings → Privacy and Security → Clear browsing data → Cookies and other site data.</li>
            <li>In <strong>Firefox</strong>: Settings → Privacy &amp; Security → Cookies and Site Data → Clear Data.</li>
            <li>In <strong>Safari</strong>: Preferences → Privacy → Manage Website Data.</li>
          </ul>
          <p>Please note that clearing local storage will log you out of MedHOME and you will need to sign in again.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">6. Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes your acceptance.</p>

          <hr className="my-4" />
          <h2 className="font-semibold text-lg">7. Contact Us</h2>
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

export default CookiePolicyPage;
