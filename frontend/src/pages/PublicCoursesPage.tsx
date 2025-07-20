import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types/course';
import Modal from 'react-modal';
import MedicMenu from './medicMaterial/MedicMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes, faUpload, faCreditCard } from '@fortawesome/free-solid-svg-icons';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

// Add enrollment status type
export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Extend Course interface to include enrollment status
interface PublicCourse extends Course {
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
    transform: 'translate(-50%, -50%)',
    maxWidth: '600px',
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

export const PublicCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const response = await api.get<PublicCourse[]>('/public/courses');
      return response.data;
    },
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async ({ courseId, receipt }: { courseId: string; receipt: File }) => {
      const formData = new FormData();
      formData.append('paymentReceipt', receipt);
      
      const response = await api.post(`enrollments/courses/${courseId}/enroll`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Enrollment request submitted successfully');
      setIsEnrollModalOpen(false);
      setReceipt(null);
      setSelectedCourse(null);
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

  const handleEnrollClick = (course: PublicCourse) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // If already enrolled or pending, don't allow re-enrollment
    if (course.isEnrolled && course.enrollmentStatus !== EnrollmentStatus.REJECTED) {
      return;
    }

    // Route to refund policy page with course info
    navigate('/refund-policy', { state: { course } });
  };

  const handleEnrollSubmit = () => {
    if (!selectedCourse || !receipt) {
      toast.error('Please upload a receipt');
      return;
    }

    enrollMutation.mutate({
      courseId: selectedCourse._id,
      receipt,
    });
  };
  
  const handleCardPayment = () => {
    if (!selectedCourse) {
      toast.error('No course selected');
      return;
    }
    
    // Close the enrollment modal
    setIsEnrollModalOpen(false);
    
    // Navigate to card payment page with course details
    navigate('/cardPayment', {
      state: {
        courseId: selectedCourse._id,
        courseTitle: selectedCourse.title,
        coursePrice: selectedCourse.price
      }
    });
  };

  if (isLoadingCourses) {
    return (
      <div className="min-h-screen bg-background">
        <MedicMenu />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MedicMenu />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id.toString()} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Course Thumbnail */}
                <div className="h-48 bg-gray-200 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail.startsWith('http') ? course.thumbnail : course.thumbnail.replace('uploads/', '/api/uploads/')}
                      alt={course.title}
                      className="w-full h-full object-cover p-1 object-right-top"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-course.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                
                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-semibold text-primary">
                      {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700"
                      >
                        View Course
                      </button>
                      <button
                        onClick={() => handleEnrollClick(course)}
                        className={`px-4 py-2 rounded-md text-white ${
                          course.isEnrolled
                            ? course.enrollmentStatus === EnrollmentStatus.APPROVED
                              ? 'bg-green-500 cursor-default'
                              : course.enrollmentStatus === EnrollmentStatus.REJECTED
                              ? 'bg-red-500 cursor-default'
                              : 'bg-yellow-500 cursor-default'
                            : 'bg-primary hover:bg-primary-dark'
                        }`}
                        disabled={course.isEnrolled && course.enrollmentStatus !== EnrollmentStatus.REJECTED}
                      >
                        {course.isEnrolled
                          ? course.enrollmentStatus === EnrollmentStatus.APPROVED
                            ? 'Enrolled'
                            : course.enrollmentStatus === EnrollmentStatus.REJECTED
                            ? 'Rejected'
                            : 'Pending'
                          : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex justify-center items-center py-16">
              <p className="text-gray-500 text-lg">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Login Prompt Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onRequestClose={() => setIsLoginModalOpen(false)}
        style={customModalStyles}
        contentLabel="Login Required"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to enroll in a course. Please login or create an account to continue.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/auth?mode=login', { state: { from: '/courses' } });
              }}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/auth?mode=register', { state: { from: '/courses' } });
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Register
            </button>
          </div>
        </div>
      </Modal>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onRequestClose={() => setIsEnrollModalOpen(false)}
        style={customModalStyles}
        contentLabel="Enrollment Form"
      >
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Enrollment Form</h2>
            <button
              onClick={() => setIsEnrollModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {selectedCourse && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedCourse.title}</h3>
              <p className="text-gray-600 mb-2">Price: ${selectedCourse.price.toFixed(2)}</p>
            </div>
          )}

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
            <h4 className="text-lg font-medium text-gray-800 mb-4">Upload Payment Receipt</h4>
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
    </div>
  );
};
