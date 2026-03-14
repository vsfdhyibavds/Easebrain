import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

/**
 * Basic protected route - requires authentication
 */
export default function ProtectedRoute() {
  const { user, accessToken, isTokenExpired } = useAuth();
  const location = useLocation();

  // Also check localStorage as a fallback so route checks don't race with
  // async context updates that happen right after sign-in.
  let storedToken = null;
  let storedUser = null;
  try {
    if (typeof window !== "undefined") {
      storedToken = localStorage.getItem("access_token");
      const raw = localStorage.getItem("user");
      storedUser = raw ? JSON.parse(raw) : null;
    }
  } catch {
    // ignore
  }

  const hasValidToken = storedToken ? !isTokenExpired(storedToken) : (accessToken && !isTokenExpired(accessToken));
  const isAuthenticated = Boolean((user && hasValidToken) || (storedUser && hasValidToken));

  if (!isAuthenticated) {
    // Save the attempted URL for redirection after login
    const currentPath = window.location.pathname;

    if (currentPath !== "/signin") {
      try {
        sessionStorage.setItem("redirectAfterLogin", currentPath);
      } catch {
        // ignore
      }
    }

    // Pass the attempted location in state so the signin page can use it as well
    return (
      <Navigate to="/signin" state={{ from: location }} replace />
    );
  }

  return <Outlet />;
}