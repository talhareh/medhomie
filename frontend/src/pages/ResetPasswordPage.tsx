import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(token, data.password);
      toast.success('Password has been reset successfully!');
      navigate('/auth?mode=login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-2 border-gray-900 shadow-sm focus:border-primary focus:ring-primary"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-2 border-gray-900 shadow-sm focus:border-primary focus:ring-primary"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === password || 'The passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        <div className="space-y-4">
          <Link
            to="/auth?mode=login"
            className="block w-full px-4 py-2 text-base font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
          >
            Login to Your Account
          </Link>
          <Link
            to="/"
            className="block w-full px-4 py-2 text-base font-medium text-primary bg-white border border-primary rounded-md hover:bg-gray-50 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
