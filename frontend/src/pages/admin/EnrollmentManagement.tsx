import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { CourseTable } from '../../components/enrollment';
import { toast } from 'react-toastify';

export const EnrollmentManagement: React.FC = () => {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Course Enrollment Management</h1>
        </div>
        <CourseTable />
      </div>
    </MainLayout>
  );
};
