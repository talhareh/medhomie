// ============================================
// INPUT VALIDATION FUNCTIONS
// ============================================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z\s]+$/;
const phoneRegex = /^\d+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const passwordRequirementsMessage = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";

const validateNameInput = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return { valid: false, message: "Full name is required" };
    }
    if (!nameRegex.test(trimmed)) {
        return { valid: false, message: "Name can contain letters and spaces only" };
    }
    return { valid: true, value: trimmed };
};

const validateEmailInput = (email) => {
    const trimmed = (email || '').trim();
    if (!trimmed) {
        return { valid: false, message: "Email is required" };
    }
    if (!emailRegex.test(trimmed)) {
        return { valid: false, message: "Please provide a valid email address" };
    }
    return { valid: true, value: trimmed };
};

const validatePhoneInput = (number) => {
    const normalized = String(number || '').trim();
    if (!normalized) {
        return { valid: false, message: "Phone number is required" };
    }
    if (!phoneRegex.test(normalized)) {
        return { valid: false, message: "Phone number should contain digits only" };
    }
    return { valid: true, value: normalized };
};

const validatePasswordInput = (password, { allowEmpty = false } = {}) => {
    const pwd = password || '';
    if (!pwd) {
        return allowEmpty
            ? { valid: true, value: '' }
            : { valid: false, message: "Password is required" };
    }
    if (!passwordRegex.test(pwd)) {
        return { valid: false, message: passwordRequirementsMessage };
    }
    return { valid: true, value: pwd };
};

module.exports = {
    validateNameInput,
    validateEmailInput,
    validatePhoneInput,
    validatePasswordInput,
    passwordRequirementsMessage
};

