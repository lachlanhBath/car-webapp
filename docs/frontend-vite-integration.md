# Frontend Integration with Vite and React

This guide outlines the frontend integration using Vite and React for the car listing application.

## Technology Stack

- **Vite**: Fast and lightweight frontend build tool
- **React**: UI library 
- **TypeScript**: Type safety and better developer experience
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests

## Project Structure

```
frontend/
├── node_modules/
├── public/
├── src/
│   ├── api/              # API client and service modules
│   │   ├── client.ts     # Base API client with Axios
│   │   ├── listingsService.ts
│   │   ├── vehiclesService.ts
│   │   └── searchesService.ts
│   ├── components/       # Reusable UI components
│   │   ├── ListingCard.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── ListingsPage.tsx
│   │   └── VehicleLookupPage.tsx
│   ├── utils/            # Utility functions
│   │   ├── cache.ts      # Caching utilities
│   │   └── ...
│   ├── App.tsx           # Main App component with routing
│   ├── App.css           # App-specific styles
│   ├── index.css         # Global styles
│   └── main.tsx          # Application entry point
├── .gitignore
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Running the Frontend

### Development Server

```bash
cd frontend
npm install
npm run dev
```

This will start the development server, typically on http://localhost:5173.

### Building for Production

```bash
cd frontend
npm run build
```

This will create a production-ready build in the `dist` directory.

## API Integration

The frontend communicates with the Rails API through service modules that use Axios for HTTP requests.

### API Client

The base API client (`src/api/client.ts`) is configured to:
- Set the base URL to `/api/v1`
- Handle request/response interceptors
- Provide consistent error handling

```typescript
import axios from 'axios';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
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

### API Services

Service modules encapsulate API calls for different resources:

- `listingsService.ts`: Methods for fetching and filtering car listings
- `vehiclesService.ts`: Methods for vehicle details and MOT history
- `searchesService.ts`: Methods for saving and retrieving searches

## Vite Configuration

Vite is configured to proxy API requests to the Rails backend:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

This setup allows the frontend to make API requests to `/api/v1/*` which will be proxied to the Rails server running at `http://localhost:3000`.

## Routing

React Router is used for client-side routing:

```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import VehicleLookupPage from './pages/VehicleLookupPage';

function App() {
  return (
    <div className="app-container">
      <header>{/* ... */}</header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/vehicle-lookup" element={<VehicleLookupPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>{/* ... */}</footer>
    </div>
  )
}
```

## Caching

A simple caching utility (`src/utils/cache.ts`) is implemented to improve performance by storing API responses in localStorage with expiration:

```typescript
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const cacheManager = {
  setItem: <T>(key: string, value: T): void => {
    const item = {
      value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  getItem: <T>(key: string): T | null => {
    // Implementation details...
  },
  
  // Other methods...
};
```

## Key Components

### ListingCard

A reusable component for displaying listing previews:

```typescript
const ListingCard = ({ id, title, price, location, thumbnail_url, post_date, vehicle }: ListingCardProps) => {
  return (
    <div className="listing-card">
      <Link to={`/listings/${id}`}>
        <img src={thumbnail_url} alt={title} className="card-image" />
      </Link>
      <div className="card-content">
        <h3 className="card-title">
          <Link to={`/listings/${id}`}>{title}</Link>
        </h3>
        <p className="card-price">£{price.toLocaleString()}</p>
        {/* Additional content */}
      </div>
    </div>
  );
};
```

### ListingsPage

The main page for displaying and filtering listings:

```typescript
const ListingsPage = () => {
  const [listings, setListings] = useState<any[]>([]);
  // State and handler implementations...
  
  return (
    <div className="listings-page">
      <h1>Car Listings</h1>
      {/* Filter controls */}
      <div className="listings-grid">
        {listings.map(listing => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
      {/* Pagination */}
    </div>
  );
};
```

### VehicleLookupPage

A page that allows users to look up vehicle details by registration number:

```typescript
const VehicleLookupPage = () => {
  const [registration, setRegistration] = useState('');
  // State and handler implementations...
  
  return (
    <div className="vehicle-lookup-page">
      <h1>Vehicle Lookup</h1>
      <form onSubmit={handleSubmit} className="lookup-form">
        {/* Form inputs */}
      </form>
      {vehicle && (
        <div className="vehicle-result">
          {/* Vehicle details display */}
        </div>
      )}
    </div>
  );
};
```

## Future Enhancements

1. **State Management**: For larger applications, consider adding Redux or React Context for state management
2. **Form Handling**: Add a form library like Formik or React Hook Form for complex forms
3. **Authentication**: Implement authentication with JWT tokens
4. **Testing**: Set up Jest and React Testing Library for component testing
5. **Accessibility**: Enhance accessibility compliance
6. **Performance Optimization**: Implement code splitting and lazy loading

## Deployment Considerations

For production deployment, we recommend:

1. Building the frontend with `npm run build`
2. Serving the static assets from the Rails public directory or a CDN
3. Configuring proper cache headers for static assets
4. Setting up appropriate environment-specific API endpoints 