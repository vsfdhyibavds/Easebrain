import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const notesApi = createApi({
  reducerPath: 'notesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: () => '/caregiver-notes',
    }),
    getNote: builder.query({
      query: (id) => `/caregiver-notes/${id}`,
    }),
    addNote: builder.mutation({
      query: (note) => ({
        url: '/caregiver-notes',
        method: 'POST',
        body: note,
      }),
    }),
    updateNote: builder.mutation({
      query: ({ id, ...note }) => ({
        url: `/caregiver-notes/${id}`,
        method: 'PUT',
        body: note,
      }),
    }),
    deleteNote: builder.mutation({
      query: (id) => ({
        url: `/caregiver-notes/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi;
