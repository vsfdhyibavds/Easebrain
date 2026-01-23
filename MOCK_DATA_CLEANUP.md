# Mock Data Cleanup Report

## Overview

This document identifies all areas of the EaseBrain application that still use mock/placeholder data and need to be updated to use real API endpoints or database queries.

---

## 🔴 HIGH PRIORITY - Blocking Features

### 1. **Backend Settings API**

**File**: [backend-ease-brain/app.py](backend-ease-brain/app.py#L316-L329)
**Status**: ❌ Mock Data (Lines 316-329)

```python
@app.route("/api/settings", methods=["GET"])
def get_settings():
    # TODO: Replace with real user lookup and settings from DB
    # For now, return mock data for frontend integration
    return jsonify({
        "name": "Eugene Wekesa",
        "email": "eugenco578@gmail.com",
        "phone": "0797824442",
        "timezone": "UTC",
        "notifications": {"email": True, "sms": False, "push": True},
        "theme": "light",
    })
```

**What needs to happen**:

- [ ] Fetch actual user settings from database
- [ ] Join with user table to get real name, email, phone
- [ ] Fetch user_settings table for timezone, notifications, theme preferences
- [ ] Add authentication check to return only current user's settings

**Impact**: User profile settings page shows hardcoded data instead of personal settings

---

## 🟡 HIGH PRIORITY - Frontend Test Data

### 2. **Mock Caregiver Data File**

**File**: [frontend-ease-brain/src/utils/mockCaregiverData.js](frontend-ease-brain/src/utils/mockCaregiverData.js) (492 lines)
**Status**: ❌ Unused Placeholder Data

**Contains**:

- `mockDependents` (3 example dependents: Sarah Johnson, Michael Chen, Emma Williams)
- `mockConversations` (3 example conversations)
- `mockMessages` (21 sample messages across conversations)
- `mockCurrentUser` (Caregiver Mom user)
- Helper functions for simulating message send/receive

**Where it's used**:

- [MockChatTest.jsx](frontend-ease-brain/src/pages/MockChatTest.jsx) - Demo page only (not critical)
- Imported but may not be actively used in production components

**What needs to happen**:

- [ ] Verify CaregiverDashboard.jsx uses real API calls (not this mock data)
- [ ] Verify all caregiver modals use real API endpoints
- [ ] Remove mockCaregiverData.js if no longer needed in components
- [ ] Keep MockChatTest.jsx for development/demo purposes (marked as demo)

**Impact**: If CaregiverDashboard or chat features are still using this, they show fake dependents instead of real ones

---

### 3. **Mock Chat Test Page**

**File**: [frontend-ease-brain/src/pages/MockChatTest.jsx](frontend-ease-brain/src/pages/MockChatTest.jsx) (335 lines)
**Status**: ⚠️ Development Demo (intentional)

**Purpose**: Standalone demo page for testing chat UI with mock data
**Is it used in production?**: No - This is a development test page
**Should be kept?**: Yes - Useful for UI testing without backend

---

### 4. **Crisis Hotline Victory Stories**

**File**: [frontend-ease-brain/src/pages/CrisisHotline.jsx](frontend-ease-brain/src/pages/CrisisHotline.jsx#L100-L125)
**Status**: ⚠️ Fallback Mock Data (Lines 100-125)

```javascript
// Fallback: sensible defaults to show on first load
return [
  {
    id: 1,
    title: "Finding Strength in Small Steps",
    author: "Sam",
    anonymous: false,
    content: "I started with a single walk each day...",
    date: new Date().toISOString(),
  },
  {
    id: 2,
    title: "A New Day",
    author: "",
    anonymous: true,
    content: "Sharing my story helped me feel less alone...",
  },
];
```

**What needs to happen**:

- [ ] Verify API call to fetch real victory stories is working
- [ ] This is a fallback - OK to keep for UX if API fails
- [ ] Consider loading state while fetching from API

**Impact**: Users see example stories on first load if API is slow/unavailable

---

## 🟢 MEDIUM PRIORITY - Testing Code

### 5. **Backend Moderation Test Files**

**Files**:

- [backend-ease-brain/test_moderation_endpoints.py](backend-ease-brain/test_moderation_endpoints.py)
- [backend-ease-brain/test_moderation_integration.py](backend-ease-brain/test_moderation_integration.py)
- [backend-ease-brain/test_llm_integration.py](backend-ease-brain/test_llm_integration.py)

**Status**: ✅ Intentional Test Data (Used for API testing)

**Example** (test_moderation_endpoints.py):

```python
signup_data = {
    "username": "testmoderator",
    "email": "moderator@test.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "Moderator",
}
```

**Purpose**: Integration testing with local test server
**Should be kept?**: Yes - Essential for testing
**Note**: These use temp test data that gets created and destroyed

---

## 📋 Data Fields Still Using Hardcoded Values

### 6. **Email Mode Configuration**

**File**: [backend-ease-brain/utils/send_email.py](backend-ease-brain/utils/send_email.py)
**Status**: ⚠️ Development Feature (intentional)

```python
if os.getenv("MOCK_EMAIL_MODE", "").lower() == "true":
    # Returns early without sending real emails
```

**Purpose**: Development flag to avoid sending real emails during testing
**Should be kept?**: Yes - Useful for dev/testing
**Note**: Set via environment variable, not hardcoded

---

## ✅ Verified - Already Using Real Data

### 7. **Caregiver Dashboard Components** ✓

**File**: [frontend-ease-brain/src/components/CaregiverDashboard.jsx](frontend-ease-brain/src/components/CaregiverDashboard.jsx)

**Status**: ✅ Uses Real API Calls

- Fetches dependents from `/api/caregiver/dependents`
- Fetches moods from `/api/caregiver/moods/chart`
- Fetches medications from `/api/caregiver/medications/adherence`
- Fetches activities from `/api/caregiver/activities/recent`
- Fetches notes from `/api/caregiver/notes`
- Fixed token auth (using `user?.accessToken` from auth context)

---

### 8. **Caregiver Notes Component** ✓

**File**: [frontend-ease-brain/src/components/CaregiverNotes.jsx](frontend-ease-brain/src/components/CaregiverNotes.jsx)

**Status**: ✅ Uses Real API

```javascript
const data = await response.json();
// Fetches from real API endpoint
```

---

### 9. **Caregiver Modals** ✓

**File**: [frontend-ease-brain/src/components/CaregiverModals.jsx](frontend-ease-brain/src/components/CaregiverModals.jsx)

**Status**: ✅ Uses Real API for:

- Add Dependent modal
- Create Task modal
- Send Alert modal
- Schedule Appointment modal

---

### 10. **Community Components** ✓

**File**: [frontend-ease-brain/src/components/Community/](frontend-ease-brain/src/components/Community/)

**Status**: ✅ Uses Real API Calls via RTK Query:

- `useGetCommunityQuery()` - Real community data
- `useGetCommunityPostsQuery()` - Real posts
- `useGetFlaggedPostsQuery()` - Real flagged content
- `useGetModerationLogsQuery()` - Real logs

---

## 📝 Summary & Action Items

| Area            | File                     | Status        | Action                                          |
| --------------- | ------------------------ | ------------- | ----------------------------------------------- |
| Settings API    | `app.py` line 316        | 🔴 **URGENT** | Implement real user settings lookup from DB     |
| Mock Data Utils | `mockCaregiverData.js`   | 🟡 **REVIEW** | Verify not used in production, remove if unused |
| Chat Test Page  | `MockChatTest.jsx`       | ✅ OK         | Keep as development demo                        |
| Victory Stories | `CrisisHotline.jsx`      | ✅ OK         | Fallback is acceptable                          |
| Dashboard       | `CaregiverDashboard.jsx` | ✅ DONE       | Already using real APIs                         |
| Caregiver Notes | `CaregiverNotes.jsx`     | ✅ DONE       | Already using real APIs                         |
| Modals          | `CaregiverModals.jsx`    | ✅ DONE       | Already using real APIs                         |
| Community       | `Community/`             | ✅ DONE       | Already using real APIs                         |

---

## 🚀 Immediate Tasks

### **Task 1: Fix Settings API** (CRITICAL)

1. Create database schema for `user_settings` table if not exists
2. Update `/api/settings` GET endpoint to:
   ```python
   - Get current user from JWT token
   - Query user table for name, email, phone
   - Query user_settings table for timezone, notifications, theme
   - Return merged user + settings data
   ```
3. Add PUT/PATCH endpoint to update settings
4. Test with frontend Profile component

### **Task 2: Audit mockCaregiverData.js** (MEDIUM)

1. Search codebase for imports of `mockCaregiverData`
2. For each import:
   - If in production component: Replace with real API calls
   - If in test/demo page: Keep it
3. Remove file if unused
4. Update imports if file is moved/deleted

### **Task 3: Email Testing Mode** (LOW)

1. Decide if `MOCK_EMAIL_MODE` should stay
2. Document when/how to use it
3. Ensure it's disabled in production

---

## 📊 Statistics

- **Total Mock Data Areas Found**: 4 (1 critical, 2 medium, 1 low)
- **Already Using Real APIs**: 7 components ✅
- **Test Files (Intentional)**: 3 ✅
- **Files to Fix**: 1 urgent
- **Files to Review**: 1 medium

---

**Last Updated**: January 17, 2026
**Next Review**: After settings API is implemented
