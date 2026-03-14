import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useEffect, useState } from "react";
import AdminLayout from "@/Layout/AdminLayout";

/**
 * Requires user to have a specific role
 * Usage: <RoleProtectedRoute requiredRole="admin" />
 */
export function RoleProtectedRoute({ requiredRole, fallbackPath = "/signin" }) {
  const { isAuthenticated, hasRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasRole(requiredRole)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [isAuthenticated, requiredRole, hasRole]);

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ message: `This page requires ${requiredRole} role` }}
        replace
      />
    );
  }

  return <Outlet />;
}

/**
 * Requires user to have a specific role type (e.g., 'admin', 'caregiver')
 * Usage: <RoleTypeProtectedRoute requiredRoleType="admin" />
 */
export function RoleTypeProtectedRoute({ requiredRoleType, fallbackPath = "/signin" }) {
  const { isAuthenticated, hasRoleType } = useAuth();
  const [_isAuthorized, _setIsAuthorized] = useState(false);

  useEffect(() => {
    // // TODO: Uncomment when role type access control is needed
    // if (isAuthenticated && hasRoleType(requiredRoleType)) {
    //   setIsAuthorized(true);
    // } else {
    //   setIsAuthorized(false);
    // }

    // For now, allow all authenticated users
    if (isAuthenticated) {
      _setIsAuthorized(true);
    } else {
      _setIsAuthorized(false);
    }
  }, [isAuthenticated, requiredRoleType, hasRoleType]);

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // // TODO: Uncomment when role type access control is needed
  // if (!isAuthorized) {
  //   return (
  //     <Navigate
  //       to="/unauthorized"
  //       state={{ message: `This page requires ${requiredRoleType} role type` }}
  //       replace
  //     />
  //   );
  // }

  return <Outlet />;
}

/**
 * Requires user to have ANY of the specified roles
 * Usage: <AnyRoleProtectedRoute requiredRoles={['admin', 'moderator']} />
 */
export function AnyRoleProtectedRoute({ requiredRoles, fallbackPath = "/signin" }) {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasAnyRole(requiredRoles)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [isAuthenticated, requiredRoles, hasAnyRole]);

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ message: `This page requires one of: ${requiredRoles.join(', ')}` }}
        replace
      />
    );
  }

  return <Outlet />;
}

/**
 * Requires user to have ALL of the specified roles
 * Usage: <AllRolesProtectedRoute requiredRoles={['admin', 'therapist']} />
 */
export function AllRolesProtectedRoute({ requiredRoles, fallbackPath = "/signin" }) {
  const { isAuthenticated, hasAllRoles } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasAllRoles(requiredRoles)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [isAuthenticated, requiredRoles, hasAllRoles]);

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ message: `This page requires: ${requiredRoles.join(', ')}` }}
        replace
      />
    );
  }

  return <Outlet />;
}

/**
 * Requires user to be an admin
 * Shortcut for: <RoleTypeProtectedRoute requiredRoleType="admin" />
 */
export function AdminProtectedRoute({ fallbackPath = "/signin" }) {
  const { isAuthenticated, isAdmin: _isAdmin } = useAuth();

  // TODO: Uncomment to re-enable authentication protection
  // if (!isAuthenticated) {
  //   return <Navigate to={fallbackPath} replace />;
  // }

  // // TODO: Uncomment when admin access control is needed
  // if (!isAdmin) {
  //   return (
  //     <Navigate
  //       to="/unauthorized"
  //       state={{ message: "This page is for administrators only" }}
  //       replace
  //     />
  //   );
  // }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

/**
 * Requires user to be a caregiver
 * Shortcut for: <RoleTypeProtectedRoute requiredRoleType="caregiver" />
 */
export function CaregiverProtectedRoute({ fallbackPath = "/signin" }) {
  const { isAuthenticated, isCaregiver: _isCaregiver } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // // TODO: Uncomment when caregiver access control is needed
  // if (!isCaregiver) {
  //   return (
  //     <Navigate
  //       to="/unauthorized"
  //       state={{ message: "This page is for caregivers only" }}
  //       replace
  //     />
  //   );
  // }

  return <Outlet />;
}
