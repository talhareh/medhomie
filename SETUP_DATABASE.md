# Database Setup Guide

## Quick Setup Steps

### 1. Start MySQL Server
Make sure MySQL is running on your computer.

### 2. Create the Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```

Then run:
```sql
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
```

**Option B: Using the SQL File**
```bash
mysql -u root -p < database-setup.sql
```

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the `database-setup.sql` file
4. Execute the script (Run button or F5)

### 3. Verify Database Connection Settings

Check `backend/server.js` - it should have:
```javascript
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // Update if your MySQL has a password
    database: "medhome"
});
```

**If your MySQL has a password**, update line 16 in `backend/server.js`:
```javascript
password: "your_mysql_password",
```

### 4. Test the Connection

After setting up the database, restart the backend server:
1. Close the backend PowerShell window
2. Run: `cd backend && npm start`

You should see:
- ✅ Connected to MySQL database
- 🚀 Server listening on port 8081

### Troubleshooting

**Error: "Database connection failed"**
- ✅ Make sure MySQL service is running
- ✅ Verify the database `medhome` exists
- ✅ Check username/password in `backend/server.js`
- ✅ Try connecting manually: `mysql -u root -p`

**Error: "Access denied"**
- ✅ Check MySQL username and password
- ✅ Make sure the user has permissions to access the database

**Error: "Unknown database 'medhome'"**
- ✅ Run the database setup script above
- ✅ Verify with: `SHOW DATABASES;` in MySQL







