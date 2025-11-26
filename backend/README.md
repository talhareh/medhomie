# MedHome Backend API

## Project Structure

```
backend/
├── src/              # Source code directory
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection configuration
│   │   └── jwt.js        # JWT secret and configuration
│   │
│   ├── controllers/      # Request handlers (business logic)
│   │   ├── authController.js    # Authentication (signup, login)
│   │   ├── userController.js    # User CRUD operations
│   │   └── stageController.js    # Stage management
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Token verification middleware
│   │   └── database.js   # Database connection middleware
│   │
│   ├── models/           # Database models (data access layer)
│   │   └── userModel.js  # User database queries
│   │
│   ├── routes/           # API route definitions
│   │   ├── authRoutes.js     # Signup route (/signup)
│   │   ├── loginRoutes.js    # Login route (/login)
│   │   ├── userRoutes.js     # User routes (/users)
│   │   └── stageRoutes.js    # Stage routes (/stages)
│   │
│   ├── services/         # Business logic services
│   │   └── authService.js    # JWT token generation
│   │
│   ├── utils/           # Utility functions
│   │   └── databaseSetup.js  # Database schema setup
│   │
│   └── validators/      # Input validation functions
│       └── inputValidators.js  # Email, password, name, phone validators
│
├── scripts/          # Utility scripts
│   └── fix-phone-number.js
│
├── server.js        # Main server file (entry point)
├── package.json     # Dependencies and scripts
└── README.md        # Documentation
```

## API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - Login user (returns JWT token)

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (requires token)
- `DELETE /users/:id` - Delete user (requires token)
- `GET /users/validate/all` - Get all users for validation

### Stages
- `GET /stages` - Get all stage definitions

## Authentication

Protected routes (PUT, DELETE) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are generated on login and expire after 7 days.

## Database

- **Database:** MySQL
- **Database Name:** medhome
- **Table:** login
- **Connection:** Configured in `config/database.js`

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure database in `config/database.js`

3. Start server:
```bash
npm start
```

Server runs on `http://localhost:8081`

