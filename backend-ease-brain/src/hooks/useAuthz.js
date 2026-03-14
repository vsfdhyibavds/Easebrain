import { useAuth } from "@/features/auth/AuthContext";

/**
 * Hook to conditionally render content based on user roles.
 * Useful for showing/hiding UI elements that the user doesn't have permission to access.
 *
 * @example
 * const { can } = useAuthz();
 * return (
 *   <>
 *     {can('admin') && <AdminPanel />}
 *     {can(['edit', 'delete']) && <EditDeleteButtons />}
 *   </>
 * );
 */
export function useAuthz() {
  const auth = useAuth();

  /**
   * Check if user has a specific role
   * @param {string} role - Role name to check
   * @returns {boolean}
   */
  const can = (role) => {
    if (typeof role === 'string') {
      return auth.hasRole(role);
    }
    // If array, check if user has ANY of the roles
    if (Array.isArray(role)) {
      return auth.hasAnyRole(role);
    }
    return false;
  };

  /**
   * Check if user has a specific role type
   * @param {string} roleType - Role type to check (e.g., 'admin', 'caregiver')
   * @returns {boolean}
   */
  const canType = (roleType) => {
    return auth.hasRoleType(roleType);
  };

  /**
   * Check if user has ALL specified roles
   * @param {string[]} roles - Array of role names
   * @returns {boolean}
   */
  const canAll = (roles) => {
    return auth.hasAllRoles(roles);
  };

  /**
   * Check if user cannot perform an action (negation helper)
   * @param {string | string[]} role - Role name(s) to check
   * @returns {boolean}
   */
  const cannot = (role) => {
    return !can(role);
  };

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return auth.isAdmin;
  };

  /**
   * Check if user is caregiver
   * @returns {boolean}
   */
  const isCaregiver = () => {
    return auth.isCaregiver;
  };

  return {
    can,
    canType,
    canAll,
    cannot,
    isAdmin,
    isCaregiver,
    userRoles: auth.userRoles,
    userRoleTypes: auth.userRoleTypes,
  };
}

/**
 * Conditional rendering component that shows content only if user has required role
 *
 * @example
 * <CanAccess role="admin">
 *   <AdminPanel />
 * </CanAccess>
 *
 * @example
 * <CanAccess roles={['edit', 'delete']}>
 *   <EditDeleteButtons />
 * </CanAccess>
 */
export function CanAccess({ children, role, roles, fallback = null }) {
  const { can } = useAuthz();

  if (role && can(role)) {
    return children;
  }

  if (roles && can(roles)) {
    return children;
  }

  return fallback;
}

/**
 * Conditional rendering component for role types
 *
 * @example
 * <CanAccessByType roleType="admin">
 *   <AdminPanel />
 * </CanAccessByType>
 */
export function CanAccessByType({ children, roleType, fallback = null }) {
  const { canType } = useAuthz();

  if (canType(roleType)) {
    return children;
  }

  return fallback;
}

/**
 * Conditional rendering component for negation (cannot do something)
 *
 * @example
 * <Cannot role="admin">
 *   <p>This feature is only for non-admins</p>
 * </Cannot>
 */
export function Cannot({ children, role, roles, fallback = null }) {
  const { cannot } = useAuthz();

  if (role && cannot(role)) {
    return children;
  }

  if (roles && cannot(roles)) {
    return children;
  }

  return fallback;
}
