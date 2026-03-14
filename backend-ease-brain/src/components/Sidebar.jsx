import {
  Calendar,
  Home,
  MessageSquare,
  Notebook,
  Settings,
  Users,
  Heart,
  UserPlus,
  Shield,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { FaComments } from "react-icons/fa";
import { useEffect, useRef } from "react";

export default function Sidebar({ isOpen, toggleSidebar, isCollapsed, isSidebarPinned }) {
  const asideRef = useRef(null);
  const location = useLocation();
  const isCaregiverRoute = location.pathname.startsWith("/caregiver");

  const maybeClose = () => {
    if (typeof toggleSidebar === "function" && window.innerWidth < 768 && !isSidebarPinned) {
      toggleSidebar();
    }
  };

  // Focus management & simple focus trap when sidebar is open (mobile)
  useEffect(() => {
    const aside = asideRef.current;
    if (!isOpen || !aside) return;

    const selector = 'a, button, input, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(aside.querySelectorAll(selector)).filter((el) => !el.hasAttribute("disabled"));

    // Focus the first focusable element
    if (nodes.length) {
      try {
        nodes[0].focus();
      } catch {
        // ignore
      }
    } else {
      // make aside itself focusable as a last resort
      aside.tabIndex = -1;
      try {
        aside.focus();
      } catch {
        // ignore
      }
    }

    function onKey(e) {
      if (e.key !== "Tab") return;
      const items = Array.from(aside.querySelectorAll(selector)).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }

    aside.addEventListener("keydown", onKey);
    return () => aside.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <aside
      role="navigation"
      aria-label="Main menu"
      aria-expanded={isOpen}
      ref={asideRef}
      onKeyDown={() => {}}
      className={`bg-teal-800 dark:bg-slate-900 text-white h-screen fixed top-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
        isOpen || isSidebarPinned ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "md:w-20" : "md:w-64"} md:translate-x-0 md:z-40 md:fixed`}
    >
      <div className="p-4 flex items-center justify-center">
        <span className="text-sm font-semibold">EaseBrain</span>
      </div>

      <nav className="flex flex-col gap-2 p-4 mt-8">
        {isCaregiverRoute ? (
          // Caregiver-specific navigation
          <>
            <SidebarLink to="/caregiver" icon={<Home />} text="Dashboard" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/caregiver/dependents" icon={<Users />} text="Dependents" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/caregiver/tasks" icon={<Calendar />} text="Tasks" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/caregiver/notes" icon={<Notebook />} text="Notes" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/caregiver/messages" icon={<MessageSquare />} text="Messages" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/caregiver/settings" icon={<Settings />} text="Settings" isCollapsed={isCollapsed} onNavigate={maybeClose} />
          </>
        ) : (
          // Main dashboard navigation
          <>
            <SidebarLink to="/easebrain" icon={<Home />} text="Dashboard" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/notes" icon={<Notebook />} text="Notes" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/reminders" icon={<Calendar />} text="Reminders" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/messages" icon={<MessageSquare />} text="Messages" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/community" icon={<Users />} text="Community" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/stories" icon={<Heart />} text="Stories of Hope" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/caregivers" icon={<UserPlus />} text="My Caregivers" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/safety-plans" icon={<Shield />} text="Safety Plans" isCollapsed={isCollapsed} onNavigate={maybeClose} />
            <SidebarLink to="/easebrain/settings" icon={<Settings />} text="Settings" isCollapsed={isCollapsed} onNavigate={maybeClose} />

          </>
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({ to, icon, text, isCollapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      title={text}
      className={({ isActive }) =>
        `flex items-center p-2 text-white rounded-lg ${isActive ? "bg-teal-700" : "hover:bg-teal-700 hover:text-white"} ${isCollapsed ? "justify-center" : ""}`
      }
      onClick={() => {
        try {
          if (typeof onNavigate === "function") onNavigate();
        } catch {
          // ignore
        }
      }}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{text}</span>}
    </NavLink>
  );
}
