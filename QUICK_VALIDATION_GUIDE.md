# Quick Validation Guide

## 🚀 Quick Start

### Step 1: Test Backend API in Postman

1. **Import Postman Collection:**
   - Open Postman
   - Click **Import** → Select `POSTMAN_COLLECTION.json`
   - Collection will be imported with all endpoints

2. **Test Stage Endpoint:**
   - Select **"Get Stage Definitions"** request
   - Click **Send**
   - Expected: Status 200 with stages object containing id and name

3. **Test Other Endpoints:**
   - Run requests in order: Signup → Login → Get Users → etc.
   - Check **Tests** tab for automatic validation

### Step 2: Test Frontend State in Browser

1. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

2. **Open Test Page:**
   - Navigate to: `http://localhost:3000/test-state`
   - See live state from both Redux and Context API
   - Test stage updates with buttons

3. **Check Browser Console:**
   ```javascript
   // In browser console (F12)
   JSON.parse(localStorage.getItem('currentStage'))  // Context API
   JSON.parse(localStorage.getItem('reduxState'))    // Redux
   ```

### Step 3: Visual Validation

1. Navigate between pages:
   - `/login` → Should show: ID: 1, Name: "Login Page"
   - `/register` → Should show: ID: 2, Name: "Registration Page"
   - `/home` → Should show: ID: 3, Name: "Home Page"

2. Verify both implementations show the same values

---

## 📋 Validation Checklist

### Postman Tests
- [ ] GET /stages returns stage definitions with id and name
- [ ] All API endpoints return expected responses
- [ ] Test scripts pass automatically

### Browser Tests
- [ ] `/test-state` page shows both states
- [ ] Stage updates when navigating
- [ ] localStorage persists state
- [ ] Both Redux and Context API show same values

---

## 🔍 Troubleshooting

**Postman:**
- Ensure backend is running: `cd backend && npm start`
- Check URL: `http://localhost:8081`

**Browser:**
- Clear localStorage if state seems stuck
- Check browser console for errors
- Verify Redux DevTools extension is installed (optional)

---

## 📚 Full Documentation

- **Postman Guide:** See `POSTMAN_TESTING_GUIDE.md`
- **State Management:** See `frontend/STATE_MANAGEMENT.md`

