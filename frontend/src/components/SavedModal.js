import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

// ============================================
// SAVED MODAL COMPONENT
// ============================================
const SavedModal = ({ isOpen, onClose }) => {
  const { savedItems, removeFromSaved, addToCart, isInCart } = useCart();

  const handleAddToCart = (course) => {
    if (!isInCart(course.id)) {
      addToCart(course);
      // Silently add to cart without alert
    }
    // If already in cart, do nothing silently
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Saved Courses</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Saved Items Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💾</div>
              <p className="text-gray-500 text-lg">No saved courses yet</p>
              <p className="text-gray-400 mt-2">Save courses to view them later!</p>
              <Link
                to="/programs"
                onClick={onClose}
                className="inline-block mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Browse Programs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Duration: {item.duration}</span>
                        <span>Level: {item.level}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                          item.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          item.level === 'Advanced' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-orange-600">{item.price}</span>
                        <span className="text-sm text-gray-500">• {item.instructor}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isInCart(item.id)}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition ${
                        isInCart(item.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {isInCart(item.id) ? '✓ In Cart' : '🛒 Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromSaved(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedItems.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                {savedItems.length} {savedItems.length === 1 ? 'course' : 'courses'} saved
              </span>
              <Link
                to="/programs"
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                View All Programs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedModal;

