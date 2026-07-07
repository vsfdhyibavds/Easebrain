import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();

  const getErrorMessage = () => {
    if (error.status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (error.status === 401 || error.status === 403) {
      return "You don't have permission to access this page.";
    }
    if (error.status >= 500) {
      return "Our servers are having trouble. Please try again later.";
    }
    return error.message || "Something unexpected went wrong.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
        {error.status >= 500 && (
          <p className="mt-6 text-sm text-gray-500">
            Error code: {error.status || "Unknown"}
          </p>
        )}
      </div>
    </div>
  );
}