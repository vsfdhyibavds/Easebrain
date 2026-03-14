import React, { useState, useEffect, useRef } from "react";
import { FaCamera, FaEdit } from "react-icons/fa";
import { useAuth } from "@/features/auth/AuthContext";
import { BASE_URL } from "../config/apiConfig";
import { authFetch } from "@/lib/api";
import NavigationBar from "../components/NavigationBar";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const avatarInputRef = useRef();
  const { accessToken } = useAuth();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch(`${BASE_URL}/me`);
        if (!res.ok) throw new Error("Could not load your profile. Please check your connection or sign in again.");
        const data = await res.json();
        setUser(data);
        setForm({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          bio: data.bio || "",
        });
        setImagePreview(data.avatarUrl || data.profilePicture || defaultAvatar);
      } catch (err) {
        setError(err.message || "Could not load your profile. Please check your connection or sign in again.");
      }
      setLoading(false);
    }
    fetchUser();
  }, [accessToken]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let avatarUrl = user.avatarUrl || user.profilePicture;

      // Upload new avatar if selected
      if (avatarFile && user?.id) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const avatarRes = await authFetch(`${BASE_URL}/users/${user.id}/avatar`, {
          method: "POST",
          body: formData,
        });
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          avatarUrl = avatarData.avatarUrl || avatarData.profilePicture;
        }
      }

      // Update user profile
      const res = await authFetch(`${BASE_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          bio: form.bio,
          avatarUrl: avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setUser(data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setResetStatus("");
    try {
      const res = await authFetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (res.ok) {
        setResetStatus("Password reset link sent to your email.");
        setResetEmail("");
        setTimeout(() => setShowPasswordReset(false), 3000);
      } else {
        setResetStatus("Failed to send reset link.");
      }
    } catch {
      setResetStatus("Server error. Please try again later.");
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white text-teal-700">
      <Navbar />
      <div className="pt-36">
        <LoadingSpinner />
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-white text-teal-700">
      <Navbar />
      <div className="pt-36">
        <ErrorMessage message={error || "User not found"} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-teal-700">
      <Navbar />

      <div className="container mx-auto px-4 pt-36 pb-20 flex flex-col items-center">
        {/* Card */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-8 w-full max-w-2xl transition-all duration-500">

          {/* Profile picture */}
          <div className="flex flex-col items-center mb-8 relative">
            <img
              src={imagePreview || defaultAvatar}
              alt="Profile"
              className="w-36 h-36 rounded-full border-4 border-teal-200 shadow-xl object-cover"
            />

            {isEditing && (
              <label className="absolute bottom-2 right-1 cursor-pointer bg-teal-600 p-2 rounded-full text-white hover:bg-teal-700 transition-all">
                <FaCamera />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleAvatarChange}
                  ref={avatarInputRef}
                  accept="image/*"
                />
              </label>
            )}

            <h2 className="text-2xl font-bold mt-4 text-teal-700">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600 text-sm">{user.role || "Member"}</p>
          </div>

          {/* Success and Error Messages */}
          {success && (
            <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg" role="status">
              {success}
            </div>
          )}
          {error && <ErrorMessage message={error} />}

          {/* Editable fields */}
          <div className="space-y-6">
            {/* First Name */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                disabled={!isEditing}
                value={form.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/50 border ${
                  isEditing
                    ? "border-teal-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    : "border-gray-300 cursor-not-allowed"
                }`}
                aria-label="First Name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                disabled={!isEditing}
                value={form.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/50 border ${
                  isEditing
                    ? "border-teal-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    : "border-gray-300 cursor-not-allowed"
                }`}
                aria-label="Last Name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Email
              </label>
              <input
                name="email"
                type="email"
                disabled={!isEditing}
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/50 border ${
                  isEditing
                    ? "border-teal-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    : "border-gray-300 cursor-not-allowed"
                }`}
                aria-label="Email"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Bio
              </label>
              <textarea
                name="bio"
                disabled={!isEditing}
                rows="4"
                value={form.bio}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/50 border ${
                  isEditing
                    ? "border-teal-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    : "border-gray-300 cursor-not-allowed"
                }`}
                aria-label="Bio"
              />
            </div>

            {/* Non-editable info */}
            <div className="bg-white/40 p-4 rounded-xl border border-white/50">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-teal-700">
                  Member Since:
                </span>{" "}
                {user.memberSince || "2024"}
              </p>
              <p className="text-gray-700 text-sm mt-1">
                <span className="font-semibold text-teal-700">Account ID:</span>{" "}
                {user.id || "N/A"}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="Edit Profile"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordReset(true)}
                    className="bg-gray-200 text-teal-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Reset Password"
                  >
                    Reset Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                    aria-label="Save Profile"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setImagePreview(user.avatarUrl || user.profilePicture || defaultAvatar);
                      setAvatarFile(null);
                    }}
                    className="px-6 py-3 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Cancel Edit"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Password Reset Form */}
            {showPasswordReset && (
              <form onSubmit={handlePasswordReset} className="mt-6 p-4 bg-white/50 rounded-xl border border-teal-100" aria-label="Password Reset Form">
                <h3 className="text-lg font-semibold text-teal-700 mb-3">Reset Password</h3>
                <label htmlFor="reset-email" className="block mb-2 text-sm font-medium text-gray-700">
                  Email for password reset
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  aria-label="Reset Email"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="Send Reset Link"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setResetEmail("");
                      setResetStatus("");
                    }}
                    aria-label="Cancel Password Reset"
                  >
                    Cancel
                  </button>
                </div>
                {resetStatus && (
                  <div className={`mt-3 text-sm ${resetStatus.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                    {resetStatus}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}