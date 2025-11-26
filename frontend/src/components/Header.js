import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '../services/authService';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';
import SavedModal from './SavedModal';

const Header = ({ showLogoutButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const cartItemCount = cart.length;
  
  // Get current user for displaying name
  const currentUser = getCurrentUser();
  const userName = currentUser?.name || 'User';

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <Link to="/home" className="flex items-center gap-3 cursor-pointer">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🏠</span>
        </div>
        <span className="text-2xl font-bold text-orange-600">MedHome</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8">
        <Link to="/home" className="text-gray-700 hover:text-orange-600 font-medium">Home</Link>
        <Link to="/about" className="text-gray-700 hover:text-orange-600 font-medium">About ▾</Link>
        <Link to="/programs" className="text-gray-700 hover:text-orange-600 font-medium">Programs ▾</Link>
        <Link to="/my-courses" className="text-gray-700 hover:text-orange-600 font-medium">My Courses ▾</Link>
        <button className="text-gray-700 hover:text-orange-600 font-medium">Digital Learn Zone ▾</button>
        <button className="text-gray-700 hover:text-orange-600 font-medium">Media ▾</button>
      </nav>
      
      <div className="flex items-center gap-3">
        {/* WhatsApp Icon Button */}
        <button 
          className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-lg flex items-center justify-center transition"
          title="WhatsApp"
        >
          <span className="text-xl">📱</span>
        </button>
        
        {/* Saved Icon Button - No badge */}
        {!isAuthPage && (
          <button
            onClick={() => setIsSavedOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition relative"
            title="Saved Courses"
          >
            <span className="text-xl">💾</span>
          </button>
        )}
        
        {/* Cart Icon Button */}
        {!isAuthPage && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-orange-600 hover:bg-orange-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition"
            title="Shopping Cart"
          >
            <span className="text-xl">🛒</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        )}
        
        {/* User Name and Logout */}
        {showLogoutButton && !isAuthPage && (
          <>
            <div className="flex items-center gap-2 px-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
              <span className="text-gray-700 font-medium text-sm">
                {userName} (student)
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 w-10 h-10 rounded-lg flex items-center justify-center transition hover:bg-gray-100"
              title="Logout"
            >
              <span className="text-xl">🚪</span>
            </button>
          </>
        )}
        
        {/* Login/Register Buttons for Auth Pages */}
        {isAuthPage && (
          <>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition">
              Login
            </Link>
            <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold transition">
              Register
            </Link>
          </>
        )}
      </div>
      
      {/* Saved Modal */}
      {!isAuthPage && (
        <SavedModal isOpen={isSavedOpen} onClose={() => setIsSavedOpen(false)} />
      )}
      
      {/* Cart Modal */}
      {!isAuthPage && (
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </header>
  );
};

export default Header;