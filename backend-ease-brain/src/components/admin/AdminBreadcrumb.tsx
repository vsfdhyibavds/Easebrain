import { FC } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const AdminBreadcrumb: FC<AdminBreadcrumbProps> = ({
  items,
  className = "",
}) => {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.path ? (
            <Link
              to={item.path}
              className="text-teal-600 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <FaChevronRight className="text-gray-400 text-xs" />
          )}
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumb;
