/**
 * Stories API service
 */

import { apiGet, apiPost } from "./api";

export const storiesService = {
  /**
   * Get all stories
   */
  getStories: (page = 1, perPage = 10, category = null) => {
    let endpoint = `/api/stories/?page=${page}&per_page=${perPage}`;
    if (category) {
      endpoint += `&category=${category}`;
    }
    return apiGet(endpoint);
  },

  /**
   * Get specific story
   */
  getStory: (storyId) =>
    apiGet(`/api/stories/${storyId}`),

  /**
   * Create story
   */
  createStory: (data) =>
    apiPost("/api/stories/", data),

  /**
   * Update story
   */
  updateStory: (storyId, data) =>
    apiPost(`/api/stories/${storyId}`, data),

  /**
   * Like story
   */
  likeStory: (storyId) =>
    apiPost(`/api/stories/${storyId}/like`),

  /**
   * Share story
   */
  shareStory: (storyId) =>
    apiPost(`/api/stories/${storyId}/share`),

  /**
   * Comment on story
   */
  commentOnStory: (storyId, content) =>
    apiPost(`/api/stories/${storyId}/comments`, { content }),

  /**
   * Approve story (moderation)
   */
  approveStory: (storyId) =>
    apiPost(`/api/stories/${storyId}/approve`),

  /**
   * Get story categories
   */
  getCategories: () =>
    apiGet("/api/stories/categories"),
};

export default storiesService;
