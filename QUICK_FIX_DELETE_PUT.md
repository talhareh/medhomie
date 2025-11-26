# Quick Fix: DELETE and PUT 404 Errors

## The Problem
You're getting `404 Not Found` because **user ID 1 doesn't exist** in your database.

## Quick Solution

### Step 1: Check What Users Exist

**In Postman:**
1. Create a **GET** request
2. URL: `http://localhost:8081/users`
3. Click **Send**

This will show you all users and their IDs.

---

### Step 2: Create a User (if database is empty)

**In Postman:**
1. Create a **POST** request
2. URL: `http://localhost:8081/signup`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "number": "1234567890",
     "password": "Test@1234"
   }
   ```
5. Click **Send**

**Save the `userId` from the response!**

---

### Step 3: Use the Correct User ID

After Step 1 or 2, you'll have a user ID. Use that ID in your requests:

- **PUT:** `http://localhost:8081/users/1` (replace 1 with actual ID)
- **DELETE:** `http://localhost:8081/users/1` (replace 1 with actual ID)

---

## Example Workflow

1. **GET /users** → See user with ID: 5
2. **PUT /users/5** → Update user 5 ✅
3. **DELETE /users/5** → Delete user 5 ✅

**Don't assume ID is 1!** Always check with GET /users first.

