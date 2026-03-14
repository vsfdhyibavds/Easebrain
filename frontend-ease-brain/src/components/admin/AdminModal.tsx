import { FC, ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

export interface AdminModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  footer?: ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const AdminModal: FC<AdminModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  size = "md",
  showCloseButton = true,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeClasses[size]} rounded-lg bg-white shadow-lg transition-transform`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded p-1 hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 px-6 py-4">{footer}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminModal;
