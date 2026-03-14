import { baseApi } from "./baseApi";

export const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== POSTS ====================
    // Get pending posts awaiting moderation approval
    getPendingPosts: builder.query({
      query: ({ communityId, page = 1, perPage = 10, sortBy = 'oldest' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', perPage);
        params.append('sort', sortBy);
        return `/moderation/${communityId}/posts/pending?${params.toString()}`;
      },
      providesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [{ type: 'PendingPosts', id: communityId }];
      },
    }),

    // Get flagged posts reported by community members
    getFlaggedPosts: builder.query({
      query: ({ communityId, page = 1, perPage = 10 } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', perPage);
        return `/moderation/${communityId}/posts/flagged?${params.toString()}`;
      },
      providesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [{ type: 'FlaggedPosts', id: communityId }];
      },
    }),

    // Approve a pending post
    approvePost: builder.mutation({
      query: ({ postId, approvalNotes = '' }) => ({
        url: `/moderation/posts/${postId}/approve`,
        method: 'POST',
        body: {
          approval_notes: approvalNotes,
        },
      }),
      invalidatesTags: () => [
        { type: 'PendingPosts' },
        { type: 'ModerationLogs' },
      ],
    }),

    // Reject a pending post
    rejectPost: builder.mutation({
      query: ({ postId, rejectionReason = '' }) => ({
        url: `/moderation/posts/${postId}/reject`,
        method: 'POST',
        body: {
          rejection_reason: rejectionReason,
        },
      }),
      invalidatesTags: () => [
        { type: 'PendingPosts' },
        { type: 'ModerationLogs' },
      ],
    }),

    // ==================== MEMBERS ====================
    // Get community members with moderation status
    getCommunityMembersWithStatus: builder.query({
      query: ({ communityId, page = 1, perPage = 20, status = null } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', perPage);
        if (status) params.append('status', status);
        return `/moderation/${communityId}/members?${params.toString()}`;
      },
      providesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [{ type: 'CommunityMembers', id: communityId }];
      },
    }),

    // ==================== USER ACTIONS ====================
    // Suspend user from community
    suspendUser: builder.mutation({
      query: ({ userId, communityId, suspensionReason = '', durationDays = 7 }) => ({
        url: `/moderation/users/${userId}/suspend`,
        method: 'POST',
        body: {
          community_id: communityId,
          suspension_reason: suspensionReason,
          duration_days: durationDays,
        },
      }),
      invalidatesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [
          { type: 'CommunityMembers', id: communityId },
          { type: 'ModerationLogs', id: communityId },
        ];
      },
    }),

    // Ban user from community
    banUser: builder.mutation({
      query: ({ userId, communityId, banReason = '' }) => ({
        url: `/moderation/users/${userId}/ban`,
        method: 'POST',
        body: {
          community_id: communityId,
          ban_reason: banReason,
        },
      }),
      invalidatesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [
          { type: 'CommunityMembers', id: communityId },
          { type: 'ModerationLogs', id: communityId },
        ];
      },
    }),

    // Restore user access (unsuspend/unban)
    restoreUser: builder.mutation({
      query: ({ userId, communityId, restorationNotes = '' }) => ({
        url: `/moderation/users/${userId}/restore`,
        method: 'POST',
        body: {
          community_id: communityId,
          restoration_notes: restorationNotes,
        },
      }),
      invalidatesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [
          { type: 'CommunityMembers', id: communityId },
          { type: 'ModerationLogs', id: communityId },
        ];
      },
    }),

    // ==================== LOGS ====================
    // Get moderation audit logs
    getModerationLogs: builder.query({
      query: ({ communityId, page = 1, perPage = 20, actionType = null, userId = null } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', perPage);
        if (actionType) params.append('action_type', actionType);
        if (userId) params.append('user_id', userId);
        return `/moderation/${communityId}/logs?${params.toString()}`;
      },
      providesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [{ type: 'ModerationLogs', id: communityId }];
      },
    }),

    // ==================== SETTINGS ====================
    // Get community moderation settings
    getModerationSettings: builder.query({
      query: (communityId) => `/moderation/${communityId}/settings`,
      providesTags: (...args) => {
        const communityId = args[2];
        return [{ type: 'ModerationSettings', id: communityId }];
      },
    }),

    // Update community moderation settings
    updateModerationSettings: builder.mutation({
      query: ({
        communityId,
        requiresModeration,
        allowsAnonymousPosting,
        communityGuidelines,
        crisisHotlinePhone,
        crisisHotlineUrl,
        keywords = [],
      }) => ({
        url: `/moderation/${communityId}/settings`,
        method: 'POST',
        body: {
          requires_moderation: requiresModeration,
          allows_anonymous_posting: allowsAnonymousPosting,
          community_guidelines: communityGuidelines,
          crisis_hotline_phone: crisisHotlinePhone,
          crisis_hotline_url: crisisHotlineUrl,
          keywords,
        },
      }),
      invalidatesTags: (...args) => {
        const communityId = args[2]?.communityId;
        return [{ type: 'ModerationSettings', id: communityId }];
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useGetPendingPostsQuery,
  useGetFlaggedPostsQuery,
  useApprovePostMutation,
  useRejectPostMutation,
  useGetCommunityMembersWithStatusQuery,
  useSuspendUserMutation,
  useBanUserMutation,
  useRestoreUserMutation,
  useGetModerationLogsQuery,
  useGetModerationSettingsQuery,
  useUpdateModerationSettingsMutation,
} = moderationApi;
