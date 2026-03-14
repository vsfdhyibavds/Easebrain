import {
  FC,
  useState,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCheckCircle, FaExclamationCircle, FaClock, FaUsers } from "react-icons/fa";
import {
  AdminCard,
  AdminBreadcrumb,
  ExportModal,
  AddAdminUserModal,
  TimeRangeFilter,
} from "../components/admin";
import SkeletonLoader from "../components/SkeletonLoader";

const DashboardCharts = lazy(() =>
  import("../components/admin").then((module) => ({
    default: module.DashboardCharts,
  }))
);
import type { BreadcrumbItem } from "../components/admin/AdminBreadcrumb";
import type { TimeRange } from "../components/admin/TimeRangeFilter";

interface SystemEvent {
  id: number;
  type: "user_signup" | "task_created" | "alert" | "status_change" | "error";
  title: string;
  description: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
}

interface SystemHealth {
  database: "healthy" | "warning" | "critical";
  apiResponse: number; // ms
  errorRate: number; // %
  lastBackup: string;
}

const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [systemHealth] = useState<SystemHealth>({
    database: "healthy",
    apiResponse: 145,
    errorRate: 0.2,
    lastBackup: "2 hours ago",
  });

  // Memoized event handlers
  const handleExportModalOpen = useCallback(() => {
    setShowExportModal(true);
    setActionMessage("Export modal opened");
    setTimeout(() => setActionMessage(null), 1500);
  }, []);
  const handleExportModalClose = useCallback(
    () => setShowExportModal(false),
    []
  );

  const handleAddUserModalOpen = useCallback(() => {
    setShowAddUserModal(true);
    setActionMessage("Add user modal opened");
    setTimeout(() => setActionMessage(null), 1500);
  }, []);
  const handleAddUserModalClose = useCallback(
    () => setShowAddUserModal(false),
    []
  );

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setTimeRange(range);
      setActionMessage(`Time range changed to ${range}`);
      setTimeout(() => setActionMessage(null), 1500);
    },
    []
  );

  const handleNavigateToAddDependent = useCallback(() => {
    setActionMessage("Navigating to Dependents...");
    setTimeout(() => navigate("/admin/dependents"), 400);
  }, [navigate]);
  const handleNavigateToTasks = useCallback(() => {
    setActionMessage("Navigating to Tasks...");
    setTimeout(() => navigate("/admin/tasks"), 400);
  }, [navigate]);
  const handleNavigateToTimeline = useCallback(() => {
    setActionMessage("Navigating to Timeline...");
    setTimeout(() => navigate("/admin/timeline"), 400);
  }, [navigate]);

  // Mock data
  const [recentEvents] = useState<SystemEvent[]>([
    {
      id: 1,
      type: "user_signup",
      title: "New Admin User Registered",
      description: "Sarah Johnson signed up as admin",
      timestamp: "2 minutes ago",
      severity: "info",
    },
    {
      id: 2,
      type: "task_created",
      title: "High Priority Task Created",
      description: "Doctor appointment scheduled for John Doe",
      timestamp: "15 minutes ago",
      severity: "warning",
    },
    {
      id: 3,
      type: "status_change",
      title: "Dependent Status Updated",
      description: "Robert Brown marked as Active",
      timestamp: "1 hour ago",
      severity: "info",
    },
    {
      id: 4,
      type: "alert",
      title: "System Alert",
      description: "High message volume detected",
      timestamp: "2 hours ago",
      severity: "warning",
    },
    {
      id: 5,
      type: "user_signup",
      title: "New Caregiver Onboarded",
      description: "Emily Wilson created caregiver account",
      timestamp: "3 hours ago",
      severity: "info",
    },
  ]);

  // Calculate stats with trend data
  const stats = useMemo(() => ({
    totalDependents: 42,
    totalDependentsTrend: 15,
    activeTasks: 18,
    activeTasksTrend: 12,
    systemUsers: 156,
    systemUsersTrend: 8,
    alertsToday: 7,
    alertsTodayTrend: -5,
  }), []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-l-4 border-red-500 dark:bg-red-950 dark:border-red-400";
      case "warning":
        return "bg-yellow-50 border-l-4 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-400";
      default:
        return "bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950 dark:border-blue-400";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <FaExclamationCircle className="text-red-600" />;
      case "warning":
        return <FaExclamationCircle className="text-yellow-600" />;
      default:
        return <FaCheckCircle className="text-blue-600" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Admin Dashboard" },
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening in your system today.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center" role="group" aria-label="Dashboard controls">
          <TimeRangeFilter onRangeChange={handleTimeRangeChange} defaultRange="week" />
          <button
            onClick={handleExportModalOpen}
            aria-label="Open export modal to download dashboard data"
            className="flex items-center gap-2 rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition min-h-[44px]"
          >
            <FaPlus aria-hidden="true" /> Quick Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <section aria-labelledby="metrics-title">
        <h2 id="metrics-title" className="sr-only">Key System Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminCard
          title="Total Dependents"
          value={stats.totalDependents}
          icon={<FaUsers className="text-2xl" />}
          color="teal"
          trend={stats.totalDependentsTrend}
          trendLabel={`vs last ${timeRange === 'week' ? 'week' : 'period'}`}
        />
        <AdminCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon={<FaClock className="text-2xl" />}
          color="blue"
          trend={stats.activeTasksTrend}
          trendLabel={`vs last ${timeRange === 'week' ? 'week' : 'period'}`}
        />
        <AdminCard
          title="System Users"
          value={stats.systemUsers}
          icon={<FaUsers className="text-2xl" />}
          color="green"
          trend={stats.systemUsersTrend}
          trendLabel={`vs last ${timeRange === 'week' ? 'week' : 'period'}`}
        />
        <AdminCard
          title="Alerts (24h)"
          value={stats.alertsToday}
          icon={<FaExclamationCircle className="text-2xl" />}
          color="red"
          trend={stats.alertsTodayTrend}
          trendLabel={`vs last ${timeRange === 'week' ? 'week' : 'period'}`}
        />
      </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2 columns */}
        <section aria-labelledby="activity-title">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
            <h2 id="activity-title" className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-3" aria-live="polite" aria-label="Recent system activity events">
              {recentEvents.map((event) => (
                <div key={event.id} className={`rounded p-4 ${getSeverityColor(event.severity)}`}>
                  <div className="flex gap-3">
                    <div className="pt-1">{getSeverityIcon(event.severity)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{event.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleNavigateToTimeline}
              aria-label="Navigate to full activity timeline"
              className="mt-4 w-full rounded border border-teal-600 py-2 text-center text-teal-600 hover:bg-teal-50 transition dark:hover:bg-teal-950 dark:text-teal-400 min-h-[44px]"
            >
              View All Activity
            </button>
          </div>
        </section>

        {/* System Health & Quick Actions */}
        <div className="space-y-4">
          {/* System Health */}
          <section aria-labelledby="health-title">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
              <h2 id="health-title" className="mb-4 text-xl font-bold text-gray-900 dark:text-white">System Health</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Database</span>
                  <span className={`font-semibold capitalize ${getHealthColor(systemHealth.database)}`}>
                    {systemHealth.database}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-1 rounded-full bg-green-500" style={{ width: "95%" }} />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-700 dark:text-gray-300">API Response</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{systemHealth.apiResponse}ms</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-700 dark:text-gray-300">Error Rate</span>
                  <span className={systemHealth.errorRate > 1 ? "font-semibold text-red-600 dark:text-red-400" : "font-semibold text-green-600 dark:text-green-400"}>
                    {systemHealth.errorRate}%
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{systemHealth.lastBackup}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section aria-labelledby="actions-title">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
              <h2 id="actions-title" className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              <div className="space-y-2" role="group" aria-label="Quick action buttons">
                <button
                  onClick={handleNavigateToAddDependent}
                  aria-label="Navigate to add new dependent"
                  className="w-full rounded bg-teal-50 dark:bg-teal-950 py-2 text-left pl-4 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900 transition min-h-[44px]"
                >
                  + Add Dependent
                </button>
                <button
                  onClick={handleNavigateToTasks}
                  aria-label="Navigate to create task"
                  className="w-full rounded bg-blue-50 dark:bg-blue-950 py-2 text-left pl-4 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition min-h-[44px]"
                >
                  + Create Task
                </button>
                <button
                  onClick={handleAddUserModalOpen}
                  aria-label="Open modal to add new admin user"
                  className="w-full rounded bg-green-50 dark:bg-green-950 py-2 text-left pl-4 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition min-h-[44px]"
                >
                  + Add Admin User
                </button>
                <button
                  onClick={handleExportModalOpen}
                  aria-label="Open modal to export system data"
                  className="w-full rounded bg-amber-50 dark:bg-amber-950 py-2 text-left pl-4 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition min-h-[44px]"
                >
                  📊 Export Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Analytics Section */}
      <section aria-labelledby="analytics-title">
        <h2 id="analytics-title" className="sr-only">Analytics and Compliance</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Statistics */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Top Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-700 dark:text-gray-300">Most Active Caregivers</span>
              <span className="font-semibold text-gray-900 dark:text-white">Sarah Johnson (12)</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-700 dark:text-gray-300">Busiest Time Period</span>
              <span className="font-semibold text-gray-900 dark:text-white">2-4 PM EST</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-700 dark:text-gray-300">Top Safety Concerns</span>
              <span className="font-semibold text-gray-900 dark:text-white">Medication Adherence</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">System Uptime (30d)</span>
              <span className="font-semibold text-green-600 dark:text-green-400">99.8%</span>
            </div>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Compliance Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">HIPAA Compliance</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">All requirements met</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Data Privacy</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">All checks passed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <FaExclamationCircle className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">SSL Certificate</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires in 45 days</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Analytics Charts */}
      <Suspense
        fallback={
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
            <SkeletonLoader type="chart" count={1} />
          </div>
        }
      >
        <DashboardCharts />
      </Suspense>

      {/* Modals */}
      <ExportModal isOpen={showExportModal} onClose={handleExportModalClose} />
      <AddAdminUserModal isOpen={showAddUserModal} onClose={handleAddUserModalClose} />
    </main>
  );
};

export default AdminDashboard;
