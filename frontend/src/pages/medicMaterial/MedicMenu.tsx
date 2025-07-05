import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

/**
 * MedicMenu component - Navigation menu for the MedicHomePage
 * Extracted from MedicHomePage for better modularity and reusability
 */
const MedicMenu: React.FC = () => {
  // State to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const whatsappNumber = '15551519131';
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }, []);
  const whatsappLink = isMobile
    ? `https://wa.me/${whatsappNumber}`
    : `https://web.whatsapp.com/send?phone=${whatsappNumber}`;

  return (
    <header className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/medicHomePage" className="text-2xl font-bold text-primary">MedHome</Link>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link to="/medicHomePage" className="text-neutral-700 hover:text-primary py-2">Home</Link>
          
          {/* About Dropdown */}
          <div className="relative group">
            <button 
              className="text-neutral-700 hover:text-primary flex items-center py-2"
              onClick={() => toggleDropdown('about')}
              onMouseEnter={() => setOpenDropdown('about')}
            >
              About <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            {openDropdown === 'about' && (
              <div 
                className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-1">
                  <Link to="/medicAbout" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    About Us
                  </Link>
                  <Link to="/medicScholarship" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Scholarships
                  </Link>
                  <Link to="/medicAccreditations" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Medical Accreditation
                  </Link>
                  <Link to="/medicPartners" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Partners
                  </Link>
                  <Link to="/medicClinicalPrograms" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary">
                    Clinical Programs
                  </Link>
                </div>
              </div>
            )}
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
          
          <Link to="/medicContact" className="text-neutral-700 hover:text-primary py-2">Contact</Link>
          {/* WhatsApp Button for desktop */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#1ebe57] transition-colors md:inline-flex hidden"
            title="Chat with us on WhatsApp"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-lg" /> WhatsApp
          </a>
        </nav>
        <div className="flex space-x-4 items-center">
          <Link to="/auth" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Login
          </Link>
          {/* WhatsApp Button for mobile */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#1ebe57] transition-colors md:hidden"
            title="Chat with us on WhatsApp"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-lg" /> WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
};

export default MedicMenu;
