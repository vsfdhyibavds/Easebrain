# 🔧 Failed to Load Roles - Solution Guide

## ✅ Diagnosis Complete

Your database **already has all roles seeded**:

- ✅ Caregiver (ID: 1)
- ✅ Admin (ID: 3)
- ✅ Organization (ID: 4)
- ✅ Patient (ID: 5)

## 🚨 Root Cause

The "Failed to load roles" error occurs when:

1. **Backend not running** - API is not accessible
2. **CORS blocked** - Frontend can't access backend API
3. **API endpoint not configured** - Wrong URL in frontend
4. **Network error** - DNS/connectivity issue

## ✅ Solution - Quick Fix

### Step 1: Verify Backend is Running

```bash
# Terminal 1
cd backend-ease-brain
source venv/bin/activate
python app.py
```

**Expected output:**

```
Running on http://localhost:5500/ (Press CTRL+C to quit)
```

### Step 2: Test API Endpoint

```bash
# In Terminal 2
curl http://localhost:5500/api/roles
```

**Expected response:**

```json
[
  {
    "id": 1,
    "name": "Caregiver",
    "role_type": "caregiver",
    "is_caregiver": true
  },
  { "id": 3, "name": "Admin", "role_type": "admin", "is_caregiver": false },
  {
    "id": 4,
    "name": "Organization",
    "role_type": "organization",
    "is_caregiver": false
  },
  { "id": 5, "name": "Patient", "role_type": "patient", "is_caregiver": false }
]
```

### Step 3: Start Frontend

```bash
# Terminal 3
cd frontend-ease-brain
npm install  # First time only
npm run dev
```

**Expected output:**

```
Local:   http://localhost:5173/
```

### Step 4: Test In Browser

1. Open: http://localhost:5173
2. You should see the **Sign In** page
3. Click the **Role** dropdown - it should show the 4 roles

---

## 🔍 Troubleshooting Checklist

### Issue: Blank role dropdown

**Check 1: Backend running?**

```bash
curl http://localhost:5500/api/health
# Should return: {"status": "healthy"} or similar
```

**Check 2: CORS configured?**

```bash
# Should include localhost:5173
grep -A5 "cors_origins" backend-ease-brain/app.py
```

**Check 3: Browser console errors?**

```
Press F12 → Console → Look for errors
```

### Issue: CORS error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

```python
# backend-ease-brain/app.py - ensure this is there:
cors_origins = [
    "http://localhost:5173",          # Frontend dev
    "http://127.0.0.1:5173",
    "http://www.easebrain.live",      # Production
    "https://www.easebrain.live",
]
```

### Issue: API 404 error

```
GET http://localhost:5500/api/roles 404
```

**Solution:**

```bash
# Check if API is registered
grep -n "add_resource.*Role" backend-ease-brain/app.py

# Should see:
# api.add_resource(RoleResource, "/roles", "/roles/<int:role_id>")
```

### Issue: Network timeout

```
Failed to fetch (timeout)
```

**Solutions:**

1. Make sure backend is running
2. Check firewall isn't blocking port 5500
3. Try: `telnet localhost 5500`

---

## 🔧 Advanced Fixes

### Reset Roles (Delete & Re-seed)

```bash
cd backend-ease-brain
source venv/bin/activate

# Delete database
rm easebrain_dev.db

# Re-seed
python seed_roles.py
```

### Check Database Directly

```bash
cd backend-ease-brain
source venv/bin/activate
python

# In Python shell:
from app import db
from models.role import Role
roles = Role.query.all()
for role in roles:
    print(f"ID: {role.id}, Name: {role.name}")
```

### View API Logs

```bash
# Terminal running backend
# Check output for errors when loading roles
```

### Browser DevTools

```
1. Open: http://localhost:5173
2. Press: F12
3. Go to: Network tab
4. Reload page
5. Look for GET request to "/api/roles"
6. Check:
   - Status: 200 (success)
   - Response: Contains role list
   - Headers: No CORS errors
```

---

## 📝 Common Issues Summary

| Problem        | Cause                       | Fix                    |
| -------------- | --------------------------- | ---------------------- |
| Blank dropdown | Backend not running         | `python app.py`        |
| CORS error     | Frontend not in whitelist   | Add to `cors_origins`  |
| 404 error      | API endpoint not registered | Check `add_resource()` |
| Timeout        | Backend not responding      | Restart server         |
| Empty response | Database has no roles       | Run `seed_roles.py`    |

---

## ✨ After Fix Verification

Once roles load, test full auth flow:

```
1. Sign In page opens ✓
2. Role dropdown shows 4 options ✓
3. Select "Patient" role ✓
4. Enter email & password ✓
5. Click Sign In ✓
6. Should redirect to dashboard ✓
```

---

## 🚀 For Production Deployment

When deploying to production (`www.easebrain.live`):

```bash
# 1. Render automatically seeds database
# 2. Roles will be available at: http://www.easebrain.live/api/roles
# 3. Frontend will access via: http://www.easebrain.live/api/roles
# 4. CORS already configured for www.easebrain.live
```

---

## 📞 Still Having Issues?

1. **Check these files:**
   - `backend-ease-brain/app.py` - Lines 100-107 (CORS)
   - `backend-ease-brain/resources/role_resource.py` - GET method
   - `frontend-ease-brain/src/components/auth/SignIn.tsx` - Lines 88-111 (fetch)

2. **Run diagnostics:**

   ```bash
   bash fix-roles.sh
   ```

3. **Check logs:**
   ```bash
   # Backend console output
   # Browser DevTools (F12)
   # Network tab for API requests
   ```
