// Quick database connection test
const mysql = require('mysql');

console.log('Testing MySQL connection...\n');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // Update if your MySQL has a password
    database: "medhome"
});

db.connect((err) => {
    if (err) {
        console.error('❌ Connection failed!');
        console.error('Error:', err.message);
        console.error('Code:', err.code);
        console.log('\nPossible solutions:');
        console.log('1. Make sure XAMPP MySQL is running');
        console.log('2. If MySQL has a password, update the password in this file');
        console.log('3. Verify database "medhome" exists: SHOW DATABASES;');
        console.log('4. Verify table "login" exists: USE medhome; SHOW TABLES;');
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
        
        console.log('\n📋 Tables in medhome database:');
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

