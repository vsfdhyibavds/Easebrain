import { useState, useRef, useEffect } from "react";
import { ChevronDown, Shield, Briefcase, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { BASE_URL } from "@/config/apiConfig";
import toast from "react-hot-toast";

/**
 * RoleSwitcher Component
 * Allows users to switch between multiple roles they have access to
 * Respects role hierarchy and permissions
 */
export default function RoleSwitcher() {
  const { userRoleTypes, setUser, setAccessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const dropdownRef = useRef(null);

  // Role hierarchy for navigation and permissions
  const roleHierarchy = {
    admin: {
      level: 3,
      title: "Administrator",
      icon: Shield,
      color: "red",
      description: "Full system access",
      navigateTo: "/admin",
      permissions: ["manage_users", "manage_roles", "view_reports", "configure_system"]
    },
    caregiver: {
      level: 2,
      title: "Caregiver",
      icon: Briefcase,
      color: "blue",
      description: "Care management access",
      navigateTo: "/caregiver",
      permissions: ["write_notes", "view_patients", "send_messages", "track_progress"]
    },
    user: {
      level: 1,
      title: "Patient/User",
      icon: User,
      color: "green",
      description: "Personal health access",
      navigateTo: "/easebrain",
      permissions: ["view_own_records", "create_notes", "set_reminders", "join_community"]
    },
    therapist: {
      level: 2,
      title: "Therapist",
      icon: Briefcase,
      color: "purple",
      description: "Clinical care access",
      navigateTo: "/caregiver",
      permissions: ["write_clinical_notes", "view_patients", "manage_treatment_plans", "prescribe_reminders"]
    },
    moderator: {
      level: 2,
      title: "Community Moderator",
      icon: Shield,
      color: "indigo",
      description: "Community management",
      navigateTo: "/easebrain/community",
      permissions: ["moderate_community", "manage_posts", "respond_to_reports"]
    }
  };

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

  // Load available roles on mount
  useEffect(() => {
    if (userRoleTypes && userRoleTypes.length > 0) {
      const roles = userRoleTypes
        .map(roleType => ({
          type: roleType,
          ...roleHierarchy[roleType] || {
            level: 0,
            title: roleType,
            color: "gray",
            navigateTo: "/easebrain"
          }
        }))
        .sort((a, b) => b.level - a.level); // Sort by hierarchy level (highest first)

      setAvailableRoles(roles);
      if (roles.length > 0 && !currentRole) {
        setCurrentRole(roles[0]);
      }
    }
  }, [userRoleTypes]);

  const switchRole = async (role) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role_type: role.type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to switch role");
      }

      // Update auth context with new token
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      if (data?.user) {
        setUser(data.user);
      }

      setCurrentRole(role);
      setIsOpen(false);
      toast.success(`Switched to ${role.title} role`);

      // Navigate to role-specific dashboard
      window.location.href = role.navigateTo;
    } catch (error) {
      toast.error(error.message || "Failed to switch role");
      console.error("Role switch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!availableRoles || availableRoles.length <= 1) {
    return null; // Don't show switcher if user has 0 or 1 role
  }

  const RoleIcon = currentRole?.icon || Shield;
  const getColorClass = (color) => {
    const colors = {
      red: "text-red-600 dark:text-red-400",
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      purple: "text-purple-600 dark:text-purple-400",
      indigo: "text-indigo-600 dark:text-indigo-400",
      gray: "text-gray-600 dark:text-gray-400"
    };
    return colors[color] || colors.gray;
  };

  const getBgColorClass = (color) => {
    const colors = {
      red: "bg-red-50 dark:bg-red-900/20",
      blue: "bg-blue-50 dark:bg-blue-900/20",
      green: "bg-green-50 dark:bg-green-900/20",
      purple: "bg-purple-50 dark:bg-purple-900/20",
      indigo: "bg-indigo-50 dark:bg-indigo-900/20",
      gray: "bg-gray-50 dark:bg-gray-900/20"
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        title={`Current role: ${currentRole?.title || 'None'}`}
      >
        {currentRole && <RoleIcon className={`w-4 h-4 ${getColorClass(currentRole.color)}`} />}
        <span className="text-sm font-medium">
          {currentRole?.title || 'Select Role'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Available Roles
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {availableRoles.length > 1
                  ? `You have ${availableRoles.length} roles. Click to switch.`
                  : "You have only one role."}
              </p>
            </div>

            {/* Role List */}
            <div className="space-y-2">
              {availableRoles.map((role) => {
                const Icon = role.icon;
                const isCurrentRole = currentRole?.type === role.type;

                return (
                  <button
                    key={role.type}
                    onClick={() => switchRole(role)}
                    disabled={isLoading || isCurrentRole}
                    className={`
                      w-full text-left p-3 rounded-lg border-2 transition-all
                      ${isCurrentRole
                        ? `border-teal-500 ${getBgColorClass(role.color)}`
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-teal-400"
                      }
                      ${isLoading || isCurrentRole ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${getColorClass(role.color)}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {role.title}
                        </span>
                      </div>
                      {isCurrentRole && (
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-6 mb-2">
                      {role.description}
                    </p>

                    {/* Permissions List */}
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="ml-6 text-xs">
                        <p className="text-gray-500 dark:text-gray-500 mb-1 font-semibold">Permissions:</p>
                        <ul className="space-y-1">
                          {role.permissions.slice(0, 3).map((perm, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-400">
                              • {perm.replace(/_/g, ' ')}
                            </li>
                          ))}
                          {role.permissions.length > 3 && (
                            <li className="text-gray-500 dark:text-gray-500 italic">
                              +{role.permissions.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Hierarchy Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Role Hierarchy:</strong> Higher roles have more permissions and can perform admin tasks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
