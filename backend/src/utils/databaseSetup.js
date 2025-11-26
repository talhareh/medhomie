// ============================================
// DATABASE SETUP UTILITIES
// ============================================

const db = require('../config/database');

// Ensure login table has the required schema
const ensureLoginTableSchema = () => {
    ensureCreatedAtColumn();
    ensurePhoneNumberColumn();
    ensureSavedCoursesColumn();
    ensurePurchasedCoursesColumn();
};

const ensureCreatedAtColumn = () => {
    const checkColumnSql = "SHOW COLUMNS FROM login LIKE 'created_at'";
    db.query(checkColumnSql, (err, results) => {
        if (err) {
            console.error('⚠️ Unable to verify login table schema:', err.message);
            return;
        }

        if (results.length === 0) {
            console.log('🛠️ Adding `created_at` column to login table...');
            const alterSql = "ALTER TABLE login ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
            db.query(alterSql, (alterErr) => {
                if (alterErr) {
                    console.error('❌ Failed to add `created_at` column:', alterErr.message);
                    return;
                }
                console.log('✅ `created_at` column added to login table');
            });
        } else {
            console.log('✅ `created_at` column already exists on login table');
        }
    });
};

const ensurePhoneNumberColumn = () => {
    const checkNumberSql = "SHOW COLUMNS FROM login LIKE 'number'";
    db.query(checkNumberSql, (err, results) => {
        if (err) {
            console.error('⚠️ Unable to verify login table phone column:', err.message);
            return;
        }

        if (results.length === 0) {
            console.warn('⚠️ `number` column is missing on login table. Please re-run database-setup.sql');
            return;
        }

        const columnType = results[0].Type.toLowerCase();
        if (!columnType.includes('varchar')) {
            console.log('🛠️ Updating `number` column to VARCHAR(20) so large WhatsApp numbers are supported...');
            const alterNumberSql = "ALTER TABLE login MODIFY COLUMN `number` VARCHAR(20) NOT NULL UNIQUE";
            db.query(alterNumberSql, (alterErr) => {
                if (alterErr) {
                    console.error('❌ Failed to update `number` column type:', alterErr.message);
                    return;
                }
                console.log('✅ `number` column updated to VARCHAR(20)');
            });
        } else {
            console.log('✅ `number` column is already VARCHAR-based');
        }
    });
};

const ensureSavedCoursesColumn = () => {
    const checkColumnSql = "SHOW COLUMNS FROM login LIKE 'saved_courses'";
    db.query(checkColumnSql, (err, results) => {
        if (err) {
            console.error('⚠️ Unable to verify saved_courses column:', err.message);
            return;
        }

        if (results.length === 0) {
            console.log('🛠️ Adding `saved_courses` column to login table...');
            const alterSql = "ALTER TABLE login ADD COLUMN `saved_courses` JSON DEFAULT NULL";
            db.query(alterSql, (alterErr) => {
                if (alterErr) {
                    console.error('❌ Failed to add `saved_courses` column:', alterErr.message);
                    return;
                }
                console.log('✅ `saved_courses` column added to login table');
            });
        } else {
            console.log('✅ `saved_courses` column already exists on login table');
        }
    });
};

const ensurePurchasedCoursesColumn = () => {
    const checkColumnSql = "SHOW COLUMNS FROM login LIKE 'purchased_courses'";
    db.query(checkColumnSql, (err, results) => {
        if (err) {
            console.error('⚠️ Unable to verify purchased_courses column:', err.message);
            return;
        }

        if (results.length === 0) {
            console.log('🛠️ Adding `purchased_courses` column to login table...');
            const alterSql = "ALTER TABLE login ADD COLUMN `purchased_courses` JSON DEFAULT NULL";
            db.query(alterSql, (alterErr) => {
                if (alterErr) {
                    console.error('❌ Failed to add `purchased_courses` column:', alterErr.message);
                    return;
                }
                console.log('✅ `purchased_courses` column added to login table');
            });
        } else {
            console.log('✅ `purchased_courses` column already exists on login table');
        }
    });
};

module.exports = {
    ensureLoginTableSchema
};

