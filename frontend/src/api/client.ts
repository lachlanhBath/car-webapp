import axios from 'axios';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptors if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add authentication headers here in the future
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptors for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      status: error.response?.status,
      message: error.response?.data?.error?.message || 'An unexpected error occurred',
      code: error.response?.data?.error?.code || 'unknown_error',
      details: error.response?.data?.error?.details || {},
    };
    return Promise.reject(customError);
  }
);

export default apiClient; 