# Frontend API Integration Guide

## Overview
This guide outlines how the frontend application should integrate with the Rails API for the car listing application. The API follows RESTful principles and provides a consistent interface for retrieving and interacting with car listings and vehicle data.

## API Base URL
```
/api/v1
```

## Authentication
Currently, no authentication is required for API endpoints. Future implementations may include token-based authentication.

## Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data specific to the endpoint
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "error_code",
    "message": "Human readable error message",
    "details": {
      // Additional error details if available
    }
  }
}
```

## Frontend Integration Approach

### API Client Setup

We recommend using a dedicated API client module for all API calls. For a React application, you could structure it like this:

```javascript
// src/api/client.js
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
```

### API Service Modules

Create specific service modules for different API resources:

```javascript
// src/api/listingsService.js
import apiClient from './client';

export const listingsService = {
  getListings: async (params = {}) => {
    return apiClient.get('/listings', { params });
  },
  
  getListingById: async (id) => {
    return apiClient.get(`/listings/${id}`);
  }
};

// src/api/vehiclesService.js
import apiClient from './client';

export const vehiclesService = {
  getVehicleById: async (id) => {
    return apiClient.get(`/vehicles/${id}`);
  },
  
  getVehicleMOTHistory: async (id) => {
    return apiClient.get(`/vehicles/${id}/mot_histories`);
  },
  
  lookupVehicleByRegistration: async (registration) => {
    return apiClient.post('/vehicles/lookup', { registration });
  }
};

// src/api/searchesService.js
import apiClient from './client';

export const searchesService = {
  saveSearch: async (searchParams) => {
    return apiClient.post('/searches', searchParams);
  },
  
  getRecentSearches: async () => {
    return apiClient.get('/searches/recent');
  }
};
```

## React Component Integration Examples

### Listing Search and Display

```jsx
// src/pages/ListingsPage.jsx
import React, { useState, useEffect } from 'react';
import { listingsService } from '../api/listingsService';
import ListingCard from '../components/ListingCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    sort_by: 'posted_date',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_count: 0
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await listingsService.getListings(filters);
      setListings(response.data.listings);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  if (loading && !listings.length) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="listings-page">
      <h1>Car Listings</h1>
      
      <SearchFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <div className="listings-grid">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      
      {!listings.length && <p>No listings found matching your criteria.</p>}
      
      <Pagination 
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ListingsPage;
```

### Listing Detail Page

```jsx
// src/pages/ListingDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listingsService } from '../api/listingsService';
import { vehiclesService } from '../api/vehiclesService';
import ImageGallery from '../components/ImageGallery';
import VehicleDetails from '../components/VehicleDetails';
import MOTHistoryList from '../components/MOTHistoryList';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [motHistory, setMotHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const listingResponse = await listingsService.getListingById(id);
        setListing(listingResponse.data.listing);
        
        // If the listing has a vehicle with ID, fetch MOT history
        if (listingResponse.data.listing.vehicle?.id) {
          const vehicleId = listingResponse.data.listing.vehicle.id;
          const motResponse = await vehiclesService.getVehicleMOTHistory(vehicleId);
          setMotHistory(motResponse.data.mot_histories);
        }
        
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <div className="listing-detail-page">
      <h1>{listing.title}</h1>
      
      <div className="listing-price">£{listing.price.toLocaleString()}</div>
      <div className="listing-location">{listing.location}</div>
      
      <ImageGallery images={listing.image_urls} />
      
      <div className="listing-description">
        <h2>Description</h2>
        <p>{listing.description}</p>
      </div>
      
      <VehicleDetails vehicle={listing.vehicle} />
      
      {motHistory.length > 0 && (
        <div className="mot-history-section">
          <h2>MOT History</h2>
          <MOTHistoryList motHistory={motHistory} />
        </div>
      )}
      
      <div className="listing-source">
        <p>
          Source: <a href={listing.source_url} target="_blank" rel="noopener noreferrer">
            View original listing
          </a>
        </p>
      </div>
    </div>
  );
};

export default ListingDetailPage;
```

### Vehicle Registration Lookup

```jsx
// src/components/VehicleLookup.jsx
import React, { useState } from 'react';
import { vehiclesService } from '../api/vehiclesService';

const VehicleLookup = () => {
  const [registration, setRegistration] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!registration.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehiclesService.lookupVehicleByRegistration(registration);
      setVehicle(response.data.vehicle);
    } catch (err) {
      setError(err.message);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="vehicle-lookup">
      <h2>Lookup Vehicle Details</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="Enter registration (e.g., AB12CDE)"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !registration.trim()}>
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </div>
        
        {error && <p className="error">{error}</p>}
      </form>
      
      {vehicle && (
        <div className="vehicle-result">
          <h3>{vehicle.make} {vehicle.model} {vehicle.variant}</h3>
          <ul>
            <li><strong>Registration:</strong> {vehicle.registration}</li>
            <li><strong>Year:</strong> {vehicle.year}</li>
            <li><strong>Fuel Type:</strong> {vehicle.fuel_type}</li>
            <li><strong>Engine Size:</strong> {vehicle.engine_size}</li>
            <li><strong>Color:</strong> {vehicle.color}</li>
            <li><strong>MOT Status:</strong> {vehicle.mot_status}</li>
            <li><strong>Tax Status:</strong> {vehicle.tax_status}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VehicleLookup;
```

## Error Handling Strategy

For a consistent user experience, implement a global error handling strategy:

```jsx
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Caching Considerations

For improved performance, consider implementing frontend caching:

```javascript
// src/utils/cache.js
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export const cacheManager = {
  setItem: (key, value) => {
    const item = {
      value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  getItem: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = Date.now();
    
    // Return null if expired
    if (now - item.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};
```

Then update your service to use the cache:

```javascript
// Example of caching in the listings service
import apiClient from './client';
import { cacheManager } from '../utils/cache';

export const listingsService = {
  getListings: async (params = {}) => {
    const cacheKey = `listings_${JSON.stringify(params)}`;
    const cachedData = cacheManager.getItem(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await apiClient.get('/listings', { params });
    cacheManager.setItem(cacheKey, response);
    return response;
  },
  
  // Other methods...
};
```

## Performance Optimization

1. **Implement lazy loading** for listing images to improve page load times
2. **Use React.memo** for components that render frequently but with the same props
3. **Implement virtualization** for long lists using libraries like `react-window`
4. **Add debounce** to search inputs to reduce API calls during typing

## Implementing Responsive Behavior

Ensure your API integration works well across different device sizes:

1. Adjust the `per_page` parameter based on screen size
2. Implement mobile-specific UI patterns for API interactions
3. Consider using a simplified view with fewer fields on mobile devices
4. Implement proper loading states that work well on slower mobile connections

## Testing API Integration

Use React Testing Library and Mock Service Worker (MSW) to test your API integration:

```javascript
// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/listings', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        data: {
          listings: [
            // Mock listing data
          ],
          pagination: {
            current_page: 1,
            total_pages: 5,
            total_count: 100,
            per_page: 20
          }
        }
      })
    );
  }),
  
  // Additional mock handlers...
];
```

## Conclusion

Following these integration patterns will ensure a consistent, performant, and maintainable frontend application that communicates effectively with the Rails API. The approach emphasizes clean separation of concerns, effective error handling, and a great user experience.

For any questions or issues regarding the API integration, please contact the backend team. 