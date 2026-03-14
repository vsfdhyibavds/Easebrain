import { useState, useEffect, useMemo, useRef, ReactNode, ChangeEvent, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDarkMode } from "@/context/DarkModeContext";
import {
  FaUserFriends,
  FaClipboardList,
  FaExclamationTriangle,
  FaSmileBeam,
  FaPlus,
  FaBell,
  FaChartLine,
  FaArrowUp,
  FaCalendarAlt,
  FaHeartbeat,
  FaMedkit,
  FaNotesMedical,
  FaSearch,
  FaChevronRight,
  FaCheckCircle,
  FaEye,
  FaDownload,
  FaComments,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BASE_URL } from "@/utils/utils";
import {
  AddDependentModal,
  CreateTaskModal,
  SendAlertModal,
  ScheduleAppointmentModal,
} from "../components/CaregiverModals";
import CaregiverChatModal from "../components/CaregiverChatModal";
import NotificationsModal from "../components/NotificationsModal";
// Lazy load heavy components for code splitting
const CalendarView = lazy(() => import("../components/CalendarView"));
const ReportGenerator = lazy(() => import("../components/ReportGenerator"));
const MedicationAdherenceTracker = lazy(() => import("../components/MedicationAdherenceTracker"));
const EmergencySafety = lazy(() => import("../components/EmergencySafety"));
const CommunicationHub = lazy(() => import("../components/CommunicationHub"));
import SkeletonLoader from "../components/SkeletonLoader";
import type {
  StatCard,
  Dependent,
  Activity,
  MoodDataPoint,
  MedicationDataPoint,
  ModalState,
  User,
  CustomTooltipProps,
} from "./CaregiverDashboardTypes";

function CaregiverDashboard() {
  const user: User = {
    accessToken: "mock-token",
    first_name: "John",
    username: "caregiver",
  };
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const [modals, setModals] = useState<ModalState>({
    addDependent: false,
    createTask: false,
    sendAlert: false,
    scheduleAppointment: false,
    chat: false,
    viewReports: false,
    viewActivities: false,
    viewAllDependents: false,
    viewAllNotifications: false,
  });

  const [selectedDependentForChat, setSelectedDependentForChat] = useState<Dependent | null>(null);

  const openModal = useCallback((modalName: keyof ModalState): void => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: keyof ModalState): void => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName === "chat") {
      setSelectedDependentForChat(null);
    }
  }, []);

  const openChatModal = useCallback((dependent: Dependent): void => {
    setSelectedDependentForChat(dependent);
    setModals((prev) => ({ ...prev, chat: true }));
  }, []);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [filterType, _setFilterType] = useState<string>("all");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentDependentPage, setCurrentDependentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 5;

  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "Dependents",
      value: 0,
      icon: FaUserFriends,
      trend: "+2 this week",
      change: "+15%",
      trendUp: true,
      color: "bg-gradient-to-br from-teal-500 to-cyan-500",
      iconBg: "bg-teal-100",
      textColor: "text-teal-700",
    },
    {
      title: "Pending Tasks",
      value: 0,
      icon: FaClipboardList,
      trend: "3 overdue",
      change: "-5%",
      trendUp: false,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      iconBg: "bg-amber-100",
      textColor: "text-amber-700",
    },
    {
      title: "Urgent Alerts",
      value: 0,
      icon: FaExclamationTriangle,
      trend: "1 needs review",
      change: "+8%",
      trendUp: false,
      color: "bg-gradient-to-br from-red-500 to-orange-500",
      iconBg: "bg-red-100",
      textColor: "text-red-700",
    },
    {
      title: "Mood Checks",
      value: 0,
      icon: FaSmileBeam,
      trend: "All checked in",
      change: "+22%",
      trendUp: true,
      color: "bg-gradient-to-br from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-700",
    },
  ]);

  const [_recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [moodData, setMoodData] = useState<MoodDataPoint[]>([]);
  const [medicationData, setMedicationData] = useState<MedicationDataPoint[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isTabTransitioning, setIsTabTransitioning] = useState<boolean>(false);
  const [_showNotificationsPanel, setShowNotificationsPanel] = useState<boolean>(false);

  const moodColors = {
    positive: "#059669",
    neutral: "#0d9488",
    negative: "#0f766e",
  };

  // Smooth tab transition effect
  useEffect(() => {
    setIsTabTransitioning(true);
    const timer = setTimeout(() => setIsTabTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    async function loadAllDashboardData(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BASE_URL}/caregiver/dashboard`);

        if (!response.ok) {
          throw new Error(`Failed to load dashboard: ${response.statusText}`);
        }

        const data = await response.json();

        setStats([
          {
            title: "Dependents",
            value: data.stats?.dependents_count || 0,
            icon: FaUserFriends,
            trend: "+2 this week",
            change: "+15%",
            trendUp: true,
            color: "bg-gradient-to-br from-teal-500 to-cyan-500",
            iconBg: "bg-teal-100",
            textColor: "text-teal-700",
          },
          {
            title: "Pending Tasks",
            value: data.stats?.active_tasks || 0,
            icon: FaClipboardList,
            trend: "3 overdue",
            change: "-5%",
            trendUp: false,
            color: "bg-gradient-to-br from-amber-500 to-orange-500",
            iconBg: "bg-amber-100",
            textColor: "text-amber-700",
          },
          {
            title: "Urgent Alerts",
            value: data.stats?.safety_concerns || 0,
            icon: FaExclamationTriangle,
            trend: "1 needs review",
            change: "+8%",
            trendUp: false,
            color: "bg-gradient-to-br from-red-500 to-orange-500",
            iconBg: "bg-red-100",
            textColor: "text-red-700",
          },
          {
            title: "Mood Checks",
            value: data.stats?.completion_rate || 0,
            icon: FaSmileBeam,
            trend: "All checked in",
            change: "+22%",
            trendUp: true,
            color: "bg-gradient-to-br from-emerald-500 to-teal-500",
            iconBg: "bg-emerald-100",
            textColor: "text-emerald-700",
          },
        ]);

        setRecentActivity(data.recent_activities || []);
        setMoodData(data.mood_data || []);
        setMedicationData(data.medication_data || []);
        setDependents(data.dependents || []);
        // TODO: Implement performance data tracking when metrics dashboard is enabled
        // setPerformanceData({
        //   overallScore: data.performance?.overall_score || 0,
        //   rating: data.performance?.rating || "",
        //   taskCompletion: data.performance?.task_completion || 0,
        //   medicationAdherence: data.performance?.medication_adherence || 0,
        //   moodPositivity: data.performance?.mood_positivity || 0,
        //   responseTime: data.performance?.response_time || 0,
        // });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(errorMessage);
        toast.error(errorMessage || "Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadAllDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps): ReactNode => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-teal-100">
          <p className="font-semibold text-teal-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm text-teal-700"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const filteredDependents = useMemo(
    () =>
      dependents.filter(
        (dependent) =>
          dependent.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          dependent.status
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          dependent.mood
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
      ),
    [dependents, debouncedSearchQuery]
  );

  // filteredActivities - Activities filtering not currently displayed, kept for future use
  // const filteredActivities = useMemo(
  //   () =>
  //     recentActivity.filter(
  //       (activity) =>
  //         activity.dependent
  //           .toLowerCase()
  //           .includes(debouncedSearchQuery.toLowerCase()) ||
  //         activity.activity
  //           .toLowerCase()
  //           .includes(debouncedSearchQuery.toLowerCase()) ||
  //         activity.status
  //           .toLowerCase()
  //           .includes(debouncedSearchQuery.toLowerCase())
  //     ),
  //   [recentActivity, debouncedSearchQuery]
  // );

  const displayDependents = useMemo(
    () =>
      filterType === "all" || filterType === "dependents"
        ? filteredDependents
        : [],
    [filterType, filteredDependents]
  );

  // displayActivities - Activities filtering not currently displayed, kept for future use
  // const displayActivities = useMemo(
  //   () =>
  //     filterType === "all" || filterType === "activities"
  //       ? filteredActivities
  //       : [],
  //   [filterType, filteredActivities]
  // );

  const totalDependentPages = Math.ceil(displayDependents.length / ITEMS_PER_PAGE);

  const paginatedDependents = useMemo(() => {
    const startIdx = (currentDependentPage - 1) * ITEMS_PER_PAGE;
    return displayDependents.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [displayDependents, currentDependentPage, totalDependentPages]);

  useEffect(() => {
    setCurrentDependentPage(1);
  }, [debouncedSearchQuery, filterType]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleQuickAction = useCallback(async (actionLabel: string): Promise<void> => {
    const token = user?.accessToken;
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      switch (actionLabel) {
        case "Add New Dependent":
          openModal("addDependent");
          break;
        case "Create Task List":
          openModal("createTask");
          break;
        case "Send Health Alert":
          openModal("sendAlert");
          break;
        case "Generate Report": {
          toast.loading("Generating report...");
          const reportRes = await fetch(`${BASE_URL}/caregiver/reports/generate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (reportRes.ok) {
            toast.success("Report generated successfully!");
          } else {
            toast.error("Failed to generate report");
          }
          break;
        }
        case "Schedule Appointment":
          openModal("scheduleAppointment");
          break;
        case "Export Health Data": {
          toast.success("Exporting health data...");
          const exportRes = await fetch(
            `${BASE_URL}/caregiver/health-data/export`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (exportRes.ok) {
            const blob = await exportRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `health-data-${new Date()
              .toISOString()
              .split("T")[0]}.csv`;
            a.click();
            toast.success("Health data exported!");
          } else {
            toast.error("Failed to export data");
          }
          break;
        }
        default:
          toast.success(`${actionLabel} feature coming soon!`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to process: ${actionLabel}`;
      toast.error(errorMessage);
    }
  }, [user?.accessToken, openModal]);

  // handleActivityAction - Not currently used, kept for future implementation
  // TODO: Implement activity actions when activity management is fully integrated
  // const handleActivityAction = async (
  //   activityId: number,
  //   action: string
  // ): Promise<void> => {
  //   const token = user?.accessToken;
  //   if (!token) {
  //     toast.error("Authentication required");
  //     return;
  //   }
  //   try {
  //     switch (action) {
  //       case "view": {
  //         const activity = recentActivity.find((a) => a.id === activityId);
  //         if (activity) {
  //           toast.success(
  //             `Activity: ${activity.activity}\nDependent: ${activity.dependent}\nStatus: ${activity.status}`
  //           );
  //         }
  //         break;
  //       }
  //       case "approve":
  //         setRecentActivity((prev) =>
  //           prev.map((a) =>
  //             a.id === activityId ? { ...a, status: "completed" } : a
  //           )
  //         );
  //         toast.success("Activity approved! ✅");
  //         break;
  //       case "alert":
  //         toast.success("Alert created and sent to caregivers! 🔔");
  //         break;
  //       default:
  //         toast.success(`${action} action on activity ${activityId}`);
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : `Failed to ${action} activity`;
  //     toast.error(errorMessage);
  //   }
  // };

  const handleDependentView = useCallback((dependentId: number): void => {
    navigate(`/caregiver/dependents/${dependentId}`);
  }, [navigate]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(query);
    }, 300);
  }, []);

  const handleNotificationClick = useCallback((): void => {
    openModal("viewAllNotifications");
  }, [openModal]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${isDarkMode ? 'from-slate-900 to-slate-800' : 'from-teal-50 to-white'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-14 w-14 border-4 ${isDarkMode ? 'border-slate-700 border-t-teal-500' : 'border-teal-200 border-t-teal-600'} mx-auto mb-4`}></div>
          <p className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>Loading your caregiving dashboard...</p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-teal-500' : 'text-teal-600'}`}>Preparing insights and analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-teal-50 to-white'} p-6`}>
        <div className={`rounded-2xl shadow-xl p-8 max-w-md w-full border-2 ${isDarkMode ? 'bg-slate-800 border-red-900' : 'bg-white border-red-200'}`}>
          <div className={`flex justify-center mb-4 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-full p-4 w-fit mx-auto`}>
            <FaExclamationTriangle className={`text-3xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <h2 className={`text-2xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Failed to Load Dashboard
          </h2>
          <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full mt-3 border-2 border-teal-500 text-teal-600 hover:bg-teal-50 font-semibold py-3 rounded-lg transition-all duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 min-h-screen p-6 ${isDarkMode ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-gradient-to-b from-white to-teal-50'}`}>
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:rounded-lg focus:bg-teal-600 focus:text-white`}
      >
        Skip to main content
      </a>

      {/* Header with Search and Notifications */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4 sm:gap-6 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent mb-2 ${isDarkMode ? 'bg-gradient-to-r from-teal-400 to-cyan-400' : 'bg-gradient-to-r from-teal-600 to-cyan-600'}`}>
              Welcome, {user?.first_name || user?.username || "Caregiver"}! 👋
            </h1>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Manage your dependents and track their wellness in real-time
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <label htmlFor="dashboard-search" className="sr-only">
                Search dependents
              </label>
              <FaSearch className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg pointer-events-none ${isDarkMode ? 'text-teal-500' : 'text-teal-400'}`} />
              <input
                id="dashboard-search"
                type="text"
                placeholder="Search..."
                onChange={handleSearchChange}
                aria-label="Search dependents by name or status"
                aria-describedby="search-hint"
                className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all shadow-sm border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'}`}
              />
              <span id="search-hint" className="sr-only">
                Search for dependents by name, mood, or status
              </span>
            </div>

            <button
              type="button"
              onClick={handleNotificationClick}
              className={`relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-colors cursor-pointer shrink-0 ${isDarkMode ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700' : 'border-teal-200 hover:border-teal-300 hover:bg-teal-50'}`}
              aria-label="View notifications, 3 unread"
              aria-live="polite"
            >
              <FaBell className={`text-lg sm:text-xl ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center" aria-hidden="true">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-700/50 border border-slate-600' : 'bg-teal-50 border border-teal-200'}`} role="group" aria-label="Quick caregiver actions">
          <button
            onClick={() => openModal("addDependent")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all min-h-[44px] sm:min-h-auto ${isDarkMode ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
            aria-label="Add new dependent"
          >
            <FaPlus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Dependent</span>
            <span className="sm:hidden text-xs">Add</span>
          </button>
          <button
            onClick={() => openModal("createTask")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all min-h-[44px] sm:min-h-auto ${isDarkMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
            aria-label="Create new task"
          >
            <FaClipboardList className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden text-xs">Task</span>
          </button>
          <button
            onClick={() => openModal("sendAlert")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all min-h-[44px] sm:min-h-auto ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            aria-label="Send health alert"
          >
            <FaBell className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Send Alert</span>
            <span className="sm:hidden text-xs">Alert</span>
          </button>
          <button
            onClick={() => openModal("scheduleAppointment")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all min-h-[44px] sm:min-h-auto ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            aria-label="Schedule appointment"
          >
            <FaCalendarAlt className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sm:hidden text-xs">Appt</span>
          </button>
        </div>

        {/* Dashboard Tabs - Horizontally Scrollable on Mobile */}
        <nav
          className={`flex gap-2 sm:gap-4 border-b overflow-x-auto overflow-y-hidden pb-0 scrollbar-hide ${isDarkMode ? 'border-slate-600' : 'border-teal-200'}`}
          role="tablist"
          aria-label="Dashboard navigation tabs"
        >
          {[
            { id: "overview", label: "Overview", icon: FaChartLine },
            { id: "messages", label: "Messages", icon: FaComments },
            { id: "dependents", label: "Dependents", icon: FaUserFriends },
            { id: "medications", label: "Medications", icon: FaMedkit },
            { id: "health", label: "Health Metrics", icon: FaHeartbeat },
            { id: "safety", label: "Safety", icon: FaExclamationTriangle },
            { id: "reports", label: "Analytics", icon: FaNotesMedical },
            { id: "summary-reports", label: "Reports", icon: FaDownload },
            { id: "calendar", label: "Calendar", icon: FaCalendarAlt },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-sm md:text-base font-semibold transition-colors flex items-center gap-1 sm:gap-2 border-b-2 cursor-pointer whitespace-nowrap min-h-[44px] ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'text-teal-400 border-teal-400'
                      : 'text-teal-600 border-teal-600'
                    : isDarkMode
                    ? 'text-teal-300 border-transparent hover:text-teal-400'
                    : 'text-teal-700 border-transparent hover:text-teal-600'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <IconComponent className="text-sm sm:text-base" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main id="main-content" role="main">
      {/* Tab Content - Messages */}
      {activeTab === "messages" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <Suspense fallback={<SkeletonLoader type="chart" count={1} />}>
            <CommunicationHub caregiverName="John" />
          </Suspense>
        </div>
      )}

      {/* Tab Content - Overview */}
      {activeTab === "overview" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? (
            <div className="space-y-8">
              <SkeletonLoader type="card" count={4} />
              <SkeletonLoader type="chart" count={1} />
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const IconComponent = s.icon;
              return (
                <div
                  key={idx}
                  className={`group relative shadow-lg hover:shadow-xl rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden ${isDarkMode ? 'bg-slate-700 border-slate-600 hover:border-teal-500' : 'bg-white border-teal-100 hover:border-teal-300'}`}
                >
                  <div
                    className={`absolute inset-0 ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
                  ></div>

                  <div
                    className={`${s.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-teal-100`}
                  >
                    <IconComponent className={`text-2xl ${s.textColor}`} />
                  </div>

                  <div className="relative z-10">
                    <p className={`text-sm font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      {s.title}
                    </p>
                    <div className="flex items-end justify-between mb-2">
                      <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                        {s.value}
                      </p>
                      <span
                        className={`text-sm font-bold ${
                          s.trendUp ? (isDarkMode ? 'text-teal-400' : 'text-teal-600') : 'text-red-500'
                        }`}
                      >
                        {s.change}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.trendUp ? (
                        <FaArrowUp className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                      ) : (
                        <FaExclamationTriangle className="text-red-500 text-xs" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          s.trendUp ? (isDarkMode ? 'text-teal-400' : 'text-teal-600') : 'text-red-600'
                        }`}
                      >
                        {s.trend}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dependents Summary */}
          {dependents.length > 0 && (
            <div className={`shadow-lg rounded-2xl p-6 border mt-8 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-3 rounded-xl shadow-md">
                    <FaUserFriends className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                      Your Dependents
                    </h3>
                    <p className={isDarkMode ? 'text-teal-300 text-sm' : 'text-teal-600 text-sm'}>Quick status overview</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("dependents")}
                  className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-teal-400 hover:text-teal-300 hover:bg-slate-600' : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'}`}
                >
                  View All <FaChevronRight />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dependents.slice(0, 6).map((dependent) => (
                  <div
                    key={dependent.id}
                    className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-600 border-slate-500 hover:border-teal-500 hover:shadow-md' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100 hover:border-teal-300 hover:shadow-md'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-200'}`}>
                          <FaUserFriends className={isDarkMode ? 'text-teal-400 text-lg' : 'text-teal-600 text-lg'} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white group-hover:text-teal-300' : 'text-teal-900 group-hover:text-teal-700'}`}>
                            {dependent.name}
                          </h4>
                          <p className={isDarkMode ? 'text-teal-300 text-xs' : 'text-teal-500 text-xs'}>
                            {dependent.age ? `Age ${dependent.age}` : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          dependent.status === "stable"
                            ? isDarkMode ? 'bg-teal-500' : 'bg-teal-600'
                            : dependent.status === "needs_attention"
                            ? "bg-amber-500"
                            : isDarkMode ? 'bg-slate-500' : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-teal-300' : 'text-teal-600'}>Mood:</span>
                        <span className={`font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                          {dependent.mood || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-teal-300' : 'text-teal-600'}>Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            dependent.status === "stable"
                              ? isDarkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'
                              : dependent.status === "needs_attention"
                              ? isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                              : isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {dependent.status === "stable"
                            ? "Stable"
                            : dependent.status === "needs_attention"
                            ? "Needs Attention"
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      )}

      {/* Tab Content - Dependents */}
      {activeTab === "dependents" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className={`lg:col-span-2 shadow-lg rounded-2xl p-4 sm:p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md">
                    <FaUserFriends className="text-white text-base sm:text-lg" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                      Your Dependents
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                      All active dependents under your care
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {paginatedDependents.length > 0 ? (
                  paginatedDependents.map((dependent) => (
                    <div
                      key={dependent.id}
                      className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-600 hover:bg-slate-600/80 border-slate-500 hover:border-slate-400' : 'bg-teal-50 hover:bg-teal-100 border-teal-100 hover:border-teal-300'}`}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 flex-1">
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br rounded-lg sm:rounded-xl flex items-center justify-center border ${isDarkMode ? 'from-slate-500 to-slate-400 border-slate-400' : 'from-teal-100 to-cyan-100 border-teal-200'}`}>
                            <FaUserFriends className={`text-base sm:text-xl ${isDarkMode ? 'text-white' : 'text-teal-600'}`} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-semibold group-hover:text-opacity-80 flex items-center gap-2 flex-wrap ${isDarkMode ? 'text-white group-hover:text-teal-300' : 'text-teal-900 group-hover:text-teal-700'}`}>
                            {dependent.name}
                            {dependent.is_verified && (
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                <FaCheckCircle className="text-xs" /> Verified
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm flex-wrap">
                            <span className={isDarkMode ? 'text-teal-300' : 'text-teal-600'}>
                              Mood: {dependent.mood}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <span className={`text-xs sm:text-sm whitespace-nowrap ${isDarkMode ? 'text-teal-300' : 'text-teal-500'}`}>
                          Checked: {dependent.lastCheck}
                        </span>
                        <button
                          type="button"
                          onClick={() => openChatModal(dependent)}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer min-h-[44px] sm:min-h-auto flex items-center justify-center ${isDarkMode ? 'hover:bg-slate-500' : 'hover:bg-teal-200'}`}
                        >
                          <FaComments className={`text-base sm:text-lg ${isDarkMode ? 'text-teal-300 hover:text-teal-200' : 'text-teal-400 hover:text-teal-600'}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDependentView(dependent.id)}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer min-h-[44px] sm:min-h-auto flex items-center justify-center ${isDarkMode ? 'hover:bg-slate-500' : 'hover:bg-teal-200'}`}
                        >
                          <FaEye className={`text-base sm:text-lg ${isDarkMode ? 'text-teal-300 hover:text-teal-200' : 'text-teal-400 hover:text-teal-600'}`} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                    <p className="text-sm">No dependents match your search</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={`shadow-lg rounded-2xl p-4 sm:p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md">
                  <FaPlus className="text-white text-base sm:text-lg" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    Quick Actions
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                    Manage your caregiving tasks
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: FaUserFriends,
                    label: "Add New Dependent",
                    color:
                      "bg-gradient-to-br from-teal-500 to-cyan-500",
                  },
                  {
                    icon: FaClipboardList,
                    label: "Create Task List",
                    color:
                      "bg-gradient-to-br from-teal-400 to-cyan-400",
                  },
                  {
                    icon: FaBell,
                    label: "Send Health Alert",
                    color:
                      "bg-gradient-to-br from-teal-600 to-cyan-600",
                  },
                  {
                    icon: FaNotesMedical,
                    label: "Generate Report",
                    color:
                      "bg-gradient-to-br from-teal-500 to-cyan-500",
                  },
                  {
                    icon: FaCalendarAlt,
                    label: "Schedule Appointment",
                    color:
                      "bg-gradient-to-br from-teal-400 to-cyan-400",
                  },
                  {
                    icon: FaDownload,
                    label: "Export Health Data",
                    color:
                      "bg-gradient-to-br from-teal-600 to-cyan-600",
                  },
                ].map((action, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleQuickAction(action.label)}
                    className={`group/btn w-full flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-300 cursor-pointer min-h-[44px] sm:min-h-auto ${isDarkMode ? 'border-slate-600 hover:border-slate-500 hover:shadow-md hover:bg-slate-600' : 'border-teal-100 hover:border-teal-300 hover:shadow-md hover:bg-teal-50'}`}
                  >
                    <div className={`${action.color} p-2 sm:p-3 rounded-lg shadow-sm flex-shrink-0`}>
                      <action.icon className={`text-white text-base sm:text-lg`} />
                    </div>
                    <span className={`font-medium group-hover/btn:opacity-80 flex-1 text-left text-xs sm:text-base ${isDarkMode ? 'text-teal-300 group-hover/btn:text-teal-200' : 'text-teal-700 group-hover/btn:text-teal-900'}`}>
                      {action.label}
                    </span>
                    <FaChevronRight className={`flex-shrink-0 text-xs sm:text-base ${isDarkMode ? 'text-teal-400 group-hover/btn:text-teal-300' : 'text-teal-400 group-hover/btn:text-teal-600'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Tab Content - Medications */}
      {activeTab === "medications" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? <SkeletonLoader type="chart" count={1} /> : (
            <Suspense fallback={<SkeletonLoader type="chart" count={1} />}>
              <MedicationAdherenceTracker />
            </Suspense>
          )}
        </div>
      )}

      {/* Tab Content - Safety */}
      {activeTab === "safety" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <Suspense fallback={<SkeletonLoader type="chart" count={1} />}>
            <EmergencySafety dependentName="John Smith" />
          </Suspense>
        </div>
      )}

      {/* Tab Content - Health Metrics */}
      {activeTab === "health" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? (
            <div className="space-y-8">
              <SkeletonLoader type="chart" count={1} />
              <SkeletonLoader type="table" count={5} />
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Vital Signs Trend Chart */}
            <div className={`lg:col-span-2 shadow-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    Vital Signs Trends
                  </h3>
                  <p className={isDarkMode ? 'text-teal-300 text-sm' : 'text-teal-600 text-sm'}>
                    21-day heart rate monitoring
                  </p>
                </div>
                <FaHeartbeat className={`text-2xl ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={medicationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e5e7eb'} />
                    <XAxis dataKey="time" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                    <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="completed" name="Normal Range" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="missed" name="Actual Reading" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Status Indicators */}
            <div className={`shadow-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                Health Status
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-emerald-900/30 border-emerald-500' : 'bg-emerald-50 border-emerald-500'}`}>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    All Dependents
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                    ✓ Healthy
                  </p>
                </div>
                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-500'}`}>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Last Update
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    Just now
                  </p>
                </div>
                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-500'}`}>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Risk Level
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                    Low
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Vital Signs by Dependent */}
          <div className="space-y-6">
            {dependents.map((dependent) => (
              <div key={dependent.id} className={`shadow-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                      {dependent.name}
                    </h4>
                    <p className={isDarkMode ? 'text-teal-300 text-sm' : 'text-teal-600 text-sm'}>
                      Complete vital signs profile
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isDarkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                    Stable
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Heart Rate", value: "72", unit: "bpm", normal: true },
                    { label: "Blood Pressure", value: "120/80", unit: "mmHg", normal: true },
                    { label: "Temperature", value: "98.6", unit: "°F", normal: true },
                    { label: "Oxygen Level", value: "98", unit: "%", normal: true },
                    { label: "Blood Sugar", value: "98", unit: "mg/dl", normal: true },
                    { label: "Weight", value: "165", unit: "lbs", normal: true },
                  ].map((metric, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border text-center ${isDarkMode ? (metric.normal ? 'bg-slate-600 border-slate-500' : 'bg-red-900/30 border-red-500') : (metric.normal ? 'bg-teal-50 border-teal-100' : 'bg-red-50 border-red-200')}`}>
                      <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                        {metric.label}
                      </p>
                      <p className={`text-lg sm:text-xl font-bold ${isDarkMode ? (metric.normal ? 'text-white' : 'text-red-300') : (metric.normal ? 'text-teal-900' : 'text-red-700')}`}>
                        {metric.value}
                      </p>
                      <p className={`text-xs ${isDarkMode ? (metric.normal ? 'text-teal-400' : 'text-red-400') : (metric.normal ? 'text-teal-600' : 'text-red-600')}`}>
                        {metric.unit}
                      </p>
                      {metric.normal && <p className="text-xs text-emerald-500 mt-1">✓ Normal</p>}
                    </div>
                  ))}
                </div>

                {/* Additional Risk Assessment */}
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="flex items-center justify-between">
                    <span className={isDarkMode ? 'text-teal-300 text-sm' : 'text-teal-700 text-sm'}>
                      Last Sync: 2 minutes ago
                    </span>
                    <button className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${isDarkMode ? 'hover:bg-slate-600 text-teal-400 hover:text-teal-300' : 'hover:bg-teal-50 text-teal-600 hover:text-teal-700'}`}>
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Tab Content - Summary Reports */}
      {activeTab === "summary-reports" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? <SkeletonLoader type="chart" count={1} /> : (
            <Suspense fallback={<SkeletonLoader type="chart" count={1} />}>
              <ReportGenerator />
            </Suspense>
          )}
        </div>
      )}

      {/* Tab Content - Calendar */}
      {activeTab === "calendar" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? <SkeletonLoader type="chart" count={1} /> : (
            <Suspense fallback={<SkeletonLoader type="chart" count={1} />}>
              <CalendarView />
            </Suspense>
          )}
        </div>
      )}

      {/* Tab Content - Reports (Analytics) */}
      {activeTab === "reports" && (
        <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {loading ? (
            <div className="space-y-8">
              <SkeletonLoader type="card" count={4} />
              <SkeletonLoader type="chart" count={2} />
            </div>
          ) : (
          <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-teal-50 border-teal-200'}`}>
              <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Avg Mood Score
              </p>
              <p className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                8.2/10
              </p>
              <p className="text-xs text-emerald-500 mt-1">↑ +0.5 from last week</p>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Medication Adherence
              </p>
              <p className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                94%
              </p>
              <p className="text-xs text-emerald-500 mt-1">↑ +2% from last week</p>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                Task Completion
              </p>
              <p className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-amber-900'}`}>
                87%
              </p>
              <p className="text-xs text-red-500 mt-1">↓ -1% from last week</p>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-purple-50 border-purple-200'}`}>
              <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                Health Score
              </p>
              <p className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                86%
              </p>
              <p className="text-xs text-emerald-500 mt-1">↑ +3% from last week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Mood Trends */}
            <div className={`shadow-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    Mood Trends
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>Weekly emotional patterns</p>
                </div>
                <FaSmileBeam className={`text-xl sm:text-2xl ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              </div>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} tick={{ fontSize: 12 }} />
                    <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="positive"
                      name="Positive"
                      stroke={moodColors.positive}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="neutral"
                      name="Neutral"
                      stroke={moodColors.neutral}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="negative"
                      name="Negative"
                      stroke={moodColors.negative}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Insights */}
            <div className={`shadow-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                Key Insights
              </h3>

              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-emerald-900/30 border-emerald-500' : 'bg-emerald-50 border-emerald-500'}`}>
                  <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    ✓ Improving Mood Trend
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Positive mood increased by 18% this week
                  </p>
                </div>

                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-500'}`}>
                  <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    ✓ High Medication Adherence
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    All dependents exceeding 90% adherence target
                  </p>
                </div>

                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-amber-900/30 border-amber-500' : 'bg-amber-50 border-amber-500'}`}>
                  <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                    ⚠ Task Completion Dip
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    Follow-up on pending tasks needed for 3 dependents
                  </p>
                </div>

                <div className={`p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-500'}`}>
                  <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    📊 Overall Health Stable
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    No concerning vital sign changes detected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Medication Adherence Chart */}
          <div className={`shadow-lg rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                  Medication Adherence Details
                </h3>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                  Daily completion rates across all dependents - Last 14 days
                </p>
              </div>
              <FaMedkit className={`text-xl sm:text-2xl ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
            </div>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medicationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e5e7eb'} />
                  <XAxis dataKey="time" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} tick={{ fontSize: 12 }} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missed" name="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </>
          )}
        </div>
      )}
      </main>

      {/* Modals */}
      <AddDependentModal
        isOpen={modals.addDependent}
        onClose={() => closeModal("addDependent")}
      />
      <CreateTaskModal
        isOpen={modals.createTask}
        onClose={() => closeModal("createTask")}
      />
      <SendAlertModal
        isOpen={modals.sendAlert}
        onClose={() => closeModal("sendAlert")}
      />
      <ScheduleAppointmentModal
        isOpen={modals.scheduleAppointment}
        onClose={() => closeModal("scheduleAppointment")}
      />
      <CaregiverChatModal
        isOpen={modals.chat}
        onClose={() => closeModal("chat")}
        dependent={selectedDependentForChat}
      />
      <NotificationsModal
        isOpen={modals.viewAllNotifications}
        onClose={() => closeModal("viewAllNotifications")}
      />
    </div>
  );
}

export default function CaregiverDashboardWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <CaregiverDashboard />
    </ErrorBoundary>
  );
}
