import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types/auth';
import api from '../utils/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token refresh interval (6 hours)
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from local storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        if (storedToken && storedRefreshToken && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry);
          
          if (Date.now() >= expiryTime) {
            // Token has expired, try to refresh
            try {
              const response = await api.post<AuthResponse>('/auth/refresh', {
                refreshToken: storedRefreshToken,
              });
              
              const { token: newToken, refreshToken: newRefreshToken, expiresIn } = response.data;
              
              setToken(newToken);
              setRefreshToken(newRefreshToken);
              localStorage.setItem('token', newToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              localStorage.setItem('tokenExpiry', expiresIn.toString());
              
              api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              
              // Fetch current user
              const fetchCurrentUser = async () => {
                try {
                  const response = await api.get('/auth/me');
                  return response.data;
                } catch (error) {
                  console.error('Error fetching current user:', error);
                  throw error;
                }
              };
              const userData = await fetchCurrentUser();
              setUser(userData);
            } catch (error) {
              // If refresh fails, clear everything
              logout();
            }
          } else {
            // Token still valid
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            
            try {
              // Fetch current user
              const fetchCurrentUser = async () => {
                try {
                  const response = await api.get('/auth/me');
                  return response.data;
                } catch (error) {
                  console.error('Error fetching current user:', error);
                  throw error;
                }
              };
              const userData = await fetchCurrentUser();
              setUser(userData);
              setToken(storedToken);
              setRefreshToken(storedRefreshToken);
            } catch (error) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Setup axios interceptor for token expiry
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;

          try {
            const response = await api.post<AuthResponse>('/auth/refresh', {
              refreshToken,
            });

            const { token: newToken, refreshToken: newRefreshToken, expiresIn } = response.data;
            
            setToken(newToken);
            setRefreshToken(newRefreshToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('tokenExpiry', expiresIn.toString());
            
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            return api(originalRequest);
          } catch (error) {
            logout();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  // Setup token refresh interval
  useEffect(() => {
    if (!refreshToken) return;

    const refreshTokens = async () => {
      try {
        const response = await api.post<AuthResponse>('/auth/refresh', {
          refreshToken,
        });
        
        const { token: newToken, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('tokenExpiry', expiresIn.toString());
        
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } catch (error) {
        logout();
      }
    };

    const interval = setInterval(refreshTokens, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshToken]);

  const login = async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { user: userData, token: newToken, refreshToken: newRefreshToken, expiresIn } = response.data;

    setUser(userData);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('tokenExpiry', expiresIn.toString());
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    delete api.defaults.headers.common['Authorization'];
  };

  const register = async (data: RegisterData) => {
    await api.post('/auth/register', data);
  };

  const verifyEmail = async (verificationToken: string) => {
    await api.get(`/auth/verify-email/${verificationToken}`);
  };

  const requestPasswordReset = async (email: string) => {
    await api.post('/auth/request-password-reset', { email });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await api.post(`/auth/reset-password/${token}`, { password: newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
