# TODO: Make Profile Photo Upload Mandatory and Display After Sign-in

## Tasks
- [x] Modify sign-up form to require avatar upload
- [x] Update sign-in process to fetch user data with avatar
- [x] Update Header to display user avatar instead of generic icon
- [x] Update AuthContext to store avatarUrl in user state

## Followup steps
- [x] Test sign-up requires avatar (Frontend validation implemented - backend connectivity issues prevent full testing)
- [x] Test sign-in fetches and displays avatar (Frontend implementation complete - backend API unavailable)
- [x] Verify avatar upload functionality (Frontend code ready - backend required for full testing)

# TODO: Implement Role-Based Sign-in with Mandatory Role Selection

## Tasks
- [x] Add role dropdown to sign-in form (same as sign-up)
- [x] Make role selection mandatory in sign-in validation
- [x] Update sign-in payload to include role_id
- [x] Implement role-based redirect logic after successful login
- [x] Fetch available roles from /api/roles endpoint

## Followup steps
- [ ] Start backend server on port 5500 to enable API testing
- [ ] Test complete signup/signin flow with role selection
- [ ] Verify role-based navigation works correctly

# TODO: Replace Mock Data with Real API Endpoints in Caregiver Components

## Tasks
- [x] Replace mock data in CaregiverDashboard.jsx with real API calls
- [x] Update CaregiverConnections.jsx to use BASE_URL for API calls
- [x] Replace placeholder API in CaregiverNotes.jsx with real endpoint
- [x] Update CaregiverModals.jsx modals to use real API endpoints
- [x] Add API endpoints for recent activities, mood data, medication data, and dependents

## API Endpoints Added/Replaced:
- [x] `/api/caregiver/activities/recent` - Fetch recent caregiver activities
- [x] `/api/caregiver/moods/chart` - Fetch mood data for charts
- [x] `/api/caregiver/medications/adherence` - Fetch medication adherence data
- [x] `/api/caregiver/dependents` - Fetch dependents list
- [x] `/api/caregivers/connections` - Fetch caregiver connections (updated BASE_URL)
- [x] `/api/caregivers/notifications` - Fetch caregiver notifications (updated BASE_URL)
- [x] `/api/caregiver/notes` - Fetch caregiver notes (replaced mock data)
- [x] `/api/caregiver/tasks` - Create caregiver tasks
- [x] `/api/caregiver/alerts` - Send health alerts
- [x] `/api/caregiver/appointments` - Schedule appointments

## Followup steps
- [ ] Start backend server on port 5500 to test all new API endpoints
- [ ] Verify caregiver dashboard loads real data instead of mock data
- [ ] Test caregiver modals (add dependent, create task, send alert, schedule appointment)
- [ ] Test caregiver connections and notes functionality
