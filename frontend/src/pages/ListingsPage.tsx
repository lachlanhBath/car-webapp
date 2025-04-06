import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography } from '../styles/styleGuide';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { motion } from 'motion/react';
import { FadeIn, StaggerContainer, TextReveal } from '../components/UI/ScrollAnimations';
import MotionButton from '../components/UI/MotionButton';
import AnimatedSection from '../components/AnimatedSection';

// Types for our data
interface VehicleSummary {
  make: string;
  model: string | null;
  year: number;
  fuel_type: string;
  transmission: string | null;
  mileage?: number;
  purchase_summary?: string;
  registration?: string;
  registration_source?: string;
  mot_status?: string;
  mot_expiry_date?: string;
  mot_repair_estimate?: string;
  expected_lifetime?: string;
}

interface Listing {
  id: number;
  title: string;
  price: string;
  location: string | null;
  description?: string;
  post_date: string;
  source_url?: string;
  image_urls: string[];
  vehicle: VehicleSummary;
}

interface ListingsResponse {
  listings: Listing[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Constants for filter options
const FUEL_TYPES = [
  { value: '', label: 'Any fuel type' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plugin_hybrid', label: 'Plug-in Hybrid' },
  { value: 'lpg', label: 'LPG' }
];

const TRANSMISSION_TYPES = [
  { value: '', label: 'Any transmission' },
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'semi_automatic', label: 'Semi-Automatic' },
  { value: 'cvt', label: 'CVT' }
];

// Update QUICK_FILTERS to fix type issues
const QUICK_FILTERS = [
  { 
    id: 'bmw_range',
    label: 'BMW £10k-£30k', 
    filters: { 
      make: 'BMW',
      minPrice: '10000',
      maxPrice: '30000' 
    } 
  },
  { 
    id: 'electric',
    label: 'Electric Vehicles', 
    filters: { 
      fuelType: 'electric' 
    } 
  },
  { 
    id: 'under_5k',
    label: 'Under £5,000', 
    filters: { 
      maxPrice: '5000' 
    } 
  },
  { 
    id: 'newest',
    label: '2020 or newer', 
    filters: { 
      yearFrom: '2020' 
    } 
  },
  { 
    id: 'automatic',
    label: 'Automatic', 
    filters: { 
      transmission: 'automatic' 
    } 
  }
];

// Styled components
const PageContainer = styled.div`
  width: 100%;
`;

const PageHeader = styled.div`
  position: relative;
  background-color: ${colors.light.background};
  padding: ${spacing[12]} ${spacing[6]} ${spacing[8]};
  margin-bottom: ${spacing[8]};
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 100%);
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: ${spacing[8]} ${spacing[4]} ${spacing[6]};
  }
`;

const PageHeaderBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(125deg, ${colors.light.background}, ${colors.light.surface}, ${colors.gray[100]});
  overflow: hidden;
  z-index: 0;
  
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      ellipse at center,
      ${colors.primary.main}25 0%,
      ${colors.primary.main}10 30%,
      ${colors.primary.main}00 60%
    );
    transform-origin: center center;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 35%, ${colors.primary.main}15 0%, ${colors.primary.main}00 25%),
      radial-gradient(circle at 75% 70%, ${colors.primary.light}10 0%, ${colors.primary.light}00 25%);
    z-index: 2;
  }
`;

const PageHeaderContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing[6]} ${spacing[6]};
  
  @media (max-width: 768px) {
    padding: 0 ${spacing[4]} ${spacing[4]};
  }
`;

const Title = styled(motion.h1)`
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.primary};
  background: linear-gradient(to right, ${colors.text.primary}, ${colors.primary.main});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(50, 205, 50, 0.1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: ${colors.primary.main};
    border-radius: 2px;
  }
`;

const FilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: ${spacing[3]};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  padding: ${spacing[1]} ${spacing[3]};
  border-radius: 20px;
  vertical-align: middle;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const QuickFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[2]};
  margin-bottom: ${spacing[6]};
`;

const QuickFilterChip = styled(motion.button)<{ $active?: boolean }>`
  background-color: ${props => props.$active ? `${colors.primary.main}15` : 'transparent'};
  border: 1px solid ${props => props.$active ? colors.primary.main : colors.dark.border};
  border-radius: 24px;
  padding: ${spacing[2]} ${spacing[4]};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${props => props.$active ? colors.primary.main : colors.text.primary};
  cursor: pointer;
`;

const FilterSection = styled.div`
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  margin-bottom: ${spacing[8]};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.dark.border};
`;

const FilterSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding-bottom: ${spacing[4]};
`;

const FilterArrow = styled.div<{ $expanded: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0)'};
  color: ${colors.text.secondary};
`;

const FilterContent = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
  animation: ${props => props.$expanded ? 'fadeIn 0.3s ease' : 'none'};
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FilterSectionTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  margin: 0;
  
  svg {
    margin-right: ${spacing[2]};
    color: ${colors.primary.main};
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing[5]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing[4]};
  margin-top: ${spacing[6]};
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${spacing[6]};
  margin-bottom: ${spacing[8]};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ListingCard = styled(motion(Card))`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  border-radius: 12px;
  border: 1px solid ${colors.dark.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
`;

const ListingImageContainer = styled.div`
  position: relative;
  height: 220px;
  margin: -${spacing[6]} -${spacing[6]} 0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
`;

const ListingImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ListingPrice = styled.div`
  position: absolute;
  bottom: ${spacing[4]};
  right: ${spacing[4]};
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: ${spacing[2]} ${spacing[4]};
  border-radius: 8px;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.lg};
`;

const ListingContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${spacing[5]};
`;

const ListingTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[2]};
  line-height: 1.3;
  
  a {
    color: ${colors.text.primary};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${colors.primary.main};
    }
  }
`;

const ListingLocation = styled.div`
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[4]};
  font-size: ${typography.fontSize.sm};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${spacing[2]};
    color: ${colors.primary.main};
  }
`;

const ListingSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[4]} ${spacing[5]};
  margin-bottom: ${spacing[5]};
  background-color: ${colors.dark.surface}40;
  padding: ${spacing[4]};
  border-radius: 8px;
  border: 1px solid ${colors.dark.border}40;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SpecLabel = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[1]};
  display: flex;
  align-items: center;
`;

const SpecValue = styled.span`
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary};
`;

// Keep gradient for AI elements
const AIBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, ${colors.primary.main}30, #8355ff30);
  color: ${colors.primary.main};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  margin-bottom: ${spacing[2]};
  
  svg {
    margin-right: ${spacing[1]};
  }
`;

// Keep gradient for AI elements
const SmallAITag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.primary.main}40, #8355ff40);
  color: ${colors.primary.main};
  font-size: 9px;
  font-weight: ${typography.fontWeight.bold};
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: ${spacing[1]};
`;

const MOTStatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  background-color: ${({ status }) => 
    status.toLowerCase() === 'valid' 
      ? colors.state.success + '30' 
      : status.toLowerCase() === 'expired'
        ? colors.state.error + '30'
        : colors.state.warning + '30'};
  color: ${({ status }) => 
    status.toLowerCase() === 'valid' 
      ? colors.state.success 
      : status.toLowerCase() === 'expired'
        ? colors.state.error
        : colors.state.warning};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
`;

// Keep gradient for AI elements
const AIPoweredContainer = styled.div`
  margin-top: ${spacing[3]};
  margin-bottom: ${spacing[4]};
  padding: ${spacing[3]};
  background: linear-gradient(135deg, rgba(131, 85, 255, 0.05), rgba(131, 85, 255, 0.1));
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary.main}, #8355ff);
  }
`;

const PurchaseSummaryPreview = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin: ${spacing[2]} 0 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const BadgeBase = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: 8px;
  margin-bottom: ${spacing[3]};
  
  svg {
    flex-shrink: 0;
  }
`;

const RepairEstimateBadge = styled(BadgeBase)`
  background-color: ${colors.state.warning}20;
  color: ${colors.state.warning};
`;

const ExpectedLifetimeBadge = styled(BadgeBase)`
  background-color: ${colors.primary.main}15;
  color: ${colors.primary.main};
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, ${colors.dark.surface} 0%, ${colors.dark.border}40 50%, ${colors.dark.surface} 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  height: 380px;
  margin-bottom: ${spacing[6]};
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[5]};
  padding-bottom: ${spacing[4]};
  border-bottom: 1px solid ${colors.dark.border};
`;

const ResultsCount = styled.div`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.primary};
  font-weight: ${typography.fontWeight.semibold};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${spacing[8]};
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  border: 1px solid ${colors.dark.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  
  h3 {
    font-size: ${typography.fontSize.xl};
    margin-bottom: ${spacing[4]};
    font-weight: ${typography.fontWeight.semibold};
  }
  
  p {
    color: ${colors.text.secondary};
    margin-bottom: ${spacing[6]};
    max-width: 400px;
  }
  
  svg {
    width: 60px;
    height: 60px;
    margin-bottom: ${spacing[4]};
    color: ${colors.primary.main};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing[8]};
  margin-bottom: ${spacing[4]};
`;

const PaginationButton = styled(Button)<{ $active?: boolean }>`
  margin: 0 ${spacing[1]};
  min-width: 40px;
  background-color: ${props => props.$active ? colors.primary.main : 'transparent'};
  border: 1px solid ${props => props.$active ? colors.primary.main : colors.dark.border};
  color: ${props => props.$active ? colors.primary.contrast : colors.text.primary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? colors.primary.main : colors.primary.main + '10'};
    border-color: ${colors.primary.main};
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing[8]};
  text-align: center;
  
  p {
    margin-top: ${spacing[4]};
    color: ${colors.text.secondary};
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${colors.primary.main}30;
  border-top: 4px solid ${colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing[4]};
  margin-top: ${spacing[6]};
`;

// Main component
const ListingsPage: React.FC = () => {
  const { listings: listingsApi } = useApi();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: 20
  });
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    yearFrom: '',
    yearTo: '',
    fuelType: '',
    transmission: ''
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [pagination.currentPage]);

  useEffect(() => {
    // Count active filters for badge display
    let count = 0;
    Object.values(filters).forEach(value => {
      if (value) count++;
    });
    setActiveFilters(count);
  }, [filters]);

  const fetchListings = () => {
    setLoading(true);
    
    // Filter parameters
    const params: any = {
      page: pagination.currentPage,
      per_page: pagination.perPage
    };
    
    // Helper function to parse numeric values safely
    const parseNumericParam = (value: string): number | undefined => {
      if (!value || value.trim() === '') return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    };
    
    // Add filters if they have values - map form field names to API parameter names
    if (filters.make && filters.make.trim() !== '') {
      params.make = filters.make.trim();
    }
    
    if (filters.model && filters.model.trim() !== '') {
      params.model = filters.model.trim();
    }
    
    const minPrice = parseNumericParam(filters.minPrice);
    if (minPrice !== undefined) {
      params.min_price = minPrice;
    }
    
    const maxPrice = parseNumericParam(filters.maxPrice);
    if (maxPrice !== undefined) {
      params.max_price = maxPrice;
    }
    
    const yearFrom = parseNumericParam(filters.yearFrom);
    if (yearFrom !== undefined) {
      params.year_from = yearFrom;
    }
    
    const yearTo = parseNumericParam(filters.yearTo);
    if (yearTo !== undefined) {
      params.year_to = yearTo;
    }
    
    if (filters.fuelType && filters.fuelType !== '') {
      params.fuel_type = filters.fuelType;
    }
    
    if (filters.transmission && filters.transmission !== '') {
      params.transmission = filters.transmission;
    }
    
    listingsApi.getListings(params)
      .then((response) => {
        if (response && Array.isArray(response.listings)) {
          // Ensure each listing has a vehicle property
          const processedListings = response.listings.map((listing: any) => ({
            ...listing,
            vehicle: listing.vehicle || {
              make: 'Unknown',
              model: 'Unknown',
              year: 'N/A',
              fuel_type: 'Unknown',
              transmission: 'Unknown'
            }
          }));
          
          setListings(processedListings);
          
          // Handle meta data if it exists
          if (response.meta) {
            setPagination({
              currentPage: response.meta.current_page || 1,
              totalPages: response.meta.total_pages || 1,
              totalCount: response.meta.total_count || 0,
              perPage: pagination.perPage
            });
          }
        } else {
          console.error('Unexpected API response format:', response);
          setListings([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching listings:', error);
      })
      .finally(() => {
        setLoading(false);
        setFilterLoading(false);
      });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // Show loading state for filter operation
    setFilterLoading(true);
    // Reset to first page when applying new filters
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchListings();
  };

  const handleResetFilters = () => {
    // Show loading state
    setFilterLoading(true);
    
    // Reset all filter states to empty values
    const emptyFilters = {
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      yearFrom: '',
      yearTo: '',
      fuelType: '',
      transmission: ''
    };
    
    setFilters(emptyFilters);
    
    // Reset to first page
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Explicitly make an API request with empty params
    const params = {
      page: 1,
      per_page: pagination.perPage
    };
    
    // Use direct API call instead of fetchListings to ensure we use empty filters
    listingsApi.getListings(params)
      .then((response) => {
        if (response && Array.isArray(response.listings)) {
          const processedListings = response.listings.map((listing: any) => ({
            ...listing,
            vehicle: listing.vehicle || {
              make: 'Unknown',
              model: 'Unknown',
              year: 'N/A',
              fuel_type: 'Unknown',
              transmission: 'Unknown'
            }
          }));
          
          setListings(processedListings);
          
          if (response.meta) {
            setPagination({
              currentPage: response.meta.current_page || 1,
              totalPages: response.meta.total_pages || 1,
              totalCount: response.meta.total_count || 0,
              perPage: pagination.perPage
            });
          }
        } else {
          console.error('Unexpected API response format during reset:', response);
          setListings([]);
        }
      })
      .catch((error) => {
        console.error('Error resetting filters:', error);
      })
      .finally(() => {
        setLoading(false);
        setFilterLoading(false);
      });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Format price with currency symbol
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(numericPrice);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const { currentPage, totalPages } = pagination;
    
    // Previous button
    buttons.push(
      <PaginationButton 
        key="prev" 
        variant="secondary" 
        size="small" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </PaginationButton>
    );
    
    // Page number buttons
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton 
          key={i} 
          variant={i === currentPage ? 'primary' : 'secondary'} 
          size="small" 
          $active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }
    
    // Next button
    buttons.push(
      <PaginationButton 
        key="next" 
        variant="secondary" 
        size="small" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </PaginationButton>
    );
    
    return buttons;
  };

  // Add a function to apply predefined filters
  const applyPredefinedFilter = (newFilterValues: Partial<typeof filters>) => {
    // Set loading state
    setFilterLoading(true);
    
    // Apply new filter values while keeping any other existing filters
    setFilters(prev => ({
      ...prev,
      ...newFilterValues
    }));
    
    // Reset to first page
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Use setTimeout to ensure state updates before fetching
    setTimeout(fetchListings, 0);
  };

  // In the ListingsPage component, add a function to handle quick filters
  const handleQuickFilter = (presetFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...presetFilters
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchListings();
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderBackground
          animate={{ 
            background: [
              `linear-gradient(125deg, ${colors.light.background}, ${colors.light.surface}, ${colors.gray[100]})`,
              `linear-gradient(125deg, ${colors.light.surface}, ${colors.gray[50]}, ${colors.light.background})`,
              `linear-gradient(125deg, ${colors.gray[50]}, ${colors.light.background}, ${colors.light.surface})`,
              `linear-gradient(125deg, ${colors.light.background}, ${colors.light.surface}, ${colors.gray[100]})`
            ]
          }} 
          transition={{ 
            duration: 45, 
            repeat: Infinity,
            repeatType: "mirror",
            ease: "linear"
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 2,
              overflow: "hidden"
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  background: i % 3 === 0 
                    ? `${colors.primary.main}12`
                    : i % 3 === 1
                      ? `${colors.primary.light}10`
                      : `${colors.secondary.main}08`,
                  borderRadius: "50%",
                  width: `${15 + (i % 5) * 8}px`,
                  height: `${15 + (i % 5) * 8}px`,
                  top: `${10 + (i * 8) % 80}%`,
                  left: `${10 + (i * 9) % 85}%`,
                  filter: "blur(6px)"
                }}
                animate={{
                  y: [0, i % 2 === 0 ? -10 : -15, 0],
                  x: [0, i % 3 === 0 ? 8 : i % 3 === 1 ? -8 : 12, 0],
                  opacity: [0.2, 0.35, 0.2]
                }}
                transition={{
                  duration: 12 + i % 8,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </PageHeaderBackground>
        
        <PageHeaderContent>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Vehicle Listings
            {!loading && listings.length > 0 && (
              <FilterBadge>{pagination.totalCount.toLocaleString()} vehicles</FilterBadge>
            )}
          </Title>
          
          <QuickFiltersContainer>
            {QUICK_FILTERS.map((filter, index) => (
              <QuickFilterChip
                key={filter.id}
                $active={activeQuickFilter === filter.id}
                onClick={() => handleQuickFilter(filter.filters)}
                whileHover={{ 
                  y: -2, 
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
              >
                {filter.label}
              </QuickFilterChip>
            ))}
          </QuickFiltersContainer>
          
          <FilterSection>
            <FilterSectionHeader onClick={toggleFilters}>
              <h2>Advanced Filters</h2>
              <FilterArrow $expanded={filtersExpanded}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: filtersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </FilterArrow>
            </FilterSectionHeader>
            
            {filtersExpanded && (
              <>
                <FilterGrid>
                  <Input 
                    label="Make"
                    name="make"
                    value={filters.make}
                    onChange={handleFilterChange}
                    placeholder="Any make"
                  />
                  
                  <Input 
                    label="Model"
                    name="model"
                    value={filters.model}
                    onChange={handleFilterChange}
                    placeholder="Any model"
                  />
                  
                  <Input 
                    label="Min Price"
                    name="minPrice"
                    type="number"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="£"
                  />
                  
                  <Input 
                    label="Max Price"
                    name="maxPrice"
                    type="number"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="£"
                  />
                  
                  <Input 
                    label="Year From"
                    name="yearFrom"
                    type="number"
                    value={filters.yearFrom}
                    onChange={handleFilterChange}
                    placeholder="From"
                  />
                  
                  <Input 
                    label="Year To"
                    name="yearTo"
                    type="number"
                    value={filters.yearTo}
                    onChange={handleFilterChange}
                    placeholder="To"
                  />
                  
                  <Select
                    label="Fuel Type"
                    name="fuelType"
                    value={filters.fuelType}
                    onChange={handleFilterChange}
                    options={FUEL_TYPES}
                  />
                  
                  <Select
                    label="Transmission"
                    name="transmission"
                    value={filters.transmission}
                    onChange={handleFilterChange}
                    options={TRANSMISSION_TYPES}
                  />
                </FilterGrid>
                
                <FilterButtons>
                  <Button
                    variant="secondary"
                    onClick={handleResetFilters}
                    disabled={filterLoading}
                  >
                    Reset Filters
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    disabled={filterLoading}
                  >
                    {filterLoading ? 'Applying...' : 'Apply Filters'}
                  </Button>
                </FilterButtons>
              </>
            )}
          </FilterSection>
        </PageHeaderContent>
      </PageHeader>
      
      <PageContent>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Loading listings...</p>
          </LoadingContainer>
        ) : listings.length > 0 ? (
          <>
            <ListingsGrid>
              {listings.map(listing => {
                // Ensure we have a valid listing object with required properties
                if (!listing) {
                  return null; // Skip this listing if it's undefined
                }
                
                // Make sure listing.vehicle exists, create a dummy one if not
                const vehicle = listing.vehicle || {
                  make: 'Unknown',
                  model: 'Unknown',
                  year: 'N/A',
                  fuel_type: 'Unknown',
                  transmission: 'Unknown'
                };
                
                return (
                  <ListingCard 
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ 
                      y: -8, 
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)' 
                    }}
                    variants={{}}
                  >
                    <ListingImageContainer>
                      <ListingImage
                        src={listing.image_urls?.[0] || '/placeholder-car.jpg'}
                        alt={listing.title || 'Vehicle listing'}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.5 }}
                      />
                      <ListingPrice>
                        {formatPrice(listing.price || 0)}
                      </ListingPrice>
                    </ListingImageContainer>

                    <ListingContent>
                      <ListingTitle>
                        <Link to={`/listings/${listing.id}`}>
                          {listing.title || 'Vehicle listing'}
                        </Link>
                      </ListingTitle>

                      <ListingLocation>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                        </svg>
                        {listing.location || 'Location unknown'}
                      </ListingLocation>

                      <ListingSpecs>
                        <SpecItem>
                          <SpecLabel>Make</SpecLabel>
                          <SpecValue>{vehicle.make || 'Unknown'}</SpecValue>
                        </SpecItem>

                        <SpecItem>
                          <SpecLabel>Model</SpecLabel>
                          <SpecValue>{vehicle.model || 'Unknown'}</SpecValue>
                        </SpecItem>

                        <SpecItem>
                          <SpecLabel>Year</SpecLabel>
                          <SpecValue>{vehicle.year || 'Unknown'}</SpecValue>
                        </SpecItem>

                        <SpecItem>
                          <SpecLabel>Mileage</SpecLabel>
                          <SpecValue>
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Unknown'}
                          </SpecValue>
                        </SpecItem>
                        
                        {vehicle.registration && (
                          <SpecItem>
                            <SpecLabel>
                              Reg
                              {vehicle.registration_source === "ai_vision" && (
                                <SmallAITag>AI</SmallAITag>
                              )}
                            </SpecLabel>
                            <SpecValue>
                              {vehicle.registration}
                            </SpecValue>
                          </SpecItem>
                        )}
                        
                        {vehicle.mot_status && (
                          <SpecItem>
                            <SpecLabel>MOT</SpecLabel>
                            <SpecValue>
                              <MOTStatusBadge status={vehicle.mot_status}>
                                {vehicle.mot_status}
                                {vehicle.mot_expiry_date && vehicle.mot_status.toLowerCase() === 'valid' && 
                                  ` - Exp. ${new Date(vehicle.mot_expiry_date).toLocaleDateString('en-GB', { 
                                    day: 'numeric',
                                    month: 'short',
                                    year: '2-digit'
                                  })}`
                                }
                              </MOTStatusBadge>
                            </SpecValue>
                          </SpecItem>
                        )}
                      </ListingSpecs>
                      
                      {vehicle.purchase_summary && (
                        <AIPoweredContainer>
                          <AIBadge>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                              <path d="M2 17L12 22L22 17" fill="currentColor"/>
                              <path d="M2 12L12 17L22 12" fill="currentColor"/>
                            </svg>
                            AI Analysis
                          </AIBadge>
                          <PurchaseSummaryPreview>
                            {vehicle.purchase_summary}
                          </PurchaseSummaryPreview>
                        </AIPoweredContainer>
                      )}

                      {vehicle.mot_repair_estimate && (
                        <RepairEstimateBadge>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                          MOT Repair Estimate Available
                        </RepairEstimateBadge>
                      )}

                      {vehicle.expected_lifetime && (
                        <ExpectedLifetimeBadge>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Expected Lifetime: {vehicle.expected_lifetime}
                        </ExpectedLifetimeBadge>
                      )}

                      <Button
                        as={Link}
                        to={`/listings/${listing.id}`}
                        fullWidth
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        iconPosition="right"
                      >
                        View Details
                      </Button>
                    </ListingContent>
                  </ListingCard>
                );
              })}
            </ListingsGrid>
            
            <PaginationContainer>
              {renderPaginationButtons()}
            </PaginationContainer>
          </>
        ) : (
          <EmptyState
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              No listings found
            </motion.h3>
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Try adjusting your filters to see more results
            </motion.p>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </motion.div>
          </EmptyState>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default ListingsPage; 