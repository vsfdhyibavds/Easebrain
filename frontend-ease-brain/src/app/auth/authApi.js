// Handles authentication-related API calls:
// login
// signup
// logout
// refreshToken
// resendVerificationEmail
// getCurrentUser (/me)
// verifyEmail

import { baseApi } from "@/app/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (signupData) => ({
        url: "/signup",
        method: "POST",
        body: signupData,
      }),
      invalidatesTags: ["User"], //to refresh user list after signup
    }),
    login: builder.mutation({
      query: (loginData) => ({
        url: "/login",
        method: "POST",
        body: loginData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    getCurrentUser: builder.query({
      query: () => "/me",
      providesTags: ["User"],
    }),

    resendVerificationEmail: builder.mutation({
      // allow caller to pass { email } for unauthenticated resends
      query: (payload) => ({
        url: "/resend-email-verification",
        method: "POST",
        body: payload || undefined,
      }),
    }),

    refreshToken: builder.mutation({
      query: () => ({
        url: "/refresh-token",
        method: "POST",
      }),
    }),

    verifyEmail: builder.query({
      query: (token) => `/verify-email?token=${token}`,
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useResendVerificationEmailMutation,
  useRefreshTokenMutation,
  useVerifyEmailQuery,
} = authApi;
