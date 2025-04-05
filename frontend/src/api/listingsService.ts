import apiClient from './client';

export interface ListingsParams {
  page?: number;
  per_page?: number;
  make?: string;
  model?: string;
  min_price?: number;
  max_price?: number;
  year_from?: number;
  year_to?: number;
  fuel_type?: string;
  transmission?: string;
  sort_by?: string;
  sort_order?: string;
}

export const listingsService = {
  getListings: async (params: ListingsParams = {}) => {
    return apiClient.get('/listings', { params });
  },
  
  getListingById: async (id: string) => {
    return apiClient.get(`/listings/${id}`);
  }
}; 