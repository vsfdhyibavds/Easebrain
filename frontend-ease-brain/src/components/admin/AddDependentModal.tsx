import { useState, FC, ChangeEvent, FormEvent } from "react";
import { FaTimes, FaUser, FaCalendar } from "react-icons/fa";
import { Dependent } from "@/types/admin";

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dependent: Dependent) => void;
}

const AddDependentModal: FC<AddDependentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    caregiver: "",
    status: "Active" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://www.easebrain.live/api";

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.age || parseInt(formData.age) <= 0 || parseInt(formData.age) > 150) {
      newErrors.age = "Please enter a valid age";
    }
    if (!formData.caregiver.trim()) {
      newErrors.caregiver = "Caregiver name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

      // Calculate date of birth from age
      const currentYear = new Date().getFullYear();
      const age = parseInt(formData.age);
      const dateOfBirth = `${currentYear - age}-01-01`;

      const response = await fetch(`${API_BASE_URL}/caregiver/dependents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          date_of_birth: dateOfBirth,
          medical_history: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || "Failed to add dependent" });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setSuccess(true);

      // Create a Dependent object to pass to parent
      const newDependent: Dependent = {
        id: data.dependent_id || Date.now(),
        name: formData.name,
        age: parseInt(formData.age),
        caregiver: formData.caregiver,
        status: "Active",
        lastUpdate: new Date().toISOString().split("T")[0],
      };

      // Call parent callback
      onAdd(newDependent);

      // Reset form
      setFormData({
        name: "",
        age: "",
        caregiver: "",
        status: "Active",
      });

      // Close after delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to add dependent:", err);
      setErrors({ submit: "Failed to connect to server" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Dependent
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaTimes className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-3">
                <p className="text-sm text-red-700 dark:text-red-200">{errors.submit}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 p-3">
                <p className="text-sm text-green-700 dark:text-green-200">
                  ✓ Dependent added successfully!
                </p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaUser className="inline mr-2" aria-hidden="true" />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter dependent name"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Age Field */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaCalendar className="inline mr-2" aria-hidden="true" />
                Age
              </label>
              <input
                id="age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter age"
                min="0"
                max="150"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.age}</p>
              )}
            </div>

            {/* Caregiver Field */}
            <div>
              <label htmlFor="caregiver" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Caregiver Name
              </label>
              <input
                id="caregiver"
                type="text"
                name="caregiver"
                value={formData.caregiver}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter caregiver name"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
              />
              {errors.caregiver && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.caregiver}</p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                const parentDiv = (e.currentTarget as HTMLButtonElement).closest("div");
                if (parentDiv) {
                  const form = parentDiv.querySelector("form");
                  if (form) {
                    form.dispatchEvent(new Event("submit", { bubbles: true }));
                  }
                }
              }}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition disabled:opacity-50 min-h-[44px]"
            >
              {isLoading ? "Adding..." : "Add Dependent"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDependentModal;
