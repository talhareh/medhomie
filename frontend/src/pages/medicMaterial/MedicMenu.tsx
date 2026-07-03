import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo.png';

const EXTERNAL_HOME_URL = 'https://medhome.courses';

/**
 * MedicMenu component - Navigation menu for the MedicHomePage
 * Extracted from MedicHomePage for better modularity and reusability
 */
const MedicMenu: React.FC = () => {
  // Auth hook - must be at top level
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const whatsappNumber = '+923020465921';
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }, []);
  const whatsappLink = isMobile
    ? `https://wa.me/${whatsappNumber}`
    : `https://web.whatsapp.com/send?phone=${whatsappNumber}`;

  // Handle mobile menu effects
  useEffect(() => {
    // Close mobile menu when screen becomes larger
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left side - Logo + Home (desktop) */}
        <motion.div
          className="flex items-center gap-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <a href={EXTERNAL_HOME_URL} className="flex items-center">
            <img src={logo} alt="MedHome Logo" className="h-10 w-auto" />
          </a>
          <motion.a
            href={EXTERNAL_HOME_URL}
            className="hidden md:inline-flex text-neutral-700 hover:text-primary py-2 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Home
          </motion.a>
        </motion.div>

        {/* Right side - Mobile burger menu + WhatsApp + Auth buttons */}
        <div className="flex items-center space-x-2">
          {/* WhatsApp Button for desktop */}
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#1ebe57] transition-colors"
            title="Chat with us on WhatsApp"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-lg" /> WhatsApp
          </motion.a>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-primary hover:bg-primary/10 rounded transition-colors"
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-lg" />
          </button>

          {/* WhatsApp Button - Always visible on mobile, hidden on desktop (shown in nav) */}
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden flex items-center bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#1ebe57] transition-colors text-sm"
            title="Chat with us on WhatsApp"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
          </motion.a>

          {/* Auth buttons - Hidden on mobile, shown in mobile menu instead */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-neutral-700">
                  <span className="font-bold">{user.fullName}</span>
                  <span className="text-sm text-neutral-500 ml-2">({user.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title="Profile"
                    onClick={() => {
                      if (user.role === 'admin') {
                        navigate('/admin');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
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
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Link to="/auth" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">Login</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Link to="/auth?mode=register" className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 transition-colors">Register</Link>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Mobile Menu */}
              <motion.div
                className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-neutral-800">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    aria-label="Close menu"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="p-4 space-y-6">
                  {/* Navigation Links */}
                  <div className="space-y-4">
                    <a
                      href={EXTERNAL_HOME_URL}
                      className="block text-neutral-700 hover:text-primary py-2 text-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                  </div>

                  {/* Auth Buttons for Mobile */}
                  <div className="border-t border-gray-200 pt-6">
                    {user ? (
                      <div className="space-y-4">
                        <div className="text-neutral-700 text-center">
                          <div className="font-bold text-lg">{user.fullName}</div>
                          <div className="text-sm text-neutral-500">({user.role})</div>
                        </div>
                        <div className="flex flex-col space-y-3">
                          <button
                            className="flex items-center justify-center w-full bg-primary text-white px-4 py-3 rounded hover:bg-primary/90 transition-colors"
                            onClick={() => {
                              if (user.role === 'admin') {
                                navigate('/admin');
                              } else {
                                navigate('/dashboard');
                              }
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center justify-center w-full bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 transition-colors"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        <Link 
                          to="/auth" 
                          className="block text-center bg-primary text-white px-4 py-3 rounded hover:bg-primary/90 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link 
                          to="/auth?mode=register" 
                          className="block text-center bg-secondary text-white px-4 py-3 rounded hover:bg-secondary/90 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default MedicMenu;
