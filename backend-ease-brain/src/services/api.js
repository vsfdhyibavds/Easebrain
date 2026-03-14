/**
 * Core API service with base configuration, interceptors, and error handling
 * Uses fetch API - designed to work alongside React Query hooks
 */

import { BASE_URL } from "@/utils/utils";

const API_BASE = BASE_URL || "";

/**
 * Default fetch options
 */
const defaultOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Get authorization token
 */
const getAuthToken = () => {
  try {
    return localStorage.getItem("access_token");
  } catch (err) {
    console.warn("Failed to get auth token from localStorage:", err);
    return null;
  }
};

/**
 * Get headers with authorization
 */
const getHeaders = (includeAuth = true) => {
  const headers = { ...defaultOptions.headers };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Handle API errors with user-friendly messages
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Make authenticated API request
 */
export const apiRequest = async (
  endpoint,
  options = {},
  includeAuth = true
) => {
  try {
    const url = `${API_BASE}${endpoint}`;
    const headers = getHeaders(includeAuth);

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
      throw new ApiError(
        "Session expired. Please log in again.",
        401,
        null
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or JSON parse error
    console.error("API request error:", error);
    throw new ApiError(
      error.message || "Failed to connect to server",
      null,
      null
    );
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}, includeAuth = true) => {
  return apiRequest(endpoint, {
    ...options,
    method: "GET",
  }, includeAuth);
};

/**
 * POST request
 */
export const apiPost = (endpoint, body = {}, options = {}, includeAuth = true) => {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  }, includeAuth);
};

/**
 * PUT request
 */
export const apiPut = (endpoint, body = {}, options = {}, includeAuth = true) => {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  }, includeAuth);
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}, includeAuth = true) => {
  return apiRequest(endpoint, {
    ...options,
    method: "DELETE",
  }, includeAuth);
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
