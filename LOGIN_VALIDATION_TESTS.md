# Login Page Validation Tests for Postman

Use these test cases to verify login validation is working correctly.

## Base URL
```
http://localhost:8081
```

## Endpoint
```
POST http://localhost:8081/login
```

---

## ✅ Test 1: Valid Login (Should Pass - Status 200)

**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 200
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

**Note:** Use an email and password that exist in your database.

---

## ❌ Validation Error Tests

### Test 2: Empty Email
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Email is required"
}
```

---

### Test 3: Missing Email Field
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "password": "Test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Email is required"
}
```

---

### Test 4: Invalid Email Format (No @)
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "johnexample.com",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Please provide a valid email address"
}
```

---

### Test 5: Invalid Email Format (No Domain)
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Please provide a valid email address"
}
```

---

### Test 6: Invalid Email Format (No TLD)
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Please provide a valid email address"
}
```

---

### Test 7: Invalid Email Format (Spaces)
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john @example.com",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Please provide a valid email address"
}
```

---

### Test 8: Empty Password
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": ""
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password is required"
}
```

---

### Test 9: Missing Password Field
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password is required"
}
```

---

### Test 10: Password Too Short
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "Test1!"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
}
```

---

### Test 11: Password Without Uppercase
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "test123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
}
```

---

### Test 12: Password Without Lowercase
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "TEST123!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
}
```

---

### Test 13: Password Without Number
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "TestPass!@#"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
}
```

---

### Test 14: Password Without Special Character
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "Test12345"
}
```

**Expected Response:** Status 400
```json
{
  "message": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
}
```

---

### Test 15: Valid Format But Wrong Credentials
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "nonexistent@example.com",
  "password": "Test123!@#"
}
```

**Expected Response:** Status 401
```json
{
  "message": "Invalid email or password"
}
```

**Note:** This tests that validation passes, but credentials don't match.

---

### Test 16: Valid Email But Wrong Password
**Method:** `POST`  
**URL:** `http://localhost:8081/login`  
**Body (raw, JSON):**
```json
{
  "email": "john@example.com",
  "password": "WrongPass123!@#"
}
```

**Expected Response:** Status 401
```json
{
  "message": "Invalid email or password"
}
```

**Note:** Use an email that exists in your database but with wrong password.

---

## Quick Test Checklist

### Email Validation:
- [ ] Empty email → Should get 400 "Email is required"
- [ ] Missing email field → Should get 400 "Email is required"
- [ ] Invalid email (no @) → Should get 400 "Please provide a valid email address"
- [ ] Invalid email (no domain) → Should get 400 "Please provide a valid email address"
- [ ] Invalid email (no TLD) → Should get 400 "Please provide a valid email address"
- [ ] Invalid email (spaces) → Should get 400 "Please provide a valid email address"

### Password Validation:
- [ ] Empty password → Should get 400 "Password is required"
- [ ] Missing password field → Should get 400 "Password is required"
- [ ] Password too short → Should get 400 "Password must be at least 8 characters..."
- [ ] Password no uppercase → Should get 400 "Password must be at least 8 characters..."
- [ ] Password no lowercase → Should get 400 "Password must be at least 8 characters..."
- [ ] Password no number → Should get 400 "Password must be at least 8 characters..."
- [ ] Password no special char → Should get 400 "Password must be at least 8 characters..."

### Authentication Tests:
- [ ] Valid credentials → Should get 200 "Login successful"
- [ ] Wrong email → Should get 401 "Invalid email or password"
- [ ] Wrong password → Should get 401 "Invalid email or password"

---

## How to Test in Postman

1. **Create a Collection:** Name it "Login Validation Tests"

2. **Add Requests:** Create one request for each test case above

3. **Configure Each Request:**
   - Method: `POST`
   - URL: `http://localhost:8081/login`
   - Headers: `Content-Type: application/json` (usually auto-set)
   - Body: Select "raw" → "JSON" → Paste the JSON body

4. **Run Tests:**
   - Send each request individually
   - Check the status code and response message
   - Verify it matches the expected response

---

## Expected Response Codes

- **200** = Login successful (valid credentials)
- **400** = Validation error (invalid format)
- **401** = Authentication failed (wrong credentials)
- **500** = Server error (database issue)

---

## Summary

The login endpoint validates:
1. **Email:** Must be a valid email format
2. **Password:** Must be 8+ characters with uppercase, lowercase, number, and special character

If validation passes but credentials don't match, you'll get a 401 error instead of 400.


