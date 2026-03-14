/**
 * Caregivers API service
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const caregiversService = {
  /**
   * Get user's caregivers
   */
  getCaregivers: () =>
    apiGet("/api/caregivers/connections"),

  /**
   * Add caregiver
   */
  addCaregiver: (data) =>
    apiPost("/api/caregivers/add-caregiver", data),

  /**
   * Update caregiver connection
   */
  updateCaregiver: (connectionId, data) =>
    apiPut(`/api/caregivers/connections/${connectionId}`, data),

  /**
   * Remove caregiver
   */
  removeCaregiver: (connectionId) =>
    apiDelete(`/api/caregivers/connections/${connectionId}`),

  /**
   * Get caregiver notifications
   */
  getNotifications: () =>
    apiGet("/api/caregivers/notifications"),

  /**
   * Send warning sign notification
   */
  sendWarningNotification: (caregiverId, data) =>
    apiPost(`/api/caregivers/warning-signs/${caregiverId}/notify`, data),

  /**
   * Acknowledge warning
   */
  acknowledgeWarning: (warningId) =>
    apiPost(`/api/caregivers/warnings/${warningId}/acknowledge`),

  /**
   * Share questionnaire results
   */
  shareResults: (caregiverId, data) =>
    apiPost(`/api/caregivers/share-results/${caregiverId}`, data),
};

export default caregiversService;
