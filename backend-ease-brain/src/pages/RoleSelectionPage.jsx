import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Briefcase, User as UserIcon, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/config/apiConfig";
import RoleSelectionCard from "@/components/auth/RoleSelectionCard";

/**
 * RoleSelectionPage - Post-signup page for users to select their role type
 * Can also be used for role selection/change from settings
 */
export default function RoleSelectionPage({ redirectTo = "/easebrain" }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      type: "user",
      title: "Patient/User",
      description: "Access your personal health journey and get support",
      features: [
        "Personal health notes and reminders",
        "Access to support resources",
        "Community discussions",
        "Message therapists and caregivers",
      ],
      icon: UserIcon,
      accentColor: "green",
    },
    {
      type: "caregiver",
      title: "Caregiver",
      description: "Support and manage care for patients you're helping",
      features: [
        "Write and manage caregiver notes",
        "Track patient progress",
        "Send reminders and updates",
        "Communicate with patients",
        "View shared health information",
      ],
      icon: Briefcase,
      accentColor: "blue",
    },
    {
      type: "admin",
      title: "Administrator",
      description: "Manage users, roles, and system settings",
      features: [
        "User and role management",
        "System configuration",
        "Access to admin dashboard",
        "View system reports",
        "Manage permissions",
      ],
      icon: Shield,
      accentColor: "red",
    },
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }

    setIsLoading(true);

    try {
      // Get the verification token from storage (set during signup)
      const verificationToken = localStorage.getItem("verification_token");

      const requestBody = { role_type: selectedRole };

      // If we have a verification token, use it for unauthenticated role assignment
      if (verificationToken) {
        requestBody.token = verificationToken;
      }

      const response = await fetch(`${BASE_URL}/roles/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to assign role");
      }

      toast.success("Role assigned successfully!");

      // Clear the verification token after successful role assignment
      localStorage.removeItem("verification_token");

      // Redirect to role-specific dashboard
      const roleRoutes = {
        user: "/easebrain/dashboard",
        caregiver: "/caregiver",
        admin: "/admin"
      };

      const dashboardRoute = roleRoutes[selectedRole] || redirectTo;
      navigate(dashboardRoute, { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to assign role");
      console.error("Role assignment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // User can skip and still access the app, but will be prompted later
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-cyan-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select your role to customize your experience. You can change this anytime in your settings.
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Why this matters:</strong> Different roles have different features and permissions.
                Selecting the right role will give you the best experience.
              </p>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {roles.map((role) => (
              <RoleSelectionCard
                key={role.type}
                roleType={role.type}
                title={role.title}
                description={role.description}
                features={role.features}
                icon={role.icon}
                accentColor={role.accentColor}
                isSelected={selectedRole === role.type}
                onSelect={() => setSelectedRole(role.type)}
              />
            ))}
          </div>

          {/* Additional Info */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>📋 Multiple Roles:</strong> You can have multiple roles! For example, you can be both a patient
              and a caregiver. Contact an administrator if you need additional roles assigned.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              onClick={handleRoleSelection}
              disabled={!selectedRole || isLoading}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Assigning..." : "Continue"}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>You can update your role preferences anytime in Settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
