import { useState, FC } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { Dependent } from "@/types/admin";

interface DeleteDependentModalProps {
  isOpen: boolean;
  dependent: Dependent | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  onDelete?: (dependentId: number) => void;
}

const DeleteDependentModal: FC<DeleteDependentModalProps> = ({
  isOpen,
  dependent,
  onClose,
  onConfirm,
  onDelete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";

  if (!isOpen || !dependent) return null;

  const handleConfirmDelete = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/caregiver/dependents/${dependent?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || "Failed to delete dependent.");
        setIsLoading(false);
        return;
      }

      if (onDelete) {
        onDelete(dependent?.id || 0);
      }
      onConfirm(dependent?.id || 0);
      onClose();
    } catch (err) {
      console.error("Failed to delete dependent:", err);
      setError(err instanceof Error ? err.message : "Failed to delete dependent.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Dependent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-950 p-3">
              <FaExclamationTriangle className="text-3xl text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h3 className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-white">
            Are you sure?
          </h3>
          <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
            You are about to delete <span className="font-medium">{dependent.name}</span>. This
            action cannot be undone.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-400">
            <p>
              <strong>Warning:</strong> All associated data (notes, messages, safety plans) will
              also be removed.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 py-2 font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-red-600 dark:bg-red-700 py-2 font-medium text-white transition hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDependentModal;
