import { useState, FC, ChangeEvent, useCallback, Suspense, lazy, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { Dependent } from "@/types/admin";
import EditDependentModal from "@/components/admin/EditDependentModal";
import DeleteDependentModal from "@/components/admin/DeleteDependentModal";
import SkeletonLoader from "@/components/SkeletonLoader";

const AdminDependents: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(
    null
  );

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";

  // Fetch dependents from API on component mount
  useEffect(() => {
    const fetchDependents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/caregiver/dependents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch dependents");
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        // Map API response to Dependent type
        const mappedDependents = data.dependents.map((dep: any) => ({
          id: dep.id,
          name: dep.name,
          age: new Date().getFullYear() - new Date(dep.date_of_birth).getFullYear(),
          caregiver: dep.caregiver_name || "Unknown",
          status: dep.is_active ? "Active" : "Inactive",
          lastUpdate: new Date(dep.updated_at).toISOString().split("T")[0],
        }));
        setDependents(mappedDependents);
      } catch (err) {
        setError("Failed to connect to server");
        console.error("Error fetching dependents:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDependents();
  }, [API_BASE_URL]);

  // Memoized event handlers
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDelete = useCallback((id: number): void => {
    setDependents(dependents.filter((d) => d.id !== id));
    setActionMessage(`Dependent deleted successfully`);
    setTimeout(() => setActionMessage(null), 2000);
  }, [dependents]);

  const handleAddDependent = useCallback((): void => {
    setShowAddModal(true);
    setActionMessage("Add dependent modal opened");
    setTimeout(() => setActionMessage(null), 1500);
  }, []);

  const handleEditDependent = useCallback((dependent: Dependent): void => {
    setSelectedDependent(dependent);
    setShowEditModal(true);
    setActionMessage(`Editing ${dependent.name}`);
    setTimeout(() => setActionMessage(null), 1500);
  }, []);

  const handleDeleteDependent = useCallback((dependent: Dependent): void => {
    setSelectedDependent(dependent);
    setShowDeleteModal(true);
    setActionMessage(`Delete confirmation for ${dependent.name}`);
    setTimeout(() => setActionMessage(null), 1500);
  }, []);

  const handleSaveDependent = useCallback((updated: Dependent): void => {
    setDependents(
      dependents.map((d) => (d.id === updated.id ? updated : d))
    );
    setActionMessage(`${updated.name} saved successfully`);
    setTimeout(() => setActionMessage(null), 2000);
  }, [dependents]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setActionMessage("Edit modal closed");
    setTimeout(() => setActionMessage(null), 1000);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const filteredDependents = dependents.filter(
    (dependent) =>
      dependent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dependent.caregiver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main id="main-content" role="main" className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-4">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Action Message */}
      {actionMessage && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 text-blue-700 dark:text-blue-400" role="status" aria-live="polite">
          ✓ {actionMessage}
        </div>
      )}

      {/* Header */}
      <section aria-labelledby="page-title">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 id="page-title" className="text-3xl font-bold text-gray-900 dark:text-white">Dependents Management</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage all dependents in the system</p>
          </div>
          <button
            onClick={handleAddDependent}
            aria-label="Add new dependent to the system"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus aria-hidden="true" /> Add Dependent
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search by name or caregiver..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search dependents by name or caregiver"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      ) : (
      <>
      {/* Table */}
      <section aria-labelledby="table-title">
        <h2 id="table-title" className="sr-only">Dependents List</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow dark:shadow-lg">
          <table className="w-full" aria-label="Dependents table with name, age, caregiver, status and actions">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Age</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Caregiver</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Last Update</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" role="presentation">
              {filteredDependents.length > 0 ? (
                filteredDependents.map((dependent) => (
                  <tr key={dependent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{dependent.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{dependent.age}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{dependent.caregiver}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-green-100 dark:bg-green-900 px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-200">
                        {dependent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{dependent.lastUpdate}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2" role="group" aria-label={`Actions for ${dependent.name}`}>
                        <button
                          onClick={() => handleEditDependent(dependent)}
                          aria-label={`Edit ${dependent.name}`}
                          className="rounded p-2 hover:bg-blue-100 dark:hover:bg-blue-900 transition min-h-[44px] min-w-[44px]"
                        >
                          <FaEdit className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteDependent(dependent)}
                          aria-label={`Delete ${dependent.name}`}
                          className="rounded p-2 hover:bg-red-100 dark:hover:bg-red-900 transition min-h-[44px] min-w-[44px]"
                        >
                          <FaTrash className="text-red-600 dark:text-red-400" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No dependents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stats */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Dependents Statistics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Dependents</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{dependents.length}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {dependents.filter((d) => d.status === "Active").length}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-gray-600 dark:text-gray-400">
            {dependents.filter((d) => d.status === "Inactive").length}
          </p>
        </div>
      </div>
      </section>
      </>
      )}

      {/* Modals */}
      <EditDependentModal
        isOpen={showEditModal}
        dependent={selectedDependent}
        onClose={handleCloseEditModal}
        onSave={handleSaveDependent}
      />
      <DeleteDependentModal
        isOpen={showDeleteModal}
        dependent={selectedDependent}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
      />
    </main>
  );
};

export default AdminDependents;
