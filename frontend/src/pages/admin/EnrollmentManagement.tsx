import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { CourseTable } from '../../components/enrollment';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/roles';

export const EnrollmentManagement: React.FC = () => {
  const { user } = useAuth();
  const readOnly = !isAdmin(user?.role);

  return (
    <MainLayout>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {readOnly ? 'Enrolled Students' : 'Course Enrollment Management'}
          </h1>
        </div>
        <CourseTable readOnly={readOnly} />
      </div>
    </MainLayout>
  );
};
