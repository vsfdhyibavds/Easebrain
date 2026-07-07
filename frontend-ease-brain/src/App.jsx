import React, { useEffect, ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/Footer';
import ErrorBoundaryClass from '@/components/ErrorBoundaryClass';

function App() {
  // Initialize theme from DarkModeContext via localStorage
  // Default to light mode (not system preference)
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    let isDarkMode = false; // Default to light mode

    if (saved !== null) {
      // If explicitly set in localStorage, use that value
      isDarkMode = JSON.parse(saved);
    }

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // App is used as a route element (see src/main.jsx). It renders
  // nested routes via <Outlet /> and relies on AuthProvider at the root level (main.jsx).
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <ErrorBoundaryClass>
          <Outlet />
        </ErrorBoundaryClass>
      </div>
      <Footer />
    </div>
  );
}

export default App;
