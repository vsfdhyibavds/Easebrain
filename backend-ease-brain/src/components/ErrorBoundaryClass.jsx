import React from 'react';

/**
 * Error Boundary for catching React component errors
 * Note: Error boundaries only catch errors in their children
 * They don't catch:
 * - Event handler errors (use try/catch)
 * - Async code (use .catch())
 * - Server-side rendering errors
 */
class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send error to logging service (optional)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you'd send this to an error tracking service
    // like Sentry, LogRocket, or your own logging endpoint
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Example: Send to your own logging endpoint
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });

      console.log('Error logged:', errorData);
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                We're sorry for the inconvenience. An unexpected error occurred.
              </p>
            </div>

            {/* Error Details (Development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <details className="text-sm">
                  <summary className="font-semibold text-red-800 cursor-pointer hover:text-red-900">
                    Error Details (Dev Only)
                  </summary>
                  <div className="mt-3 space-y-2 font-mono text-red-700">
                    <div className="break-words">
                      <strong>Message:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div className="break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
                        <strong>Stack:</strong>
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Error Count Warning */}
            {this.state.errorCount > 2 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Multiple errors detected ({this.state.errorCount}).
                  If the problem persists, please reload the page.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
              >
                Go to Home
              </a>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-2">What can you do?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Click "Try Again" to retry the operation</li>
                <li>Click "Reload Page" to refresh your browser</li>
                <li>If the problem persists, clear your browser cache</li>
                <li>Contact support if you need further assistance</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryClass;
