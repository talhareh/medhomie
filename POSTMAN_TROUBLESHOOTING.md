# Postman Troubleshooting: DELETE and PUT 404 Errors

## Problem
Getting `404 Not Found` with message `"User not found"` when trying to:
- `DELETE /users/1`
- `PUT /users/1`

## Solution

The error means **user with ID 1 doesn't exist** in your database. You need to:

### Step 1: Create a User First

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
    "name": "Test User",
    "email": "test@example.com",
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

**Note the `userId` from the response!** This is the ID you'll use for PUT/DELETE.

---

### Step 2: Check Existing Users

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8081/users`

**Expected Response (200):**
```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "number": "1234567890",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Use the `id` from this response for PUT/DELETE operations.**

---

### Step 3: Now Test PUT with Valid ID

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:8081/users/1` (use the actual user ID from Step 2)
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
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

### Step 4: Test DELETE with Valid ID

**Request:**
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/users/1` (use the actual user ID)

**Expected Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Quick Test Sequence

1. ✅ **POST /signup** - Create a user
2. ✅ **GET /users** - Get all users (note the IDs)
3. ✅ **GET /users/:id** - Get specific user (verify it exists)
4. ✅ **PUT /users/:id** - Update user (use valid ID)
5. ✅ **DELETE /users/:id** - Delete user (use valid ID)

---

## Common Issues

### Issue: "User not found" even after creating
- **Solution:** Check the actual user ID from `GET /users` response
- User IDs are auto-incremented, so first user might not be ID 1 if you've deleted users before

### Issue: Can't create user (duplicate error)
- **Solution:** Use a different email and phone number
- Or delete existing user first

### Issue: Database empty
- **Solution:** Make sure MySQL is running
- Check database connection in backend console

---

## Pro Tip: Use Postman Variables

1. Create a **Postman Environment**
2. Add variable: `user_id`
3. In **POST /signup** test script, save the ID:
   ```javascript
   if (pm.response.code === 201) {
       var jsonData = pm.response.json();
       pm.environment.set("user_id", jsonData.userId);
   }
   ```
4. Use `{{user_id}}` in your PUT/DELETE URLs:
   - `http://localhost:8081/users/{{user_id}}`

This way, you always use the correct user ID automatically!

