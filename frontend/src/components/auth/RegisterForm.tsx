import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/auth';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export const RegisterForm = () => {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterData>();

  const onSubmit = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // Set default role as student
      const registerData = { ...data, role: 'student' };
      await registerUser(registerData);
      setVerificationSent(true);
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      toast.success('Google registration successful!');
    } catch (error) {
      toast.error('Google registration failed');
    }
  };

  if (verificationSent) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="input-field"
            {...register('fullName', {
              required: 'Full name is required'
            })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email Address
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
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="whatsappNumber" className="form-label">
            WhatsApp Number
          </label>
          <Controller
            name="whatsappNumber"
            control={control}
            rules={{
              required: 'WhatsApp number is required'
            }}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                country={'pk'}
                value={value}
                onChange={phone => onChange(phone)}
                inputClass="!w-full !h-10 !text-base"
                containerClass="!w-full"
                buttonClass="!h-10 !border-gray-300"
                dropdownClass="!min-w-[300px]"
                searchClass="!w-full"
                enableSearch
                searchPlaceholder="Search country..."
              />
            )}
          />
          {errors.whatsappNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>
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
                className="h-5 w-5 text-gray-400 hover:text-gray-500"
              />
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full btn-secondary"
        >
          <FontAwesomeIcon icon={faGoogle} className="mr-2" />
          Register with Google
        </button>
      </form>
    </div>
  );
};
