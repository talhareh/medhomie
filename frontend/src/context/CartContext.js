// ============================================
// CONTEXT API: Cart and Saved Items Management
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getSavedCourses, 
  saveCoursesToBackend, 
  getCurrentUser,
  getPurchasedCourses,
  savePurchasedCoursesToBackend
} from '../services/authService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart and saved items from localStorage
  const getInitialCart = () => {
    const savedCart = localStorage.getItem('medHomeCart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getInitialSaved = () => {
    const savedItems = localStorage.getItem('medHomeSaved');
    if (savedItems) {
      try {
        return JSON.parse(savedItems);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getInitialPurchased = () => {
    const purchasedCourses = localStorage.getItem('medHomePurchased');
    if (purchasedCourses) {
      try {
        return JSON.parse(purchasedCourses);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const [cart, setCart] = useState(getInitialCart);
  const [savedItems, setSavedItems] = useState(getInitialSaved);
  const [purchasedCourses, setPurchasedCourses] = useState(getInitialPurchased);

  // Load saved and purchased courses from backend on mount (if user is logged in)
  useEffect(() => {
    const loadCoursesFromBackend = async () => {
      const user = getCurrentUser();
      if (user && user.id) {
        try {
          const [backendSaved, backendPurchased] = await Promise.all([
            getSavedCourses(),
            getPurchasedCourses()
          ]);

          if (backendSaved && backendSaved.length > 0) {
            // Merge with localStorage (backend takes priority)
            setSavedItems(backendSaved);
            // Also update localStorage as cache
            localStorage.setItem('medHomeSaved', JSON.stringify(backendSaved));
          }

          if (backendPurchased && backendPurchased.length > 0) {
            setPurchasedCourses(backendPurchased);
            localStorage.setItem('medHomePurchased', JSON.stringify(backendPurchased));
          }
        } catch (error) {
          console.error('Failed to load courses from backend:', error);
          // Continue with localStorage data if backend fails
        }
      }
    };

    loadCoursesFromBackend();
  }, []); // Run once on mount

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medHomeCart', JSON.stringify(cart));
  }, [cart]);

  // Save saved items to localStorage AND backend whenever they change
  useEffect(() => {
    // Always save to localStorage (works offline/without login)
    localStorage.setItem('medHomeSaved', JSON.stringify(savedItems));
    
    // Also sync to backend if user is logged in
    const user = getCurrentUser();
    if (user && user.id) {
      saveCoursesToBackend(savedItems).catch(error => {
        console.error('Failed to sync saved courses to backend:', error);
        // Don't break the app if backend sync fails
      });
    }
  }, [savedItems]);

  // Save purchased courses to localStorage AND backend whenever they change
  useEffect(() => {
    localStorage.setItem('medHomePurchased', JSON.stringify(purchasedCourses));

    const user = getCurrentUser();
    if (user && user.id) {
      savePurchasedCoursesToBackend(purchasedCourses).catch(error => {
        console.error('Failed to sync purchased courses to backend:', error);
      });
    }
  }, [purchasedCourses]);

  // Add item to cart
  const addToCart = (course) => {
    setCart(prevCart => {
      // Check if course already in cart
      if (prevCart.find(item => item.id === course.id)) {
        return prevCart;
      }
      return [...prevCart, course];
    });
  };

  // Remove item from cart
  const removeFromCart = (courseId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== courseId));
  };

  // Add item to saved
  const addToSaved = (course) => {
    setSavedItems(prevSaved => {
      // Check if course already saved
      if (prevSaved.find(item => item.id === course.id)) {
        return prevSaved;
      }
      return [...prevSaved, course];
    });
  };

  // Remove item from saved
  const removeFromSaved = (courseId) => {
    setSavedItems(prevSaved => prevSaved.filter(item => item.id !== courseId));
  };

  // Check if item is in cart
  const isInCart = (courseId) => {
    return cart.some(item => item.id === courseId);
  };

  // Check if item is saved
  const isSaved = (courseId) => {
    return savedItems.some(item => item.id === courseId);
  };

  // Check if item is purchased
  const isPurchased = (courseId) => {
    return purchasedCourses.some(item => item.id === courseId);
  };

  // Add purchased courses (called after successful payment)
  const addPurchasedCourses = (courses) => {
    setPurchasedCourses(prevPurchased => {
      const newCourses = courses.filter(course => 
        !prevPurchased.find(item => item.id === course.id)
      );
      return [...prevPurchased, ...newCourses];
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    savedItems,
    purchasedCourses,
    addToCart,
    removeFromCart,
    addToSaved,
    removeFromSaved,
    isInCart,
    isSaved,
    isPurchased,
    addPurchasedCourses,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

