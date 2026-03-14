import React, { useState, useRef } from "react";
import moment from "moment-timezone";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaClock, FaBell, FaTimes, FaCalendar, FaHome, FaBook, FaCalendarAlt, FaCommentAlt, FaUsers, FaCog, FaArrowLeft, FaComments } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  useGetRemindersQuery,
  useAddReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} from "@/app/remindersApi";
import Footer from "@/components/Footer";

const sidebarLinks = [
  { icon: <FaHome />, label: 'Dashboard', to: '/easebrain/dashboard' },
  { icon: <FaBook />, label: 'Notes', to: '/easebrain/notes' },
  { icon: <FaCalendarAlt />, label: 'Reminders', to: '/easebrain/reminders' },
  { icon: <FaCommentAlt />, label: 'Messages', to: '/easebrain/messages' },
  { icon: <FaUsers />, label: 'Community', to: '/easebrain/community' },
  { icon: <FaCog />, label: 'Settings', to: '/easebrain/settings' },

];

export default function Reminders() {
  const notifiedIds = useRef(new Set());
  const { data: remindersRaw, refetch, isLoading, isError: _isError } = useGetRemindersQuery();
  const reminders = Array.isArray(remindersRaw) ? remindersRaw : (remindersRaw?.length ? remindersRaw : []);
  const [addReminder, { isLoading: isAdding }] = useAddReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();
  const [deleteReminder, { isLoading: _isDeleting }] = useDeleteReminderMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed
  const [sortBy, setSortBy] = useState("date"); // date or priority
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userTz = moment.tz.guess();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    remind_at: '',
    notification_email: true,
    notification_sms: false,
    notification_push: false,
    priority: 'medium', // low, medium, high
    timezone: userTz,
  });

  // In-app notification logic
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const interval = setInterval(() => {
      const now = moment();
      reminders.forEach(reminder => {
        if (reminder.done) return;
        if (!reminder.remind_at) return;
        const remindAt = moment.tz(reminder.remind_at, reminder.timezone || moment.tz.guess());
        if (
          Math.abs(remindAt.diff(now, 'minutes')) < 1 &&
          !notifiedIds.current.has(reminder.id)
        ) {
          if (Notification.permission === "granted") {
            new Notification(`Reminder: ${reminder.title}`, {
              body: reminder.description || "You have a reminder.",
            });
            notifiedIds.current.add(reminder.id);
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenModal = (reminderToEdit = null) => {
    if (reminderToEdit) {
      setEditingId(reminderToEdit.id);
      setFormData({
        title: reminderToEdit.title,
        description: reminderToEdit.description,
        remind_at: reminderToEdit.remind_at,
        notification_email: reminderToEdit.notification_email,
        notification_sms: reminderToEdit.notification_sms,
        notification_push: reminderToEdit.notification_push,
        priority: reminderToEdit.priority || 'medium',
        timezone: reminderToEdit.timezone || userTz,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        remind_at: '',
        notification_email: true,
        notification_sms: false,
        notification_push: false,
        priority: 'medium',
        timezone: userTz,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      remind_at: '',
      notification_email: true,
      notification_sms: false,
      notification_push: false,
      priority: 'medium',
      timezone: userTz,
    });
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.remind_at) {
      setFeedback("Title and reminder date/time are required");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
      return;
    }

    try {
      if (editingId) {
        await updateReminder({ id: editingId, ...formData }).unwrap();
        setFeedback("Reminder updated successfully! ✓");
      } else {
        await addReminder(formData).unwrap();
        setFeedback("Reminder created successfully! ✓");
      }
      setFeedbackType("success");
      handleCloseModal();
      refetch();
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback(editingId ? "Failed to update reminder" : "Failed to create reminder");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleMarkDone = async (id, done) => {
    try {
      await updateReminder({ id, done }).unwrap();
      setFeedback(!done ? "Reminder marked as done ✓" : "Reminder marked as pending ✓");
      setFeedbackType("success");
      refetch();
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Failed to update reminder");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      try {
        await deleteReminder(id).unwrap();
        setFeedback("Reminder deleted ✓");
        setFeedbackType("success");
        refetch();
        setTimeout(() => setFeedback(""), 3000);
      } catch {
        setFeedback("Failed to delete reminder");
        setFeedbackType("error");
        setTimeout(() => setFeedback(""), 3000);
      }
    }
  };

  // Filter and sort reminders
  const filteredReminders = reminders.filter(r => {
    if (filter === "completed") return r.done;
    if (filter === "upcoming") return !r.done;
    return true;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.remind_at) - new Date(b.remind_at);
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    }
    return 0;
  });

  const priorityColors = {
    high: "bg-red-100 text-red-700 border-l-4 border-red-500",
    medium: "bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500",
    low: "bg-green-100 text-green-700 border-l-4 border-green-500"
  };

  return (
    <>
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-teal-900 dark:bg-slate-950 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-teal-700 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {!collapsed && <span className="text-2xl font-extrabold dark:text-teal-300">Ease Brain</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map(link => {
            const isActiveBase = location.pathname.startsWith(link.to);
            const isExact = location.pathname === link.to;
            return (
              <li
                key={link.label}
                className={`px-6 py-3 flex items-center gap-3 text-lg font-medium cursor-pointer transition-colors duration-150 rounded-lg ${isActiveBase ? 'bg-teal-800 dark:bg-teal-700 text-yellow-300' : 'hover:bg-teal-700 dark:hover:bg-slate-800'}`}
                title={collapsed ? link.label : ""}
              >
                <Link to={link.to} className="flex items-center gap-3 w-full">
                  <span className="inline-block w-6 text-center text-xl flex-shrink-0">
                    {link.icon}
                  </span>
                  {!collapsed && link.label}
                </Link>
                {!collapsed && isActiveBase && !isExact && (
                  <button
                    className="ml-2 text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800"
                    onClick={() => navigate(link.to)}
                    aria-label={`Back to ${link.label}`}
                    title={`Back to ${link.label}`}
                  >
                    <FaArrowLeft />
                  </button>
                )}
              </li>
            );
          })}
        </nav>
        <div className={`px-6 py-4 text-xs text-gray-300 dark:text-gray-500 ${collapsed ? 'hidden' : ''}`}>© 2025 Ease Brain. All rights reserved.</div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold text-teal-900">Reminders</h1>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <FaPlus /> New Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto">
            {/* Filters & Sort */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    filter === "all"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("upcoming")}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    filter === "upcoming"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    filter === "completed"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 flex-1 overflow-y-auto">
          {/* Feedback Messages */}
          {feedback && (
            <div className={`fixed top-40 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
              feedbackType === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}>
              {feedbackType === "success" ? <FaCheck /> : "⚠"}
              {feedback}
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border-3 border-teal-400 border-t-transparent animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your reminders...</p>
              </div>
            )}

            {/* Error State */}
            {_isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
                <p className="font-semibold">Failed to load reminders</p>
              </div>
            )}

            {/* Reminders List */}
            {!isLoading && !_isError && (
              <>
                {sortedReminders.length > 0 ? (
                  <div className="space-y-4">
                    {sortedReminders.map(reminder => {
                      const remindAt = moment(reminder.remind_at);
                      const now = moment();
                      const isOverdue = remindAt.isBefore(now) && !reminder.done;
                      const daysUntil = remindAt.diff(now, 'days');

                      return (
                        <div
                          key={reminder.id}
                          className={`rounded-lg shadow-sm border-l-4 p-6 transition-all hover:shadow-md ${
                            reminder.done
                              ? "bg-gray-50 opacity-60"
                              : isOverdue
                              ? "bg-red-50 border-l-red-500"
                              : priorityColors[reminder.priority] || priorityColors.medium
                          } ${reminder.done ? "line-through" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Title & Description */}
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => handleMarkDone(reminder.id, reminder.done)}
                                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    reminder.done
                                      ? "bg-teal-600 border-teal-600"
                                      : "border-gray-400 hover:border-teal-600"
                                  }`}
                                  title={reminder.done ? "Mark as pending" : "Mark as done"}
                                >
                                  {reminder.done && <FaCheck className="text-white text-sm" />}
                                </button>
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg text-gray-900">{reminder.title}</h3>
                                  {reminder.description && (
                                    <p className="text-gray-700 text-sm mt-1">{reminder.description}</p>
                                  )}
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <FaClock className="w-4 h-4" />
                                  {remindAt.format('MMM DD, YYYY [at] h:mm A')}
                                </div>
                                {!reminder.done && (
                                  <div className={`font-semibold ${isOverdue ? "text-red-600" : "text-orange-600"}`}>
                                    {isOverdue ? "OVERDUE" : daysUntil === 0 ? "TODAY" : `In ${daysUntil} days`}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <FaBell className="w-4 h-4" />
                                  {[reminder.notification_email && "Email", reminder.notification_sms && "SMS", reminder.notification_push && "Push"]
                                    .filter(Boolean)
                                    .join(", ") || "No notifications"}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 ml-4 flex-shrink-0">
                              <button
                                onClick={() => handleOpenModal(reminder)}
                                className="text-teal-600 hover:text-teal-700 font-semibold p-2 hover:bg-teal-50 rounded transition"
                                title="Edit reminder"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(reminder.id)}
                                className="text-red-600 hover:text-red-700 font-semibold p-2 hover:bg-red-50 rounded transition"
                                title="Delete reminder"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No reminders {filter !== "all" ? `(${filter})` : ""}</h3>
                    <p className="text-gray-600 mb-6">
                      {filter === "all" ? "Create your first reminder to get started" : "Try a different filter"}
                    </p>
                    {filter === "all" && (
                      <button
                        onClick={() => handleOpenModal()}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <FaPlus /> Create a Reminder
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal for Create/Edit Reminder */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-teal-50 to-green-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0">
                  <h2 className="text-2xl font-bold text-teal-900">
                    {editingId ? "Edit Reminder" : "Create New Reminder"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSaveReminder} className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Reminder title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                      disabled={isAdding || isUpdating}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add any details about this reminder"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                      disabled={isAdding || isUpdating}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date & Time */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Remind me on <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="remind_at"
                        value={formData.remind_at}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        disabled={isAdding || isUpdating}
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        disabled={isAdding || isUpdating}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition max-h-64"
                      disabled={isAdding || isUpdating}
                    >
                      {moment.tz.names().map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      How would you like to be notified?
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          name="notification_email"
                          checked={formData.notification_email}
                          onChange={handleChange}
                          disabled={isAdding || isUpdating}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-gray-700">Email notification</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          name="notification_sms"
                          checked={formData.notification_sms}
                          onChange={handleChange}
                          disabled={isAdding || isUpdating}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-gray-700">SMS notification</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          name="notification_push"
                          checked={formData.notification_push}
                          onChange={handleChange}
                          disabled={isAdding || isUpdating}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-gray-700">Browser push notification</span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                      disabled={isAdding || isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={isAdding || isUpdating}
                    >
                      {isAdding || isUpdating ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          {editingId ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <FaCheck /> {editingId ? "Update Reminder" : "Create Reminder"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
