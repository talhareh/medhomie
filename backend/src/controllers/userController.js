// ============================================
// USER CONTROLLER
// ============================================

const UserModel = require('../models/userModel');
const { 
    validateNameInput, 
    validateEmailInput, 
    validatePhoneInput, 
    validatePasswordInput 
} = require('../validators/inputValidators');

// Get all users
const getAllUsers = (req, res) => {
    UserModel.findAll((err, data) => {
        if (err) {
            console.error('❌ Error fetching users:', err);
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);
            return res.status(500).json({ 
                message: "Failed to fetch users", 
                error: err.message,
                users: [],
                total: 0
            });
        }
        
        console.log(`✅ Fetched ${data.length} users`);
        return res.status(200).json({ 
            message: "Users fetched successfully",
            users: data || [],
            total: data ? data.length : 0
        });
    });
};

// Get single user by ID
const getUserById = (req, res) => {
    const userId = req.params.id;
    
    UserModel.findById(userId, (err, data) => {
        if (err) {
            console.error('❌ Error fetching user:', err);
            return res.status(500).json({ 
                message: "Failed to fetch user", 
                error: err 
            });
        }
        
        if (data.length === 0) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }
        
        console.log(`✅ Fetched user:`, data[0].email);
        return res.status(200).json({ 
            message: "User fetched successfully",
            user: data[0]
        });
    });
};

// Update user
const updateUser = (req, res) => {
    const userId = req.params.id;
    const tokenUserId = req.user.id; // User ID from token
    
    // Verify user can only update their own data
    if (parseInt(userId) !== parseInt(tokenUserId)) {
        return res.status(403).json({ 
            message: "Forbidden. You can only update your own account." 
        });
    }
    
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

    const passwordValidation = validatePasswordInput(password, { allowEmpty: true });
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    const shouldUpdatePassword = passwordValidation.value !== '';

    UserModel.update(
        userId,
        nameValidation.value,
        emailValidation.value,
        phoneValidation.value,
        shouldUpdatePassword ? passwordValidation.value : null,
        (err, result) => {
            if (err) {
                console.error('❌ Error updating user:', err);
                
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ 
                        message: "Email or phone number already exists for another user"
                    });
                }
                
                return res.status(500).json({ 
                    message: "Failed to update user", 
                    error: err 
                });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: "User not found" 
                });
            }
            
            console.log(`✅ User updated: ID ${userId}`);
            return res.status(200).json({ 
                message: "User updated successfully"
            });
        }
    );
};

// Delete user
const deleteUser = (req, res) => {
    const userId = req.params.id;
    const tokenUserId = req.user.id; // User ID from token
    
    // Verify user can only delete their own data
    if (parseInt(userId) !== parseInt(tokenUserId)) {
        return res.status(403).json({ 
            message: "Forbidden. You can only delete your own account." 
        });
    }
    
    UserModel.delete(userId, (err, result) => {
        if (err) {
            console.error('❌ Error deleting user:', err);
            return res.status(500).json({ 
                message: "Failed to delete user", 
                error: err 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }
        
        console.log(`✅ User deleted: ID ${userId}`);
        return res.status(200).json({ 
            message: "User deleted successfully"
        });
    });
};

// Validate all users
const validateAllUsers = (req, res) => {
    UserModel.findAllForValidation((err, data) => {
        if (err) {
            console.error('❌ Error fetching users for validation:', err);
            return res.status(500).json({ 
                message: "Failed to fetch users", 
                error: err 
            });
        }
        
        if (data.length === 0) {
            return res.status(200).json({ 
                message: "No users found in database",
                totalUsers: 0,
                validUsers: 0,
                invalidUsers: 0,
                validationResults: []
            });
        }
        
        const validationResults = [];
        let validCount = 0;
        let invalidCount = 0;
        
        data.forEach(user => {
            const errors = [];
            
            // Validate name
            const nameValidation = validateNameInput(user.name);
            if (!nameValidation.valid) {
                errors.push({ field: 'name', message: nameValidation.message });
            }
            
            // Validate email
            const emailValidation = validateEmailInput(user.email);
            if (!emailValidation.valid) {
                errors.push({ field: 'email', message: emailValidation.message });
            }
            
            // Validate phone number
            const phoneValidation = validatePhoneInput(user.number);
            if (!phoneValidation.valid) {
                errors.push({ field: 'number', message: phoneValidation.message });
            }
            
            // Validate password
            const passwordValidation = validatePasswordInput(user.password);
            if (!passwordValidation.valid) {
                errors.push({ field: 'password', message: passwordValidation.message });
            }
            
            const isValid = errors.length === 0;
            if (isValid) {
                validCount++;
            } else {
                invalidCount++;
            }
            
            validationResults.push({
                userId: user.id,
                name: user.name,
                email: user.email,
                number: user.number,
                isValid: isValid,
                errors: errors
            });
        });
        
        console.log(`✅ Validation complete: ${validCount} valid, ${invalidCount} invalid out of ${data.length} users`);
        
        return res.status(200).json({ 
            message: "User validation complete",
            totalUsers: data.length,
            validUsers: validCount,
            invalidUsers: invalidCount,
            validationResults: validationResults
        });
    });
};

// Get saved courses for authenticated user
const getSavedCourses = (req, res) => {
    const userId = req.user.id; // User ID from token
    
    UserModel.getSavedCourses(userId, (err, courses) => {
        if (err) {
            console.error('❌ Error fetching saved courses:', err);
            return res.status(500).json({ 
                message: "Failed to fetch saved courses", 
                error: err.message 
            });
        }
        
        console.log(`✅ Fetched ${courses.length} saved courses for user ${userId}`);
        return res.status(200).json({ 
            message: "Saved courses fetched successfully",
            courses: courses || []
        });
    });
};

// Save courses for authenticated user
const saveCourses = (req, res) => {
    const userId = req.user.id; // User ID from token
    const { courses } = req.body;
    
    if (!Array.isArray(courses)) {
        return res.status(400).json({ 
            message: "Invalid request. 'courses' must be an array." 
        });
    }
    
    UserModel.saveCourses(userId, courses, (err) => {
        if (err) {
            console.error('❌ Error saving courses:', err);
            return res.status(500).json({ 
                message: "Failed to save courses", 
                error: err.message 
            });
        }
        
        console.log(`✅ Saved ${courses.length} courses for user ${userId}`);
        return res.status(200).json({ 
            message: "Courses saved successfully",
            coursesCount: courses.length
        });
    });
};

// Get purchased courses for authenticated user
const getPurchasedCourses = (req, res) => {
    const userId = req.user.id;

    UserModel.getPurchasedCourses(userId, (err, courses) => {
        if (err) {
            console.error('❌ Error fetching purchased courses:', err);
            return res.status(500).json({
                message: "Failed to fetch purchased courses",
                error: err.message
            });
        }

        console.log(`✅ Fetched ${courses.length} purchased courses for user ${userId}`);
        return res.status(200).json({
            message: "Purchased courses fetched successfully",
            courses: courses || []
        });
    });
};

// Save purchased courses for authenticated user
const savePurchasedCourses = (req, res) => {
    const userId = req.user.id;
    const { courses } = req.body;

    if (!Array.isArray(courses)) {
        return res.status(400).json({
            message: "Invalid request. 'courses' must be an array."
        });
    }

    UserModel.savePurchasedCourses(userId, courses, (err) => {
        if (err) {
            console.error('❌ Error saving purchased courses:', err);
            return res.status(500).json({
                message: "Failed to save purchased courses",
                error: err.message
            });
        }

        console.log(`✅ Saved ${courses.length} purchased courses for user ${userId}`);
        return res.status(200).json({
            message: "Purchased courses saved successfully",
            coursesCount: courses.length
        });
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    validateAllUsers,
    getSavedCourses,
    saveCourses,
    getPurchasedCourses,
    savePurchasedCourses
};

