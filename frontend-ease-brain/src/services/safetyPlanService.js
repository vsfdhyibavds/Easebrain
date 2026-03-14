/**
 * Safety Plans API service
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const safetyPlanService = {
  /**
   * Get all user's safety plans
   */
  getPlans: () =>
    apiGet("/api/safety-plans/"),

  /**
   * Get specific safety plan
   */
  getPlan: (planId) =>
    apiGet(`/api/safety-plans/${planId}`),

  /**
   * Create safety plan
   */
  createPlan: (data) =>
    apiPost("/api/safety-plans/", data),

  /**
   * Update safety plan
   */
  updatePlan: (planId, data) =>
    apiPut(`/api/safety-plans/${planId}`, data),

  /**
   * Share safety plan with caregivers
   */
  sharePlan: (planId, caregiverIds, canEdit = false) =>
    apiPost(`/api/safety-plans/${planId}/share`, {
      caregiver_ids: caregiverIds,
      can_edit: canEdit,
    }),

  /**
   * Get who has access to plan
   */
  getPlanAccess: (planId) =>
    apiGet(`/api/safety-plans/${planId}/access`),

  /**
   * Revoke caregiver access
   */
  revokePlanAccess: (planId, caregiverId) =>
    apiDelete(`/api/safety-plans/${planId}/revoke/${caregiverId}`),

  /**
   * Get safety plan update history
   */
  getPlanHistory: (planId) =>
    apiGet(`/api/safety-plans/${planId}/history`),

  /**
   * Get accessible plans (caregiver view)
   */
  getAccessiblePlans: () =>
    apiGet("/api/safety-plans/caregiver/accessible"),
};

export default safetyPlanService;
