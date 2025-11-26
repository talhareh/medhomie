# Postman Validation Testing Guide

Use these test cases in Postman to verify all validation rules are working correctly.

## Base URL
```
http://localhost:8081
```

---

## 1. POST /signup - Test Signup Validation

### ✅ Valid Request (Should Pass - Status 201)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

### ❌ Test Cases for Validation Errors

#### Test 1: Empty Name
**Expected:** Status 400 - "Full name is required"
```json
{
  "name": "",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

#### Test 2: Name with Numbers
**Expected:** Status 400 - "Name can contain letters and spaces only"
```json
{
  "name": "John123",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

#### Test 3: Name with Special Characters
**Expected:** Status 400 - "Name can contain letters and spaces only"
```json
{
  "name": "John@Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

#### Test 4: Empty Email
**Expected:** Status 400 - "Email is required"
```json
{
  "name": "John Doe",
  "email": "",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

#### Test 5: Invalid Email Format (No @)
**Expected:** Status 400 - "Please provide a valid email address"
```json
{
  "name": "John Doe",
  "email": "johnexample.com",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

#### Test 6: Invalid Email Format (No Domain)
**Expected:** Status 400 - "Please provide a valid email address"
```json
{
  "name": "John Doe",
  "email": "john@",
  "number": "1234567890",
  "password": "Test123!@#"
}
```

#### Test 7: Empty Phone Number
**Expected:** Status 400 - "Phone number is required"
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "",
  "password": "Test123!@#"
}
```

#### Test 8: Phone Number with Letters
**Expected:** Status 400 - "Phone number should contain digits only"
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "123abc456",
  "password": "Test123!@#"
}
```

#### Test 9: Phone Number with Special Characters
**Expected:** Status 400 - "Phone number should contain digits only"
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "123-456-7890",
  "password": "Test123!@#"
}
```

#### Test 10: Empty Password
**Expected:** Status 400 - "Password is required"
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": ""
}
```

#### Test 11: Password Too Short
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Test1!"
}
```

#### Test 12: Password Without Uppercase
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "test123!@#"
}
```

#### Test 13: Password Without Lowercase
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "TEST123!@#"
}
```

#### Test 14: Password Without Number
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "TestPass!@#"
}
```

#### Test 15: Password Without Special Character
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "password": "Test12345"
}
```

---

## 2. POST /login - Test Login Validation

### ✅ Valid Request (Should Pass - Status 200)
```json
{
  "email": "john@example.com",
  "password": "Test123!@#"
}
```

### ❌ Test Cases for Validation Errors

#### Test 1: Empty Email
**Expected:** Status 400 - "Email is required"
```json
{
  "email": "",
  "password": "Test123!@#"
}
```

#### Test 2: Invalid Email Format
**Expected:** Status 400 - "Please provide a valid email address"
```json
{
  "email": "invalid-email",
  "password": "Test123!@#"
}
```

#### Test 3: Empty Password
**Expected:** Status 400 - "Password is required"
```json
{
  "email": "john@example.com",
  "password": ""
}
```

#### Test 4: Invalid Password Format
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "email": "john@example.com",
  "password": "weak"
}
```

---

## 3. PUT /users/:id - Test Update Validation

**Note:** First get a valid user ID by calling `GET http://localhost:8081/users`

### ✅ Valid Request (Should Pass - Status 200)
**URL:** `PUT http://localhost:8081/users/1` (replace 1 with actual user ID)
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "number": "9876543210",
  "password": "NewPass123!@#"
}
```

### ✅ Valid Request Without Password (Password Optional)
**URL:** `PUT http://localhost:8081/users/1`
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "number": "9876543210",
  "password": ""
}
```

### ❌ Test Cases for Validation Errors

#### Test 1: Invalid Name
**Expected:** Status 400 - "Name can contain letters and spaces only"
```json
{
  "name": "Jane123",
  "email": "jane@example.com",
  "number": "9876543210",
  "password": ""
}
```

#### Test 2: Invalid Email
**Expected:** Status 400 - "Please provide a valid email address"
```json
{
  "name": "Jane Smith",
  "email": "invalid-email",
  "number": "9876543210",
  "password": ""
}
```

#### Test 3: Invalid Phone Number
**Expected:** Status 400 - "Phone number should contain digits only"
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "number": "987-654-3210",
  "password": ""
}
```

#### Test 4: Invalid Password (If Provided)
**Expected:** Status 400 - "Password must be at least 8 characters long..."
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "number": "9876543210",
  "password": "weak"
}
```

#### Test 5: User Not Found
**URL:** `PUT http://localhost:8081/users/99999` (non-existent ID)
**Expected:** Status 404 - "User not found"

---

## Quick Test Checklist

### Signup Endpoint Tests:
- [ ] Empty name
- [ ] Name with numbers
- [ ] Name with special characters
- [ ] Empty email
- [ ] Invalid email format
- [ ] Empty phone number
- [ ] Phone with letters
- [ ] Phone with special characters
- [ ] Empty password
- [ ] Password too short
- [ ] Password missing uppercase
- [ ] Password missing lowercase
- [ ] Password missing number
- [ ] Password missing special character
- [ ] Valid data (should succeed)

### Login Endpoint Tests:
- [ ] Empty email
- [ ] Invalid email format
- [ ] Empty password
- [ ] Invalid password format
- [ ] Valid credentials (should succeed)

### Update Endpoint Tests:
- [ ] Invalid name
- [ ] Invalid email
- [ ] Invalid phone number
- [ ] Invalid password (if provided)
- [ ] Non-existent user ID
- [ ] Valid data (should succeed)

---

## Expected Response Format

### Success Response (200/201):
```json
{
  "message": "Registration successful",
  "userId": 1
}
```

### Validation Error Response (400):
```json
{
  "message": "Full name is required"
}
```

### Not Found Response (404):
```json
{
  "message": "User not found"
}
```


