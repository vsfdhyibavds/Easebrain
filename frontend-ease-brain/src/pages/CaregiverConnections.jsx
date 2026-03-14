import React, { useState, useEffect } from "react";
import { User, Plus, X, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { BASE_URL } from "@/utils/utils";

export default function CaregiverConnections() {
  const _user = useAuth().user;
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchCaregivers();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCaregivers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/caregivers/connections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCaregivers(data.caregivers);
      }
    } catch {
      setError("Failed to load caregivers");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Check if user is a caregiver and fetch notifications
      const response = await fetch(`${BASE_URL}/caregiver/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleRemoveCaregiver = async (connectionId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this caregiver connection?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/caregivers/connections/${connectionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (response.ok) {
        setCaregivers(caregivers.filter((c) => c.id !== connectionId));
      }
    } catch {
      alert("Failed to remove caregiver");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Caregiver Connections
          </h1>
          <p className="text-lg text-gray-600">
            Connect with your caregivers to receive support and share important
            health updates during warning signs or crises.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Caregiver Notifications (for caregivers) */}
        {notifications.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Patients Needing Attention
            </h2>
            <div className="space-y-4">
              {notifications.map((notif) => (
                <CaregiverNotificationCard
                  key={notif.connection_id}
                  notification={notif}
                  onRefresh={fetchNotifications}
                />
              ))}
            </div>
          </div>
        )}

        {/* Connected Caregivers */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Caregivers
            </h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Add Caregiver
              </button>
            )}
          </div>

          {/* Add Caregiver Form */}
          {showAddForm && (
            <AddCaregiverForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchCaregivers();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Caregivers List */}
          {caregivers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">
                You haven't added any caregivers yet
              </p>
              <p className="text-gray-500 mb-6">
                Add a caregiver to receive support and share updates about your
                health
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Caregiver
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {caregivers.map((caregiver) => (
                <div
                  key={caregiver.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {caregiver.caregiver_name}
                        </h3>
                        {caregiver.relationship && (
                          <p className="text-sm text-gray-600">
                            {caregiver.relationship} • {caregiver.role}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          {caregiver.email_address && (
                            <p className="text-sm text-gray-500">
                              📧 {caregiver.email_address}
                            </p>
                          )}
                          {caregiver.phone_number && (
                            <p className="text-sm text-gray-500">
                              📱 {caregiver.phone_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCaregiver(caregiver.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Remove caregiver"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Notification Preferences */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3">
                      Notifications
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {caregiver.notify_on_warning_signs ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-700">
                          Warning signs detected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {caregiver.notify_on_crisis ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-700">
                          Crisis alerts
                        </span>
                      </div>
                    </div>
                  </div>

                  {caregiver.accepted_at && (
                    <p className="text-xs text-gray-500 mt-4">
                      Accepted on{" "}
                      {new Date(caregiver.accepted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">About Caregiver Connections</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✓ Caregivers receive alerts when you detect warning signs</li>
            <li>✓ Share questionnaire results with caregivers during assessments</li>
            <li>✓ Your caregiver can access your stories and support requests</li>
            <li>✓ Control what information your caregiver sees</li>
            <li>✓ Can have multiple caregivers (family, therapist, doctor, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Add Caregiver Form Component
function AddCaregiverForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    caregiver_email: "",
    relationship: "",
    role: "Secondary",
    phone_number: "",
    email_address: "",
    notify_on_warning_signs: true,
    notify_on_crisis: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/caregivers/add-caregiver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add caregiver");
      }

      alert("Caregiver connection created successfully!");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Caregiver Email *
        </label>
        <input
          type="email"
          name="caregiver_email"
          value={formData.caregiver_email}
          onChange={handleChange}
          placeholder="Enter your caregiver's email address"
          required
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Relationship (e.g., Family, Therapist)
          </label>
          <input
            type="text"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            placeholder="e.g., Mother, Doctor"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          >
            <option>Primary</option>
            <option>Secondary</option>
            <option>Emergency</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Contact number"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address (Optional)
          </label>
          <input
            type="email"
            name="email_address"
            value={formData.email_address}
            onChange={handleChange}
            placeholder="Notification email"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg space-y-3">
        <h4 className="font-semibold text-gray-900">Notification Preferences</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="notify_on_warning_signs"
            checked={formData.notify_on_warning_signs}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Notify when warning signs detected</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="notify_on_crisis"
            checked={formData.notify_on_crisis}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Notify during crisis alerts</span>
        </label>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Caregiver"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Caregiver Notification Card Component
function CaregiverNotificationCard({ notification, onRefresh }) {
  const [acknowledging, setAcknowledging] = useState(false);

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      const response = await fetch(
        `${BASE_URL}/caregivers/warnings/${notification.latest_warning.id}/acknowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            action_taken: "Reviewed patient warning signs",
          }),
        }
      );
      if (response.ok) {
        onRefresh();
      }
    } catch {
      alert("Failed to acknowledge");
    } finally {
      setAcknowledging(false);
    }
  };

  const severity = notification.latest_warning.severity;
  const severityColor = {
    critical: "bg-red-100 border-red-300",
    high: "bg-orange-100 border-orange-300",
    medium: "bg-yellow-100 border-yellow-300",
    low: "bg-blue-100 border-blue-300",
  }[severity] || "bg-gray-100 border-gray-300";

  return (
    <div className={`border-l-4 rounded-lg p-6 ${severityColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {notification.patient_name}
          </h3>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Relationship:</strong> {notification.relationship}
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Warning signs:</strong>{" "}
            {notification.latest_warning.signs_detected}
          </p>
          {notification.latest_warning.patient_notes && (
            <p className="text-sm text-gray-600 italic mb-3">
              "{notification.latest_warning.patient_notes}"
            </p>
          )}
          <p className="text-xs text-gray-500">
            Notified:{" "}
            {new Date(
              notification.latest_warning.notified_at
            ).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleAcknowledge}
          disabled={acknowledging}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap disabled:opacity-50"
        >
          {acknowledging ? "Acknowledging..." : "Acknowledge"}
        </button>
      </div>
    </div>
  );
}
