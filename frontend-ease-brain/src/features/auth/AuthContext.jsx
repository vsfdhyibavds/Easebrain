import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  );

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Avatar is stored on the user object; no separate avatar state required.

  const decodeJwt = useCallback((token) => {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSeconds;
  }, [decodeJwt]);

  // Extract claims from token (roles, permissions, etc.)
  const getTokenClaims = useCallback(() => {
    if (!accessToken) return {};
    const payload = decodeJwt(accessToken);
    return payload || {};
  }, [accessToken, decodeJwt]);

  const tokenClaims = useMemo(() => getTokenClaims(), [getTokenClaims]);

  // Listen for token update events from SigninForm
  useEffect(() => {
    const handleTokenSet = (e) => {
      if (e.detail) {
        setAccessToken(e.detail);
      }
    };

    const handleRoleSet = (e) => {
      // Handle role if needed for additional logic
      console.log("Role set:", e.detail);
    };

    window.addEventListener("auth:set_token", handleTokenSet);
    window.addEventListener("auth:set_role", handleRoleSet);

    return () => {
      window.removeEventListener("auth:set_token", handleTokenSet);
      window.removeEventListener("auth:set_role", handleRoleSet);
    };
  }, []);

  useEffect(() => {
    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        localStorage.removeItem("access_token");
      } catch {
        // ignore
      }
      if (accessToken) {
        setAccessToken(null);
      }
      return;
    }
    try {
      localStorage.setItem("access_token", accessToken);
    } catch {
      // ignore
    }
  }, [accessToken, isTokenExpired]);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  function logout() {
    setAccessToken(null);
    setUser(null);
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // avatar stored on user; no separate key
      sessionStorage.removeItem("redirectAfterLogin");
    } catch {
      // ignore
    }
  }

  const isAuthenticated = useMemo(() => {
    return Boolean(accessToken && !isTokenExpired(accessToken));
  }, [accessToken, isTokenExpired]);

  // ========== ROLE-BASED ACCESS HELPERS ==========

  /**
   * Check if user has a specific role
   * @param {string} roleName - Role name to check (e.g., 'admin', 'therapist')
   * @returns {boolean}
   */
  const hasRole = useCallback((roleName) => {
    if (!tokenClaims.roles) return false;
    return tokenClaims.roles.includes(roleName);
  }, [tokenClaims]);

  /**
   * Check if user has a specific role type
   * @param {string} roleType - Role type to check (e.g., 'admin', 'caregiver')
   * @returns {boolean}
   */
  const hasRoleType = useCallback((roleType) => {
    if (!tokenClaims.role_types) return false;
    return tokenClaims.role_types.includes(roleType);
  }, [tokenClaims]);

  /**
   * Check if user has ANY of the specified roles
   * @param {string[]} roleNames - Array of role names
   * @returns {boolean}
   */
  const hasAnyRole = useCallback((roleNames) => {
    if (!tokenClaims.roles) return false;
    return roleNames.some(role => tokenClaims.roles.includes(role));
  }, [tokenClaims]);

  /**
   * Check if user has ALL of the specified roles
   * @param {string[]} roleNames - Array of role names
   * @returns {boolean}
   */
  const hasAllRoles = useCallback((roleNames) => {
    if (!tokenClaims.roles) return false;
    return roleNames.every(role => tokenClaims.roles.includes(role));
  }, [tokenClaims]);

  const isAdmin = useMemo(() => {
    return tokenClaims.is_admin || false;
  }, [tokenClaims]);

  const isCaregiver = useMemo(() => {
    return tokenClaims.is_caregiver || false;
  }, [tokenClaims]);

  const userRoles = useMemo(() => {
    return tokenClaims.roles || [];
  }, [tokenClaims]);

  const userRoleTypes = useMemo(() => {
    return tokenClaims.role_types || [];
  }, [tokenClaims]);

  const value = {
    // Core auth
    user,
    setUser,
    accessToken,
    setAccessToken,
    isAuthenticated,
    isTokenExpired,
    logout,

    // Token claims
    tokenClaims,
    getTokenClaims,

    // Role checking
    hasRole,
    hasRoleType,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isCaregiver,
    userRoles,
    userRoleTypes,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
