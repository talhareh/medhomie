import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { UserRole } from '../types/auth';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';

export const HomePage = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case UserRole.STUDENT:
        return 'Welcome back';
      case UserRole.INSTRUCTOR:
        return 'Welcome to your teaching dashboard';
      case UserRole.ADMIN:
        return 'Welcome to the admin dashboard';
      default:
        return 'Welcome to MedHome';
    }
  };

  if (user?.role === UserRole.STUDENT) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">{getWelcomeMessage()}</h1>
            <p className="mt-1 text-neutral-600">
              {user?.fullName
                ? `Hi ${user.fullName.split(' ')[0]}, here is what needs your attention.`
                : 'Here is what needs your attention.'}
            </p>
          </div>
          <StudentDashboard />
        </div>
      </MainLayout>
    );
  }

  if (user?.role === UserRole.INSTRUCTOR) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="card">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">
              {getWelcomeMessage()}
            </h1>
            <p className="text-neutral-600 mb-6">
              Manage your courses and track student progress.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin/courses"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                My Courses
              </Link>
              <Link
                to="/students"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                View Students
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            {getWelcomeMessage()}
          </h1>
          <p className="text-neutral-600">
            {user?.role === UserRole.ADMIN && (
              'Manage users, courses, and system settings.'
            )}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
