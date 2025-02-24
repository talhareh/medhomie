import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">MedHome</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-neutral-700">
                <span className="font-medium">{user.firstName} {user.lastName}</span>
                <span className="text-sm text-neutral-500 ml-2">({user.role})</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  title="Profile"
                >
                  <FontAwesomeIcon icon={faUser} />
                </button>
                
                <button 
                  onClick={logout}
                  className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  title="Logout"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
