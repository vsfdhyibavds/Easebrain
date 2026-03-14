import { baseApi } from "./baseApi";

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Community Management
    getCommunities: builder.query({
      query: ({ subjectArea, search, page = 1, perPage = 20 } = {}) => {
        const params = new URLSearchParams();
        if (subjectArea) params.append('subject_area', subjectArea);
        if (search) params.append('search', search);
        params.append('page', page);
        params.append('per_page', perPage);
        return `/community/?${params.toString()}`;
      },
      providesTags: ['Community'],
    }),

    getCommunity: builder.query({
      query: (id) => `/community/${id}`,
      providesTags: (result, error, id) => [{ type: 'Community', id }],
    }),

    getCommunityStats: builder.query({
      query: (communityId) => `/community/${communityId}/stats`,
      providesTags: (result, error, communityId) => [{ type: 'CommunityStats', id: communityId }],
    }),

    getCommunityMembers: builder.query({
      // expects backend endpoint: /user-communities?community_id=ID
      query: (communityId) => `/user-communities?community_id=${communityId}`,
      providesTags: (result, error, communityId) => [{ type: 'UserCommunity', id: communityId }],
    }),

    checkModeratorStatus: builder.query({
      query: (communityId) => `/community/${communityId}/moderator-status`,
      providesTags: (result, error, communityId) => [{ type: 'ModeratorStatus', id: communityId }],
    }),

    // Community Posts
    getCommunityPosts: builder.query({
      query: ({ communityId, page = 1, perPage = 20, sort = 'recent' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', perPage);
        params.append('sort', sort);
        return `/community/${communityId}/posts?${params.toString()}`;
      },
      providesTags: (result, error, { communityId }) => [{ type: 'CommunityPost', id: communityId }],
    }),

    createPost: builder.mutation({
      query: ({ communityId, title, content, postType = 'discussion', hasTriggerWarning, triggerWarningText, isAnonymous }) => ({
        url: `/community/${communityId}/posts`,
        method: 'POST',
        body: {
          title,
          content,
          post_type: postType,
          has_trigger_warning: hasTriggerWarning,
          trigger_warning_text: triggerWarningText,
          is_anonymous: isAnonymous,
        },
      }),
      invalidatesTags: (result, error, { communityId }) => [{ type: 'CommunityPost', id: communityId }],
    }),

    getPost: builder.query({
      query: (postId) => `/community/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    // Post Interactions
    replyToPost: builder.mutation({
      query: ({ postId, content }) => ({
        url: `/community/posts/${postId}/reply`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    likePost: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    markHelpful: builder.mutation({
      query: (postId) => ({
        url: `/community/posts/${postId}/helpful`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    // Content Moderation
    reportPost: builder.mutation({
      query: ({ postId, reason, description }) => ({
        url: `/community/posts/${postId}/report`,
        method: 'POST',
        body: {
          reason,
          description,
        },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    getPendingPosts: builder.query({
      query: ({ communityId } = {}) => {
        const params = new URLSearchParams();
        if (communityId) params.append('community_id', communityId);
        return `/community/posts/pending${params.toString() ? '?' + params.toString() : ''}`;
      },
      providesTags: ['PendingPost'],
    }),

    approvePost: builder.mutation({
      query: ({ postId, action, reason }) => ({
        url: `/community/posts/${postId}/approve`,
        method: 'POST',
        body: {
          action,
          reason,
        },
      }),
      invalidatesTags: [{ type: 'Post' }, { type: 'PendingPost' }],
    }),

    rejectPost: builder.mutation({
      query: ({ postId, reason }) => ({
        url: `/community/posts/${postId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [{ type: 'Post' }, { type: 'PendingPost' }],
    }),

    getFlaggedPosts: builder.query({
      query: (communityId) => `/community/${communityId}/flagged`,
      providesTags: (result, error, communityId) => [{ type: 'FlaggedPost', id: communityId }],
    }),
  }),
});

export const {
  // Queries
  useGetCommunitiesQuery,
  useGetCommunityQuery,
  useGetCommunityStatsQuery,
  useGetCommunityPostsQuery,
  useGetPostQuery,
  useGetPendingPostsQuery,
  useGetFlaggedPostsQuery,
  useGetCommunityMembersQuery,
  useCheckModeratorStatusQuery,
  // Mutations
  useCreatePostMutation,
  useReplyToPostMutation,
  useLikePostMutation,
  useMarkHelpfulMutation,
  useReportPostMutation,
  useApprovePostMutation,
  useRejectPostMutation,
} = communityApi;
