// ============================================
// AUTHENTICATION CONTROLLER
// ============================================

const UserModel = require('../models/userModel');
const { generateToken, verifyToken } = require('../services/authService');
const { 
    validateNameInput, 
    validateEmailInput, 
    validatePhoneInput, 
    validatePasswordInput 
} = require('../validators/inputValidators');

// Signup controller
const signup = (req, res) => {
    const { name, email, number, password } = req.body;

    const nameValidation = validateNameInput(name);
    if (!nameValidation.valid) {
        return res.status(400).json({ message: nameValidation.message });
    }

    const emailValidation = validateEmailInput(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    const phoneValidation = validatePhoneInput(number);
    if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
    }

    const passwordValidation = validatePasswordInput(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    const normalizedName = nameValidation.value;
    const normalizedEmail = emailValidation.value;
    const normalizedNumber = phoneValidation.value;
    const normalizedPassword = passwordValidation.value;

    // Check for duplicate email or number
    UserModel.findByEmailOrNumber(normalizedEmail, normalizedNumber, (err, data) => {
        if (err) {
            console.error('❌ Database error during check:', err);
            return res.status(500).json({ 
                message: "Database error", 
                error: err 
            });
        }

        if (data.length > 0) {
            const existingField = data[0].email === email ? 'email' : 'phone number';
            console.log('⚠️ Duplicate account attempt:', email, number);
            
            return res.status(409).json({ 
                message: `Account with this ${existingField} already exists. Please login or use different credentials.`,
                duplicate: true
            });
        }

        // Create new user
        UserModel.create(normalizedName, normalizedEmail, normalizedNumber, normalizedPassword, (err, result) => {
            if (err) {
                console.error('❌ Registration error:', err);
                
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ 
                        message: "Account with this email or phone number already exists",
                        duplicate: true
                    });
                }
                
                return res.status(500).json({ 
                    message: "Registration failed", 
                    error: err 
                });
            }
            
            console.log('✅ New user registered:', email);
            return res.status(201).json({ 
                message: "Registration successful", 
                userId: result.insertId 
            });
        });
    });
};

// Login controller
const login = (req, res) => {
    const { email, password } = req.body;

    const emailValidation = validateEmailInput(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePasswordInput(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    const normalizedEmail = emailValidation.value;
    const normalizedPassword = passwordValidation.value;
    
    console.log('Login attempt - Email:', normalizedEmail);
    console.log('Login attempt - Password length:', normalizedPassword.length);
    console.log('Login attempt - Password (first 3 chars):', normalizedPassword.substring(0, 3));
    
    UserModel.findByEmailAndPassword(normalizedEmail, normalizedPassword, (err, data) => {
        if (err) {
            console.error('❌ Login error:', err);
            return res.status(500).json({ 
                message: "Login failed", 
                error: err 
            });
        }
        
        if (data.length > 0) {
            console.log('✅ User logged in:', email);
            console.log('User ID:', data[0].id);
            console.log('User Name:', data[0].name);
            
            // Generate JWT token
            const token = generateToken(data[0]);
            
            console.log('Token generated successfully');
            console.log('Token length:', token.length);
            console.log('🔑 JWT Token:', token); // Log the actual token for debugging/Postman use
            
            const responseData = { 
                message: "Login successful", 
                token: token,
                user: {
                    id: data[0].id,
                    name: data[0].name,
                    email: data[0].email,
                    number: data[0].number
                }
            };
            
            console.log('Sending response with token:', !!responseData.token);
            
            return res.status(200).json(responseData);
        } else {
            console.log('⚠️ Invalid login attempt:', email);
            console.log('Query returned', data.length, 'rows');
            return res.status(401).json({ 
                message: "Invalid email or password" 
            });
        }
    });
};

// Token verification controller (for testing in Postman)
const verifyTokenController = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'] || req.body.token;
    
    if (!token) {
        return res.status(400).json({ 
            message: "No token provided. Please provide token in Authorization header (Bearer <token>) or in request body as 'token' field." 
        });
    }
    
    const verification = verifyToken(token);
    
    if (verification.valid) {
        return res.status(200).json({
            message: "Token is valid",
            token: token,
            decoded: verification.decoded,
            expiresAt: new Date(verification.decoded.exp * 1000).toISOString()
        });
    } else {
        return res.status(401).json({
            message: "Token is invalid or expired",
            error: verification.error
        });
    }
};

module.exports = {
    signup,
    login,
    verifyTokenController
};

