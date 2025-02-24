import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            MedHome
          </Link>
          <div className="space-x-4">
            {user ? (
              <button 
                onClick={handleDashboardClick}
                className="p-2 text-neutral-600 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                title="Go to Dashboard"
              >
                <FontAwesomeIcon icon={faUser} className="text-xl" />
              </button>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
