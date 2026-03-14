/**
 * Community API service
 */

import { apiGet, apiPost } from "./api";

export const communityService = {
  /**
   * Get all communities
   */
  getCommunities: () =>
    apiGet("/api/community/"),

  /**
   * Get community posts
   */
  getCommunityPosts: (communityId, page = 1, perPage = 8, sort = "recent") =>
    apiGet(`/api/community/${communityId}/posts?page=${page}&per_page=${perPage}&sort=${sort}`),

  /**
   * Get specific post
   */
  getPost: (postId) =>
    apiGet(`/api/community/posts/${postId}`),

  /**
   * Create post
   */
  createPost: (communityId, data) =>
    apiPost(`/api/community/${communityId}/posts`, data),

  /**
   * Like post
   */
  likePost: (postId) =>
    apiPost(`/api/community/posts/${postId}/like`),

  /**
   * Mark post as helpful
   */
  markHelpful: (postId) =>
    apiPost(`/api/community/posts/${postId}/helpful`),

  /**
   * Reply to post
   */
  replyToPost: (postId, content) =>
    apiPost(`/api/community/posts/${postId}/reply`, { content }),

  /**
   * Approve post (moderation)
   */
  approvePost: (postId) =>
    apiPost(`/api/community/posts/${postId}/approve`),

  /**
   * Get pending posts (moderation)
   */
  getPendingPosts: () =>
    apiGet("/api/community/posts/pending"),
};

export default communityService;
