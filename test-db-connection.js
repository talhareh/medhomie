// Quick database connection test
require('dotenv').config();
const mysql = require('mysql');

console.log('Testing MySQL connection...\n');

// Load database credentials from environment variables
const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = process.env;

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

db.connect((err) => {
    if (err) {
        console.error('❌ Connection failed!');
        console.error('Error:', err.message);
        console.error('Code:', err.code);
        console.log('\nPossible solutions:');
        console.log('1. Make sure XAMPP MySQL is running');
        console.log('2. Check your .env file for correct database credentials');
        console.log(`3. Verify database "${DB_NAME}" exists: SHOW DATABASES;`);
        console.log(`4. Verify table "login" exists: USE ${DB_NAME}; SHOW TABLES;`);
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL!');
    
    // Test query
    db.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('❌ Query failed:', err.message);
            db.end();
            process.exit(1);
        }
        
        console.log(`\n📋 Tables in ${DB_NAME} database:`);
        results.forEach(row => {
            console.log('   -', Object.values(row)[0]);
        });
        
        // Check login table structure
        db.query('DESCRIBE login', (err, results) => {
            if (err) {
                console.error('\n❌ Table "login" not found or error:', err.message);
            } else {
                console.log('\n✅ Table "login" exists with columns:');
                results.forEach(col => {
                    console.log(`   - ${col.Field} (${col.Type})`);
                });
            }
            
            db.end();
            console.log('\n✅ Database connection test completed successfully!');
            process.exit(0);
        });
    });
});







