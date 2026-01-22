import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faEye, 
  faFilter,
  faNoteSticky,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Enrollment, EnrollmentStatus } from '../../types/enrollment';
import api from '../../utils/axios';
import { MainLayout } from '../../components/layout/MainLayout';
import { UpdateExpirationModal } from '../../components/enrollment/UpdateExpirationModal';
import { enrollmentService } from '../../services/enrollmentService';

// Server URL for receipt files
const SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://uat.medhome.courses'; // Dynamic server URL based on environment
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
};

interface Filters {
  dateRange: {
    start: string;
    end: string;
  };
  status: EnrollmentStatus | '';
  searchTerm: string;
}

const getReceiptUrl = (receiptPath: string): string => {
  if (!receiptPath) {
    console.error('Receipt path is empty');
    return '';
  }
  
  if (receiptPath.startsWith('http')) {
    console.log('Receipt path is already a full URL:', receiptPath);
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
  const fullUrl = `${API_UPLOADS_URL}/${path}`;
  console.log('Constructed receipt URL:', fullUrl);
  
  // Test URL directly in browser
  console.log('Test this URL directly in your browser:', fullUrl);
  
  return fullUrl;
};

export const PaymentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isUpdateExpirationModalOpen, setIsUpdateExpirationModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [testingServer, setTestingServer] = useState(false);
  const [serverTestResult, setServerTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      start: '',
      end: '',
    },
    status: '',
    searchTerm: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Fetch enrollments
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.dateRange.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange.end) params.append('endDate', filters.dateRange.end);
      if (filters.status) params.append('status', filters.status);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      
      const response = await api.get<Enrollment[]>('/enrollments', { params });
      return response.data;
    },
  });

  // Update enrollment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      status, 
      rejectionReason 
    }: { 
      enrollmentId: string; 
      status: EnrollmentStatus; 
      rejectionReason?: string;
    }) => {
      const response = await api.patch(`/enrollments/${enrollmentId}/status`, {
        status,
        rejectionReason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
      toast.success('Enrollment status updated successfully');
      setIsRejectModalOpen(false);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating enrollment status');
    },
  });

  // Update admin notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      notes 
    }: { 
      enrollmentId: string; 
      notes: string;
    }) => {
      const response = await api.patch(`/enrollments/${enrollmentId}/notes`, { notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
      toast.success('Notes updated successfully');
      setIsNotesModalOpen(false);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error updating notes');
    },
  });

  const handleApprove = (enrollment: Enrollment) => {
    updateStatusMutation.mutate({
      enrollmentId: enrollment._id,
      status: EnrollmentStatus.APPROVED,
    });
  };

  const handleReject = () => {
    if (!selectedEnrollment || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    updateStatusMutation.mutate({
      enrollmentId: selectedEnrollment._id,
      status: EnrollmentStatus.REJECTED,
      rejectionReason: rejectionReason.trim(),
    });
  };

  const handleUpdateNotes = () => {
    if (!selectedEnrollment || !adminNotes.trim()) {
      toast.error('Please provide notes');
      return;
    }

    updateNotesMutation.mutate({
      enrollmentId: selectedEnrollment._id,
      notes: adminNotes.trim(),
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(enrollments.length / itemsPerPage);
  const indexOfLastEnrollment = currentPage * itemsPerPage;
  const indexOfFirstEnrollment = indexOfLastEnrollment - itemsPerPage;
  const currentEnrollments = enrollments.slice(indexOfFirstEnrollment, indexOfLastEnrollment);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.dateRange.start, filters.dateRange.end, filters.status, filters.searchTerm]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Payment Management</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-sm text-gray-600">to</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value as EnrollmentStatus | ''
              }))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value={EnrollmentStatus.PENDING}>Pending</option>
              <option value={EnrollmentStatus.APPROVED}>Approved</option>
              <option value={EnrollmentStatus.REJECTED}>Rejected</option>
            </select>

            <input
              type="text"
              placeholder="Search by name, email, or course"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                searchTerm: e.target.value
              }))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Enrollments Table */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEnrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.student?.fullName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.student?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.student?.whatsappNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.course?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${enrollment.course?.price ? enrollment.course.price.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.paymentMethod === 'paypal' ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Card Payment
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${enrollment.status === EnrollmentStatus.APPROVED ? 'bg-green-100 text-green-800' : ''}
                      ${enrollment.status === EnrollmentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${enrollment.status === EnrollmentStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.expirationDate ? (
                      <div>
                        <div className={`${
                          enrollment.isExpired 
                            ? 'text-red-600 font-semibold' 
                            : new Date(enrollment.expirationDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            ? 'text-yellow-600 font-semibold'
                            : 'text-gray-900'
                        }`}>
                          {new Date(enrollment.expirationDate).toLocaleDateString()}
                        </div>
                        {enrollment.isExpired && (
                          <span className="text-xs text-red-600">Expired</span>
                        )}
                        {!enrollment.isExpired && new Date(enrollment.expirationDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <span className="text-xs text-yellow-600">
                            Expires in {Math.ceil((new Date(enrollment.expirationDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('Selected enrollment:', enrollment);
                          console.log('Receipt path from DB:', enrollment.paymentReceipt);
                          
                          // Verify file exists by logging details
                          const receiptUrl = getReceiptUrl(enrollment.paymentReceipt || '');
                          console.log('Full receipt URL:', receiptUrl);
                          console.log('To verify if file exists, open this URL in a new browser tab:', receiptUrl);
                          
                          setSelectedEnrollment(enrollment);
                          setIsReceiptModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Receipt"
                        disabled={!enrollment.paymentReceipt}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      {enrollment.status === EnrollmentStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleApprove(enrollment)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setIsRejectModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setAdminNotes(enrollment.adminNotes || '');
                          setIsNotesModalOpen(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Add Notes"
                      >
                        <FontAwesomeIcon icon={faNoteSticky} />
                      </button>

                      {enrollment.status === EnrollmentStatus.APPROVED && (
                        <button
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setIsUpdateExpirationModalOpen(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Update Expiration Date"
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>

            {/* Pagination */}
            {enrollments.length > 0 && (
              <div className="bg-white rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstEnrollment + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastEnrollment, enrollments.length)}</span> of{' '}
                  <span className="font-medium">{enrollments.length}</span> enrollments
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Receipt Modal */}
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
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {selectedEnrollment?.paymentReceipt ? (
              <div className="max-h-[70vh] overflow-auto">
                {(() => {
                  const receiptUrl = getReceiptUrl(selectedEnrollment.paymentReceipt);
                  console.log('Modal rendering receipt URL:', receiptUrl);
                  
                  if (selectedEnrollment.paymentReceipt.endsWith('.pdf')) {
                    return (
                      <embed
                        src={receiptUrl}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                      />
                    );
                  } else {
                    return (
                      <>
                        <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded">
                          <p><strong>Troubleshooting:</strong></p>
                          <p>If image doesn't appear, try opening this URL directly:</p>
                          <a 
                            href={receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-all"
                          >
                            {receiptUrl}
                          </a>
                        </div>
                        <img
                          src={receiptUrl}
                          alt="Payment Receipt"
                          className="max-w-full border"
                          onError={(e) => {
                            console.error('Image failed to load:', receiptUrl);
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            // Just use a fallback image without showing a toast
                            target.src = '/placeholder-receipt.png';
                          }}
                        />
                      </>
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No receipt available for this enrollment
              </div>
            )}
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onRequestClose={() => setIsRejectModalOpen(false)}
          style={customModalStyles}
          contentLabel="Reject Enrollment"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Reject Enrollment</h2>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-32 px-3 py-2 border rounded-lg resize-none"
                placeholder="Enter reason for rejection..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleReject}
                disabled={updateStatusMutation.isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                {updateStatusMutation.isLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Notes Modal */}
        <Modal
          isOpen={isNotesModalOpen}
          onRequestClose={() => setIsNotesModalOpen(false)}
          style={customModalStyles}
          contentLabel="Admin Notes"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Admin Notes</h2>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full h-32 px-3 py-2 border rounded-lg resize-none"
                placeholder="Enter admin notes..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdateNotes}
                disabled={updateNotesMutation.isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {updateNotesMutation.isLoading ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Update Expiration Modal */}
        {selectedEnrollment && (
          <UpdateExpirationModal
            isOpen={isUpdateExpirationModalOpen}
            onClose={() => {
              setIsUpdateExpirationModalOpen(false);
              setSelectedEnrollment(null);
            }}
            enrollmentId={selectedEnrollment._id}
            currentExpirationDate={selectedEnrollment.expirationDate}
            onUpdate={async (expirationDate: string) => {
              await enrollmentService.updateEnrollmentExpiration(selectedEnrollment._id, expirationDate);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
