// ============================================
// USER MODEL - Database Queries
// ============================================

const db = require('../config/database');

const UserModel = {
    // Check if user exists by email or number
    findByEmailOrNumber: (email, number, callback) => {
        const sql = "SELECT * FROM login WHERE `email` = ? OR `number` = ?";
        db.query(sql, [email, number], callback);
    },

    // Find user by email and password
    findByEmailAndPassword: (email, password, callback) => {
        const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
        db.query(sql, [email, password], callback);
    },

    // Create new user
    create: (name, email, number, password, callback) => {
        const sql = "INSERT INTO login (`name`, `email`, `number`, `password`) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, number, password], callback);
    },

    // Get all users
    findAll: (callback) => {
        const sql = "SELECT id, name, email, number, created_at FROM login ORDER BY created_at DESC";
        db.query(sql, callback);
    },

    // Find user by ID
    findById: (userId, callback) => {
        const sql = "SELECT id, name, email, number, created_at FROM login WHERE id = ?";
        db.query(sql, [userId], callback);
    },

    // Update user
    update: (userId, name, email, number, password, callback) => {
        if (password) {
            const sql = "UPDATE login SET `name` = ?, `email` = ?, `number` = ?, `password` = ? WHERE id = ?";
            db.query(sql, [name, email, number, password, userId], callback);
        } else {
            const sql = "UPDATE login SET `name` = ?, `email` = ?, `number` = ? WHERE id = ?";
            db.query(sql, [name, email, number, userId], callback);
        }
    },

    // Delete user
    delete: (userId, callback) => {
        const sql = "DELETE FROM login WHERE id = ?";
        db.query(sql, [userId], callback);
    },

    // Get all users for validation (includes password)
    findAllForValidation: (callback) => {
        const sql = "SELECT id, name, email, number, password FROM login ORDER BY id";
        db.query(sql, callback);
    },

    // Get saved courses for a user
    getSavedCourses: (userId, callback) => {
        const sql = "SELECT saved_courses FROM login WHERE id = ?";
        db.query(sql, [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            if (results.length === 0) {
                return callback(null, []);
            }
            // Parse JSON if it exists, otherwise return empty array
            try {
                const savedCourses = results[0].saved_courses 
                    ? JSON.parse(results[0].saved_courses) 
                    : [];
                callback(null, savedCourses);
            } catch (parseErr) {
                callback(null, []);
            }
        });
    },

    // Save courses for a user
    saveCourses: (userId, courses, callback) => {
        const coursesJson = JSON.stringify(courses);
        const sql = "UPDATE login SET saved_courses = ? WHERE id = ?";
        db.query(sql, [coursesJson, userId], callback);
    },

    // Get purchased courses for a user
    getPurchasedCourses: (userId, callback) => {
        const sql = "SELECT purchased_courses FROM login WHERE id = ?";
        db.query(sql, [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            if (results.length === 0) {
                return callback(null, []);
            }
            try {
                const purchased = results[0].purchased_courses
                    ? JSON.parse(results[0].purchased_courses)
                    : [];
                callback(null, purchased);
            } catch (parseErr) {
                callback(null, []);
            }
        });
    },

    // Save purchased courses for a user
    savePurchasedCourses: (userId, courses, callback) => {
        const coursesJson = JSON.stringify(courses);
        const sql = "UPDATE login SET purchased_courses = ? WHERE id = ?";
        db.query(sql, [coursesJson, userId], callback);
    }
};

module.exports = UserModel;

