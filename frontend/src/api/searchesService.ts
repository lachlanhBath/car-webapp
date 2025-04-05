import apiClient from './client';
import { ListingsParams } from './listingsService';

export const searchesService = {
  saveSearch: async (searchParams: ListingsParams) => {
    return apiClient.post('/searches', searchParams);
  },
  
  getRecentSearches: async () => {
    return apiClient.get('/searches/recent');
  },
  
  getPopularSearches: async () => {
    return apiClient.get('/searches/popular');
  }
}; 