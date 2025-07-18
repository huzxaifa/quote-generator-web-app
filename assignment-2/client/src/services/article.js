import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const articleApi = createApi({
  reducerPath: 'articleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_RAPID_API_ARTICLE_URL,
    prepareHeaders: (headers) => {
      headers.set('X-RapidAPI-Key', import.meta.env.VITE_RAPID_API_ARTICLE_KEY);
      headers.set('X-RapidAPI-Host', import.meta.env.VITE_RAPID_API_ARTICLE_HOST);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSummary: builder.query({
      query: ({ articleUrl, length = 3 }) => ({
        url: `?url=${encodeURIComponent(articleUrl)}&length=${length}`,
        method: 'GET', // Explicitly set method if required
      }),
    }),
  }),
});

export const { useLazyGetSummaryQuery } = articleApi;