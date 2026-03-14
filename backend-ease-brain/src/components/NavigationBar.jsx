import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import NavSearch from "../components/NavSearch";
import RoleDropdown from "./RoleDropdown";

const defaultAvatar = "https://via.placeholder.com/40"; // Placeholder for default avatar

export default function NavigationBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all login data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("pending_email");
    localStorage.removeItem("pending_role_type");
    localStorage.removeItem("verification_token");
    localStorage.removeItem("redirectAfterLogin");
    localStorage.removeItem("theme");

    // Clear sessionStorage
    sessionStorage.clear();

    // Redirect to signin
    window.location.href = "/signin";
  };

  return (
    <nav className="bg-teal-600 text-white p-4 flex gap-6 items-center justify-between">
      <div className="flex gap-6">
        <Link to="/app/profile">Profile</Link>
        <Link to="/roles">Roles</Link>
        <Link to="/community">Community</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/caregiver-notes">Caregiver Notes</Link>
      </div>

      {/* Right Side - User Info & Role Dropdown */}
      <div className="flex items-center gap-4">
        {user && <RoleDropdown />}
        {/* Right Side AFTER sign in */}
        {user ? (
          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate("/app/profile")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={user.profilePicture || defaultAvatar}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-teal-300 shadow-sm object-cover"
              />

              <span className="text-white font-semibold hidden sm:inline">
                {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-white hover:text-teal-200 transition-all text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-6">
            <NavSearch onSearch={(q) => console.log("Searching:", q)} />

            <button
              onClick={() => navigate("/signin")}
              className="text-white hover:text-teal-200 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-teal-600 px-4 py-2 rounded-lg shadow-md hover:bg-teal-100 transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
