import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loginUser } from '../services/authService';
import { validateLoginForm } from '../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validation = validateLoginForm(formData.email, formData.password);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with email:', formData.email);
      console.log('Password length:', formData.password.length);
      
      const data = await loginUser(formData.email, formData.password);
      console.log('Login successful:', data);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      console.log('Token saved:', !!savedToken);
      console.log('User saved:', !!savedUser);
      
      if (!savedToken) {
        alert('Login successful but token was not saved. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Navigate directly to home page without alert
      navigate('/home');
      
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <div className="bg-gray-100 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Sign in to your account</h1>
      </div>

      <div className="bg-white px-6 py-8 max-w-2xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-gray-800 text-base font-semibold mb-2">Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-800 text-base font-semibold mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                👁️
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="text-right">
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg font-semibold py-4 rounded-lg transition"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button 
            type="button"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-4 rounded-lg transition"
          >
            <span className="text-2xl font-bold">G</span> Login with Google
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;