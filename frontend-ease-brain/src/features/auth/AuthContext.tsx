import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";

// ========== TYPE DEFINITIONS ==========

interface User {
  id?: string | number;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  role_types?: string[];
  role?: string;
  avatar?: string;
  [key: string]: any;
}

interface TokenClaims {
  roles?: string[];
  role_types?: string[];
  is_admin?: boolean;
  is_caregiver?: boolean;
  exp?: number;
  [key: string]: any;
}

interface AuthContextType {
  // Core auth
  user: User | null;
  setUser: (user: User | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  isTokenExpired: (token: string | null) => boolean;
  logout: () => void;

  // Token claims
  tokenClaims: TokenClaims;
  getTokenClaims: () => TokenClaims;

  // Role checking
  hasRole: (roleName: string) => boolean;
  hasRoleType: (roleType: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  isAdmin: boolean;
  isCaregiver: boolean;
  userRoles: string[];
  userRoleTypes: string[];
}

interface AuthProviderProps {
  children: ReactNode;
}

// ========== CONTEXT CREATION ==========

const AuthContext = createContext<AuthContextType | null>(null);

// ========== PROVIDER COMPONENT ==========

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  );

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Avatar is stored on the user object; no separate avatar state required.

  const decodeJwt = useCallback((token: string): TokenClaims | null => {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const isTokenExpired = useCallback((token: string | null): boolean => {
    if (!token) return true;
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSeconds;
  }, [decodeJwt]);

  // Extract claims from token (roles, permissions, etc.)
  const getTokenClaims = useCallback((): TokenClaims => {
    if (!accessToken) return {};
    const payload = decodeJwt(accessToken);
    return payload || {};
  }, [accessToken, decodeJwt]);

  const tokenClaims = useMemo(() => getTokenClaims(), [getTokenClaims]);

  // Listen for token update events from SigninForm
  useEffect(() => {
    const handleTokenSet = (e: CustomEvent<string>) => {
      if (e.detail) {
        setAccessToken(e.detail);
      }
    };

    const handleRoleSet = (e: CustomEvent<string>) => {
      // Handle role if needed for additional logic
      console.log("Role set:", e.detail);
    };

    window.addEventListener("auth:set_token", handleTokenSet as EventListener);
    window.addEventListener("auth:set_role", handleRoleSet as EventListener);

    return () => {
      window.removeEventListener("auth:set_token", handleTokenSet as EventListener);
      window.removeEventListener("auth:set_role", handleRoleSet as EventListener);
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

  function logout(): void {
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
  const hasRole = useCallback((roleName: string): boolean => {
    if (!tokenClaims.roles) return false;
    return tokenClaims.roles.includes(roleName);
  }, [tokenClaims]);

  /**
   * Check if user has a specific role type
   * @param {string} roleType - Role type to check (e.g., 'admin', 'caregiver')
   * @returns {boolean}
   */
  const hasRoleType = useCallback((roleType: string): boolean => {
    if (!tokenClaims.role_types) return false;
    return tokenClaims.role_types.includes(roleType);
  }, [tokenClaims]);

  /**
   * Check if user has ANY of the specified roles
   * @param {string[]} roleNames - Array of role names
   * @returns {boolean}
   */
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    if (!tokenClaims.roles) return false;
    return roleNames.some(role => tokenClaims.roles!.includes(role));
  }, [tokenClaims]);

  /**
   * Check if user has ALL of the specified roles
   * @param {string[]} roleNames - Array of role names
   * @returns {boolean}
   */
  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    if (!tokenClaims.roles) return false;
    return roleNames.every(role => tokenClaims.roles!.includes(role));
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

  const value: AuthContextType = {
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

// ========== CUSTOM HOOK ==========

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
