/**
 * Utility script to ensure the login.number column uses VARCHAR(20)
 * and that existing duplicate values are repaired.
 *
 * Run with: node scripts/fix-phone-number.js
 */
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'medhome'
});

const query = util.promisify(connection.query).bind(connection);

async function run() {
    try {
        console.log('🔌 Connecting to MySQL...');
        await query('SELECT 1');
        console.log('✅ Connected.');

        const columns = await query("SHOW COLUMNS FROM login LIKE 'number'");
        if (!columns.length) {
            console.log('⚠️ `number` column not found. Please recreate the table using database-setup.sql.');
            return;
        }

        const column = columns[0];
        const currentType = column.Type.toLowerCase();
        const isVarchar = currentType.includes('varchar');
        const isUnique = column.Key === 'UNI';
        console.log(`ℹ️ Current column type: ${currentType}, unique: ${isUnique}`);

        if (isVarchar && isUnique) {
            console.log('✅ Column already uses VARCHAR(20) with a UNIQUE constraint. No action needed.');
            return;
        }

        await dropUniqueIndexIfExists();
        await alterColumnToVarchar();
        await dedupeNumbers();
        await addUniqueIndex();
        console.log('🎉 Phone number column successfully migrated to VARCHAR(20) with unique values.');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        connection.end();
    }
}

async function dropUniqueIndexIfExists() {
    const indexes = await query("SHOW INDEX FROM login WHERE Key_name = 'number'");
    if (indexes.length) {
        console.log('🧹 Dropping existing UNIQUE index on `number`...');
        await query('ALTER TABLE login DROP INDEX `number`');
    } else {
        console.log('ℹ️ No UNIQUE index named `number` found (nothing to drop).');
    }
}

async function alterColumnToVarchar() {
    console.log('🛠️ Converting `number` column to VARCHAR(20)...');
    await query('ALTER TABLE login MODIFY COLUMN `number` VARCHAR(20) NOT NULL');
}

async function dedupeNumbers() {
    console.log('🔎 Checking for duplicate phone numbers...');
    const rows = await query('SELECT id, number FROM login ORDER BY number, id');
    const seen = new Set();
    let updates = 0;

    for (const row of rows) {
        const numStr = String(row.number ?? '').trim();
        if (numStr === '') {
            const fallback = `pending-${row.id}`;
            await query('UPDATE login SET number = ? WHERE id = ?', [fallback, row.id]);
            updates += 1;
            continue;
        }

        if (seen.has(numStr)) {
            const newValue = `${numStr}-${row.id}`;
            await query('UPDATE login SET number = ? WHERE id = ?', [newValue, row.id]);
            updates += 1;
        } else {
            seen.add(numStr);
        }
    }

    if (updates > 0) {
        console.log(`♻️ Updated ${updates} duplicate record(s) to unique placeholder values.`);
        console.log('   You can edit these numbers later via the dashboard.');
    } else {
        console.log('✅ No duplicates detected.');
    }
}

async function addUniqueIndex() {
    console.log('🔐 Re-adding UNIQUE constraint on `number` column...');
    await query('ALTER TABLE login ADD UNIQUE KEY `number` (`number`)');
}

run();

