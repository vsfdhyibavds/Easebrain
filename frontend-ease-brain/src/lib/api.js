// Centralized API utility for frontend-ease-brain
import { BASE_URL } from "../utils/utils";

export { BASE_URL };

export async function signUp(data) {
  return fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

export async function signIn(data) {
  return fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

export async function getUser(token, userId) {
  return fetch(`${BASE_URL}/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());
}

export async function updateUser(token, userId, data) {
  return fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json());
}


export async function getUserRoles(token, userId) {
  return fetch(`${BASE_URL}/user_roles?user_id=${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());
}

export async function getRoles(token) {
  return fetch(`${BASE_URL}/roles`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());
}

export async function assignRole(token, userId, roleId) {
  return fetch(`${BASE_URL}/user_roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId, role_id: roleId })
  }).then(res => res.json());
}

export async function removeRole(token, userId, roleId) {
  return fetch(`${BASE_URL}/user_roles`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId, role_id: roleId })
  }).then(res => res.json());
}

/**
 * Authenticated fetch utility for API requests with JWT.
 * Usage:
 *   import { authFetch } from '../lib/api';
 *   authFetch('/me').then(...)
 */
export async function authFetch(url, options = {}) {
  // Use token from options if provided, otherwise from localStorage
  const token = options.token || localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (response.status === 401) {
    // Optionally handle unauthorized globally
    console.error('Unauthorized access. Please log in again.');
    // window.location.href = '/login';
  }
  return response;
}
