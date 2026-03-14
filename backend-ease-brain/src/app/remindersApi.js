import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const remindersApi = createApi({
  reducerPath: 'remindersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Reminder'],
  endpoints: (builder) => ({
    getReminders: builder.query({
      query: () => '/reminders',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Reminder', id })),
        { type: 'Reminder', id: 'LIST' },
      ],
    }),
    addReminder: builder.mutation({
      query: (reminder) => ({
        url: '/reminders',
        method: 'POST',
        body: reminder,
      }),
      invalidatesTags: [{ type: 'Reminder', id: 'LIST' }],
    }),
    updateReminder: builder.mutation({
      query: ({ id, ...reminder }) => ({
        url: `/reminders/${id}`,
        method: 'PUT',
        body: reminder,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Reminder', id },
        { type: 'Reminder', id: 'LIST' },
      ],
    }),
    deleteReminder: builder.mutation({
      query: (id) => ({
        url: `/reminders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Reminder', id },
        { type: 'Reminder', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useAddReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = remindersApi;
