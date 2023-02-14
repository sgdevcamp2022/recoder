import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const testAPI = createApi({
  reducerPath: "testAPI",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  tagTypes: ["Test"],
  endpoints: (builder) => ({
    getTests: builder.query({
      query: () => "test",
      providesTags: ["Test"],
    }),
    getTest: builder.query({
      query: (id: string) => `test/${id}`,
      providesTags: (result, error, id) => [{ type: "Test", id }],
    }),
    createTest: builder.mutation({
      query: (body: any) => ({
        url: "test",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Test"],
    }),
  }),
});

export const { useGetTestsQuery, useGetTestQuery, useCreateTestMutation } =
  testAPI;
