import { FC, ReactNode } from "react";
import TrendIndicator from "./TrendIndicator";

interface AdminCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: "teal" | "green" | "red" | "yellow" | "blue";
  description?: string;
  trend?: number; // percentage change
  trendLabel?: string; // e.g., "vs last week"
}

const colorMap: Record<string, string> = {
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400",
};

const AdminCard: FC<AdminCardProps> = ({
  title,
  value,
  icon,
  color = "teal",
  description,
  trend,
  trendLabel = "vs last period",
}) => {
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg transition hover:shadow-lg dark:hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className="mt-3">
              <TrendIndicator value={trend} label={trendLabel} showSparkline={true} />
            </div>
          )}
          {description && !trend && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`rounded-lg p-2 ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCard;
