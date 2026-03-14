import React, { useEffect, ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/Footer';
import ErrorBoundaryClass from '@/components/ErrorBoundaryClass';

function App() {
  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
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
