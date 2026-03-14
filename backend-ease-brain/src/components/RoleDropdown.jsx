import { useState, useRef, useEffect } from "react";
import { ChevronDown, Shield, User, Briefcase } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

/**
 * RoleDropdown Component
 * Displays user's current roles and role types
 * Shows role information and permissions
 */
export default function RoleDropdown() {
  const { userRoles, userRoleTypes, isAdmin, isCaregiver } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get role badge color
  const getRoleColor = (roleType) => {
    switch (roleType) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "caregiver":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user":
      case "patient":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Get role icon
  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "caregiver":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
        title="View your roles and permissions"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">
          {userRoles.length > 0 ? `${userRoles.length} Role${userRoles.length !== 1 ? 's' : ''}` : 'No Roles'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Your Roles & Permissions
              </h3>
            </div>

            {/* Role Types Section */}
            {userRoleTypes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Role Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {userRoleTypes.map((roleType) => (
                    <div
                      key={roleType}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(roleType)}`}
                    >
                      {getRoleIcon(roleType)}
                      <span className="capitalize">{roleType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Roles Section */}
            {userRoles.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Specific Roles
                </p>
                <div className="space-y-1">
                  {userRoles.map((role) => (
                    <div
                      key={role}
                      className="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 dark:bg-slate-700"
                    >
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                Permissions
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    disabled
                    className="mt-0.5"
                    readOnly
                  />
                  <label className="text-gray-700 dark:text-gray-300">
                    Administrator Access
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={isCaregiver}
                    disabled
                    className="mt-0.5"
                    readOnly
                  />
                  <label className="text-gray-700 dark:text-gray-300">
                    Caregiver Permissions
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={!isAdmin && !isCaregiver}
                    disabled
                    className="mt-0.5"
                    readOnly
                  />
                  <label className="text-gray-700 dark:text-gray-300">
                    Standard User Access
                  </label>
                </div>
              </div>
            </div>

            {/* Info Message */}
            {userRoles.length === 0 && userRoleTypes.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No roles assigned yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
