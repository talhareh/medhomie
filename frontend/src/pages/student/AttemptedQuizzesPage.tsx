import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faChevronDown,
  faChevronUp,
  faEye,
  faSpinner,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { useMyQuizAttempts } from '../../hooks/useQuizzes';
import { AttemptedQuizRow } from '../../types/quiz';

type SortKey = 'completedAt' | 'quizTitle' | 'courseTitle' | 'attemptNumber' | 'percentage';
type SortOrder = 'asc' | 'desc';

const sortAttempts = (
  rows: AttemptedQuizRow[],
  sortKey: SortKey,
  sortOrder: SortOrder
): AttemptedQuizRow[] => {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'completedAt':
        cmp = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        break;
      case 'quizTitle':
        cmp = a.quizTitle.localeCompare(b.quizTitle);
        break;
      case 'courseTitle':
        cmp = a.courseTitle.localeCompare(b.courseTitle);
        break;
      case 'attemptNumber':
        cmp = a.attemptNumber - b.attemptNumber;
        break;
      case 'percentage':
        cmp = a.percentage - b.percentage;
        break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });
  return sorted;
};

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  className?: string;
}> = ({ label, sortKey, activeKey, sortOrder, onSort, className = '' }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 ${className}`}
    onClick={() => onSort(sortKey)}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {activeKey === sortKey && (
        <FontAwesomeIcon icon={sortOrder === 'asc' ? faChevronUp : faChevronDown} className="text-[10px]" />
      )}
    </span>
  </th>
);

export const AttemptedQuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyQuizAttempts();
  const [sortKey, setSortKey] = useState<SortKey>('completedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const attempts = data?.data ?? [];

  const sortedAttempts = useMemo(
    () => sortAttempts(attempts, sortKey, sortOrder),
    [attempts, sortKey, sortOrder]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder(key === 'completedAt' ? 'desc' : 'asc');
    }
  };

  const handleViewResults = (attemptId: string) => {
    navigate(`/student/quiz-results/${attemptId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">My Quiz Attempts</h1>
          <div className="text-sm text-gray-600">
            {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Unable to load quiz attempts. Please try again.</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No quiz attempts yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Completed quizzes will appear here with date, score, and results.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader
                      label="Date & Time"
                      sortKey="completedAt"
                      activeKey={sortKey}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Quiz"
                      sortKey="quizTitle"
                      activeKey={sortKey}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Course"
                      sortKey="courseTitle"
                      activeKey={sortKey}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Attempt"
                      sortKey="attemptNumber"
                      activeKey={sortKey}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Score"
                      sortKey="percentage"
                      activeKey={sortKey}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAttempts.map((row) => (
                    <tr
                      key={row.attemptId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewResults(row.attemptId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(row.completedAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.quizTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.courseTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{row.attemptNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(row.percentage)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={row.passed ? faCheckCircle : faTimesCircle}
                            className="mr-1 mt-0.5"
                          />
                          {row.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewResults(row.attemptId);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View results"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {sortedAttempts.map((row) => (
                <button
                  key={row.attemptId}
                  type="button"
                  onClick={() => handleViewResults(row.attemptId)}
                  className="w-full text-left bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{row.quizTitle}</h3>
                      <p className="text-xs text-gray-500 mt-1">{row.courseTitle}</p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                        row.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>{format(new Date(row.completedAt), 'MMM dd, yyyy HH:mm')}</span>
                    <span>Attempt #{row.attemptNumber}</span>
                    <span>{Math.round(row.percentage)}%</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};
