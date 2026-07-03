import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from 'react-modal';
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
    zIndex: 10,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
};

Modal.setAppElement('#root');

interface EnrolledStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const EnrolledStudentsModal: React.FC<EnrolledStudentsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['enrolled-students', courseId, searchTerm],
    queryFn: () => enrollmentService.getEnrolledStudents(courseId, searchTerm),
    enabled: isOpen,
    keepPreviousData: true,
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel={`Enrolled students for ${courseTitle}`}
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Enrolled Students — {courseTitle}
      </h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="overflow-x-auto max-h-[50vh]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WhatsApp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No enrolled students found
                </td>
              </tr>
            ) : (
              students.map((student: { _id: string; fullName: string; email: string; whatsappNumber?: string }) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.whatsappNumber ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
