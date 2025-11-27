// ============================================
// DATABASE CONFIGURATION
// ============================================

const mysql = require('mysql');

// Load environment variables (required)
require('dotenv').config();

const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = process.env;

// Validate required environment variables
if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error('❌ Missing required database environment variables!');
    console.error('Required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('Please check your .env file.');
    process.exit(1);
}

const db = mysql.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        console.error('Error details:', err.message);
        console.error('Error code:', err.code);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure MySQL/XAMPP is running');
        console.log('   2. Check your .env file for correct database credentials');
        console.log(`   3. Verify database "${DB_NAME}" exists`);
        console.log(`   4. Verify table "login" exists in ${DB_NAME} database`);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// Handle connection errors
db.on('error', (err) => {
    console.error('❌ Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('⚠️ Database connection lost. Attempting to reconnect...');
        db.connect();
    }
});

module.exports = db;

