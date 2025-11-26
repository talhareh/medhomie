const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z\s]+$/;
const phoneRegex = /^\d+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const passwordErrorMessage =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export const validateLoginForm = (email, password) => {
  const errors = { email: '', password: '' };
  let isValid = true;

  if (!email.trim()) {
    errors.email = 'Please enter your email address';
    isValid = false;
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!password) {
    errors.password = 'Please enter your password';
    isValid = false;
  } else if (!passwordRegex.test(password)) {
    errors.password = passwordErrorMessage;
    isValid = false;
  }

  return { errors, isValid };
};

export const validateRegistrationForm = (formData, countryPhoneLengths) => {
  const errors = { name: '', email: '', number: '', password: '' };
  let isValid = true;

  const trimmedName = formData.fullName.trim();
  if (!trimmedName) {
    errors.name = 'Please enter your full name';
    isValid = false;
  } else if (!nameRegex.test(trimmedName)) {
    errors.name = 'Name can contain letters and spaces only';
    isValid = false;
  }

  if (!formData.email.trim()) {
    errors.email = 'Please enter your email address';
    isValid = false;
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  const phoneNumber = formData.whatsapp.replace(formData.countryCode, '').trim();
  const requiredLength = countryPhoneLengths[formData.countryCode] || 10;
  
  if (!phoneNumber) {
    errors.number = 'Please enter your WhatsApp number';
    isValid = false;
  } else if (!phoneRegex.test(phoneNumber)) {
    errors.number = 'Phone number should contain digits only';
    isValid = false;
  } else if (phoneNumber.length !== requiredLength) {
    errors.number = `Please enter a valid ${requiredLength}-digit phone number`;
    isValid = false;
  }

  if (!formData.password) {
    errors.password = 'Please enter a password';
    isValid = false;
  } else if (!passwordRegex.test(formData.password)) {
    errors.password = passwordErrorMessage;
    isValid = false;
  }

  return { errors, isValid };
};