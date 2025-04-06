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
    const response = await apiClient.get('/listings', { params });
    return response;
  },
  
  getListingById: async (id: string) => {
    return apiClient.get(`/listings/${id}`);
  },
  
  processAutotraderUrl: async (url: string) => {
    console.log('Sending request to process URL:', url);
    try {
      const response = await apiClient.post('/listings/process_url', { url });
      console.log('Raw API response:', response);
      return response;
    } catch (error) {
      console.error('API error in processAutotraderUrl:', error);
      throw error;
    }
  },
  
  checkProcessingStatus: async (listingId: string) => {
    return apiClient.get(`/listings/${listingId}/check_processing_status`);
  }
}; 