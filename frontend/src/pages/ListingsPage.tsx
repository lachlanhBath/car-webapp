import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography } from '../styles/styleGuide';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

// Types for our data
interface VehicleSummary {
  make: string;
  model: string | null;
  year: number;
  fuel_type: string;
  transmission: string | null;
  mileage?: number;
  purchase_summary?: string;
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
`;

const SpecValue = styled.span`
  font-size: ${typography.fontSize.sm};
`;

const PurchaseSummaryPreview = styled.div`
  margin-top: ${spacing[2]};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
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
      45deg,
      ${colors.primary.light},
      ${colors.primary.main},
      #8f5fff,
      #6320ee
    );
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: borderBeam 3s ease infinite;
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
  color: white;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  border-radius: 4px;
  padding: 2px 6px;
  margin-bottom: ${spacing[2]};
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

  const fetchListings = () => {
    setLoading(true);
    
    // Filter parameters
    const params: any = {
      page: pagination.currentPage,
      per_page: pagination.perPage
    };
    
    // Add filters if they have values
    if (filters.make) params.make = filters.make;
    if (filters.model) params.model = filters.model;
    if (filters.minPrice) params.min_price = Number(filters.minPrice);
    if (filters.maxPrice) params.max_price = Number(filters.maxPrice);
    if (filters.yearFrom) params.year_from = Number(filters.yearFrom);
    if (filters.yearTo) params.year_to = Number(filters.yearTo);
    if (filters.fuelType) params.fuel_type = filters.fuelType;
    if (filters.transmission) params.transmission = filters.transmission;
    
    listingsApi.getListings(params)
      .then((response) => {
        // The API returns the listings directly in the response object
        // The interceptor in client.ts already extracts response.data for us
        console.log('API Response:', response);
        
        if (response && Array.isArray(response.listings)) {
          setListings(response.listings);
          
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
      });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchListings();
  };

  const handleResetFilters = () => {
    setFilters({
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      yearFrom: '',
      yearTo: '',
      fuelType: '',
      transmission: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setTimeout(() => fetchListings(), 0);
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

  return (
    <PageContainer>
      <PageHeader>
        <Title>Vehicle Listings</Title>
        
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
          
          <Input 
            label="Fuel Type"
            name="fuelType"
            value={filters.fuelType}
            onChange={handleFilterChange}
            placeholder="Any fuel type"
          />
          
          <Input 
            label="Transmission"
            name="transmission"
            value={filters.transmission}
            onChange={handleFilterChange}
            placeholder="Any transmission"
          />
          
          <ActionButtons>
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
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
            {listings.map(listing => (
              <ListingCard key={listing.id}>
                <ListingImageContainer>
                  <ListingImage 
                    src={listing.image_urls[0]} 
                    alt={listing.title} 
                  />
                  <ListingPrice>
                    {formatPrice(listing.price)}
                  </ListingPrice>
                </ListingImageContainer>
                
                <ListingContent>
                  <ListingTitle>
                    <Link to={`/listings/${listing.id}`}>
                      {listing.title}
                    </Link>
                  </ListingTitle>
                  
                  <ListingLocation>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                    </svg>
                    {listing.location}
                  </ListingLocation>
                  
                  <ListingSpecs>
                    <SpecItem>
                      <SpecLabel>Make</SpecLabel>
                      <SpecValue>{listing.vehicle.make}</SpecValue>
                    </SpecItem>
                    
                    <SpecItem>
                      <SpecLabel>Model</SpecLabel>
                      <SpecValue>{listing.vehicle.model}</SpecValue>
                    </SpecItem>
                    
                    <SpecItem>
                      <SpecLabel>Year</SpecLabel>
                      <SpecValue>{listing.vehicle.year}</SpecValue>
                    </SpecItem>
                    
                    <SpecItem>
                      <SpecLabel>Mileage</SpecLabel>
                      <SpecValue>{listing.vehicle.mileage?.toLocaleString()} miles</SpecValue>
                    </SpecItem>
                  </ListingSpecs>
                  
                  {listing.vehicle.purchase_summary && (
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
                        {listing.vehicle.purchase_summary}
                      </PurchaseSummaryPreview>
                    </AIPoweredContainer>
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
            ))}
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