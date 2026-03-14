/**
 * Authentication API service
 */

import { apiPost } from "./api";

export const authService = {
  /**
   * Sign up user
   */
  signup: (email, password, first_name, last_name) =>
    apiPost("/api/signup", {
      email,
      password,
      first_name,
      last_name,
    }, { includeAuth: false }),

  /**
   * Login user
   */
  login: (email, password) =>
    apiPost("/api/login", {
      email,
      password,
    }, { includeAuth: false }),

  /**
   * Verify email
   */
  verifyEmail: (token) =>
    apiPost("/api/verify-email", {
      token,
    }, { includeAuth: false }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: (email) =>
    apiPost("/api/resend-email-verification", {
      email,
    }, { includeAuth: false }),

  /**
   * Request password reset
   */
  requestPasswordReset: (email) =>
    apiPost("/api/forgot-password", {
      email,
    }, { includeAuth: false }),

  /**
   * Reset password
   */
  resetPassword: (token, new_password) =>
    apiPost("/api/reset-password", {
      token,
      new_password,
    }, { includeAuth: false }),
};

export default authService;
