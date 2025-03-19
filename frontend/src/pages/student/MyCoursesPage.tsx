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
      queryClient.invalidateQueries(['my-enrollments']);
      toast.success('Receipt uploaded successfully');
      setIsUploadModalOpen(false);
      setNewReceipt(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error uploading receipt');
    },
  });

  // Cancel enrollment mutation
  const cancelEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await api.delete(`/enrollments/${enrollmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-enrollments']);
      toast.success('Enrollment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error cancelling enrollment');
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate('/student/courses')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{enrollment.course.title}</h2>
                    <div className="flex items-center">
                      {getStatusIcon(enrollment.status)}
                      <span className={`ml-2 text-sm font-medium
                        ${enrollment.status === EnrollmentStatus.APPROVED ? 'text-green-600' : ''}
                        ${enrollment.status === EnrollmentStatus.PENDING ? 'text-yellow-600' : ''}
                        ${enrollment.status === EnrollmentStatus.REJECTED ? 'text-red-600' : ''}
                      `}>
                        {enrollment.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                    <p>Price: ${enrollment.course.price}</p>
                    {enrollment.status === EnrollmentStatus.REJECTED && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-red-700 flex items-center">
                          <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                          {enrollment.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-x-3">
                    {enrollment.status === EnrollmentStatus.APPROVED ? (
                      <button
                        onClick={() => navigate(`/courses/${enrollment.course._id}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Access Course
                      </button>
                    ) : enrollment.status === EnrollmentStatus.REJECTED ? (
                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setIsUploadModalOpen(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Upload New Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelEnrollment(enrollment._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Upload New Receipt</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Receipt File
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
                      <FontAwesomeIcon icon={faUpload} className="text-2xl mb-2" />
                      <p>Click to upload receipt</p>
                      <p className="text-sm text-gray-500">JPEG, JPG, PNG, or PDF (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  {newReceipt && (
                    <div className="text-sm text-gray-600">
                      Selected: {newReceipt.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUploadReceipt}
                  disabled={!newReceipt || uploadReceiptMutation.isLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {uploadReceiptMutation.isLoading ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
