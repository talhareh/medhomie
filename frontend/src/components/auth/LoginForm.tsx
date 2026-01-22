import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const LoginForm = () => {
  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const [deviceError, setDeviceError] = useState<{ message: string; devices: string[] } | null>(null);
  const [blockedError, setBlockedError] = useState<string | null>(null);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      setDeviceError(null);
      setBlockedError(null);
      await login(data);
      toast.success('Login successful!');
    } catch (error: any) {
      if (error.response?.data?.code === 'DEVICE_LIMIT_REACHED') {
        setDeviceError({
          message: error.response.data.message,
          devices: error.response.data.currentDevices || []
        });
      } else if (error.response?.data?.message?.includes('blocked')) {
        setBlockedError(error.response.data.message || 'Your account has been blocked. Please contact support.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Implement Google login logic here
      // This is a placeholder for Google OAuth implementation
      toast.info('Google login not implemented yet');
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field pr-10"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="h-5 w-5 text-gray-400"
              />
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <div className="mt-2 text-right">
            <Link
              to="/auth/request-password-reset"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleGoogleLogin}
          >
            <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 mr-2" />
            Google
          </button>
        </div>
      </form>

      {/* Device Limit Modal */}
      {deviceError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FontAwesomeIcon icon={faDesktop} className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Device Limit Reached</h3>
              <p className="mt-2 text-sm text-gray-500">
                {deviceError.message}
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Active Devices:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {deviceError.devices.map((device, index) => (
                  <li key={index}>{device}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-4 text-center">
                Please remove one of your existing devices to log in on this new device.
                Check your email for more details.
              </p>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                onClick={() => setDeviceError(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Blocked Modal */}
      {blockedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Blocked</h3>
              <p className="mt-2 text-sm text-gray-600">
                {blockedError}
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                onClick={() => setBlockedError(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
