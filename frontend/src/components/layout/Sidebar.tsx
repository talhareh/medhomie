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
  faClipboardList,
  faBlog,
  faRobot,
  faQuestionCircle,
  faTimes,
  faTicketAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

interface SidebarProps {
  onMobileClose?: () => void;
}

export const Sidebar = ({ onMobileClose }: SidebarProps) => {
  const { user } = useAuth();

  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

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
        { to: '/admin/quizzes', icon: faQuestionCircle, label: 'Quizzes' },
        { to: '/admin/blogs', icon: faBlog, label: 'Blogs' },
        { to: '/enrolled', icon: faClipboardList, label: 'Enrollments' },
        { to: '/admin/users', icon: faUsers, label: 'Users' },
        { to: '/admin/payments', icon: faCreditCard, label: 'Payments' },
        { to: '/admin/categories', icon: faLayerGroup, label: 'Categories' },
        { to: '/admin/tags', icon: faTags, label: 'Tags' },
        { to: '/admin/vouchers', icon: faTicketAlt, label: 'Vouchers' },
        { to: '/admin/whatsapp-conversations', icon: faCog, label: 'WhatsApp Conversations' },
        { to: '/admin/public-ai-chat-conversations', icon: faRobot, label: 'Public AI Chat' }
      );
    }

    return items;
  };

  return (
    <aside className="w-64 bg-white shadow-sm h-full">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        <button 
          onClick={onMobileClose}
          className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors"
          aria-label="Close navigation menu"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto">
        {getNavItems().map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={index === 0} // Only exact match for Home (first item)
            onClick={handleLinkClick}
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
