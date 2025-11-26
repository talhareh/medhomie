# Postman Testing Guide

## ⚠️ Important Note

**Postman cannot directly test Redux/Context API state management** because:
- Redux/Context API are **client-side** (browser) state management libraries
- Postman tests **HTTP APIs** (server endpoints)
- State management runs in the browser, not on the server

However, you can:
1. ✅ Test the **backend APIs** that your frontend uses
2. ✅ Validate the **browser state** using DevTools (see below)

---

## Part 1: Testing Backend APIs in Postman

### Prerequisites
1. Start the backend server: `cd backend && npm start`
2. Ensure MySQL is running and database is set up
3. Open Postman

### API Endpoints to Test

#### 1. User Registration (Signup)
**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:8081/signup`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "number": "1234567890",
    "password": "Test@1234"
  }
  ```

**Expected Response (201):**
```json
{
  "message": "Registration successful",
  "userId": 1
}
```

**Test Cases:**
- ✅ Valid registration
- ❌ Duplicate email
- ❌ Duplicate phone number
- ❌ Invalid email format
- ❌ Weak password
- ❌ Missing required fields

---

#### 2. User Login
**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:8081/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "Test@1234"
  }
  ```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "number": "1234567890"
  }
}
```

**Test Cases:**
- ✅ Valid login
- ❌ Invalid email
- ❌ Wrong password
- ❌ Non-existent user

---

#### 3. Get All Users
**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8081/users`
- **Headers:** None required

**Expected Response (200):**
```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "number": "1234567890",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### 4. Get Single User
**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8081/users/1`
- **Headers:** None required

**Expected Response (200):**
```json
{
  "message": "User fetched successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "number": "1234567890",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### 5. Update User
**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:8081/users/1`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com",
    "number": "9876543210",
    "password": "NewPass@1234"
  }
  ```

**Expected Response (200):**
```json
{
  "message": "User updated successfully"
}
```

---

#### 6. Delete User
**Request:**
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/users/1`
- **Headers:** None required

**Expected Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

#### 7. Validate All Users
**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8081/users/validate/all`
- **Headers:** None required

**Expected Response (200):**
```json
{
  "message": "User validation complete",
  "totalUsers": 1,
  "validUsers": 1,
  "invalidUsers": 0,
  "validationResults": [
    {
      "userId": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "number": "1234567890",
      "isValid": true,
      "errors": [],
      "warnings": []
    }
  ]
}
```

---

## Part 2: Testing Stage Information (New Endpoint)

I'll add a test endpoint that returns stage definitions. This helps validate the stage structure.

### Get Stage Definitions
**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8081/stages`
- **Headers:** None required

**Expected Response (200):**
```json
{
  "message": "Stage definitions retrieved successfully",
  "stages": {
    "LOGIN": {
      "id": 1,
      "name": "Login Page"
    },
    "REGISTER": {
      "id": 2,
      "name": "Registration Page"
    },
    "HOME": {
      "id": 3,
      "name": "Home Page"
    }
  }
}
```

---

## Postman Collection Setup

### Create a Collection
1. Open Postman
2. Click **New** → **Collection**
3. Name it: `MedLab API Tests`

### Add Environment Variables
1. Click **Environments** → **Create Environment**
2. Add variables:
   - `base_url`: `http://localhost:8081`
   - `user_id`: (will be set after registration)
   - `auth_token`: (if you add authentication later)

### Create Test Scripts

For each request, add tests in the **Tests** tab:

**Example for Login:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has user data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('id');
    pm.expect(jsonData.user).to.have.property('name');
    pm.expect(jsonData.user).to.have.property('email');
});

// Save user ID for later use
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("user_id", jsonData.user.id);
}
```

---

## Part 3: Browser-Based State Validation

Since Postman can't test Redux/Context API, use these browser methods:

### Method 1: Browser Console
1. Open your app: `http://localhost:3000`
2. Open DevTools (F12)
3. Go to **Console** tab
4. Type:
   ```javascript
   // Check Context API state
   JSON.parse(localStorage.getItem('currentStage'))
   
   // Check Redux state
   JSON.parse(localStorage.getItem('reduxState'))
   ```

### Method 2: Redux DevTools Extension
1. Install **Redux DevTools** browser extension
2. Open your app
3. Open DevTools → **Redux** tab
4. See state changes in real-time

### Method 3: React DevTools
1. Install **React Developer Tools** browser extension
2. Open your app
3. Open DevTools → **Components** tab
4. Inspect components and their props/state

### Method 4: Visual Validation
- The `StageDisplay` component shows both states on each page
- Navigate between pages and verify:
  - Login Page shows: `ID: 1, Name: Login Page`
  - Register Page shows: `ID: 2, Name: Registration Page`
  - Home Page shows: `ID: 3, Name: Home Page`

---

## Quick Test Checklist

### Backend API Tests (Postman)
- [ ] POST /signup - Create new user
- [ ] POST /login - Login with credentials
- [ ] GET /users - Get all users
- [ ] GET /users/:id - Get single user
- [ ] PUT /users/:id - Update user
- [ ] DELETE /users/:id - Delete user
- [ ] GET /users/validate/all - Validate all users
- [ ] GET /stages - Get stage definitions (new endpoint)

### Frontend State Tests (Browser)
- [ ] Navigate to Login Page → Verify stage ID: 1, Name: "Login Page"
- [ ] Navigate to Register Page → Verify stage ID: 2, Name: "Registration Page"
- [ ] Navigate to Home Page → Verify stage ID: 3, Name: "Home Page"
- [ ] Check localStorage for `currentStage` (Context API)
- [ ] Check localStorage for `reduxState` (Redux)
- [ ] Verify both states update when navigating
- [ ] Refresh page → Verify state persists

---

## Troubleshooting

### Backend not responding
- Check if server is running: `http://localhost:8081`
- Verify MySQL is running
- Check backend console for errors

### CORS errors
- Backend should have CORS enabled (already configured)
- Check `backend/server.js` for `app.use(cors())`

### State not persisting
- Check browser localStorage
- Verify both Context API and Redux are saving state
- Check browser console for errors

