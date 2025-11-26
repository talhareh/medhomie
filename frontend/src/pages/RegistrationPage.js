import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { registerUser } from '../services/authService';
import { validateRegistrationForm } from '../utils/validation';
import { countries, countryPhoneLengths } from '../data/countries';

const RegistrationPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+92',
    whatsapp: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    number: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredLength = countryPhoneLengths[formData.countryCode] || 10;

  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    setFormData({ ...formData, countryCode: newCode });
    setErrors({ ...errors, number: '' });
  };

  const handleWhatsAppChange = (e) => {
    const newValue = e.target.value;
    setFormData({ ...formData, whatsapp: newValue });
    
    // Extract only digits after the country code
    const phoneNumber = newValue.replace(formData.countryCode, '').trim();
    
    // Only show error if user has started typing but hasn't reached required length
    if (phoneNumber.length > 0 && phoneNumber.length < requiredLength) {
      setErrors({ ...errors, number: `Please enter a ${requiredLength}-digit phone number` });
    } else {
      setErrors({ ...errors, number: '' });
    }
  };

  const handleSubmit = async () => {
    const validation = validateRegistrationForm(formData, countryPhoneLengths);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    setIsSubmitting(true);
    
    try {
      const userData = {
        name: formData.fullName,
        email: formData.email,
        number: formData.whatsapp,
        password: formData.password
      };

      const data = await registerUser(userData);
      console.log('Registration successful:', data);
      alert('Registration successful! Please login.');
      navigate('/login');
      
    } catch (err) {
      console.error('Registration error:', err);
      
      // Check if error is about duplicate account
      if (err.message.includes('duplicate') || err.message.includes('already exists') || err.message.includes('ER_DUP_ENTRY')) {
        alert('Account with this email or phone number already exists. Please login or use different credentials.');
      } else {
        alert(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <div className="bg-gray-100 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Create a new account</h1>
      </div>

      <div className="bg-white px-6 py-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-800 text-base font-semibold mb-2">Full Name</label>
            <input 
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-800 text-base font-semibold mb-2">Email Address</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-800 text-base font-semibold mb-2">WhatsApp Number</label>
            <div className={`flex border rounded-lg overflow-hidden ${errors.number ? 'border-red-500' : 'border-gray-300'}`}>
              <select 
                value={formData.countryCode}
                onChange={handleCountryChange}
                className="px-3 py-3 bg-white border-r border-gray-300 focus:outline-none w-32"
              >
                {countries.map(country => (
                  <option key={country.code + country.name} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input 
                type="tel"
                value={formData.whatsapp}
                onChange={handleWhatsAppChange}
                placeholder="Enter your number"
                className="flex-1 px-4 py-3 focus:outline-none"
              />
            </div>
            {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
            {!errors.number && formData.whatsapp.length > 0 && formData.whatsapp.length < requiredLength && (
              <p className="text-gray-600 text-sm mt-1">Please enter a {requiredLength}-digit phone number</p>
            )}
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

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg font-semibold py-4 rounded-lg transition mt-6"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
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
            <span className="text-2xl font-bold">G</span> Register with Google
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;