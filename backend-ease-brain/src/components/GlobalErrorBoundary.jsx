import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Optionally log error to external service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 text-red-700 px-6 py-4 rounded shadow-lg">
          <strong>Something went wrong:</strong> {this.state.error?.message || "Unknown error"}
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
