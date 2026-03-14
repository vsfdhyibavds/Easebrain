// Handles CRUD and profile management:
// getUserById
// updateUser
// uploadAvatar
// changePassword
// listUsers (admin)

import { baseApi } from "../baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      transformResponse: (response) => response.users, // returns only the array
      providesTags: ["User"],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: (response) => response.user || response, // handles both wrapped and direct object
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    addUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ user_id, ...patch }) => ({
        url: `/users/${user_id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { user_id }) => [
        { type: "User", id: user_id },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
