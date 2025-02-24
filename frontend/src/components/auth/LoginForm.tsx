import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const LoginForm = () => {
  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
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
    <div className="w-full max-w-md">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link
              to="/auth/request-password-reset"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="input-field"
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
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">
              Or continue with
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 btn-outline"
          >
            <FontAwesomeIcon icon={faGoogle} />
            <span>Google</span>
          </button>
        </div>
      </form>
    </div>
  );
};
