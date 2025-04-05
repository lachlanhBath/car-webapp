import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import { defaultTheme } from './styles/styleGuide';
import Layout from './components/Layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import VehicleLookupPage from './pages/VehicleLookupPage';
import NotFoundPage from './pages/NotFoundPage';

// For development
import { mockData } from './mocks/data';
import { ApiContext } from './services/ApiContext';

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyles />
      <ApiContext.Provider value={{ apiClient: mockData }}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/vehicle-lookup" element={<VehicleLookupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </ApiContext.Provider>
    </ThemeProvider>
  );
}

export default App;
