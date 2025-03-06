import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faSpinner,
  faEye,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { useAuth } from '../../contexts/AuthContext';
import { MainLayout } from '../../components/layout/MainLayout';
import api from '../../utils/axios';
import { EnrollmentStatus } from '../../types/enrollment';

// Server URL
const SERVER_URL = 'http://localhost:5000';
const API_UPLOADS_URL = `${SERVER_URL}/api/uploads`; // URL for accessing uploaded files

// Modal styles
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
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

interface Payment {
  _id: string;
  course: {
    _id: string;
    title: string;
    price: number;
  };
  status: EnrollmentStatus;
  enrollmentDate: string;
  paymentReceipt: string;
  rejectionReason?: string;
}

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Fetch student's payments (enrollments)
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: async () => {
      const response = await api.get<Payment[]>('/enrollments/my-enrollments');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error fetching payments');
    },
  });

  const getStatusIcon = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.APPROVED:
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case EnrollmentStatus.REJECTED:
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      case EnrollmentStatus.PENDING:
        return <FontAwesomeIcon icon={faSpinner} className="text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case EnrollmentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case EnrollmentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  const getReceiptUrl = (receiptPath: string) => {
    if (!receiptPath) {
      console.error('Receipt path is empty');
      return '';
    }
    
    if (receiptPath.startsWith('http')) {
      return receiptPath;
    }
    
    // Extract just the filename part if it includes the uploads directory
    let path = receiptPath;
    if (path.includes('uploads/')) {
      // Remove 'uploads/' from the path since the API endpoint already includes it
      path = path.replace('uploads/', '');
    }
    
    // Ensure there's no double slash when joining paths
    path = path.startsWith('/') ? path.substring(1) : path;
    
    // Use the correct API endpoint for accessing uploaded files
    return `${API_UPLOADS_URL}/${path}`;
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      if (!payment.paymentReceipt) {
        toast.error('No receipt available for download');
        return;
      }
      
      const receiptUrl = getReceiptUrl(payment.paymentReceipt);
      console.log('Downloading receipt from URL:', receiptUrl);
      
      const response = await fetch(receiptUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileExtension = payment.paymentReceipt.split('.').pop() || 'pdf';
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${payment._id}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Error downloading receipt: ${error.message || 'Unknown error'}`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Payments</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No payment history found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(payment.enrollmentDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${payment.course.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                      {payment.status === EnrollmentStatus.REJECTED && payment.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{payment.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Receipt"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(payment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download Receipt"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Receipt Viewer Modal */}
        <Modal
          isOpen={isReceiptModalOpen}
          onRequestClose={() => setIsReceiptModalOpen(false)}
          style={customModalStyles}
          contentLabel="View Receipt"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Payment Receipt</h2>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {selectedPayment && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <p><strong>Course:</strong> {selectedPayment.course.title}</p>
                  <p><strong>Amount:</strong> ${selectedPayment.course.price}</p>
                  <p><strong>Date:</strong> {format(new Date(selectedPayment.enrollmentDate), 'MMMM dd, yyyy')}</p>
                  <p><strong>Status:</strong> {selectedPayment.status}</p>
                  {selectedPayment.rejectionReason && (
                    <p><strong>Rejection Reason:</strong> {selectedPayment.rejectionReason}</p>
                  )}
                </div>
                
                <div className="mt-4">
                  {selectedPayment.paymentReceipt.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <>
                      <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded">
                        <p><strong>Troubleshooting:</strong></p>
                        <p>If image doesn't appear, try opening this URL directly:</p>
                        <a 
                          href={getReceiptUrl(selectedPayment.paymentReceipt)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {getReceiptUrl(selectedPayment.paymentReceipt)}
                        </a>
                      </div>
                      <img
                        src={getReceiptUrl(selectedPayment.paymentReceipt)}
                        alt="Payment Receipt"
                        className="max-w-full h-auto rounded-lg border"
                        onError={(e) => {
                          console.error('Image failed to load:', getReceiptUrl(selectedPayment.paymentReceipt));
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder-receipt.png';
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded">
                        <p><strong>Troubleshooting:</strong></p>
                        <p>If PDF doesn't appear, try opening this URL directly:</p>
                        <a 
                          href={getReceiptUrl(selectedPayment.paymentReceipt)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {getReceiptUrl(selectedPayment.paymentReceipt)}
                        </a>
                      </div>
                      <embed
                        src={getReceiptUrl(selectedPayment.paymentReceipt)}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                        className="rounded-lg border"
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
