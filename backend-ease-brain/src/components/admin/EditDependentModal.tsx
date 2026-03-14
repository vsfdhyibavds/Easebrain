import { useState, FC, ChangeEvent, FormEvent, useEffect } from "react";
import { FaTimes, FaUser, FaCalendar, FaPhone } from "react-icons/fa";
import { Dependent } from "@/types/admin";

interface EditDependentModalProps {
  isOpen: boolean;
  dependent: Dependent | null;
  onClose: () => void;
  onSave: (dependent: Dependent) => void;
  onUpdate?: (dependentId: number, updates: any) => void;
}

const EditDependentModal: FC<EditDependentModalProps> = ({
  isOpen,
  dependent,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    caregiver: "",
    status: "Active" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";

  // Update form data when dependent changes
  useEffect(() => {
    if (dependent) {
      setFormData({
        name: dependent.name,
        age: dependent.age,
        caregiver: dependent.caregiver,
        status: dependent.status as "Active" | "Inactive" | "Pending",
      });
      setErrors({});
      setSuccess(false);
    }
  }, [dependent, isOpen]);

  if (!isOpen || !dependent) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (formData.age <= 0 || formData.age > 150) {
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
      [name]: name === "age" ? parseInt(value) || 0 : value,
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

      const response = await fetch(`${API_BASE_URL}/caregiver/dependents/${dependent?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          date_of_birth: `${2024 - formData.age}-01-01`, // Simple conversion from age
          medical_history: "",
          emergency_contact: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || errorData.message || "Failed to update dependent." });
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      if (onUpdate) {
        onUpdate(dependent?.id || 0, formData);
      }

      setTimeout(() => {
        onSave({
          ...dependent,
          ...formData,
        } as Dependent);
        setSuccess(false);
        setFormData({ name: "", age: 0, caregiver: "", status: "Active" });
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to update dependent:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update dependent." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Dependent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-700 dark:text-green-400">
              ✓ Dependent updated successfully
            </div>
          )}

          {errors.submit && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-400">
              {errors.submit}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FaUser size={14} /> Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                errors.name
                  ? "border-red-300 focus:border-red-500 dark:border-red-600"
                  : "border-gray-300 focus:border-teal-500 dark:border-gray-600 dark:focus:border-teal-400"
              }`}
              placeholder="Enter dependent name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FaCalendar size={14} /> Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                errors.age
                  ? "border-red-300 focus:border-red-500 dark:border-red-600"
                  : "border-gray-300 focus:border-teal-500 dark:border-gray-600 dark:focus:border-teal-400"
              }`}
              placeholder="Enter age"
              min="1"
              max="150"
            />
            {errors.age && (
              <p className="mt-1 text-xs text-red-600">{errors.age}</p>
            )}
          </div>

          {/* Caregiver */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaPhone size={14} /> Caregiver
            </label>
            <input
              type="text"
              name="caregiver"
              value={formData.caregiver}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none ${
                errors.caregiver
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-teal-500"
              }`}
              placeholder="Enter caregiver name"
            />
            {errors.caregiver && (
              <p className="mt-1 text-xs text-red-600">{errors.caregiver}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 py-2 font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-teal-600 dark:bg-teal-700 py-2 font-medium text-white transition hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDependentModal;
