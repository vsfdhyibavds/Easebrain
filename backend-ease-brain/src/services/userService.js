/**
 * User API service
 */

import { apiGet, apiPost, apiPut, apiRequest } from "./api";

export const userService = {
  /**
   * Get current user profile
   */
  getCurrentUser: () =>
    apiGet("/api/me"),

  /**
   * Update current user
   */
  updateProfile: (data) =>
    apiPost("/api/me", data),

  /**
   * Update email
   */
  updateEmail: (newEmail) =>
    apiPost("/api/update-email", { new_email: newEmail }),

  /**
   * Change password
   */
  changePassword: (currentPassword, newPassword) =>
    apiPost("/api/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  /**
   * Get user settings
   */
  getSettings: () =>
    apiGet("/api/settings"),

  /**
   * Update user settings
   */
  updateSettings: (settings) =>
    apiPost("/api/settings", settings),

  /**
   * Upload avatar
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiRequest("/api/upload-avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: formData,
    }, false).then((res) => res); // includeAuth=false since we set auth manually
  },

  /**
   * Get user messages
   */
  getMessages: (page = 1, perPage = 20) =>
    apiGet(`/api/messages?page=${page}&per_page=${perPage}`),

  /**
   * Send message
   */
  sendMessage: (recipientId, content) =>
    apiPost("/api/messages", { recipient_id: recipientId, content }),

  /**
   * Get reminders
   */
  getReminders: () =>
    apiGet("/api/reminders"),

  /**
   * Create reminder
   */
  createReminder: (data) =>
    apiPost("/api/reminders", data),

  /**
   * Update reminder
   */
  updateReminder: (reminderId, data) =>
    apiPut(`/api/reminders/${reminderId}`, data),

  /**
   * Delete reminder
   */
  deleteReminder: (reminderId) =>
    apiGet(`/api/reminders/${reminderId}/delete`),
};

export default userService;
