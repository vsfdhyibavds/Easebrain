import { FC, useState, useMemo, ChangeEvent, useCallback } from "react";
import { FaDownload, FaSearch, FaEye, FaTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AdminBreadcrumb } from "../components/admin";
import type { BreadcrumbItem } from "../components/admin/AdminBreadcrumb";

interface AuditLog {
  id: number;
  user: string;
  role: string;
  action: "create" | "edit" | "delete" | "export" | "login";
  resource: string;
  timestamp: string;
  status: "success" | "failed";
  ipAddress: string;
  details: string;
}

const AdminAuditLog: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Mock audit log data
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      user: "Sarah Johnson",
      role: "Super Admin",
      action: "create",
      resource: "Dependent",
      timestamp: "2026-02-03 14:32:15",
      status: "success",
      ipAddress: "192.168.1.100",
      details: "Created new dependent: John Smith",
    },
    {
      id: 2,
      user: "Mike Davis",
      role: "Admin",
      action: "edit",
      resource: "Task",
      timestamp: "2026-02-03 13:45:22",
      status: "success",
      ipAddress: "192.168.1.105",
      details: "Updated task priority from Medium to High",
    },
    {
      id: 3,
      user: "Lisa Chen",
      role: "Super Admin",
      action: "export",
      resource: "Dashboard",
      timestamp: "2026-02-03 12:15:08",
      status: "success",
      ipAddress: "192.168.1.110",
      details: "Exported data as CSV (42 dependents, 156 users)",
    },
    {
      id: 4,
      user: "John Smith",
      role: "Admin",
      action: "delete",
      resource: "User",
      timestamp: "2026-02-03 11:22:45",
      status: "failed",
      ipAddress: "192.168.1.115",
      details: "Attempted to delete admin user - insufficient permissions",
    },
    {
      id: 5,
      user: "Sarah Johnson",
      role: "Super Admin",
      action: "login",
      resource: "System",
      timestamp: "2026-02-03 09:10:33",
      status: "success",
      ipAddress: "192.168.1.100",
      details: "User logged in successfully",
    },
    {
      id: 6,
      user: "Robert Brown",
      role: "Admin",
      action: "create",
      resource: "Task",
      timestamp: "2026-02-02 16:45:12",
      status: "success",
      ipAddress: "192.168.1.120",
      details: "Created reminder task for medication adherence",
    },
    {
      id: 7,
      user: "Emily Wilson",
      role: "Admin",
      action: "edit",
      resource: "Dependent",
      timestamp: "2026-02-02 15:30:22",
      status: "success",
      ipAddress: "192.168.1.125",
      details: "Updated dependent status from Active to Inactive",
    },
    {
      id: 8,
      user: "Mike Davis",
      role: "Admin",
      action: "login",
      resource: "System",
      timestamp: "2026-02-02 08:05:55",
      status: "failed",
      ipAddress: "192.168.1.130",
      details: "Login failed - incorrect password",
    },
  ]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesStatus = filterStatus === "all" || log.status === filterStatus;
      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [auditLogs, searchQuery, filterAction, filterStatus]);

  // Memoized event handlers
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleActionFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilterAction(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  }, []);

  const handleSelectLog = useCallback((log: AuditLog) => {
    setSelectedLog(log);
    setActionMessage(`Viewing details for action: ${log.action}`);
    setTimeout(() => setActionMessage(null), 2000);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLog(null);
    setActionMessage("Modal closed");
    setTimeout(() => setActionMessage(null), 1500);
  }, []);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "edit":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "export":
        return "bg-amber-100 text-amber-800";
      case "login":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadAudit = () => {
    const csv = [
      ["User", "Role", "Action", "Resource", "Timestamp", "Status", "IP Address", "Details"],
      ...filteredLogs.map((log) => [
        log.user,
        log.role,
        log.action,
        log.resource,
        log.timestamp,
        log.status,
        log.ipAddress,
        log.details,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    setActionMessage("Audit log downloaded successfully");
    setTimeout(() => setActionMessage(null), 2000);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Admin Dashboard" },
    { label: "Audit Log" },
  ];

  return (
    <main id="main-content" role="main" className="space-y-6">
      {/* Breadcrumb */}
      <AdminBreadcrumb items={breadcrumbItems} />

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
            <h1 id="page-title" className="text-4xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Track all admin actions and system events</p>
          </div>
          <button
            onClick={handleDownloadAudit}
            aria-label="Download audit log report as CSV"
            className="flex items-center gap-2 rounded-lg bg-teal-600 dark:bg-teal-700 px-4 py-2 text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition min-h-[44px]"
          >
            <FaDownload aria-hidden="true" /> Download Report
          </button>
        </div>
      </section>

      {/* Filters */}
      <section aria-labelledby="filters-title">
        <h2 id="filters-title" className="sr-only">Audit Log Filters</h2>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="User, resource, details..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search audit logs by user, resource, or details"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
              <select
                id="action-filter"
                value={filterAction}
                onChange={handleActionFilterChange}
                aria-label="Filter audit logs by action type"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
                <option value="export">Export</option>
                <option value="login">Login</option>
              </select>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={handleStatusFilterChange}
                aria-label="Filter audit logs by status"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Results</label>
              <div className="flex items-center justify-between py-2 px-4 bg-teal-50 dark:bg-teal-950 rounded-lg" aria-live="polite">
                <span className="font-semibold text-teal-900 dark:text-teal-400">{filteredLogs.length}</span>
                <span className="text-sm text-teal-700 dark:text-teal-400">entries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Log Table */}
      <section aria-labelledby="table-title">
        <h2 id="table-title" className="sr-only">Audit Log Entries</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow dark:shadow-lg">
          <table className="w-full" aria-label="System audit logs showing user, role, action, resource, timestamp, and status">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Resource</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Timestamp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" role="presentation">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.role}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.resource}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {log.status === "success" ? (
                          <>
                            <FaCheckCircle className="text-green-600 dark:text-green-400" aria-hidden="true" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Success</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-red-600 dark:text-red-400" aria-hidden="true" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectLog(log)}
                        aria-label={`View details for ${log.action} action by ${log.user} on ${log.resource}`}
                        className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition min-h-[44px] min-w-[44px] justify-center"
                      >
                        <FaEye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Audit Log Details</h2>
              <button
                onClick={handleCloseModal}
                aria-label="Close audit log details modal"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 min-h-[44px] min-w-[44px]"
              >
                <FaTimes size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedLog.user}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedLog.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Action</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getActionBadgeColor(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resource</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedLog.resource}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Timestamp</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedLog.timestamp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <div className="flex items-center gap-2">
                  {selectedLog.status === "success" ? (
                    <>
                      <FaCheckCircle className="text-green-600 dark:text-green-400" aria-hidden="true" />
                      <span className="font-semibold text-green-600 dark:text-green-400">Success</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-600 dark:text-red-400" aria-hidden="true" />
                      <span className="font-semibold text-red-600 dark:text-red-400">Failed</span>
                    </>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Details</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedLog.details}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
              <button
                onClick={handleCloseModal}
                aria-label="Close audit log details modal"
                className="w-full rounded-lg bg-teal-600 dark:bg-teal-700 py-2 font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminAuditLog;
