# MedLab Project

A medical lab management system with React frontend and Node.js/Express backend.

## Project Structure

```
MedLab/
├── frontend/          # React application
├── backend/           # Node.js/Express API server
├── database-setup.sql # MySQL database setup script
└── start-project.ps1  # Quick startup script
```

## Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (running locally)
- **npm** (comes with Node.js)

## Setup Instructions

### 1. Database Setup

1. Start your MySQL server
2. Open MySQL command line or MySQL Workbench
3. Run the database setup script:
   ```sql
   source database-setup.sql
   ```
   Or copy and paste the contents of `database-setup.sql` into your MySQL client

4. Verify the database was created:
   ```sql
   USE medhome;
   SHOW TABLES;
   ```

### 2. Backend Configuration

The backend is configured to connect to MySQL with these default settings:
- Host: `localhost`
- User: `root`
- Password: `` (empty)
- Database: `medhome`

If your MySQL setup is different, edit `backend/server.js` and update the connection settings:

```javascript
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",  // Update if needed
    database: "medhome"
});
```

### 3. Install Dependencies

If you haven't already installed dependencies, run:

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Starting the Project

### Option 1: Quick Start (Recommended)

Run the startup script:
```powershell
powershell -ExecutionPolicy Bypass -File start-project.ps1
```

This will open two separate PowerShell windows:
- Backend server on port **8081**
- Frontend server on port **3000**

### Option 2: Manual Start

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

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081

## API Endpoints

- `POST /signup` - User registration
- `POST /login` - User login
- `GET /users` - Get all users
- `GET /users/:id` - Get single user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Troubleshooting

### Backend won't start
- Make sure MySQL is running
- Verify the `medhome` database exists
- Check MySQL credentials in `backend/server.js`

### Frontend won't start
- Make sure port 3000 is not in use
- Try deleting `node_modules` and running `npm install` again

### Database connection errors
- Verify MySQL service is running
- Check database credentials
- Ensure the `medhome` database and `login` table exist

## Development

- Backend uses **Express.js** and **MySQL**
- Frontend uses **React** with **React Router**
- Styling uses **Tailwind CSS**

## License

This project is for educational purposes.



