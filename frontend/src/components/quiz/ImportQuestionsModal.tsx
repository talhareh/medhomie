import React, { useState, useCallback } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUpload,
  faFileExcel,
  faDownload,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useImportQuestionsFromExcel } from '../../hooks/useQuizzes';
import { generateQuizQuestionTemplate } from '../../utils/excelTemplate';
import { toast } from 'react-toastify';
import { ImportQuestionsResponse } from '../../services/quizService';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  onImportSuccess?: () => void;
}

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  quizId,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<ImportQuestionsResponse | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const importMutation = useImportQuestionsFromExcel();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setImportResults(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setImportResults(null);
    }
  }, []);

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importMutation.mutateAsync({
        quizId,
        file: selectedFile
      });
      setImportResults(result);
      
      if (result.successCount > 0) {
        toast.success(`${result.successCount} question(s) imported successfully`);
        if (onImportSuccess) {
          onImportSuccess();
        }
      }
      
      if (result.failedCount > 0) {
        toast.warning(`${result.failedCount} row(s) failed validation`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import questions');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResults(null);
    onClose();
  };

  const handleDownloadTemplate = () => {
    generateQuizQuestionTemplate();
    toast.success('Template downloaded successfully');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      contentLabel="Import Questions from Excel"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import Questions from Excel</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Requirements Section */}
          {!importResults && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Excel Format Requirements</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Required Columns:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Question</strong> - The question text (required)</li>
                    <li><strong>Option A</strong> - First multiple choice option (required)</li>
                    <li><strong>Option B</strong> - Second multiple choice option (required)</li>
                    <li><strong>Option C</strong> - Third multiple choice option (required)</li>
                    <li><strong>Option D</strong> - Fourth multiple choice option (required)</li>
                    <li><strong>Correct Answer</strong> - The correct option (A, B, C, or D) (required)</li>
                  </ul>
                  <p className="mt-2"><strong>Optional Columns:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Points</strong> - Points for this question (default: 1)</li>
                    <li><strong>Explanation</strong> - Explanation for the answer</li>
                    <li><strong>Order</strong> - Display order (auto-increments if not provided)</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-blue-300">
                    <button
                      onClick={handleDownloadTemplate}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Example Table */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Example Format</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-3 py-2 text-left">Question</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Option A</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Option B</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Option C</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Option D</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Correct Answer</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2">What is 2+2?</td>
                        <td className="border border-gray-300 px-3 py-2">3</td>
                        <td className="border border-gray-300 px-3 py-2">4</td>
                        <td className="border border-gray-300 px-3 py-2">5</td>
                        <td className="border border-gray-300 px-3 py-2">6</td>
                        <td className="border border-gray-300 px-3 py-2">B</td>
                        <td className="border border-gray-300 px-3 py-2">1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload Excel File</h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                >
                  {selectedFile ? (
                    <div className="space-y-3">
                      <FontAwesomeIcon icon={faFileExcel} className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-gray-700 font-medium">{selectedFile.name}</p>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drag and drop your Excel file here, or</p>
                      <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                        <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                        Browse Files
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="text-gray-500 text-sm mt-2">Only .xlsx and .xls files are accepted</p>
                    </>
                  )}
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                      Import Questions
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Import Results Section */}
          {importResults && (
            <div className="space-y-4">
              {/* Success Summary */}
              {importResults.successCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">
                        {importResults.successCount} question(s) imported successfully
                      </h3>
                      <p className="text-green-700 text-sm mt-1">
                        The questions have been added to your quiz.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Rows Table */}
              {importResults.failedCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-red-900">
                      {importResults.failedCount} row(s) failed validation
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-red-300 text-sm">
                      <thead>
                        <tr className="bg-red-100">
                          <th className="border border-red-300 px-3 py-2 text-left">Row Number</th>
                          <th className="border border-red-300 px-3 py-2 text-left">Question</th>
                          <th className="border border-red-300 px-3 py-2 text-left">Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResults.failedRows.map((row, index) => (
                          <tr key={index} className="bg-white">
                            <td className="border border-red-300 px-3 py-2 font-medium">{row.rowNumber}</td>
                            <td className="border border-red-300 px-3 py-2">{row.question || 'N/A'}</td>
                            <td className="border border-red-300 px-3 py-2">
                              <ul className="list-disc list-inside space-y-1">
                                {row.errors.map((error, errorIndex) => (
                                  <li key={errorIndex} className="text-red-700 text-xs">{error}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
                {importResults.failedCount > 0 && (
                  <button
                    onClick={() => {
                      setImportResults(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Import Another File
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
