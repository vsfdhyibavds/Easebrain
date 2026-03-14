import { baseApi } from "./baseApi";

export const therapistsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTherapists: builder.query({
      query: ({ specialization, location } = {}) => {
        const params = new URLSearchParams();
        if (specialization) params.append('specialization', specialization);
        if (location) params.append('location', location);
        return `/therapists?${params.toString()}`;
      },
      providesTags: ["Therapists"],
    }),
  }),
});

export const { useGetTherapistsQuery } = therapistsApi;
