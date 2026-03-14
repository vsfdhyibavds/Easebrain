import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { safeSetStorage } from "@/utils/utils";

export default function MainLayout() {
  // Force sidebar to always be visible and unpinned on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        safeSetStorage("sb:isOpen", next ? "true" : "false");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        safeSetStorage("sb:isCollapsed", next ? "true" : "false");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const togglePinSidebar = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try {
        safeSetStorage("sb:isPinned", next ? "true" : "false");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleBtnRef = useRef(null);
  const location = useLocation();
  // Prevent background scroll on mobile when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  // Auto-close sidebar on navigation for small screens (unless pinned)
  useEffect(() => {
    if (window.innerWidth < 768 && isSidebarOpen && !isSidebarPinned) {
      setIsSidebarOpen(false);
      try {
        safeSetStorage("sb:isOpen", "false");
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isSidebarPinned]);

  // When sidebar is pinned on mobile, keep it open
  useEffect(() => {
    if (window.innerWidth < 768 && isSidebarPinned && !isSidebarOpen) {
      setIsSidebarOpen(true);
      try {
        safeSetStorage("sb:isOpen", "true");
      } catch {
        /* ignore */
      }
    }
  }, [isSidebarPinned, isSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
        try {
            safeSetStorage("sb:isOpen", "false");
          } catch {
            /* ignore */
          }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  // restore focus to the header toggle button when the sidebar closes
  useEffect(() => {
    if (!isSidebarOpen && toggleBtnRef.current) {
      try {
        toggleBtnRef.current.focus();
      } catch {
        // ignore
      }
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex w-full h-screen bg-[#f0fdfa] text-[#444]">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => toggleSidebar()}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        isSidebarPinned={isSidebarPinned}
        togglePinSidebar={togglePinSidebar}
      />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} toggleCollapse={toggleCollapse} toggleBtnRef={toggleBtnRef} />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <main className="flex-1 px-4 md:px-8 py-6 w-full">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
