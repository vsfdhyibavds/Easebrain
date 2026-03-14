import React, { Component, ReactNode } from 'react';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useDarkMode } from '@/context/DarkModeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-teal-50 to-cyan-50'
      }`}
    >
      <div
        className={`max-w-md w-full rounded-3xl shadow-2xl p-8 border ${
          isDarkMode
            ? 'bg-slate-700 border-slate-600'
            : 'bg-white border-teal-100'
        }`}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`p-4 rounded-full ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
            }`}
          >
            <FaExclamationTriangle
              className={`text-4xl ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
            />
          </div>
        </div>

        {/* Error Title */}
        <h1
          className={`text-2xl font-bold text-center mb-3 ${
            isDarkMode ? 'text-white' : 'text-teal-900'
          }`}
        >
          Oops, Something Went Wrong
        </h1>

        {/* Error Message */}
        <p
          className={`text-center mb-6 ${
            isDarkMode ? 'text-teal-300' : 'text-teal-700'
          }`}
        >
          We're sorry for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Error Details (Development Only) */}
        {/* Error Details - Development Only */}
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-mono overflow-auto max-h-40 border ${
            isDarkMode
              ? 'bg-slate-600 border-slate-500 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <p className="font-bold mb-2">Error Details:</p>
          <p>{error?.toString() || 'An unknown error occurred'}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onReset}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <FaArrowLeft /> Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              isDarkMode
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-teal-100 hover:bg-teal-200 text-teal-900'
            }`}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Support Message */}
        <p
          className={`text-xs text-center mt-6 ${
            isDarkMode ? 'text-slate-400' : 'text-teal-500'
          }`}
        >
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
