# 🚀 Quick Start Guide

## Step 1: Setup Database

1. **Start MySQL Server** (if not already running)

2. **Create the database and table:**
   - Open MySQL Command Line or MySQL Workbench
   - Run the SQL script:
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

   OR simply run:
   ```bash
   mysql -u root -p < database-setup.sql
   ```

3. **Verify database connection settings in `backend/server.js`:**
   - Default: `host: "localhost"`, `user: "root"`, `password: ""`
   - Update if your MySQL has different credentials

## Step 2: Install Dependencies (if not already installed)

Open PowerShell in the project root and run:

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 3: Start the Application

### Option A: Quick Start (Recommended)
```powershell
powershell -ExecutionPolicy Bypass -File start-project.ps1
```

This will open two PowerShell windows automatically:
- **Backend** on port **8081**
- **Frontend** on port **3000**

### Option B: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

## Step 4: Access the Application

- **Frontend**: Open your browser to http://localhost:3000
- **Backend API**: http://localhost:8081

## Step 5: Test the Application

1. **Register a new user:**
   - Click "Sign up" on the login page
   - Fill in the registration form
   - Submit

2. **Login:**
   - Use your registered email and password
   - You'll be redirected to the home page

3. **View Users:**
   - On the home page, you'll see all registered users
   - Click on a user name to see full details
   - Edit or delete users as needed

## Troubleshooting

### ❌ Backend won't start
- ✅ Check MySQL is running
- ✅ Verify `medhome` database exists
- ✅ Check MySQL credentials in `backend/server.js`
- ✅ Make sure port 8081 is not in use

### ❌ Frontend won't start
- ✅ Check port 3000 is not in use
- ✅ Try: `cd frontend && npm install` again
- ✅ Clear cache: Delete `node_modules` and reinstall

### ❌ Database connection error
- ✅ Verify MySQL service is running
- ✅ Check database credentials match your MySQL setup
- ✅ Ensure `medhome` database and `login` table exist

### ❌ Can't see users on home page
- ✅ Make sure backend is running on port 8081
- ✅ Check browser console for errors
- ✅ Verify you're logged in

## Need Help?

Check the main `README.md` for more detailed information.








