import React from 'react';
import { Shield, Briefcase, User as UserIcon, Check } from "lucide-react";

/**
 * RoleSelectionCard - Displays role options with descriptions
 */
export default function RoleSelectionCard({
  title,
  description,
  features,
  isSelected,
  onSelect,
  icon,
  accentColor = "teal"
}) {
  const borderColor = isSelected ? `border-${accentColor}-500` : "border-gray-200";
  const bgColor = isSelected ? `bg-${accentColor}-50 dark:bg-${accentColor}-900/20` : "bg-white dark:bg-slate-700";

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-6 rounded-lg border-2 cursor-pointer transition-all
        ${borderColor} ${bgColor}
        hover:shadow-lg dark:hover:shadow-slate-900/50
        ${isSelected ? "ring-2 ring-offset-2 ring-' + accentColor + '-400" : ""}
      `}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className={`absolute top-4 right-4 bg-${accentColor}-500 text-white rounded-full p-1`}>
          <Check className="w-5 h-5" />
        </div>
      )}

      {/* Icon & Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-${accentColor}-100 dark:bg-${accentColor}-900/30 rounded-lg`}>
          {icon ? (
            React.createElement(icon, { className: `w-6 h-6 text-${accentColor}-600 dark:text-${accentColor}-400` })
          ) : (
            <UserIcon className={`w-6 h-6 text-${accentColor}-600 dark:text-${accentColor}-400`} />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>

      {/* Features */}
      {features && features.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase">
            Includes:
          </p>
          <ul className="space-y-1">
            {features.map((feature, idx) => (
              <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                <span className={`text-${accentColor}-600 dark:text-${accentColor}-400 mt-0.5`}>•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
