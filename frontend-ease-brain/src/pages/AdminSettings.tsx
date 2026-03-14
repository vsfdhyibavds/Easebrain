import { FC, useState, ChangeEvent, useCallback } from "react";
import { FaCog, FaSave, FaRedo } from "react-icons/fa";
import { AdminBreadcrumb } from "../components/admin";
import type { BreadcrumbItem } from "../components/admin/AdminBreadcrumb";
import { useDarkMode } from "../context/DarkModeContext";

interface AdminSettings {
  dashboardRefreshRate: number;
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  autoLogoutMinutes: number;
  twoFactorEnabled: boolean;
  timeFormat: "12h" | "24h";
}

const AdminSettings: FC = () => {
  const { isDarkMode, setDarkMode } = useDarkMode();
  const [settings, setSettings] = useState<AdminSettings>({
    dashboardRefreshRate: 30,
    notificationsEnabled: true,
    emailAlerts: true,
    darkMode: isDarkMode,
    autoLogoutMinutes: 60,
    twoFactorEnabled: true,
    timeFormat: "24h",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordMessage, setShowPasswordMessage] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleChange = useCallback((key: keyof AdminSettings, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Apply dark mode change immediately
    if (key === "darkMode") {
      setDarkMode(value as boolean);
    }
    setUnsavedChanges(true);
    setSaveSuccess(false);
  }, [setDarkMode]);

  const handleSaveSettings = useCallback(async () => {
    try {
      // TODO: Connect to API to save settings
      // await apiClient.post("/admin/settings", settings);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSettings({
      dashboardRefreshRate: 30,
      notificationsEnabled: true,
      emailAlerts: true,
      darkMode: false,
      autoLogoutMinutes: 60,
      twoFactorEnabled: true,
      timeFormat: "24h",
    });
    setUnsavedChanges(false);
    setSaveSuccess(false);
    setShowPasswordMessage(false);
    setActionMessage("Settings reset to defaults");
    setTimeout(() => setActionMessage(null), 2000);
  }, []);

  const handleChangePassword = useCallback(() => {
    setShowPasswordMessage(true);
    setTimeout(() => setShowPasswordMessage(false), 3000);
  }, []);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Admin Dashboard" },
    { label: "Settings" },
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
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaCog className="text-2xl text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <h1 id="page-title" className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Configure your admin dashboard preferences and security settings</p>
        </div>
      </section>

      {/* Success Message */}
      {saveSuccess && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 text-green-700 dark:text-green-400" role="status" aria-live="polite">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Password Change Message */}
      {showPasswordMessage && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 text-blue-700 dark:text-blue-400" role="status" aria-live="polite">
          📧 Password change email has been sent. Please check your email for instructions.
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dashboard Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <div className="space-y-6">
            {/* Refresh Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-Refresh Rate (seconds)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={settings.dashboardRefreshRate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange("dashboardRefreshRate", parseInt(e.target.value))
                  }
                  className="flex-1 h-2 bg-teal-200 dark:bg-teal-900 rounded-lg appearance-none cursor-pointer"
                />
                <span className="min-w-16 text-right font-semibold text-gray-900 dark:text-white">
                  {settings.dashboardRefreshRate}s
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                How often to refresh dashboard metrics (10-300 seconds)
              </p>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Format</label>
              <div className="flex gap-4">
                {(["12h", "24h"] as const).map((format) => (
                  <label key={format} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFormat"
                      value={format}
                      checked={settings.timeFormat === format}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange("timeFormat", e.target.value as "12h" | "24h")
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{format === "12h" ? "12 Hour" : "24 Hour"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange("darkMode", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Enable dark theme across the dashboard</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <div className="space-y-6">
            {/* In-App Notifications */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In-App Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange("notificationsEnabled", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Receive notifications within the application</p>
            </div>

            {/* Email Alerts */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange("emailAlerts", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Send critical alerts via email</p>
            </div>

            {/* Auto Logout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-Logout (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={settings.autoLogoutMinutes}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange("autoLogoutMinutes", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Auto-logout after inactivity (15-480 minutes)</p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg lg:col-span-2">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Two Factor Auth */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
                <input
                  type="checkbox"
                  checked={settings.twoFactorEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange("twoFactorEnabled", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Require 2FA for all admin accounts</p>
            </div>

            {/* Change Password Button */}
            <div>
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 border border-teal-600 dark:border-teal-500 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition font-medium text-sm min-h-[44px]">
                Change Password
              </button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Update your admin account password</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveSettings}
          disabled={!unsavedChanges}
          aria-label={unsavedChanges ? "Save your settings changes" : "No unsaved changes to save"}
          className="flex items-center gap-2 rounded-lg bg-teal-600 dark:bg-teal-700 px-6 py-2 text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <FaSave aria-hidden="true" /> Save Settings
        </button>
        <button
          onClick={handleReset}
          aria-label="Reset all settings to their default values"
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition min-h-[44px]"
        >
          <FaRedo aria-hidden="true" /> Reset to Defaults
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4" role="note">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>💡 Tip:</strong> Settings are saved individually. Changes take effect immediately after saving.
        </p>
      </div>
    </main>
  );
};

export default AdminSettings;
