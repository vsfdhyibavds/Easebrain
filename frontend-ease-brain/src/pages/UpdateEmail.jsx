import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "@/lib/api";
import { BASE_URL } from "@/utils/utils";


const UpdateEmail = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // read the same access token key used by the sign-in flow
      const headers = { "Content-Type": "application/json" };
      const res = await authFetch(`${BASE_URL}/update-email`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update email.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Update Email</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success ? (
        <div className="mb-4 text-green-600">
          Email updated successfully! Redirecting to profile...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">New Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={loading || success}
          >
            {loading ? "Updating..." : "Update Email"}
          </button>
        </form>
      )}
      {success && (
        <div className="mt-4 text-center">
          <a href="/profile" className="text-blue-600 underline">
            Go to Profile
          </a>
        </div>
      )}
    </div>
  );
};

export default UpdateEmail;
