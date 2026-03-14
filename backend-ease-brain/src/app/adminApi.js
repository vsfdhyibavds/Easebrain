import { baseApi } from "./baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin dashboard stats
    getAdminStats: builder.query({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),

    // Get admin reports
    getAdminReports: builder.query({
      query: ({ status, severity, search } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (severity) params.append("severity", severity);
        if (search) params.append("search", search);
        return `/admin/reports?${params.toString()}`;
      },
      providesTags: ["AdminReports"],
    }),

    // Get admin activity feed
    getAdminActivity: builder.query({
      query: (limit = 20) => `/admin/activity?limit=${limit}`,
      providesTags: ["AdminActivity"],
    }),

    // Get chart data for user growth trends
    getUserGrowthData: builder.query({
      query: (timeRange = "week") => `/admin/analytics/user-growth?range=${timeRange}`,
      providesTags: ["AdminAnalytics"],
    }),

    // Get content distribution data
    getContentDistribution: builder.query({
      query: () => "/admin/analytics/content-distribution",
      providesTags: ["AdminAnalytics"],
      // Return harmonized teal/cyan colors for content types
      transformResponse: (response) => {
        if (Array.isArray(response) && response.length > 0) {
          return response;
        }
        // Default harmonized colors if no data
        return [
          { name: 'Notes', value: 35, color: '#0d9488' },
          { name: 'Forum Posts', value: 25, color: '#14b8a6' },
          { name: 'Messages', value: 20, color: '#2dd4bf' },
          { name: 'Reminders', value: 15, color: '#5eead4' },
          { name: 'Community', value: 5, color: '#99f6e4' },
        ];
      },
    }),

    // Get usage by time data
    getUsageByTimeData: builder.query({
      query: (timeRange = "week") => `/admin/analytics/usage?range=${timeRange}`,
      providesTags: ["AdminAnalytics"],
    }),

    // Get recent admin actions
    getRecentActions: builder.query({
      query: (limit = 10) => `/admin/actions/recent?limit=${limit}`,
      providesTags: ["AdminActions"],
    }),

    // Approve a report
    approveReport: builder.mutation({
      query: (reportId) => ({
        url: `/admin/reports/${reportId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["AdminReports"],
    }),

    // Reject a report
    rejectReport: builder.mutation({
      query: (reportId) => ({
        url: `/admin/reports/${reportId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["AdminReports"],
    }),

    // Ban user
    banUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}/ban`,
        method: "POST",
      }),
      invalidatesTags: ["AdminStats", "AdminReports"],
    }),

    // Escalate report
    escalateReport: builder.mutation({
      query: (reportId) => ({
        url: `/admin/reports/${reportId}/escalate`,
        method: "POST",
      }),
      invalidatesTags: ["AdminReports"],
    }),

    // Assign report to admin
    assignReport: builder.mutation({
      query: ({ reportId, adminId }) => ({
        url: `/admin/reports/${reportId}/assign`,
        method: "POST",
        body: { admin_id: adminId },
      }),
      invalidatesTags: ["AdminReports"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminReportsQuery,
  useGetAdminActivityQuery,
  useGetUserGrowthDataQuery,
  useGetContentDistributionQuery,
  useGetUsageByTimeDataQuery,
  useGetRecentActionsQuery,
  useApproveReportMutation,
  useRejectReportMutation,
  useBanUserMutation,
  useEscalateReportMutation,
  useAssignReportMutation,
} = adminApi;
