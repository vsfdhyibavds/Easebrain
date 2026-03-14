import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateProfile: builder.mutation({
      query: (profile) => ({
        url: '/settings/profile',
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['Settings'],
    }),
    updateNotifications: builder.mutation({
      query: (notifications) => ({
        url: '/settings/notifications',
        method: 'PUT',
        body: notifications,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateProfileMutation,
  useUpdateNotificationsMutation,
} = settingsApi;
