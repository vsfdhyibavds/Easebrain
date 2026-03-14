// src/utils.js

// Behavior:
// - If the Vite env var VITE_BASE_URL is set, always use it (useful for explicit
//   local setups or when running against a remote backend).
// - Otherwise, in development use a relative base ("") so the Vite dev server
//   proxy rules can forward requests to the backend (recommended for local dev).
// - In production, fall back to the hosted backend URL.
const PROD_FALLBACK = "https://easebrain-backend.onrender.com/api";

const VITE_BASE = import.meta.env.VITE_BASE_URL;

// Determine the raw base first (explicit env wins, otherwise use dev-relative or prod fallback)
let _base = VITE_BASE
  ? VITE_BASE
  : import.meta.env.MODE === "development"
  ? "/api"
  : PROD_FALLBACK;

// Normalize: remove trailing slashes when a non-empty base is provided so callers
// concatenating with leading-paths (e.g. `${BASE_URL}/login`) don't produce `//`.
if (_base && _base.endsWith("/")) {
  _base = _base.replace(/\/+$/g, "");
}

export const BASE_URL = _base;

// Helpful debug message during development when using /api base
if (import.meta.env.MODE === "development" && !VITE_BASE) {
  console.info(
    "BASE_URL is '/api'. Vite dev server proxy must be configured to forward /api requests (see vite.config.js)."
  );
}

/**
 * Safely get item from localStorage
 */
export const safeGetStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Storage read error for key "${key}":`, error);
    return null;
  }
};

/**
 * Safely set item in localStorage
 */
export const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Storage write error for key "${key}":`, error);
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch (error) {
    console.error("Invalid or malformed token:", error);
    return true; // treat invalid tokens as expired
  }
};
