// EnrollmentModal.tsx - Modal for course enrollment requirements
import React from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

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
    maxWidth: '500px',
    width: '90%',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

interface EnrollmentModalProps {
  isOpen: boolean;
  courseId: string;
  onClose: () => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  courseId,
  onClose
}) => {
  const navigate = useNavigate();
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Enrollment Required"
    >
      <div className="text-center">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-full inline-flex items-center justify-center mb-4">
          <FontAwesomeIcon icon={faLock} size="2x" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Enrollment Required</h2>
        <p className="text-neutral-600 mb-6">
          You need to be enrolled in this course to access its content.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              navigate(`/courses?enroll=${courseId}`);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </Modal>
  );
};
