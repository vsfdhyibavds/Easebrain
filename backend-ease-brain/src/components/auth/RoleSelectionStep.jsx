import React from "react";
import { Shield, Briefcase, User as UserIcon } from "lucide-react";
import RoleSelectionCard from "./RoleSelectionCard";

/**
 * RoleSelectionStep - Step in signup flow where user selects their role type
 */
export default function RoleSelectionStep({ selectedRole, onRoleSelect }) {
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

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Select Your Role
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you'll use EaseBrain. You can change this later in your settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            onSelect={() => onRoleSelect(role.type)}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          ℹ️ <strong>Note:</strong> You can request additional roles later through your account settings.
          Administrators may need to approve role changes depending on your organization's policies.
        </p>
      </div>
    </div>
  );
}
