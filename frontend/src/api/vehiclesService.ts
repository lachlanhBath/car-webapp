import apiClient from './client';

export const vehiclesService = {
  getVehicleById: async (id: string) => {
    return apiClient.get(`/vehicles/${id}`);
  },
  
  getVehicleMOTHistory: async (id: string) => {
    return apiClient.get(`/vehicles/${id}/mot_histories`);
  },
  
  lookupVehicleByRegistration: async (registration: string) => {
    return apiClient.post('/vehicles/lookup', { registration });
  }
}; 