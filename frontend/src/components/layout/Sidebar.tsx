import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faGraduationCap, 
  faBook, 
  faCreditCard,
  faUsers,
  faCog,
  faTags,
  faLayerGroup,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

export const Sidebar = () => {
  const { user } = useAuth();

  const getNavItems = () => {
    // Determine the home route based on user role
    const homeRoute = user?.role === UserRole.ADMIN ? '/admin' : '/dashboard';
    
    const items = [
      { to: homeRoute, icon: faHome, label: 'Home' },
    ];

    if (user?.role === UserRole.STUDENT) {
      items.push(
        { to: '/student/courses', icon: faBook, label: 'Courses' },
        { to: '/my-courses', icon: faGraduationCap, label: 'My Courses' },
        { to: '/payments', icon: faCreditCard, label: 'Payments' }
      );
    }

    if (user?.role === UserRole.INSTRUCTOR) {
      items.push(
        { to: '/my-courses', icon: faBook, label: 'My Courses' },
        { to: '/students', icon: faUsers, label: 'Students' },
        { to: '/payments', icon: faCreditCard, label: 'Payments' }
      );
    }

    if (user?.role === UserRole.ADMIN) {
      items.push(
        { to: '/admin/courses', icon: faBook, label: 'Courses' },
        { to: '/enrolled', icon: faClipboardList, label: 'Enrollments' },
        { to: '/admin/users', icon: faUsers, label: 'Users' },
        { to: '/admin/payments', icon: faCreditCard, label: 'Payments' },
        { to: '/admin/categories', icon: faLayerGroup, label: 'Categories' },
        { to: '/admin/tags', icon: faTags, label: 'Tags' },
        { to: '/admin/settings', icon: faCog, label: 'Settings' }
      );
    }

    return items;
  };

  return (
    <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] fixed">
      <nav className="p-4 space-y-2">
        {getNavItems().map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
