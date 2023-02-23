import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const linkAPI = createApi({
  reducerPath: "linkAPI",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/" }),
  tagTypes: ["Link"],
  endpoints: (builder) => ({
    getLink: builder.query({
      query: () => ({
        url: "createLink",
        method: "GET",
        transformResponse: (response: any) => {
          return response.link;
        },
      }),
      providesTags: ["Link"],
    }),
  }),
});

export const { useGetLinkQuery } = linkAPI;
