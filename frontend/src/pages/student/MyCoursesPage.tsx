import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faTimes, 
  faExclamationCircle,
  faCheckCircle,
  faTimesCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Enrollment, EnrollmentStatus } from '../../types/enrollment';
import api from '../../utils/axios';
import { MainLayout } from '../../components/layout/MainLayout';

// Modal styles
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
};

export const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newReceipt, setNewReceipt] = useState<File | null>(null);

  // Fetch user's enrollments
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const response = await api.get<Enrollment[]>('/enrollments/my-enrollments');
      return response.data;
    },
  });

  // Upload new receipt mutation
  const uploadReceiptMutation = useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      receipt 
    }: { 
      enrollmentId: string; 
      receipt: File;
    }) => {
      const formData = new FormData();
      formData.append('receipt', receipt);
      
      const response = await api.patch(`/enrollments/${enrollmentId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      toast.success('Receipt uploaded successfully');
      setIsUploadModalOpen(false);
      setNewReceipt(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error uploading receipt';
      toast.error(errorMessage);
    },
  });

  // Cancel enrollment mutation
  const cancelEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await api.delete(`/enrollments/${enrollmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      toast.success('Enrollment cancelled successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
        error.message || 
        'Error cancelling enrollment';
      toast.error(errorMessage);
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

    setNewReceipt(file);
  };

  const handleUploadReceipt = () => {
    if (!selectedEnrollment || !newReceipt) {
      toast.error('Please select a file');
      return;
    }

    uploadReceiptMutation.mutate({
      enrollmentId: selectedEnrollment._id,
      receipt: newReceipt,
    });
  };

  const handleCancelEnrollment = (enrollmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this enrollment?')) {
      cancelEnrollmentMutation.mutate(enrollmentId);
    }
  };

  const getStatusIcon = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.APPROVED:
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case EnrollmentStatus.REJECTED:
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      case EnrollmentStatus.PENDING:
        return <FontAwesomeIcon icon={faSpinner} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">My Courses</h1>
          <div className="text-sm text-gray-600">
            {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate('/student/courses')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 sm:mb-0 line-clamp-2">
                      {enrollment.course?.title || 'Course unavailable'}
                    </h2>
                    <div className="flex items-center flex-shrink-0">
                      {getStatusIcon(enrollment.status)}
                      <span className={`ml-2 text-xs md:text-sm font-medium px-2 py-1 rounded
                        ${enrollment.status === EnrollmentStatus.APPROVED ? 'text-green-600 bg-green-50' : ''}
                        ${enrollment.status === EnrollmentStatus.PENDING ? 'text-yellow-600 bg-yellow-50' : ''}
                        ${enrollment.status === EnrollmentStatus.REJECTED ? 'text-red-600 bg-red-50' : ''}
                      `}>
                        {enrollment.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                    <p>Price: ${enrollment.course?.price || 0}</p>
                    {enrollment.status === EnrollmentStatus.REJECTED && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-red-700 flex items-start text-xs md:text-sm">
                          <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 mt-0.5 flex-shrink-0" />
                          <span>{enrollment.rejectionReason}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {enrollment.status === EnrollmentStatus.APPROVED ? (
                      <button
                        onClick={() => navigate(`/courses/${enrollment.course?._id}`)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                        disabled={!enrollment.course}
                      >
                        Access Course
                      </button>
                    ) : enrollment.status === EnrollmentStatus.REJECTED ? (
                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setIsUploadModalOpen(true);
                        }}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Upload New Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelEnrollment(enrollment._id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Cancel Enrollment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload New Receipt Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onRequestClose={() => setIsUploadModalOpen(false)}
          style={customModalStyles}
          contentLabel="Upload New Receipt"
        >
          <div className="space-y-6 max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold">Upload New Receipt</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Receipt File
                </label>
                <div className="space-y-3">
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                      <FontAwesomeIcon icon={faUpload} className="text-2xl mb-2 text-gray-400" />
                      <p className="text-sm md:text-base">Click to upload receipt</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">JPEG, JPG, PNG, or PDF (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  {newReceipt && (
                    <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                      Selected: {newReceipt.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadReceipt}
                  disabled={!newReceipt || uploadReceiptMutation.isPending}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  {uploadReceiptMutation.isPending ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
