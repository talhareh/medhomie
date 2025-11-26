# Postman API Testing Guide

## 🔑 Getting Your JWT Token

### 1. Login to Get Token
- **Method:** `POST`
- **URL:** `http://localhost:8081/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "k@gmail.com",
    "password": "qwertY12,"
  }
  ```
- **Response:** Copy the `token` from the response

---

## ✅ Public Endpoints (No Token Required)

### Get All Users
- **Method:** `GET`
- **URL:** `http://localhost:8081/users`
- **Headers:** None required

### Get User by ID
- **Method:** `GET`
- **URL:** `http://localhost:8081/users/14`
- **Headers:** None required

### Get All Users for Validation
- **Method:** `GET`
- **URL:** `http://localhost:8081/users/validate/all`
- **Headers:** None required

---

## 🔒 Protected Endpoints (Token Required)

### Verify Token
- **Method:** `POST` or `GET`
- **URL:** `http://localhost:8081/login/verify`
- **Headers:**
  - `Authorization: Bearer <your-token-here>`
- **OR Body (raw JSON):**
  ```json
  {
    "token": "your-token-here"
  }
  ```

### Update User
- **Method:** `PUT`
- **URL:** `http://localhost:8081/users/14`
- **Headers:**
  - `Authorization: Bearer <your-token-here>`
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Updated Name",
    "email": "k@gmail.com",
    "number": "1234567890",
    "password": "newPassword123!"  // Optional - omit if not changing
  }
  ```

### Delete User
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/users/14`
- **Headers:**
  - `Authorization: Bearer <your-token-here>`

---

## 📝 How to Add Authorization Header in Postman

1. Click on the **"Headers"** tab
2. Click **"Add Header"** or use the empty row
3. **KEY:** `Authorization`
4. **VALUE:** `Bearer <paste-your-token-here>`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Make sure the checkbox next to the header is **checked** (enabled)

---

## 🎯 Quick Test Checklist

- [ ] Login and get token
- [ ] Verify token works
- [ ] Get all users (no token needed)
- [ ] Update user (with token)
- [ ] Try update without token (should fail with 401)
- [ ] Delete user (with token)

---

## ⚠️ Common Issues

1. **401 Unauthorized:** Token missing or invalid
   - Check token is in Authorization header
   - Make sure format is: `Bearer <token>` (with space)
   - Token might be expired (tokens expire after 7 days)

2. **403 Forbidden:** Token is invalid or expired
   - Get a new token by logging in again

3. **400 Bad Request:** Missing or invalid request body
   - Check JSON format is correct
   - Verify all required fields are present



