import { useState, useEffect, ReactNode } from "react";
import {
  FaBars,
  FaHome,
  FaUsers,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { getTimeBasedGreeting } from "@/utils/greetings";
import logo from "@/assets/logo.jpg";
import NavSearch from "@/components/NavSearch";

interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
}

interface User {
  first_name?: string;
  name?: string;
  role?: string;
  profilePicture?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  logout?: () => void;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth() as AuthContextType;
  const { user, logout } = auth || { user: null, logout: undefined };
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>("");
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    setGreeting(
      getTimeBasedGreeting(user?.first_name || user?.name || "Administrator")
    );
  }, [user]);

  const menu: MenuItem[] = [
    { title: "Dashboard", path: "/admin", icon: <FaHome /> },
    { title: "Dependents", path: "/admin/dependents", icon: <FaUsers /> },
    { title: "Care Tasks", path: "/admin/tasks", icon: <FaClipboardList /> },
    { title: "Settings", path: "/admin/settings", icon: <FaCog /> },
  ];

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
      }`}
    >
      {/* Sidebar - show on desktop or when not collapsed on mobile */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col gap-6 p-4 pt-6 transition-all transform ${
          collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        } md:transform-none ${
          isDarkMode
            ? "bg-slate-800/95 md:bg-slate-800/60 border-slate-700"
            : "bg-white/95 md:bg-white/60 border-white/30"
        } backdrop-blur-sm border-r w-64 md:w-auto ${collapsed ? "md:w-20" : "md:w-64"}`}
        aria-label="Admin sidebar"
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Logo"
              className={`w-10 h-10 rounded-full border ${
                isDarkMode ? "border-teal-500" : "border-teal-200"
              }`}
            />
            {!collapsed && (
              <span
                className={`font-extrabold ${
                  isDarkMode ? "text-teal-400" : "text-teal-700"
                }`}
              >
                EaseBrain
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1">
          {menu.map((m) => {
            const isActive = location.pathname.startsWith(m.path);
            return (
              <button
                key={m.path}
                onClick={() => {
                  navigate(m.path);
                  setCollapsed(true); // Close mobile menu after navigation
                }}
                className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? "bg-slate-700 text-white"
                      : "bg-teal-600 text-white"
                    : isDarkMode
                    ? "hover:bg-slate-700 text-slate-300"
                    : "hover:bg-teal-50 text-gray-700"
                }`}
              >
                <span
                  className={`text-lg ${
                    isActive
                      ? "text-white"
                      : isDarkMode
                      ? "text-teal-400"
                      : "text-teal-600"
                  }`}
                >
                  {m.icon}
                </span>
                {!collapsed && <span className="font-medium">{m.title}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setCollapsed((s) => !s)}
            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-slate-700 text-slate-300"
                : "hover:bg-teal-50 text-gray-700"
            }`}
            aria-label="Toggle sidebar"
          >
            <FaBars />
            {!collapsed && <span>Collapse</span>}
          </button>

          <div
            className={`mt-3 flex items-center gap-3 p-2 rounded-lg ${
              isDarkMode ? "bg-slate-700/50" : "bg-white/50"
            }`}
          >
            <img
              src={
                user?.profilePicture ||
                user?.avatarUrl ||
                "https://via.placeholder.com/40?text=U"
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border"
            />
            {!collapsed && (
              <div>
                <div
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-teal-400" : "text-teal-700"
                  }`}
                >
                  {user?.first_name || user?.name || "Guest"}
                </div>
                <div
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  {user?.role || "Caregiver"}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (logout) logout();
              navigate("/");
            }}
            className={`mt-3 w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-red-900/20 text-red-400"
                : "hover:bg-red-50 text-red-600"
            }`}
          >
            <FaSignOutAlt /> {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Topbar */}
        <header
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-[90%] md:w-[80%] flex justify-between items-center px-4 py-2 rounded-2xl transition-all ${
            isDarkMode
              ? "bg-slate-800/60 border-slate-700"
              : "bg-white/20 border-white/30"
          } backdrop-blur-xl shadow-lg border`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed((s) => !s)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  : "bg-white/30 hover:bg-white/50 text-gray-700"
              }`}
              aria-label="toggle sidebar"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FaBars />
            </button>

            <div className="hidden md:flex flex-col items-start gap-0">
              <p
                className={`text-xs font-semibold ${
                  isDarkMode ? "text-teal-400" : "text-teal-700"
                }`}
              >
                {greeting}
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={logo}
                  alt="logo"
                  className="w-8 h-8 rounded-full"
                />
                <div
                  className={`font-bold ${
                    isDarkMode ? "text-white" : "text-teal-700"
                  }`}
                >
                  EaseBrain Admin
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-slate-500/20 text-slate-700"
              } hover:scale-110`}
              title="Toggle dark mode"
            >
              {isDarkMode ? (
                <FaSun className="text-lg" />
              ) : (
                <FaMoon className="text-lg" />
              )}
            </button>

            {/* optional search */}
            {typeof NavSearch !== "undefined" ? (
              <NavSearch onSearch={(q: string) => console.log("search", q)} />
            ) : null}

            <div
              className={`hidden sm:flex items-center gap-3 p-1 rounded-lg ${
                isDarkMode ? "bg-slate-700/50" : ""
              }`}
            >
              <img
                src={
                  user?.profilePicture ||
                  user?.avatarUrl ||
                  "https://via.placeholder.com/40?text=U"
                }
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border"
              />
              <div
                className={`text-sm ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                <div
                  className={`font-semibold ${
                    isDarkMode ? "text-teal-400" : "text-teal-700"
                  }`}
                >
                  {user?.first_name || user?.name || "Guest"}
                </div>
                <div
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Admin
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* content area */}
        <main className="pt-24 px-4 md:px-8 lg:px-12 pb-12 flex-1">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
