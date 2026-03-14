import { FC } from "react";
import { FaTimes, FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  timestamp: string;
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsModal: FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: "Medication Reminder",
      message: "John Doe's medication is due in 2 hours",
      type: "warning",
      timestamp: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Task Completed",
      message: "Mary Johnson completed her morning checkup",
      type: "success",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Health Alert",
      message: "Patricia Davis's blood pressure is elevated",
      type: "warning",
      timestamp: "3 hours ago",
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500 text-lg" />;
      case "success":
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case "info":
      default:
        return <FaInfoCircle className="text-teal-500 text-lg" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "info":
      default:
        return "border-teal-200 bg-teal-50";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-teal-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <FaBell className="text-teal-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="Close notifications"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {mockNotifications.length > 0 ? (
            <div className="divide-y divide-teal-100">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 p-4 transition hover:bg-opacity-75 ${getNotificationColor(notification.type)} ${
                    !notification.read ? "border-l-teal-500" : "border-l-gray-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="pt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <div className="ml-2 h-2 w-2 rounded-full bg-teal-500"></div>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-500">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaBell className="mx-auto mb-3 text-4xl text-gray-300" />
              <p className="text-gray-500">No notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-teal-100 px-6 py-3">
          <button className="w-full rounded-lg py-2 text-center text-sm font-medium text-teal-600 transition hover:bg-teal-50">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
