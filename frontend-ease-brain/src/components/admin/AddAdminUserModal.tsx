import { FC, useState, ChangeEvent, FormEvent } from "react";
import { FaTimes, FaUser, FaEnvelope, FaShieldAlt } from "react-icons/fa";

interface AddAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: (user: any) => void;
}

interface AdminUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "super_admin";
}

const AddAdminUserModal: FC<AddAdminUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState<AdminUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    role: "admin",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://www.easebrain.live/api";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ submit: "Authentication required. Please log in again." });
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password_hash: Math.random().toString(36).slice(-12), // API will handle hashing
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || "Failed to add user. Please try again." });
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      setSuccess(true);

      if (onUserAdded) {
        onUserAdded(userData);
      }

      setTimeout(() => {
        setFormData({ firstName: "", lastName: "", email: "", role: "admin" });
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to add admin user:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to add user. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Admin User</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
            {/* Success Message */}
            {success && (
              <div className="rounded bg-green-50 dark:bg-green-950 p-3">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ Admin user created successfully! An invitation email has been sent.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded bg-red-50 dark:bg-red-950 p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <div className="relative mt-1">
                <FaUser className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full rounded border pl-10 py-2 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-teal-400 ${
                    errors.firstName ? "border-red-500 dark:border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <div className="relative mt-1">
                <FaUser className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full rounded border pl-10 py-2 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-teal-400 ${
                    errors.lastName ? "border-red-500 dark:border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative mt-1">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full rounded border pl-10 py-2 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-teal-400 ${
                    errors.email ? "border-red-500 dark:border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <div className="relative mt-1">
                <FaShieldAlt className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 pl-10 py-2 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded bg-blue-50 dark:bg-blue-950 p-3">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 <strong>Note:</strong> An invitation email will be sent to the new user with
                setup instructions.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 flex gap-2 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded border border-gray-300 dark:border-gray-600 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 rounded bg-teal-600 dark:bg-teal-700 py-2 text-white hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAdminUserModal;
