import { useState, FC, ChangeEvent, useCallback } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheckCircle, FaClock } from "react-icons/fa";
import { Task } from "@/types/admin";

const AdminTasks: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [_showCreateModal, setShowCreateModal] = useState(false);
  const [_showEditModal, setShowEditModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Morning Medication",
      dependent: "John Doe",
      assignedTo: "Jane Smith",
      status: "Completed",
      dueDate: "2025-02-01",
      priority: "High",
    },
    {
      id: 2,
      title: "Physical Therapy",
      dependent: "Mary Johnson",
      assignedTo: "Robert Brown",
      status: "Pending",
      dueDate: "2025-02-02",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Doctor Appointment",
      dependent: "John Doe",
      assignedTo: "Jane Smith",
      status: "Pending",
      dueDate: "2025-02-03",
      priority: "High",
    },
  ]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.dependent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDelete = useCallback((id: number): void => {
    setTasks(tasks.filter((t) => t.id !== id));
    setActionMessage(`Task #${id} deleted`);
    setTimeout(() => setActionMessage(null), 2000);
  }, [tasks]);

  const handleCreateTask = useCallback((): void => {
    setShowCreateModal(true);
    setActionMessage("Create Task modal opened");
    setTimeout(() => setActionMessage(null), 2000);
  }, []);

  const handleEditTask = useCallback((id: number): void => {
    setSelectedTaskId(id);
    setShowEditModal(true);
    setActionMessage(`Edit Task #${id} modal opened`);
    setTimeout(() => setActionMessage(null), 2000);
  }, []);

  const handleCloseCreateModal = useCallback((): void => {
    setShowCreateModal(false);
  }, []);

  const handleCloseEditModal = useCallback((): void => {
    setShowEditModal(false);
    setSelectedTaskId(null);
  }, []);

  const handleSaveTask = useCallback((_task: Task): void => {
    if (selectedTaskId) {
      // Update existing task
      // setTasks(tasks.map((t) => (t.id === selectedTaskId ? _task : t)));
    } else {
      // Create new task
      // setTasks([...tasks, { ..._task, id: Math.max(...tasks.map((t) => t.id), 0) + 1 }]);
    }
    setShowEditModal(false);
    setShowCreateModal(false);
    setSelectedTaskId(null);
  }, [selectedTaskId]);

  const getPriorityColor = (priority: Task["priority"]): string => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    return status === "Completed" ? (
      <FaCheckCircle className="text-green-600 dark:text-green-400" />
    ) : (
      <FaClock className="text-yellow-600 dark:text-yellow-400" />
    );
  };

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const highPriorityCount = tasks.filter((t) => t.priority === "High").length;

  return (
    <main id="main-content" role="main" className="space-y-6">
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
            <h1 id="page-title" className="text-3xl font-bold text-gray-900 dark:text-white">Care Tasks</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage all care tasks and schedules</p>
          </div>
          <button
            onClick={handleCreateTask}
            aria-label="Create new care task"
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700 min-h-[44px]"
          >
            <FaPlus aria-hidden="true" /> Create Task
          </button>
        </div>
      </section>

      {/* Stats */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Task Statistics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow dark:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
          <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{highPriorityCount}</p>
        </div>
      </div>
      </section>
      <div className="relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search by task or dependent..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search tasks by title or dependent name"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <section aria-labelledby="table-title">
        <h2 id="table-title" className="sr-only">Care Tasks List</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow dark:shadow-lg">
          <table className="w-full" aria-label="Care tasks table with title, dependent, assigned to, status, priority, due date and actions">
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Task</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Dependent</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Assigned To</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Priority</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{task.dependent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{task.assignedTo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(task.priority)} dark:bg-opacity-30`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{task.dueDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2" role="group" aria-label={`Actions for ${task.title}`}>
                      <button
                        onClick={() => handleEditTask(task.id)}
                        aria-label={`Edit ${task.title}`}
                        className="rounded p-2 hover:bg-blue-100 dark:hover:bg-blue-900 transition min-h-[44px] min-w-[44px]"
                      >
                        <FaEdit className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        aria-label={`Delete ${task.title}`}
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
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </section>
    </main>
  );
};

export default AdminTasks;
