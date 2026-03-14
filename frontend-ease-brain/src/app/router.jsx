import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import UsersList from "../components/users/UsersList";
import Profile from "../components/Profile";
import Roles from "../components/Roles";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  AdminProtectedRoute,
  CaregiverProtectedRoute,
  RoleProtectedRoute,
  RoleTypeProtectedRoute,
  AnyRoleProtectedRoute,
  AllRolesProtectedRoute
} from "../components/RoleProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";
import HomePage from "../pages/HomePage";
import Messages from "../pages/Messages";
import CaregiverNotes from "../components/CaregiverNotes";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import Notes from "../pages/Notes";
import Reminders from "../pages/Reminders";
import Community from "../pages/Community";
import CommunityGroupDetail from "../pages/CommunityGroupDetail";
import Settings from "../pages/Settings";
import EmailVerificationPending from "../pages/EmailVerificationPending";
import MainLayout from "../Layout/MainLayout";
import AppLayout from "../Layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import UpdateEmail from "../pages/UpdateEmail";
import Features from "../pages/Features";
import Pricing from "../pages/Pricing";
import App from "../App";

import FindTherapist from "../pages/FindTherapist";
import AiSupport from "../pages/AiSupport";
import CrisisHotline from "../pages/CrisisHotline";
import Contacts from "../pages/Contacts";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import Emergency from "../pages/Emergency";
import CrisisSupport from "../pages/CrisisSupport";
import CareGiver from "../Layout/CareGiver";
import AdminLayout from "../Layout/AdminLayout";
import DependentProfile from "../pages/DependentProfile";

// Lazy load heavy components
const CaregiverDashboard = lazy(() => import("../pages/CaregiverDashboard"));
const StoriesOfHope = lazy(() => import("../pages/StoriesOfHope"));
const CaregiverConnections = lazy(() => import("../pages/CaregiverConnections"));

// Regular imports
import Unauthorized from "../pages/Unauthorized";
import RoleSelectionPage from "../pages/RoleSelectionPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SafetyPlans from "../pages/SafetyPlans";
import ChatSpace from "../pages/ChatSpace";
import MockChatTest from "../pages/MockChatTest";
import AdminSettings from "../pages/AdminSettings";
import AdminTimeline from "../pages/AdminTimeline";
import AdminDependents from "../pages/AdminDependents";
import AdminTasks from "../pages/AdminTasks";
import AdminAuditLog from "../pages/AdminAuditLog";
import AdminDashboardEnhanced from "../pages/AdminDashboardEnhanced";
import LoadingSpinner from "../components/LoadingSpinner";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "home", element: <HomePage /> },
      { path: "email-verification-pending", element: <EmailVerificationPending /> },
      { path: "update-email", element: <UpdateEmail /> },
      { path: "features", element: <Features /> },
      { path: "pricing", element: <Pricing /> },

      { path: "community", element: <Community /> },
      { path: "community/:communityId", element: <CommunityGroupDetail /> },
      { path: "stories", element: <Suspense fallback={<LoadingSpinner />}><StoriesOfHope /></Suspense> },
      { path: "find-therapist", element: <FindTherapist /> },
      { path: "ai-support", element: <AiSupport /> },
      { path: "crisis-hotlines", element: <CrisisHotline /> },
      { path: "support", element: <CrisisSupport /> },
      { path: "contact", element: <Contacts /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "emergency", element: <Emergency /> },
      { path: "mock-chat-test", element: <MockChatTest /> },
    ],
  },
  {
    path: "/easebrain",
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard />},
      {
        path: "notes",
        element: <RoleTypeProtectedRoute requiredRoleType="caregiver" />,
        children: [
          { index: true, element: <Notes /> },
        ],
      },
      { path: "reminders", element: <Reminders />},
      { path: "messages", element: <Messages />},
      { path: "chat/:conversationId", element: <ChatSpace /> },
      { path: "community", element: <Community />},
      { path: "community/:communityId", element: <CommunityGroupDetail />},

      { path: "stories", element: <Suspense fallback={<LoadingSpinner />}><StoriesOfHope /></Suspense> },
      { path: "caregivers", element: <Suspense fallback={<LoadingSpinner />}><CaregiverConnections /></Suspense> },
      { path: "safety-plans", element: <SafetyPlans /> },
      { path: "settings", element: <Settings />},
    ]
  },
  {
    path: "/app",
    element: <ProtectedRoute><App /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Profile /> },
      { path: "profile", element: <Profile /> },
      {
        path: "roles",
        element: <AdminProtectedRoute />,
        children: [
          { index: true, element: <Roles /> },
        ],
      },
      { path: "messages", element: <Messages /> },
      {
        path: "caregiver-notes",
        // element: <CaregiverProtectedRoute />,
        children: [
          { index: true, element: <CaregiverNotes /> },
        ],
      },
      {
        path: "users",
        element: <AdminProtectedRoute />,
        children: [
          { index: true, element: <UsersList /> },
        ],
      },
    ],
  },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/signin", element: <SignInPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/role-selection", element: <ProtectedRoute><RoleSelectionPage /></ProtectedRoute> },
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    path: "/caregiver",
    // element: <CaregiverProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingSpinner />}><CaregiverDashboard /></Suspense> },
      { path: "dependents/:id", element: <DependentProfile /> },
    ],
  },
  {
    path: "/caregiver-details",
    element: <ProtectedRoute><CareGiver /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute />,  // TODO: Uncomment protection checks if needed
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <AdminDashboardEnhanced /> },
      { path: "dependents", element: <AdminDependents /> },
      { path: "tasks", element: <AdminTasks /> },
      { path: "settings", element: <AdminSettings /> },
      { path: "timeline", element: <AdminTimeline /> },
      { path: "audit-log", element: <AdminAuditLog /> },
    ],
  },
  // Public routes are now nested under the AppLayout above.
]);

export default routes;
