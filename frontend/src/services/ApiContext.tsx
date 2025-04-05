import React, { createContext, useContext } from 'react';
import { listingsService, ListingsParams } from '../api/listingsService';
import { vehiclesService } from '../api/vehiclesService';
import { searchesService } from '../api/searchesService';

// Define the shape of the context with real API services
interface ApiContextType {
  listings: {
    getListings: (params?: ListingsParams) => Promise<any>;
    getListingById: (id: string) => Promise<any>;
  };
  vehicles: {
    getVehicleById: (id: string) => Promise<any>;
    getVehicleMOTHistory: (id: string) => Promise<any>;
    lookupVehicleByRegistration: (registration: string) => Promise<any>;
  };
  searches: {
    saveSearch: (params: any) => Promise<any>;
    getRecentSearches: () => Promise<any>;
    getPopularSearches: () => Promise<any>;
  };
}

// Create real API services
const realApiServices: ApiContextType = {
  listings: listingsService,
  vehicles: vehiclesService,
  searches: searchesService
};

// Create context with real API services
export const ApiContext = createContext<ApiContextType>(realApiServices);

// Custom hook to use the API context
export const useApi = () => useContext(ApiContext);

// Provider component for wrapping the app
interface ApiProviderProps {
  children: React.ReactNode;
  // For testing, we might still need to override the services
  services?: Partial<ApiContextType>;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ 
  children, 
  services = {} 
}) => {
  // Merge any provided services with the default real API services
  const apiServices = {
    ...realApiServices,
    ...services
  };

  return (
    <ApiContext.Provider value={apiServices}>
      {children}
    </ApiContext.Provider>
  );
}; 