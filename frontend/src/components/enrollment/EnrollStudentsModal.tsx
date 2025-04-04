import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { Student, EnrollmentModalProps } from '../../types/enrollment';
import { enrollmentService } from '../../services/enrollmentService';

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
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

Modal.setAppElement('#root');

export const EnrollStudentsModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onEnroll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Query for available students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['available-students', courseId, searchTerm],
    queryFn: () => enrollmentService.getAvailableStudents(courseId, searchTerm),
    keepPreviousData: true
  });

  // Mutation for bulk enrollment
  const enrollMutation = useMutation({
    mutationFn: (studentIds: string[]) => enrollmentService.bulkEnrollStudents(courseId, studentIds),
    onSuccess: () => {
      toast.success('Students enrolled successfully');
      queryClient.invalidateQueries(['enrollments', courseId]);
      queryClient.invalidateQueries(['available-students', courseId]);
      onClose();
      setSelectedStudents([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enroll students');
    }
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && students) {
      setSelectedStudents(students.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    enrollMutation.mutate(selectedStudents);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Enroll Students"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Enroll Students - {courseTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={students.length > 0 && selectedStudents.length === students.length}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleSelectStudent(student._id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.whatsappNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={selectedStudents.length === 0 || enrollMutation.isLoading}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrollMutation.isLoading ? 'Enrolling...' : 'Enroll Selected'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
