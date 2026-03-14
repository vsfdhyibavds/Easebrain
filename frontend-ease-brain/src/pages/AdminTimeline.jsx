import React, { useState } from "react";
import { FaArrowLeft, FaClock, FaSearch, FaFilter, FaExclamationTriangle, FaUser, FaComments, FaFlag, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from "react-icons/fa";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { Toaster } from "react-hot-toast";

const AdminTimeline = () => {
  const navigate = useNavigate();
  const { user, accessToken, isTokenExpired } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock timeline data - replace with real API calls
  const [events] = useState([
    {
      id: 1,
      type: "detection",
      severity: "critical",
      title: "Critical Danger Detection",
      description: 'Message containing "suicidal ideation" detected',
      user: { name: "Jane Doe", avatar: "JD", color: "teal" },
      timestamp: new Date(Date.now() - 5 * 60000), // 5 mins ago
      action: "flagged",
      metadata: { confidence: 0.95, category: "suicidal_ideation" }
    },
    {
      id: 2,
      type: "moderation",
      severity: "high",
      title: "Report Approved",
      description: "Content moderation report #2451 approved and removed",
      user: { name: "Admin User", avatar: "AU", color: "cyan" },
      timestamp: new Date(Date.now() - 15 * 60000),
      action: "approved",
      metadata: { reportId: 2451 }
    },
    {
      id: 3,
      type: "detection",
      severity: "high",
      title: "High Risk Detection",
      description: "Message with self-harm indicators detected",
      user: { name: "John Smith", avatar: "JS", color: "orange" },
      timestamp: new Date(Date.now() - 30 * 60000),
      action: "flagged",
      metadata: { confidence: 0.72, category: "self_harm" }
    },
    {
      id: 4,
      type: "user_action",
      severity: "low",
      title: "User Settings Changed",
      description: "User updated notification preferences",
      user: { name: "Sarah Johnson", avatar: "SJ", color: "purple" },
      timestamp: new Date(Date.now() - 45 * 60000),
      action: "modified",
      metadata: { setting: "notifications" }
    },
    {
      id: 5,
      type: "moderation",
      severity: "medium",
      title: "Report Escalated",
      description: "Report #2449 escalated to supervisor review",
      user: { name: "Moderator One", avatar: "MO", color: "indigo" },
      timestamp: new Date(Date.now() - 60 * 60000),
      action: "escalated",
      metadata: { reportId: 2449 }
    },
    {
      id: 6,
      type: "detection",
      severity: "medium",
      title: "Medium Risk Detection",
      description: "Crisis indicators detected in conversation",
      user: { name: "Mike Chen", avatar: "MC", color: "blue" },
      timestamp: new Date(Date.now() - 90 * 60000),
      action: "flagged",
      metadata: { confidence: 0.58, category: "crisis" }
    },
    {
      id: 7,
      type: "system",
      severity: "low",
      title: "System Update",
      description: "Danger detector rules updated",
      user: { name: "System", avatar: "SYS", color: "gray" },
      timestamp: new Date(Date.now() - 120 * 60000),
      action: "updated",
      metadata: { version: "2.1.0" }
    }
  ]);

  // Check auth
  let storedToken = null;
  let storedUser = null;
  try {
    if (typeof window !== "undefined") {
      storedToken = localStorage.getItem("access_token");
      const raw = localStorage.getItem("user");
      storedUser = raw ? JSON.parse(raw) : null;
    }
  } catch {
    // ignore
  }

  const hasValidToken = storedToken ? !isTokenExpired(storedToken) : (accessToken && !isTokenExpired(accessToken));
  const isAuthenticated = Boolean((user && hasValidToken) || (storedUser && hasValidToken));

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || event.type === filterType;
    const matchesSeverity = filterSeverity === "all" || event.severity === filterSeverity;

    let matchesDate = true;
    if (filterDateRange !== "all") {
      const eventTime = event.timestamp.getTime();
      const now = Date.now();
      switch(filterDateRange) {
        case "1h":
          matchesDate = now - eventTime < 60 * 60 * 1000;
          break;
        case "24h":
          matchesDate = now - eventTime < 24 * 60 * 60 * 1000;
          break;
        case "7d":
          matchesDate = now - eventTime < 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesType && matchesSeverity && matchesDate;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "critical": return "from-red-500 to-orange-500";
      case "high": return "from-orange-500 to-yellow-500";
      case "medium": return "from-yellow-500 to-amber-500";
      case "low": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  const getSeverityLabel = (severity) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "detection": return FaExclamationTriangle;
      case "moderation": return FaFlag;
      case "user_action": return FaUser;
      case "system": return FaClock;
      default: return FaComments;
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case "approved": return FaCheckCircle;
      case "rejected": return FaTimesCircle;
      default: return FaComments;
    }
  };

  const formatTime = (date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className={`sticky top-0 z-40 border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-3 rounded-xl">
                  <FaClock className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Activity Timeline</h1>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Real-time detection and moderation history</p>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium">Dark Mode</span>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleDarkMode}
                className="w-4 h-4"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className={`p-6 rounded-xl border mb-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FaFilter className="text-teal-500" />
            Filters & Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className={`absolute left-3 top-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Types</option>
                <option value="detection">Detections</option>
                <option value="moderation">Moderation</option>
                <option value="user_action">User Actions</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <select
                value={filterSeverity}
                onChange={(e) => {
                  setFilterSeverity(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select
                value={filterDateRange}
                onChange={(e) => {
                  setFilterDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Time</option>
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Showing <span className="font-semibold text-teal-500">{paginatedEvents.length}</span> of <span className="font-semibold text-teal-500">{filteredEvents.length}</span> events
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {paginatedEvents.length > 0 ? (
            paginatedEvents.map((event, index) => {
              const TypeIcon = getTypeIcon(event.type);
              const ActionIcon = getActionIcon(event.action);

              return (
                <div
                  key={event.id}
                  className={`p-5 rounded-xl border transition-all hover:shadow-lg ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-teal-700'
                      : 'bg-white border-gray-200 hover:border-teal-500'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getSeverityColor(event.severity)} flex items-center justify-center text-white shadow-lg`}>
                        <TypeIcon className="text-sm" />
                      </div>
                      {index < paginatedEvents.length - 1 && (
                        <div className={`w-0.5 h-12 mt-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`} />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{event.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getSeverityColor(event.severity)} text-white`}>
                              {getSeverityLabel(event.severity)}
                            </span>
                          </div>
                          <p className={`mb-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            {event.description}
                          </p>

                          {/* User & Metadata */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${event.user.color}-400 to-${event.user.color}-600 flex items-center justify-center text-white text-xs font-bold`}>
                                {event.user.avatar}
                              </div>
                              <span className="text-sm font-medium">{event.user.name}</span>
                            </div>

                            {event.metadata && (
                              <div className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                {event.type === "detection" && `${Math.round(event.metadata.confidence * 100)}% confidence`}
                                {event.type === "moderation" && `Report #${event.metadata.reportId}`}
                                {event.type === "system" && `v${event.metadata.version}`}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamp & Action */}
                        <div className="text-right">
                          <div className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            <FaClock className="text-xs" />
                            {formatTime(event.timestamp)}
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <ActionIcon className="text-teal-500" />
                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                              {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`text-center py-12 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>No events found</p>
              <p className={isDarkMode ? 'text-slate-500' : 'text-gray-500'}>Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTimeline;
