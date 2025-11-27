import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faCreditCard, faTag, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/axios';
import { Course } from '../../types/course';
import { EnrollmentStatus } from '../../types/enrollment';
import { voucherService } from '../../services/voucherService';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

// Extend Course interface to include enrollment status
interface CourseWithEnrollment extends Course {
  isEnrolled?: boolean;
  enrollmentStatus?: EnrollmentStatus;
}

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    marginTop: '2vh',
    transform: 'translate(-50%, -50%)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    padding: '2rem',
    borderRadius: '0.5rem',
    overflow: 'auto',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'auto',
    paddingTop: '4rem',
    paddingBottom: '4rem',
  },
};

const paymentInfo = {
  paypal: {
    title: 'PayPal',
    instructions: 'Pay with Credit/Debit Card',
    details: 'Secure online payment',
    useCardPayment: true
  },

};

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: CourseWithEnrollment | null;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  selectedCourse
}) => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [voucherValid, setVoucherValid] = useState<{
    valid: boolean;
    discountAmount?: number;
    finalPrice?: number;
    originalPrice?: number;
    message?: string;
  } | null>(null);

  // Validate voucher mutation
  const validateVoucherMutation = useMutation({
    mutationFn: async ({ code, courseId }: { code: string; courseId: string }) => {
      return voucherService.validateVoucher(code, courseId);
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setVoucherValid({
          valid: true,
          discountAmount: data.data.discountAmount,
          finalPrice: data.data.finalPrice,
          originalPrice: data.data.originalPrice
        });
        toast.success(`Voucher applied! You save $${data.data.discountAmount.toFixed(2)}`);
      } else {
        setVoucherValid({
          valid: false,
          message: data.message || 'Invalid voucher code'
        });
        toast.error(data.message || 'Invalid voucher code');
      }
      setVoucherValidating(false);
    },
    onError: (error: any) => {
      setVoucherValid({
        valid: false,
        message: error.response?.data?.message || 'Error validating voucher'
      });
      toast.error(error.response?.data?.message || 'Error validating voucher');
      setVoucherValidating(false);
    }
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async ({ courseId, receipt, voucherCode }: { courseId: string; receipt: File; voucherCode?: string }) => {
      const formData = new FormData();
      formData.append('paymentReceipt', receipt);
      if (voucherCode && voucherValid?.valid) {
        formData.append('voucherCode', voucherCode);
      }
      
      const response = await api.post(`enrollments/courses/${courseId}/enroll`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Enrollment request submitted successfully');
      onClose();
      setReceipt(null);
      // Refresh the page after successful enrollment
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error submitting enrollment');
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid file (JPEG, JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setReceipt(file);
  };

  const handleVoucherValidate = () => {
    if (!selectedCourse || !voucherCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }

    setVoucherValidating(true);
    setVoucherValid(null);
    validateVoucherMutation.mutate({
      code: voucherCode.trim(),
      courseId: selectedCourse._id
    });
  };

  const handleVoucherRemove = () => {
    setVoucherCode('');
    setVoucherValid(null);
  };

  const handleEnrollSubmit = () => {
    if (!selectedCourse || !receipt) {
      toast.error('Please upload a receipt');
      return;
    }

    enrollMutation.mutate({
      courseId: selectedCourse._id,
      receipt,
      voucherCode: voucherValid?.valid ? voucherCode.trim() : undefined
    });
  };

  const handleCardPayment = () => {
    if (!selectedCourse) {
      toast.error('No course selected');
      return;
    }
    
    // Close the enrollment modal
    onClose();
    
    // Navigate to card payment page with course details
    navigate('/cardPayment', {
      state: {
        courseId: selectedCourse._id,
        courseTitle: selectedCourse.title,
        coursePrice: voucherValid?.valid ? voucherValid.finalPrice! : selectedCourse.price,
        originalPrice: selectedCourse.price,
        voucherCode: voucherValid?.valid ? voucherCode.trim() : undefined,
        discountAmount: voucherValid?.discountAmount
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Enrollment Form"
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Enrollment Form</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {selectedCourse && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedCourse.title}</h3>
            <div className="text-gray-600 mb-2">
              {voucherValid?.valid ? (
                <div>
                  <p className="line-through text-gray-400">Original Price: ${voucherValid.originalPrice?.toFixed(2)}</p>
                  <p className="text-green-600 font-semibold">
                    Final Price: ${voucherValid.finalPrice?.toFixed(2)} 
                    <span className="text-sm text-gray-600 ml-2">
                      (Save ${voucherValid.discountAmount?.toFixed(2)})
                    </span>
                  </p>
                </div>
              ) : (
                <p>Price: ${selectedCourse.price.toFixed(2)}</p>
              )}
            </div>
          </div>
        )}

        {/* Voucher Code Section */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-3">Have a Voucher Code?</h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value.toUpperCase());
                  setVoucherValid(null);
                }}
                placeholder="Enter voucher code"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={voucherValidating || voucherValid?.valid === true}
              />
            </div>
            {!voucherValid?.valid && (
              <button
                onClick={handleVoucherValidate}
                disabled={voucherValidating || !voucherCode.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  voucherValidating || !voucherCode.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {voucherValidating ? 'Validating...' : 'Apply'}
              </button>
            )}
            {voucherValid?.valid && (
              <button
                onClick={handleVoucherRemove}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
              </button>
            )}
          </div>
          {voucherValid && (
            <div className={`mt-2 p-2 rounded flex items-center gap-2 ${
              voucherValid.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <FontAwesomeIcon 
                icon={voucherValid.valid ? faCheckCircle : faTimesCircle} 
                className={voucherValid.valid ? 'text-green-600' : 'text-red-600'}
              />
              <span className="text-sm">
                {voucherValid.valid 
                  ? `Voucher applied! Discount: $${voucherValid.discountAmount?.toFixed(2)}`
                  : voucherValid.message || 'Invalid voucher code'
                }
              </span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Payment Methods</h4>
          <div className="space-y-6">
            {Object.entries(paymentInfo).map(([key, info]) => (
              <div key={key} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">{info.title}</h5>
                <p className="text-gray-600 mb-2">{info.instructions}</p>
                <pre className="bg-gray-100 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                  {info.details}
                </pre>
                {(info as any).useCardPayment && (
                  <div className="mt-4">
                    <button
                      onClick={handleCardPayment}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Pay with Card
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Already paid through Bank. Upload Payment Receipt</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="receipt"
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
            />
            {receipt ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{receipt.name}</span>
                <button
                  onClick={() => setReceipt(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="receipt"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <FontAwesomeIcon icon={faUpload} className="text-gray-400 text-3xl mb-2" />
                <span className="text-gray-600 mb-1">Click to upload payment receipt</span>
                <span className="text-gray-400 text-sm">JPG, PNG or PDF (max 5MB)</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleEnrollSubmit}
            disabled={!receipt || enrollMutation.isPending}
            className={`px-6 py-2 rounded-md text-white ${
              !receipt || enrollMutation.isPending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {enrollMutation.isPending ? 'Submitting...' : 'Submit Enrollment'}
          </button>
        </div>
      </div>
    </Modal>
  );
}; 