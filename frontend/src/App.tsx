import React from 'react';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import { defaultTheme } from './styles/styleGuide';
import Layout from './components/Layout/Layout';
import ScrollToTop from './components/UI/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import VehicleLookupPage from './pages/VehicleLookupPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyles />
      <Layout>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/vehicles/:id" element={<VehicleLookupPage />} />
          <Route path="/vehicle-lookup" element={<VehicleLookupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
