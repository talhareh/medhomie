import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Course, Filters, ActiveFilters } from '../types/course';
import Modal from 'react-modal';
import { Header } from '../components/common/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';

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

const defaultFilters = {
  testingBodies: ['PMDC', 'GMC', 'NBME'],
  specialties: ['Gynae', 'Medicine', 'Surgery', 'Peads'],
  courseTypes: ['FCPS', 'PLAB', 'USMLE']
};

const paymentInfo = {
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
  paypal: {
    title: 'PayPal',
    instructions: 'Send payment through PayPal',
    details: 'Email: payment@medhome.com'
  }
};

export const PublicCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    testingBody: [],
    specialty: [],
    courseType: []
  });

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['public-courses', activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      activeFilters.testingBody.forEach(body => params.append('testingBody', body));
      activeFilters.specialty.forEach(spec => params.append('specialty', spec));
      activeFilters.courseType.forEach(type => params.append('courseType', type));
      
      const response = await api.get<Course[]>('/courses/public', { params });
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

  const handleEnrollClick = (course: Course) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
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

  const toggleFilter = (category: keyof ActiveFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const removeFilter = (category: keyof ActiveFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== value)
    }));
  };

  if (isLoadingCourses) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>
              
              {/* Testing Body Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Testing Body</h3>
                <div className="space-y-2">
                  {defaultFilters.testingBodies.map(body => (
                    <label key={body} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.testingBody.includes(body)}
                        onChange={() => toggleFilter('testingBody', body)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{body}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Specialty</h3>
                <div className="space-y-2">
                  {defaultFilters.specialties.map(spec => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.specialty.includes(spec)}
                        onChange={() => toggleFilter('specialty', spec)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Course Type Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Course Type</h3>
                <div className="space-y-2">
                  {defaultFilters.courseTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.courseType.includes(type)}
                        onChange={() => toggleFilter('courseType', type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {Object.entries(activeFilters).some(([_, values]) => values.length > 0) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([category, values]) =>
                  values.map(value => (
                    <span
                      key={`${category}-${value}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {value}
                      <button
                        onClick={() => removeFilter(category as keyof ActiveFilters, value)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            )}

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        Price: ${course.price}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View More
                      </button>
                      <button
                        onClick={() => handleEnrollClick(course)}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Enroll
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results Message */}
            {courses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900">No courses found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters to find more courses.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onRequestClose={() => setIsEnrollModalOpen(false)}
        style={customModalStyles}
        contentLabel="Enrollment Modal"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Enroll in {selectedCourse?.title}</h2>
            <button
              onClick={() => setIsEnrollModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="space-y-4">
            {Object.values(paymentInfo).map((info) => (
              <div key={info.title} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{info.title}</h3>
                <p className="text-gray-600">{info.instructions}</p>
                <pre className="bg-gray-50 p-2 rounded mt-2 text-sm">{info.details}</pre>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Upload Payment Receipt</h3>
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
                {receipt && (
                  <div className="text-sm text-gray-600">
                    Selected: {receipt.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleEnrollSubmit}
                disabled={!receipt || enrollMutation.isLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {enrollMutation.isLoading ? 'Submitting...' : 'Submit Enrollment'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onRequestClose={() => setIsLoginModalOpen(false)}
        style={customModalStyles}
        contentLabel="Login Required"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Login Required</h2>
          <p className="text-gray-600">
            Please log in or create an account to enroll in courses.
          </p>
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/auth');
              }}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Log In / Sign Up
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
