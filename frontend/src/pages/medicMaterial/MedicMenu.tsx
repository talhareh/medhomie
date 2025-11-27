import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import { faChevronDown, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo.png';

/**
 * MedicMenu component - Navigation menu for the MedicHomePage
 * Extracted from MedicHomePage for better modularity and reusability
 */
const MedicMenu: React.FC = () => {
  // Auth hook - must be at top level
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Animation variants for subtle, professional animations
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: { 
        duration: 0.15
      }
    }
  };

  const chevronVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  const buttonHover = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown: string) => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdown);
    }
  };

  // Close dropdown when mouse leaves
  const closeDropdown = () => {
    setOpenDropdown(null);
  };

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
        {/* Logo - Always visible */}
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Link to="/" className="flex items-center">
            <img src={logo} alt="MedHome Logo" className="h-10 w-auto" />
          </Link>
        </motion.div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex space-x-6">
          <motion.button 
            className="text-neutral-700 hover:text-primary py-2 transition-colors"
            whileHover="hover"
            whileTap="tap"
            variants={buttonHover}
          >
            <Link to="/">Home</Link>
          </motion.button>
          
          {/* About Dropdown */}
          <div className="relative group">
            <motion.button 
              className="text-neutral-700 hover:text-primary flex items-center py-2 transition-colors"
              onClick={() => toggleDropdown('about')}
              onMouseEnter={() => setOpenDropdown('about')}
              whileHover="hover"
              whileTap="tap"
              variants={buttonHover}
            >
              About 
              <motion.div
                animate={openDropdown === 'about' ? 'open' : 'closed'}
                variants={chevronVariants}
                transition={{ duration: 0.2 }}
              >
                <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {openDropdown === 'about' && (
                <motion.div 
                  className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  onMouseLeave={() => setOpenDropdown(null)}
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="py-1">
                    <motion.div whileHover={{ backgroundColor: '#f0f9ff' }} transition={{ duration: 0.2 }}>
                      <Link to="/medicAbout" className="block px-4 py-2 text-sm text-neutral-700 hover:text-primary transition-colors">
                        About Us
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ backgroundColor: '#f0f9ff' }} transition={{ duration: 0.2 }}>
                      <Link to="/medicScholarship" className="block px-4 py-2 text-sm text-neutral-700 hover:text-primary transition-colors">
                        Scholarships
                      </Link>
                    </motion.div>
                    {/* <Link to="/medicAccreditations" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                      Medical Accreditation
                    </Link> */}
                    {/* <Link to="/medicPartners" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                      Partners
                    </Link> */}
                    {/* <Link to="/medicClinicalPrograms" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                      Clinical Programs
                    </Link> */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Programs Dropdown */}
          <div className="relative group">
            <button 
              className="text-neutral-700 hover:text-primary flex items-center py-2"
              onClick={() => toggleDropdown('programs')}
              onMouseEnter={() => setOpenDropdown('programs')}
            >
              Programs <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            {openDropdown === 'programs' && (
              <div 
                className="absolute left-0 mt-0 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-1">
                  <Link to="/medicAdvancedUKProgram" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Advanced UK Membership/Fellowship Program
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Digital Learn Zone Dropdown */}
          <div className="relative group">
            <button 
              className="text-neutral-700 hover:text-primary flex items-center py-2"
              onClick={() => toggleDropdown('digital')}
              onMouseEnter={() => setOpenDropdown('digital')}
            >
              Digital Learn Zone <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            {openDropdown === 'digital' && (
              <div 
                className="absolute left-0 mt-0 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-1">
                  <Link to="/medicLMS" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Learning Management System
                  </Link>
                  <Link to="/medicOSCEApp" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    OSCE Exam Application
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Media Dropdown */}
          <div className="relative group">
            <button 
              className="text-neutral-700 hover:text-primary flex items-center py-2"
              onClick={() => toggleDropdown('media')}
              onMouseEnter={() => setOpenDropdown('media')}
            >
              Media <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            {openDropdown === 'media' && (
              <div 
                className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-1">
                  <Link to="/medicBlogs" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Blogs
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* <Link to="/medicContact" className="text-neutral-700 hover:text-primary py-2">Contact</Link> */}
          {/* WhatsApp Button for desktop */}
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#1ebe57] transition-colors md:inline-flex hidden"
            title="Chat with us on WhatsApp"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-lg" /> WhatsApp
          </motion.a>
        </nav>

        {/* Right side - Mobile burger menu + WhatsApp + Auth buttons */}
        <div className="flex items-center space-x-2">
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
                    <Link 
                      to="/" 
                      className="block text-neutral-700 hover:text-primary py-2 text-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>

                    {/* About Section */}
                    <div>
                      <div className="text-neutral-700 py-2 text-lg font-medium">About</div>
                      <div className="ml-4 space-y-2">
                        <Link 
                          to="/medicAbout" 
                          className="block text-neutral-600 hover:text-primary py-1 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          About Us
                        </Link>
                        <Link 
                          to="/medicScholarship" 
                          className="block text-neutral-600 hover:text-primary py-1 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Scholarships
                        </Link>
                      </div>
                    </div>

                    {/* Programs Section */}
                    <div>
                      <div className="text-neutral-700 py-2 text-lg font-medium">Programs</div>
                      <div className="ml-4 space-y-2">
                        <Link 
                          to="/medicAdvancedUKProgram" 
                          className="block text-neutral-600 hover:text-primary py-1 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Advanced UK Membership/Fellowship Program
                        </Link>
                      </div>
                    </div>

                    {/* Digital Learn Zone Section */}
                    <div>
                      <div className="text-neutral-700 py-2 text-lg font-medium">Digital Learn Zone</div>
                      <div className="ml-4 space-y-2">
                        <Link 
                          to="/medicLMS" 
                          className="block text-neutral-600 hover:text-primary py-1 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Learning Management System
                        </Link>
                        <Link 
                          to="/medicOSCEApp" 
                          className="block text-neutral-600 hover:text-primary py-1 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          OSCE Exam Application
                        </Link>
                      </div>
                    </div>

                    {/* Media Section */}
                    <div>
                      <div className="text-neutral-700 py-2 text-lg font-medium">Media</div>
                      <div className="ml-4 space-y-2">
                        <Link 
                          to="/medicBlogs" 
                          className="block text-neutral-600 hover:text-primary py-1 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Blogs
                        </Link>
                      </div>
                    </div>
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
