// ============================================
// MAIN SERVER FILE
// ============================================

require('dotenv').config();

const express = require("express");
const cors = require('cors');
const db = require('./src/config/database');
const { ensureLoginTableSchema } = require('./src/utils/databaseSetup');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const userRoutes = require('./src/routes/userRoutes');
const stageRoutes = require('./src/routes/stageRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database schema
    ensureLoginTableSchema();

// Routes
app.use('/signup', authRoutes);
app.use('/login', loginRoutes);
app.use('/users', userRoutes);
app.use('/stages', stageRoutes);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log('🚀 Server listening on port', PORT);
    console.log('📍 API endpoints:');
    console.log('   POST   http://localhost:' + PORT + '/signup');
    console.log('   POST   http://localhost:' + PORT + '/login');
    console.log('   POST   http://localhost:' + PORT + '/login/verify (verify JWT token)');
    console.log('   GET    http://localhost:' + PORT + '/users');
    console.log('   GET    http://localhost:' + PORT + '/users/:id');
    console.log('   GET    http://localhost:' + PORT + '/users/validate/all');
    console.log('   GET    http://localhost:' + PORT + '/users/saved/courses (get saved courses - requires token)');
    console.log('   POST   http://localhost:' + PORT + '/users/saved/courses (save courses - requires token)');
    console.log('   GET    http://localhost:' + PORT + '/users/purchased/courses (get purchased courses - requires token)');
    console.log('   POST   http://localhost:' + PORT + '/users/purchased/courses (save purchased courses - requires token)');
    console.log('   GET    http://localhost:' + PORT + '/stages');
    console.log('   PUT    http://localhost:' + PORT + '/users/:id');
    console.log('   DELETE http://localhost:' + PORT + '/users/:id');
});

// ============================================
// MySQL Database Setup (Reference)
// ============================================
/*
CREATE DATABASE IF NOT EXISTS medhome;
USE medhome;

CREATE TABLE IF NOT EXISTS login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX idx_email ON login(email);
CREATE INDEX idx_number ON login(number);
*/
