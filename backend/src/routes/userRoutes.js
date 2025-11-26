// ============================================
// USER ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    validateAllUsers,
    getSavedCourses,
    saveCourses,
    getPurchasedCourses,
    savePurchasedCourses
} = require('../controllers/userController');
const { checkDatabaseConnection } = require('../middleware/database');
const { verifyToken } = require('../middleware/auth');

router.get('/', checkDatabaseConnection, getAllUsers);
router.get('/validate/all', checkDatabaseConnection, validateAllUsers);
router.get('/:id', getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

// Saved courses routes (protected)
router.get('/saved/courses', verifyToken, getSavedCourses);
router.post('/saved/courses', verifyToken, saveCourses);
router.get('/purchased/courses', verifyToken, getPurchasedCourses);
router.post('/purchased/courses', verifyToken, savePurchasedCourses);

module.exports = router;

