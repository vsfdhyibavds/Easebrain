import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUserCircle, FaBell, FaPalette, FaCheck, FaExclamationCircle, FaHome, FaBook, FaCalendarAlt, FaCommentAlt, FaUsers, FaCog, FaArrowLeft, FaComments, FaSignOutAlt } from "react-icons/fa";
import Footer from '@/components/Footer';
import {
  useGetSettingsQuery,
  useUpdateProfileMutation,
  useUpdateNotificationsMutation,
} from "../app/settingsApi";

const sidebarLinks = [
  { icon: <FaHome />, label: 'Dashboard', to: '/easebrain/dashboard' },
  { icon: <FaBook />, label: 'Notes', to: '/easebrain/notes' },
  { icon: <FaCalendarAlt />, label: 'Reminders', to: '/easebrain/reminders' },
  { icon: <FaCommentAlt />, label: 'Messages', to: '/easebrain/messages' },
  { icon: <FaUsers />, label: 'Community', to: '/easebrain/community' },
  { icon: <FaCog />, label: 'Settings', to: '/easebrain/settings' },
];

export default function Settings() {
  const { data: settings, isLoading, isError: _isError, refetch } = useGetSettingsQuery();
  const _safeSettings = settings || {};
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateNotifications, { isLoading: isUpdatingNotifications }] = useUpdateNotificationsMutation();
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", timezone: "" });
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [currentTheme, setCurrentTheme] = useState("light");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Apply theme to document
  const applyTheme = (themeValue) => {
    if (themeValue === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0f172a";
      document.body.style.color = "#f1f5f9";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#1f2937";
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!settings) return;
    const newProfile = {
      name: settings.name || "",
      email: settings.email || "",
      phone: settings.phone || "",
      timezone: settings.timezone || "",
    };
    const newNotifications = {
      email: settings.notifications?.email ?? true,
      sms: settings.notifications?.sms ?? false,
      push: settings.notifications?.push ?? true,
    };
    const newTheme = settings.theme || "light";
    if (
      JSON.stringify(profile) !== JSON.stringify(newProfile) ||
      JSON.stringify(notifications) !== JSON.stringify(newNotifications) ||
      currentTheme !== newTheme
    ) {
      setProfile(newProfile);
      setNotifications(newNotifications);
      setCurrentTheme(newTheme);
      applyTheme(newTheme);
    }
  }, [settings]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleNotificationsChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handleThemeChange = (themeValue) => {
    setCurrentTheme(themeValue);
    localStorage.setItem("theme", themeValue);
    applyTheme(themeValue);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile).unwrap();
      setFeedback("Profile updated successfully!");
      setFeedbackType("success");
      refetch();
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Failed to update profile. Please try again.");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateNotifications(notifications).unwrap();
      setFeedback("Notification preferences updated!");
      setFeedbackType("success");
      refetch();
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Failed to update notifications. Please try again.");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleLogout = () => {
    // Clear all login data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("pending_email");
    localStorage.removeItem("pending_role_type");
    localStorage.removeItem("verification_token");
    localStorage.removeItem("redirectAfterLogin");
    localStorage.removeItem("theme");

    // Clear sessionStorage
    sessionStorage.clear();

    // Redirect to signin
    window.location.href = "/signin";
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
        <div className="bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-teal-900 dark:text-teal-300 mb-2">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and notification settings</p>
            </div>

        {/* Status Messages */}
        {isLoading && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-blue-400 dark:border-blue-300 border-t-transparent animate-spin"></div>
            <span className="text-blue-800 dark:text-blue-200 font-medium">Loading settings...</span>
          </div>
        )}
        {_isError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
            <FaExclamationCircle className="text-red-600 dark:text-red-300 text-xl" />
            <span className="text-red-800 dark:text-red-200 font-medium">Error loading settings.</span>
          </div>
        )}
        {feedback && (
          <div className={`mb-6 border rounded-lg p-4 flex items-center gap-3 ${
            feedbackType === "success"
              ? "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700"
          }`}>
            {feedbackType === "success" ? (
              <FaCheck className="text-green-600 dark:text-green-300 text-xl" />
            ) : (
              <FaExclamationCircle className="text-red-600 dark:text-red-300 text-xl" />
            )}
            <span className={`font-medium ${
              feedbackType === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
            }`}>
              {feedback}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-4 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "profile"
                ? "text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            <FaUserCircle /> Profile
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-4 px-4 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "notifications"
                ? "text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            <FaBell /> Notifications
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`pb-4 px-4 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "theme"
                ? "text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            <FaPalette /> Theme
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-4 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "security"
                ? "text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            <FaSignOutAlt /> Security & Account
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900 p-8">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-300 mb-6 flex items-center gap-3">
              <div className="bg-teal-100 dark:bg-teal-900 rounded-full p-3">
                <FaUserCircle className="text-teal-600 dark:text-teal-400 text-2xl" />
              </div>
              Profile Information
            </h2>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  disabled={isUpdatingProfile}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  disabled={isUpdatingProfile}
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  disabled={isUpdatingProfile}
                />
              </div>

              {/* Timezone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                <select
                  name="timezone"
                  value={profile.timezone}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  disabled={isUpdatingProfile}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST (Eastern)</option>
                  <option value="CST">CST (Central)</option>
                  <option value="MST">MST (Mountain)</option>
                  <option value="PST">PST (Pacific)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdatingProfile ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </button>
              <button
                type="button"
                onClick={() => setProfile(profile)}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <form onSubmit={handleNotificationsSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900 p-8">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-300 mb-6 flex items-center gap-3">
              <div className="bg-teal-100 dark:bg-teal-900 rounded-full p-3">
                <FaBell className="text-teal-600 dark:text-teal-400 text-2xl" />
              </div>
              Notification Preferences
            </h2>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-teal-200 dark:hover:border-teal-800 transition">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates and alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="email"
                    checked={notifications.email}
                    onChange={handleNotificationsChange}
                    disabled={isUpdatingNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-teal-200 dark:hover:border-teal-800 transition">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">SMS Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get text messages for urgent reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="sms"
                    checked={notifications.sms}
                    onChange={handleNotificationsChange}
                    disabled={isUpdatingNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-teal-200 dark:hover:border-teal-800 transition">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Browser notifications for real-time updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="push"
                    checked={notifications.push}
                    onChange={handleNotificationsChange}
                    disabled={isUpdatingNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={isUpdatingNotifications}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdatingNotifications ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>Save Preferences</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900 p-8">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-300 mb-6 flex items-center gap-3">
              <div className="bg-teal-100 dark:bg-teal-900 rounded-full p-3">
                <FaPalette className="text-teal-600 dark:text-teal-400 text-2xl" />
              </div>
              Theme & Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Choose Theme</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light Theme */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      currentTheme === "light"
                        ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-900"
                        : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-700"
                    }`}
                  >
                    <div className="bg-white rounded-lg p-4 mb-3 border border-gray-300">
                      <div className="h-2 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded"></div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Light Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bright and easy on the eyes</p>
                  </button>

                  {/* Dark Theme */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      currentTheme === "dark"
                        ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-900"
                        : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-700"
                    }`}
                  >
                    <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-4 mb-3">
                      <div className="h-2 bg-gray-700 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-2 bg-gray-600 dark:bg-gray-500 rounded"></div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Easier on the eyes at night</p>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Note:</span> Theme preference will be applied immediately across your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security & Account Tab */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900 p-8">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-300 mb-6 flex items-center gap-3">
              <div className="bg-teal-100 dark:bg-teal-900 rounded-full p-3">
                <FaSignOutAlt className="text-teal-600 dark:text-teal-400 text-2xl" />
              </div>
              Security & Account
            </h2>

            <div className="space-y-6">
              {/* Clear Data Section */}
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Clear Login Data & Logout</h3>
                <p className="text-red-800 dark:text-red-300 text-sm mb-4">
                  This will clear all stored login information from your browser and sign you out. Use this if you're on a shared device or want to start fresh.
                </p>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt /> Clear Data & Logout
                </button>
              </div>

              {/* Additional Security Info */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Note:</span> Clearing your login data will remove your access token and all stored user information from this browser.
                </p>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}

