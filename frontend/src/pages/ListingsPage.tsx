import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography } from '../styles/styleGuide';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';

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

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing[6]};
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing[8]};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing[4]};
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  background-color: ${colors.dark.surface};
  padding: ${spacing[6]};
  border-radius: 8px;
  
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
  margin-top: ${spacing[4]};
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing[6]};
  margin-bottom: ${spacing[8]};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ListingCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ListingImageContainer = styled.div`
  position: relative;
  height: 200px;
  margin: -${spacing[6]} -${spacing[6]} 0;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  overflow: hidden;
`;

const ListingImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ListingPrice = styled.div`
  position: absolute;
  bottom: ${spacing[4]};
  right: ${spacing[4]};
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: 4px;
  font-weight: ${typography.fontWeight.bold};
`;

const ListingContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${spacing[4]};
`;

const ListingTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  margin-bottom: ${spacing[2]};
  
  a {
    color: ${colors.text.primary};
    text-decoration: none;
    
    &:hover {
      color: ${colors.primary.main};
    }
  }
`;

const ListingLocation = styled.div`
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[3]};
  font-size: ${typography.fontSize.sm};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${spacing[1]};
  }
`;

const ListingSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[3]} ${spacing[4]};
  margin-bottom: ${spacing[4]};
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SpecLabel = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.secondary};
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SpecValue = styled.span`
  font-size: ${typography.fontSize.sm};
`;

const PurchaseSummaryPreview = styled.div`
  margin-top: ${spacing[2]};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const AIPoweredContainer = styled.div`
  position: relative;
  padding: ${spacing[3]};
  border-radius: 6px;
  background-color: rgba(101, 31, 255, 0.05);
  margin-bottom: ${spacing[4]};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 6px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      ${colors.primary.light},
      ${colors.primary.main},
      #8f5fff,
      #6320ee,
      #8f5fff,
      ${colors.primary.main}
    );
    background-size: 400% 400%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: borderBeam 4s ease infinite;
  }
  
  @keyframes borderBeam {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const AIBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(90deg, ${colors.primary.main}, #6320ee);
  background-size: 200% 100%;
  color: white;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  border-radius: 4px;
  padding: 2px 6px;
  margin-bottom: ${spacing[2]};
  animation: shimmerBadge 2s ease-in-out infinite alternate;
  
  svg {
    animation: pulseIcon 1.5s ease-in-out infinite;
  }
  
  @keyframes shimmerBadge {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }
  
  @keyframes pulseIcon {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing[8]};
`;

const PaginationButton = styled(Button)<{ $active?: boolean }>`
  margin: 0 ${spacing[1]};
  min-width: 40px;
  background-color: ${props => props.$active ? colors.primary.main : 'transparent'};
  border: 1px solid ${props => props.$active ? colors.primary.main : colors.dark.border};
  color: ${props => props.$active ? colors.primary.contrast : colors.text.primary};
  
  &:hover {
    background-color: ${props => props.$active ? colors.primary.main : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing[8]};
  background-color: ${colors.dark.surface};
  border-radius: 8px;
  
  h3 {
    margin-bottom: ${spacing[4]};
  }
  
  p {
    color: ${colors.text.secondary};
    margin-bottom: ${spacing[6]};
  }
`;

// Update SmallAITag to remove the border effect
const SmallAITag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, ${colors.primary.main}, #6320ee);
  background-size: 200% 100%;
  color: white;
  font-size: 10px;
  font-weight: ${typography.fontWeight.medium};
  border-radius: 3px;
  padding: 2px 4px;
  margin-left: 4px;
  vertical-align: middle;
  animation: shimmerBadge 2s ease-in-out infinite alternate;
`;

// Update the registration field in the listings card
const AIDetectedRegistration = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 1px 4px;
  background-color: rgba(101, 31, 255, 0.05);
  border-radius: 3px;
  margin-right: 4px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 3px;
    padding: 1px;
    background: linear-gradient(
      135deg,
      ${colors.primary.light},
      ${colors.primary.main},
      #8f5fff,
      #6320ee,
      #8f5fff,
      ${colors.primary.main}
    );
    background-size: 400% 400%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: borderBeamSmall 4s ease infinite;
  }
`;

// Add a styled component for the MOT status badge
const MOTStatusBadge = styled.span<{ status?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  background-color: ${props => 
    props.status?.toLowerCase() === 'valid' ? `${colors.state.success}20` : 
    props.status?.toLowerCase() === 'expired' ? `${colors.state.error}20` : 
    `${colors.state.warning}20`
  };
  color: ${props => 
    props.status?.toLowerCase() === 'valid' ? colors.state.success : 
    props.status?.toLowerCase() === 'expired' ? colors.state.error : 
    colors.state.warning
  };
  white-space: nowrap;
`;

// Add a styled component for the repair estimate badge
const RepairEstimateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${colors.state.warning}15;
  color: ${colors.state.warning};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  border-radius: 4px;
  padding: 2px 6px;
  margin-top: ${spacing[2]};
  margin-bottom: ${spacing[2]};
  
  svg {
    margin-right: 4px;
    flex-shrink: 0;
  }
`;

// Add a styled component for the expected lifetime badge
const ExpectedLifetimeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${colors.primary.main}15;
  color: ${colors.primary.main};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  border-radius: 4px;
  padding: 2px 6px;
  margin-top: ${spacing[2]};
  margin-bottom: ${spacing[2]};
  
  svg {
    margin-right: 4px;
    flex-shrink: 0;
  }
`;

// Add a styled component for suggested searches
const SuggestedSearches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[2]};
  margin-bottom: ${spacing[4]};
`;

const SuggestedSearch = styled.button`
  background-color: ${colors.dark.surface};
  border: 1px solid ${colors.dark.border};
  border-radius: 20px;
  padding: ${spacing[1]} ${spacing[3]};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${colors.primary.main}20;
    border-color: ${colors.primary.main};
  }
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

  return (
    <PageContainer>
      <PageHeader>
        <Title>
          Vehicle Listings
          {activeFilters > 0 && (
            <span style={{ 
              marginLeft: spacing[3], 
              fontSize: typography.fontSize.lg,
              color: colors.primary.main,
              backgroundColor: `${colors.primary.main}20`,
              padding: `${spacing[1]} ${spacing[3]}`,
              borderRadius: '16px',
            }}>
              {activeFilters} {activeFilters === 1 ? 'filter' : 'filters'} active
            </span>
          )}
        </Title>
        
        <SuggestedSearches>
          <SuggestedSearch onClick={() => applyPredefinedFilter({
            make: 'BMW',
            minPrice: '10000',
            maxPrice: '30000'
          })}>
            BMW £10k-£30k
          </SuggestedSearch>
          <SuggestedSearch onClick={() => applyPredefinedFilter({
            fuelType: 'electric'
          })}>
            Electric Vehicles
          </SuggestedSearch>
          <SuggestedSearch onClick={() => applyPredefinedFilter({
            minPrice: '',
            maxPrice: '5000'
          })}>
            Under £5,000
          </SuggestedSearch>
          <SuggestedSearch onClick={() => applyPredefinedFilter({
            yearFrom: '2020'
          })}>
            2020 or newer
          </SuggestedSearch>
          <SuggestedSearch onClick={() => applyPredefinedFilter({
            transmission: 'automatic'
          })}>
            Automatic
          </SuggestedSearch>
        </SuggestedSearches>
        
        <FiltersContainer>
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
          
          <ActionButtons>
            <Button 
              variant="secondary" 
              onClick={handleResetFilters}
              disabled={filterLoading || activeFilters === 0}
            >
              Reset Filters
            </Button>
            <Button 
              onClick={handleApplyFilters}
              disabled={filterLoading}
            >
              {filterLoading ? 'Applying...' : 'Apply Filters'}
            </Button>
          </ActionButtons>
        </FiltersContainer>
      </PageHeader>
      
      {loading ? (
        <EmptyState>
          <h3>Loading listings...</h3>
        </EmptyState>
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
                <ListingCard key={listing.id}>
                  <ListingImageContainer>
                    <ListingImage
                      src={listing.image_urls?.[0] || '/placeholder-car.jpg'}
                      alt={listing.title || 'Vehicle listing'}
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
        <EmptyState>
          <h3>No listings found</h3>
          <p>Try adjusting your filters to see more results</p>
          <Button onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default ListingsPage; 