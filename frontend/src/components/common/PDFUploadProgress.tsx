import React from 'react';

interface PDFUploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  onCancel?: () => void;
}

const statusMessages: Record<string, string> = {
  idle: '',
  uploading: 'Uploading PDF...',
  success: 'PDF uploaded successfully!',
  error: 'PDF upload failed.'
};

const PDFUploadProgress: React.FC<PDFUploadProgressProps> = ({ progress, status, error, onCancel }) => {
  if (status === 'idle') return null;
  return (
    <div className="my-2 p-3 bg-gray-50 rounded border border-gray-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {status === 'error' && error ? error : statusMessages[status]}
        </span>
        {status === 'uploading' && (
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {status === 'uploading' && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
        >
          Cancel Upload
        </button>
      )}
    </div>
  );
};

export default PDFUploadProgress; 