/**
 * Authentication utility functions
 */

/**
 * Get authentication headers for API requests
 * @returns Object with Authorization header if token exists
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
