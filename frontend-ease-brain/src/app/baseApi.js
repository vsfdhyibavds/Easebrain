import { BASE_URL } from "@/utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Role",
    "UserRole",
    "Message",
    "CaregiverNote",
    "Community",
    "UserCommunity",
    "Organization",
    "PendingPosts",
    "FlaggedPosts",
    "CommunityMembers",
    "ModerationLogs",
    "ModerationSettings",
  ],
  endpoints: () => ({}),
});

export const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),
    getNotes: builder.query({
      query: () => '/notes',
      providesTags: ['Notes'],
    }),
    getReminders: builder.query({
      query: () => '/reminders',
      providesTags: ['Reminders'],
    })
  })
});

export const {
  useGetStatsQuery,
  useGetNotesQuery,
  useGetRemindersQuery
} = api;

