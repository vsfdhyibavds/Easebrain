import { Bell, HomeIcon, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import RoleDropdown from "./RoleDropdown";
import RoleSwitcher from "./RoleSwitcher";
import { useAuth } from "@/features/auth/AuthContext";

export default function Header({ toggleSidebar, toggleCollapse, toggleBtnRef }) {
  const { isAuthenticated, user } = useAuth();
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="EaseBrain Logo" className="h-8 sm:h-10" />
        </Link>
        <button ref={toggleBtnRef} className="md:hidden dark:text-gray-300 dark:hover:text-teal-400" onClick={toggleSidebar}>
          <HomeIcon />
        </button>
        <button
          onClick={toggleCollapse}
          className="hidden md:block p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-300 dark:hover:text-teal-400"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />

          <input
                type="text"
                placeholder="Search..."
                className="w-full border-2 border-teal-400 dark:border-teal-600 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-500"
              />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" />
        {isAuthenticated && <RoleSwitcher />}
        {isAuthenticated && <RoleDropdown />}
        {user?.avatarUrl || user?.profilePicture ? (
          <img
            src={user.avatarUrl || user.profilePicture}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-teal-200"
          />
        ) : (
          <User className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" />
        )}
      </div>
    </header>
  );
}
