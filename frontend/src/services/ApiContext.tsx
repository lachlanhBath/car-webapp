import React, { createContext, useContext } from 'react';
import { mockData } from '../mocks/data';

// Define the shape of the context
interface ApiContextType {
  apiClient: typeof mockData;
}

// Create context with a default value
export const ApiContext = createContext<ApiContextType>({
  apiClient: mockData,
});

// Custom hook to use the API context
export const useApi = () => useContext(ApiContext);

// Provider component for wrapping the app
interface ApiProviderProps {
  children: React.ReactNode;
  client?: typeof mockData;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ 
  children, 
  client = mockData 
}) => {
  return (
    <ApiContext.Provider value={{ apiClient: client }}>
      {children}
    </ApiContext.Provider>
  );
}; 