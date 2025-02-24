import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { UserRole } from '../types/auth';

export const HomePage = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case UserRole.STUDENT:
        return 'Welcome to your learning dashboard';
      case UserRole.INSTRUCTOR:
        return 'Welcome to your teaching dashboard';
      case UserRole.ADMIN:
        return 'Welcome to the admin dashboard';
      default:
        return 'Welcome to MedHome';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            {getWelcomeMessage()}
          </h1>
          <p className="text-neutral-600">
            {user?.role === UserRole.STUDENT && (
              'Start exploring courses and track your learning progress.'
            )}
            {user?.role === UserRole.INSTRUCTOR && (
              'Manage your courses and track student progress.'
            )}
            {user?.role === UserRole.ADMIN && (
              'Manage users, courses, and system settings.'
            )}
          </p>
        </div>

        {/* Add more dashboard widgets based on user role */}
      </div>
    </MainLayout>
  );
};
