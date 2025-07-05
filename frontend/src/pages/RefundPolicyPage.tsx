import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faUpload, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '70vh',
    padding: '2rem',
    borderRadius: '0.5rem',
    overflow: 'auto',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'auto',
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
};

const paymentInfo = {
  paypal: {
    title: 'PayPal',
    instructions: 'Pay with Credit/Debit Card',
    details: 'Secure online payment',
    useCardPayment: true
  },
  bankTransfer: {
    title: 'Bank Transfer',
    instructions: 'Transfer the course fee to our bank account',
    details: 'Account Number: XXXX-XXXX-XXXX-XXXX\nBank: Sample Bank\nAccount Title: MedHome'
  },
  easypaisa: {
    title: 'EasyPaisa',
    instructions: 'Send payment through EasyPaisa',
    details: 'Account Number: 03XX-XXXXXXX'
  },
  jazzcash: {
    title: 'JazzCash',
    instructions: 'Send payment through JazzCash',
    details: 'Account Number: 03XX-XXXXXXX'
  },
};

const RefundPolicyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const course = location.state?.course || null;

  const handleProceedToPayment = () => {
    setIsModalOpen(true);
  };

  const handleCardPayment = () => {
    setIsModalOpen(false);
    if (course) {
      navigate('/cardPayment', {
        state: {
          courseId: course._id,
          courseTitle: course.title,
          coursePrice: course.price
        }
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid file (JPEG, JPG, PNG, or PDF)');
      return;
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    setReceipt(file);
    setError(null);
  };

  const handleRemoveFile = () => {
    setReceipt(null);
    setError(null);
  };

  const handleSelectPayment = (key: string) => {
    setSelectedPayment(key);
    setReceipt(null);
    setError(null);
    if (key === 'paypal' && course) {
      setLoadingCard(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setLoadingCard(false);
        navigate('/cardPayment', {
          state: {
            courseId: course._id,
            courseTitle: course.title,
            coursePrice: course.price
          }
        });
      }, 2000);
    }
  };

  const handleProceedWithReceipt = () => {
    // Here you would handle the receipt upload logic (API call)
    setIsModalOpen(false);
    // Optionally show a toast or confirmation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">MedHOME Course Refund Policy</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-8 prose max-w-none overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <p>Thank you for enrolling in a MedHOME course. We are committed to providing structured, high-quality, and clinically relevant education. However, we understand that in certain circumstances, you may wish to request a refund.</p>
          <p>This policy applies to all live and digital courses offered through the MedHOME platform.</p>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">1. Eligibility for Refunds</h2>
          <p>Refund requests will be considered if all the following conditions are met:</p>
          <ul>
            <li>A written refund request is submitted within 72 hours (3 days) of purchase.</li>
            <li>The student has not accessed the course website or any official Telegram channels.</li>
            <li>The student has not attended more than one live session.</li>
            <li>No premium downloadable materials (e.g., eBooks, PDF packs, session recordings) have been accessed, viewed, or saved.</li>
          </ul>
          <p>If these criteria are satisfied, a full or partial refund may be issued at MedHOME's discretion.</p>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">2. Non-Refundable Circumstances</h2>
          <p>Refunds will not be granted in the following cases:</p>
          <ul>
            <li>The student has already accessed any part of the course (live session, recorded lecture, slides, Telegram materials).</li>
            <li>Failure to attend sessions due to personal scheduling conflicts.</li>
            <li>Course access was activated, and the student changed their mind afterward.</li>
            <li>The student enrolled via a non-refundable promotional or discounted offer.</li>
          </ul>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">3. How to Request a Refund</h2>
          <p>To initiate a refund request:</p>
          <ul>
            <li>Email: <a href="mailto:support@medhome.org">support@medhome.org</a> or WhatsApp: +92 301 4843695</li>
            <li>Provide:</li>
            <ul>
              <li>Full name</li>
              <li>Course name</li>
              <li>Date of enrollment</li>
              <li>Proof of payment</li>
              <li>Reason for refund request</li>
            </ul>
          </ul>
          <p>Our team will review the case and respond within 3–5 business days.</p>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">4. Refund Processing</h2>
          <ul>
            <li>Approved refunds will be issued to the original payment method (Bank transfer, Easypaisa, JazzCash, PayPal, Stripe).</li>
            <li>Please allow 5–10 business days after approval for the transaction to be completed.</li>
          </ul>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">5. Right to Decline Refund Requests</h2>
          <p>MedHOME reserves the right to refuse refunds that:</p>
          <ul>
            <li>Do not meet the eligibility requirements listed above.</li>
            <li>Are submitted after significant course usage or file downloads.</li>
            <li>Lack complete and verifiable payment details.</li>
          </ul>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">6. Course Changes or Cancellations by MedHOME</h2>
          <p>In the rare event that MedHOME cancels or significantly delays a course, students may choose to:</p>
          <ul>
            <li>Receive a full refund, or</li>
            <li>Be transferred to a future batch without extra cost.</li>
          </ul>
          <p>Affected students will be notified promptly via email or WhatsApp.</p>
          <hr className="my-4" />
          <h2 className="font-semibold text-lg">7. Contact Us</h2>
          <p>For refund or policy-related queries, please contact:</p>
          <ul>
            <li>MedHOME Official Support</li>
            <li>📧 Email: <a href="mailto:support@medhome.org">support@medhome.org</a></li>
            <li>📲 WhatsApp: +92 301 4843695</li>
            <li>🌐 Website: <a href="https://medhome.courses" target="_blank" rel="noopener noreferrer">medhome.courses</a></li>
          </ul>
          <hr className="my-4" />
          <p>MedHOME is a registered academic platform committed to student support, educational integrity, and transparent policy practices.</p>
          <p>Thank you for choosing us.</p>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-md transition duration-300 flex items-center"
            onClick={handleProceedToPayment}
          >
            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
            Proceed to Payment
          </button>
        </div>
      </div>
      {/* Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={customModalStyles}
        contentLabel="Payment Options"
      >
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">Select Payment Method</h2>
          <div className="space-y-6">
            {Object.entries(paymentInfo).map(([key, info]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 cursor-pointer ${selectedPayment === key ? 'ring-2 ring-primary' : ''} ${loadingCard && key === 'paypal' ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !loadingCard && handleSelectPayment(key)}
              >
                <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                  {info.title}
                  {loadingCard && key === 'paypal' && (
                    <FontAwesomeIcon icon={faSpinner} spin className="ml-2 text-primary" />
                  )}
                </h5>
                <p className="text-gray-600 mb-2">{info.instructions}</p>
                <pre className="bg-gray-100 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">{info.details}</pre>
                {selectedPayment === key && key !== 'paypal' && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Upload Payment Receipt</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="receipt-upload"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      {receipt ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{receipt.name}</span>
                          <button
                            onClick={handleRemoveFile}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="receipt-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faUpload} className="text-gray-400 text-3xl mb-2" />
                          <span className="text-gray-600 mb-1">Click to upload payment receipt</span>
                          <span className="text-gray-400 text-sm">JPG, PNG or PDF (max 5MB)</span>
                        </label>
                      )}
                      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            {selectedPayment && selectedPayment !== 'paypal' && (
              <button
                onClick={handleProceedWithReceipt}
                className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center ${!receipt ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!receipt}
              >
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Proceed with Receipt
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RefundPolicyPage; 