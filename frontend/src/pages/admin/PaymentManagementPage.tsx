import React, { useState } from 'react';
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
  faNoteSticky
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Enrollment, EnrollmentStatus } from '../../types/enrollment';
import api from '../../utils/axios';
import { MainLayout } from '../../components/layout/MainLayout';

// Server URL for receipt files
const SERVER_URL = 'http://localhost:5000';

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
  if (receiptPath.startsWith('http')) {
    return receiptPath;
  }
  return `${SERVER_URL}/${receiptPath}`;
};

export const PaymentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      start: '',
      end: '',
    },
    status: '',
    searchTerm: '',
  });

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

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Management</h1>
          
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="border rounded px-2 py-1"
              />
              <span>to</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="border rounded px-2 py-1"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value as EnrollmentStatus | ''
              }))}
              className="border rounded px-2 py-1"
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
              className="border rounded px-3 py-1 w-64"
            />
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
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
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.student.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.course.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.student.whatsappNumber || '-'}
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setIsReceiptModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Receipt"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            
            {selectedEnrollment?.paymentReceipt && (
              <div className="max-h-[70vh] overflow-auto">
                {selectedEnrollment.paymentReceipt.endsWith('.pdf') ? (
                  <embed
                    src={getReceiptUrl(selectedEnrollment.paymentReceipt)}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  />
                ) : (
                  <img
                    src={getReceiptUrl(selectedEnrollment.paymentReceipt)}
                    alt="Payment Receipt"
                    className="max-w-full"
                  />
                )}
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
      </div>
    </MainLayout>
  );
};
