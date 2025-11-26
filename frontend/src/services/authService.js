// ============================================
// FILE: MedHome/frontend/src/services/authService.js
// ============================================

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

export const registerUser = async (userData) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if the backend server is running and connected to the database.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to connect to server. Please check if the backend is running.');
  }
};

export const loginUser = async (email, password) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    console.log('Login response:', data); // Debug log

    if (!response.ok) {
      console.error('Login failed:', data); // Debug log
      throw new Error(data.message || 'Login failed');
    }

    // Save user data and token in localStorage
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('User saved to localStorage'); // Debug log
    } else {
      console.warn('No user data in response'); // Debug log
    }
    
    // Save token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('Token saved to localStorage'); // Debug log
    } else {
      console.error('No token in response!'); // Debug log
      throw new Error('No authentication token received from server. Please try again.');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if the backend server is running and connected to the database.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to connect to server. Please check if the backend is running.');
  }
};

export const getAllUsers = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/users`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if the backend server is running and connected to the database.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to connect to server. Please check if the backend is running.');
  }
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export const updateUser = async (userId, userData) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login again to update your account.');
    }
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Send token in Authorization header
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login again to delete your account.');
    }
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` // Send token in Authorization header
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // Remove token on logout
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Get saved courses from backend
export const getSavedCourses = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      // Not logged in, return empty array
      return [];
    }
    
    const response = await fetch(`${API_URL}/users/saved/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, user might have logged out
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      throw new Error(data.message || 'Failed to fetch saved courses');
    }

    return data.courses || [];
  } catch (error) {
    console.error('Error fetching saved courses:', error);
    // Return empty array on error, don't break the app
    return [];
  }
};

// Save courses to backend
export const saveCoursesToBackend = async (courses) => {
  try {
    const token = getToken();
    
    if (!token) {
      // Not logged in, silently fail (localStorage will still work)
      return false;
    }
    
    const response = await fetch(`${API_URL}/users/saved/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courses })
    });

    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, user might have logged out
      if (response.status === 401 || response.status === 403) {
        return false;
      }
      throw new Error(data.message || 'Failed to save courses');
    }

    return true;
  } catch (error) {
    console.error('Error saving courses:', error);
    // Return false on error, but don't break the app
    return false;
  }
};

// Get purchased courses from backend
export const getPurchasedCourses = async () => {
  try {
    const token = getToken();
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_URL}/users/purchased/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      throw new Error(data.message || 'Failed to fetch purchased courses');
    }

    return data.courses || [];
  } catch (error) {
    console.error('Error fetching purchased courses:', error);
    return [];
  }
};

// Save purchased courses to backend
export const savePurchasedCoursesToBackend = async (courses) => {
  try {
    const token = getToken();

    if (!token) {
      return false;
    }

    const response = await fetch(`${API_URL}/users/purchased/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courses })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return false;
      }
      throw new Error(data.message || 'Failed to save purchased courses');
    }

    return true;
  } catch (error) {
    console.error('Error saving purchased courses:', error);
    return false;
  }
};