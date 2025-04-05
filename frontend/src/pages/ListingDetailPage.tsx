import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, mixins } from '../styles/styleGuide';

// Types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuel_type: string;
  transmission: string;
  engine_size: string;
  body_type: string;
  doors: number;
  color: string;
  mileage: number;
  registration: string;
  vin: string;
  tax_status: string;
  tax_due_date: string;
  mot_status: string;
  mot_expiry_date: string;
}

interface ListingDetail {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  post_date: string;
  source_url: string;
  image_urls: string[];
  vehicle: Vehicle;
}

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing[6]};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  margin-bottom: ${spacing[6]};
  color: ${colors.text.secondary};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary.main};
  }
  
  svg {
    margin-right: ${spacing[2]};
  }
`;

const ListingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing[6]};
  
  @media (min-width: 768px) {
    grid-template-columns: 3fr 2fr;
  }
`;

const Gallery = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: ${spacing[6]};
  
  img {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: ${spacing[2]};
  margin-top: ${spacing[2]};
  overflow-x: auto;
  padding-bottom: ${spacing[2]};
`;

const Thumbnail = styled.img<{ isActive: boolean }>`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  opacity: ${props => props.isActive ? 1 : 0.6};
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const DetailSection = styled.div`
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  margin-bottom: ${spacing[6]};
`;

const ListingTitle = styled.h1`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing[2]};
`;

const Price = styled.div`
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary.main};
  margin-bottom: ${spacing[4]};
`;

const ListingMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  color: ${colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${spacing[2]};
  }
`;

const Description = styled.div`
  margin-bottom: ${spacing[6]};
  line-height: 1.6;
  color: ${colors.text.secondary};
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SpecLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing[1]};
`;

const SpecValue = styled.span`
  font-weight: ${typography.fontWeight.medium};
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize['xl']};
  margin-bottom: ${spacing[4]};
`;

const Button = styled.a`
  display: inline-block;
  background-color: ${colors.primary.main};
  color: white;
  padding: ${spacing[3]} ${spacing[6]};
  border-radius: 8px;
  font-weight: ${typography.fontWeight.medium};
  text-align: center;
  width: 100%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${colors.primary.dark};
    text-decoration: none;
    color: white;
  }
`;

const LoadingContainer = styled.div`
  ${mixins.centerContent}
  min-height: 300px;
  font-size: ${typography.fontSize.xl};
  color: ${colors.text.secondary};
`;

const ErrorContainer = styled.div`
  ${mixins.centerContent}
  flex-direction: column;
  min-height: 300px;
  text-align: center;
  
  h2 {
    color: ${colors.state.error};
    margin-bottom: ${spacing[4]};
  }
  
  p {
    color: ${colors.text.secondary};
    margin-bottom: ${spacing[6]};
  }
`;

// Component
const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apiClient } = useApi();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      try {
        // Fetch listing details
        const response = apiClient.getListingById(id);
        if (response.status === 'success' && response.data.listing) {
          setListing(response.data.listing as ListingDetail);
        } else {
          setError('Failed to load listing details');
        }
      } catch (err) {
        setError('An error occurred while fetching the listing');
      } finally {
        setLoading(false);
      }
    }
  }, [id, apiClient]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading listing details...</LoadingContainer>
      </Container>
    );
  }

  if (error || !listing) {
    return (
      <Container>
        <ErrorContainer>
          <h2>Something went wrong</h2>
          <p>{error || 'Could not find the requested listing'}</p>
          <Link to="/listings">
            <Button as="span">Back to Listings</Button>
          </Link>
        </ErrorContainer>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Container>
      <BackLink to="/listings">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to listings
      </BackLink>
      
      <ListingGrid>
        <div>
          <Gallery>
            <img 
              src={listing.image_urls[activeImageIndex]} 
              alt={listing.title} 
            />
          </Gallery>
          
          {listing.image_urls.length > 1 && (
            <ThumbnailsContainer>
              {listing.image_urls.map((url, index) => (
                <Thumbnail 
                  key={index}
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  isActive={index === activeImageIndex}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </ThumbnailsContainer>
          )}
          
          <DetailSection>
            <SectionTitle>Description</SectionTitle>
            <Description>{listing.description}</Description>
          </DetailSection>
        </div>
        
        <div>
          <DetailSection>
            <ListingTitle>{listing.title}</ListingTitle>
            <Price>{formatPrice(listing.price)}</Price>
            
            <ListingMeta>
              <MetaItem>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                </svg>
                {listing.location}
              </MetaItem>
              <MetaItem>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Posted on {formatDate(listing.post_date)}
              </MetaItem>
            </ListingMeta>
            
            <SectionTitle>Vehicle Specifications</SectionTitle>
            <SpecsGrid>
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
                <SpecValue>{listing.vehicle.mileage.toLocaleString()} miles</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Fuel Type</SpecLabel>
                <SpecValue>{listing.vehicle.fuel_type}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Transmission</SpecLabel>
                <SpecValue>{listing.vehicle.transmission}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Engine Size</SpecLabel>
                <SpecValue>{listing.vehicle.engine_size}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Body Type</SpecLabel>
                <SpecValue>{listing.vehicle.body_type}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Color</SpecLabel>
                <SpecValue>{listing.vehicle.color}</SpecValue>
              </SpecItem>
            </SpecsGrid>
            
            <Link to={`/vehicles/${listing.vehicle.id}`}>
              <Button>View Vehicle History</Button>
            </Link>
          </DetailSection>
        </div>
      </ListingGrid>
    </Container>
  );
};

export default ListingDetailPage; 