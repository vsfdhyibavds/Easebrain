import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || "You don't have permission to access this page.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-200 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {/* Lock Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <FaLock className="text-4xl text-red-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Details */}
        <div className="bg-gray-50 rounded p-4 mb-8 text-left">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Error Code:</span> 403 Forbidden
          </p>
          <p className="text-sm text-gray-700 mt-2">
            If you believe this is an error, please contact support or ask an administrator to grant you the necessary permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
          >
            <FaArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/easebrain/dashboard")}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? <a href="/contact" className="text-teal-600 hover:text-teal-700 font-medium">Contact support</a>
        </p>
      </div>
    </div>
  );
}
