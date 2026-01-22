import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { UpdateExpirationModalProps } from '../../types/enrollment';
import { enrollmentService } from '../../services/enrollmentService';

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

Modal.setAppElement('#root');

export const UpdateExpirationModal: React.FC<UpdateExpirationModalProps> = ({
  isOpen,
  onClose,
  enrollmentId,
  enrollmentIds,
  currentExpirationDate,
  onUpdate
}) => {
  const [expirationDate, setExpirationDate] = useState('');
  const [dateError, setDateError] = useState('');
  const queryClient = useQueryClient();

  // Initialize date from current expiration date
  useEffect(() => {
    if (currentExpirationDate) {
      const date = new Date(currentExpirationDate);
      // Convert to local date string (YYYY-MM-DD format)
      const localDateString = date.toISOString().split('T')[0];
      setExpirationDate(localDateString);
    } else {
      setExpirationDate('');
    }
    setDateError('');
  }, [currentExpirationDate, isOpen]);

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setExpirationDate(dateValue);
    setDateError('');

    if (dateValue) {
      const selectedDate = new Date(dateValue);
      const now = new Date();
      
      // Set time to start of day for comparison
      selectedDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (selectedDate <= now) {
        setDateError('Expiration date must be in the future');
      }
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (expirationDate: string) => {
      // Convert local date to UTC ISO string
      const date = new Date(expirationDate);
      const utcDateString = date.toISOString();

      if (enrollmentIds && enrollmentIds.length > 0) {
        // Bulk update
        return await enrollmentService.bulkUpdateExpiration(enrollmentIds, utcDateString);
      } else if (enrollmentId) {
        // Single update
        return await enrollmentService.updateEnrollmentExpiration(enrollmentId, utcDateString);
      } else {
        throw new Error('Either enrollmentId or enrollmentIds must be provided');
      }
    },
    onSuccess: () => {
      toast.success('Expiration date updated successfully');
      queryClient.invalidateQueries(['enrollments']);
      onClose();
      setExpirationDate('');
      setDateError('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update expiration date');
    }
  });

  const handleUpdate = async () => {
    if (!expirationDate) {
      setDateError('Expiration date is required');
      return;
    }

    if (dateError) {
      toast.error(dateError);
      return;
    }

    updateMutation.mutate(expirationDate);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Update Expiration Date"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {enrollmentIds && enrollmentIds.length > 1 
              ? `Update Expiration Date (${enrollmentIds.length} enrollments)`
              : 'Update Expiration Date'
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <input
            id="expirationDate"
            type="date"
            value={expirationDate}
            onChange={handleExpirationDateChange}
            min={new Date().toISOString().split('T')[0]}
            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
              dateError ? 'ring-red-300' : 'ring-gray-300'
            } focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
            required
          />
          {dateError && (
            <p className="mt-1 text-sm text-red-600">{dateError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Students will be automatically removed from the course after this date (UTC)
          </p>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!expirationDate || !!dateError || updateMutation.isLoading}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

