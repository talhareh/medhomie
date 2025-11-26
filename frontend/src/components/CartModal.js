import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// ============================================
// CART MODAL COMPONENT
// ============================================
const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, clearCart, addPurchasedCourses } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', '').replace(',', ''));
      return total + price;
    }, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowPaymentSelection(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Add courses to purchased courses
      addPurchasedCourses(cart);
      
      alert(`Payment successful!\nPayment Method: ${selectedPaymentMethod}\nTotal Amount: $${calculateTotal().toFixed(2)}\n\nThank you for your purchase! Your courses are now available in "My Courses".`);
      clearCart();
      setShowPaymentSelection(false);
      setSelectedPaymentMethod('');
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const paymentMethods = [
    { id: 'credit', name: 'Credit Card', icon: '💳' },
    { id: 'debit', name: 'Debit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🔵' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
    { id: 'cash', name: 'Cash on Delivery', icon: '💵' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 mt-2">Add some courses to get started!</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Duration: {item.duration}</span>
                          <span>Level: {item.level}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xl font-bold text-orange-600">{item.price}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              {showPaymentSelection && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mt-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-4 border-2 rounded-lg transition text-left ${
                          selectedPaymentMethod === method.id
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="font-semibold text-gray-800">{method.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={!selectedPaymentMethod || isProcessing}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition"
                    >
                      {isProcessing ? 'Processing...' : 'Complete Payment'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentSelection(false);
                        setSelectedPaymentMethod('');
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && !showPaymentSelection && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleCheckout}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;

