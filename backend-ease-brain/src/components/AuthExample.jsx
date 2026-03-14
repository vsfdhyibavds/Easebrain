import React from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useAuthz, CanAccess, CanAccessByType } from "@/hooks/useAuthz";

/**
 * Example component showing various ways to use the auth system.
 * This demonstrates both the hook and component-based approaches.
 */
export default function AuthExample() {
  const auth = useAuth();
  const authz = useAuthz();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication & Authorization Examples</h1>

      {/* === BASIC AUTH STATUS === */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">User Info</h2>
        <div className="space-y-2">
          <p><strong>Username:</strong> {auth.user?.username || "Not logged in"}</p>
          <p><strong>Email:</strong> {auth.user?.email || "—"}</p>
          <p><strong>Roles:</strong> {authz.userRoles.join(", ") || "None"}</p>
          <p><strong>Role Types:</strong> {authz.userRoleTypes.join(", ") || "None"}</p>
          <p><strong>Is Admin:</strong> {authz.isAdmin() ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Is Caregiver:</strong> {authz.isCaregiver() ? "✅ Yes" : "❌ No"}</p>
        </div>
      </section>

      {/* === HOOK-BASED CONDITIONAL RENDERING === */}
      <section className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Hook-Based Authorization</h2>

        {/* Show if user has admin role */}
        {authz.can("admin") && (
          <div className="mb-4 p-4 bg-blue-100 rounded border border-blue-300">
            <h3 className="font-bold mb-2">👨‍💼 Admin Access</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Admin Dashboard
            </button>
          </div>
        )}

        {/* Show if user has therapist role */}
        {authz.can("therapist") && (
          <div className="mb-4 p-4 bg-green-100 rounded border border-green-300">
            <h3 className="font-bold mb-2">👨‍⚕️ Therapist Access</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Patient Management
            </button>
          </div>
        )}

        {/* Show if user has ANY of these roles */}
        {authz.can(["edit", "moderate"]) && (
          <div className="mb-4 p-4 bg-purple-100 rounded border border-purple-300">
            <h3 className="font-bold mb-2">✏️ Moderation Access</h3>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Moderate Content
            </button>
          </div>
        )}

        {/* Show if user cannot do something */}
        {authz.cannot("delete") && (
          <div className="mb-4 p-4 bg-yellow-100 rounded border border-yellow-300">
            <p className="text-sm">You don't have delete permissions</p>
          </div>
        )}
      </section>

      {/* === COMPONENT-BASED CONDITIONAL RENDERING === */}
      <section className="mb-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Component-Based Authorization</h2>

        {/* CanAccess - Show only to admins */}
        <CanAccess
          role="admin"
          fallback={<p className="text-gray-500">Not available to your role</p>}
        >
          <div className="mb-4 p-4 bg-green-100 rounded border border-green-300">
            <h3 className="font-bold mb-2">🔧 System Settings</h3>
            <p className="mb-3">You have admin access to system settings</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Access Settings
            </button>
          </div>
        </CanAccess>

        {/* CanAccessByType - Show only to caregivers */}
        <CanAccessByType
          roleType="caregiver"
          fallback={
            <p className="text-gray-500 my-4">Caregiver features not available</p>
          }
        >
          <div className="mb-4 p-4 bg-teal-100 rounded border border-teal-300">
            <h3 className="font-bold mb-2">🏥 Patient Care Tools</h3>
            <p className="mb-3">You have access to patient care tools</p>
            <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
              Patient List
            </button>
          </div>
        </CanAccessByType>
      </section>

      {/* === MULTIPLE ROLE CHECKS === */}
      <section className="mb-8 p-6 bg-purple-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Advanced Role Checks</h2>

        {/* Check if user has admin AND therapist */}
        {authz.canAll(["admin", "therapist"]) && (
          <div className="mb-4 p-4 bg-purple-100 rounded border border-purple-300">
            <h3 className="font-bold">👑 Senior Therapist</h3>
            <p>You have both admin and therapist roles</p>
          </div>
        )}

        {/* Show based on role type */}
        {authz.canType("admin") && (
          <div className="mb-4 p-4 bg-red-100 rounded border border-red-300">
            <h3 className="font-bold">🚨 Administrative Access</h3>
            <p>You have system-level administrative access</p>
          </div>
        )}

        {/* Show list of user's roles */}
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Your Roles:</h3>
          {authz.userRoles.length > 0 ? (
            <ul className="list-disc list-inside">
              {authz.userRoles.map((role) => (
                <li key={role} className="text-sm">
                  {role}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No roles assigned</p>
          )}
        </div>
      </section>

      {/* === TOKEN INFO === */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Token Information</h2>
        <div className="bg-gray-100 p-4 rounded text-sm font-mono">
          <p><strong>Token Valid:</strong> {auth.isAuthenticated ? "✅" : "❌"}</p>
          <p>
            <strong>Claims:</strong>
            <pre className="mt-2 p-2 bg-white rounded border">
              {JSON.stringify(auth.tokenClaims, null, 2)}
            </pre>
          </p>
        </div>
      </section>

      {/* === LOGOUT BUTTON === */}
      <div className="flex gap-4">
        <button
          onClick={() => auth.logout()}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
        <button
          onClick={() => {
            // Show token claims
            console.log("Token Claims:", auth.tokenClaims);
            console.log("User:", auth.user);
            alert("Check console for auth details");
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Auth Details
        </button>
      </div>
    </div>
  );
}
