// ============================================
// DATABASE CONFIGURATION
// ============================================

const mysql = require('mysql');

const {
    DB_HOST = 'localhost',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'medhome'
} = process.env;

const db = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
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
        console.log('   2. Check if MySQL has a password (update config/database.js)');
        console.log('   3. Verify database "medhome" exists');
        console.log('   4. Verify table "login" exists in medhome database');
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

