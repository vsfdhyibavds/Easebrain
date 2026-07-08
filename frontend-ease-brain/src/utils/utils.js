// src/utils.js

// Behavior:
// - If the Vite env var VITE_BASE_URL is set, always use it.
// - In development, use a relative base ("") so the Vite dev server
//   proxy rules forward requests to the backend (recommended for local dev).
// - In production, use a relative "/api" base — since Flask serves the
//   frontend from the same origin, relative paths always work.
const VITE_BASE = import.meta.env.VITE_BASE_URL;

// Determine the raw base: explicit env wins, dev uses /api proxy, prod uses relative /api
let _base = VITE_BASE
  ? VITE_BASE
  : "/api";

// Normalize: remove trailing slashes
if (_base && _base.endsWith("/")) {
  _base = _base.replace(/\/+$/g, "");
}

export const BASE_URL = _base;

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
