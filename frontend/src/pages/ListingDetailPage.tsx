import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, mixins } from '../styles/styleGuide';

// Types
interface Vehicle {
  id?: string;
  make: string;
  model: string | null;
  variant?: string;
  year: number;
  fuel_type: string;
  transmission: string | null;
  engine_size?: string;
  body_type?: string | null;
  doors?: number | null;
  color?: string;
  mileage?: number;
  registration?: string;
  vin?: string | null;
  tax_status?: string;
  tax_due_date?: string;
  mot_status?: string;
  mot_expiry_date?: string;
}

interface MOTHistoryEntry {
  id: string | number;
  test_date: string;
  expiry_date: string | null;
  odometer: number;
  result: string;
  advisory_notes?: string | string[];
  failure_reasons?: string[] | null;
}

interface ListingDetail {
  id: number | string;
  title: string;
  price: string | number;
  location: string | null;
  description?: string;
  post_date: string;
  source_url?: string;
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

const MOTHistorySection = styled(DetailSection)`
  margin-top: ${spacing[6]};
`;

const MOTEntry = styled.div`
  border-bottom: 1px solid ${colors.dark.border};
  padding-bottom: ${spacing[4]};
  margin-bottom: ${spacing[4]};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const MOTHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing[3]};
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${spacing[2]};
  }
`;

const MOTDate = styled.span`
  font-weight: ${typography.fontWeight.medium};
`;

const MOTResult = styled.span<{ result: string }>`
  padding: ${spacing[1]} ${spacing[3]};
  border-radius: 4px;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: white;
  background-color: ${props => props.result === 'pass' ? colors.state.success : colors.state.error};
`;

const MOTDetails = styled.div`
  margin-top: ${spacing[3]};
`;

const MOTDetailTitle = styled.h4`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[2]};
`;

const MOTDetailText = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[2]};
  line-height: 1.6;
`;

// Component
const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, vehicles } = useApi();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [motHistory, setMotHistory] = useState<MOTHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [motLoading, setMotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motError, setMotError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      setLoading(true);
      listings.getListingById(id)
        .then(response => {
          console.log('Listing detail response:', response);
          // API might return the listing directly or nested in data.listing
          const listingData = response.listing || response;
          if (listingData) {
            setListing(listingData as ListingDetail);
            
            // If vehicle has registration, fetch MOT history
            if (listingData.vehicle && listingData.vehicle.registration) {
              fetchMotHistory(listingData.vehicle.registration);
            }
          } else {
            setError('Failed to load listing details');
          }
        })
        .catch(err => {
          console.error('Error fetching listing:', err);
          setError('An error occurred while fetching the listing');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);
  
  const fetchMotHistory = (registration: string) => {
    setMotLoading(true);
    setMotError(null);
    
    // If the vehicle already has an ID, use it directly
    if (listing?.vehicle?.id) {
      vehicles.getVehicleMOTHistory(listing.vehicle.id)
        .then(historyData => {
          if (historyData && historyData.mot_histories) {
            setMotHistory(historyData.mot_histories);
          } else {
            setMotHistory([]);
          }
        })
        .catch(err => {
          console.error('Error fetching MOT history:', err);
          setMotError('Could not retrieve MOT history');
        })
        .finally(() => {
          setMotLoading(false);
        });
    } else {
      // Otherwise lookup by registration
      vehicles.lookupVehicleByRegistration(registration)
        .then(vehicleData => {
          if (vehicleData && vehicleData.vehicle && vehicleData.vehicle.id) {
            return vehicles.getVehicleMOTHistory(vehicleData.vehicle.id);
          } else {
            throw new Error('Vehicle ID not found');
          }
        })
        .then(historyData => {
          if (historyData && historyData.mot_histories) {
            setMotHistory(historyData.mot_histories);
          } else {
            setMotHistory([]);
          }
        })
        .catch(err => {
          console.error('Error fetching MOT history:', err);
          setMotError('Could not retrieve MOT history');
        })
        .finally(() => {
          setMotLoading(false);
        });
    }
  };

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

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(numericPrice);
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
            {listing.description ? (
              <Description>{listing.description}</Description>
            ) : (
              <Description>No description available.</Description>
            )}
          </DetailSection>
        </div>
        
        <div>
          <DetailSection>
            <ListingTitle>{listing.title}</ListingTitle>
            <Price>{formatPrice(listing.price)}</Price>
            
            <ListingMeta>
              {listing.location && (
                <MetaItem>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                  {listing.location}
                </MetaItem>
              )}
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
                <SpecValue>{listing.vehicle.make || 'N/A'}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Model</SpecLabel>
                <SpecValue>{listing.vehicle.model || 'N/A'}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Year</SpecLabel>
                <SpecValue>{listing.vehicle.year}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Mileage</SpecLabel>
                <SpecValue>{listing.vehicle.mileage ? `${listing.vehicle.mileage.toLocaleString()} miles` : 'N/A'}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Fuel Type</SpecLabel>
                <SpecValue>{listing.vehicle.fuel_type || 'N/A'}</SpecValue>
              </SpecItem>
              <SpecItem>
                <SpecLabel>Transmission</SpecLabel>
                <SpecValue>{listing.vehicle.transmission || 'N/A'}</SpecValue>
              </SpecItem>
              {listing.vehicle.engine_size && (
                <SpecItem>
                  <SpecLabel>Engine Size</SpecLabel>
                  <SpecValue>{listing.vehicle.engine_size}</SpecValue>
                </SpecItem>
              )}
              {listing.vehicle.body_type && (
                <SpecItem>
                  <SpecLabel>Body Type</SpecLabel>
                  <SpecValue>{listing.vehicle.body_type}</SpecValue>
                </SpecItem>
              )}
              {listing.vehicle.color && (
                <SpecItem>
                  <SpecLabel>Color</SpecLabel>
                  <SpecValue>{listing.vehicle.color}</SpecValue>
                </SpecItem>
              )}
              {listing.vehicle.registration && (
                <SpecItem>
                  <SpecLabel>Registration</SpecLabel>
                  <SpecValue>{listing.vehicle.registration}</SpecValue>
                </SpecItem>
              )}
              {listing.vehicle.vin && (
                <SpecItem>
                  <SpecLabel>VIN</SpecLabel>
                  <SpecValue>{listing.vehicle.vin}</SpecValue>
                </SpecItem>
              )}
            </SpecsGrid>
            
            {listing.vehicle.registration && (
              <Link to={`/vehicles/lookup?registration=${listing.vehicle.registration}`}>
                <Button style={{ marginBottom: spacing[4] }}>View Vehicle History</Button>
              </Link>
            )}
            
            {listing.source_url && (
              <Button as="a" href={listing.source_url} target="_blank" rel="noopener noreferrer">
                View Original Listing
              </Button>
            )}
          </DetailSection>
          
          {listing.vehicle.registration && (
            <MOTHistorySection>
              <SectionTitle>MOT History</SectionTitle>
              
              {motLoading && <p>Loading MOT history...</p>}
              
              {motError && <p>Error: {motError}</p>}
              
              {!motLoading && !motError && motHistory.length === 0 && (
                <p>No MOT history available for this vehicle.</p>
              )}
              
              {!motLoading && !motError && motHistory.length > 0 && (
                <>
                  {motHistory.map((entry) => (
                    <MOTEntry key={entry.id}>
                      <MOTHeader>
                        <MOTDate>Test Date: {formatDate(entry.test_date)}</MOTDate>
                        <MOTResult result={entry.result.toLowerCase()}>
                          {entry.result.toUpperCase()}
                        </MOTResult>
                      </MOTHeader>
                      
                      <div>
                        <SpecItem>
                          <SpecLabel>Odometer Reading</SpecLabel>
                          <SpecValue>{entry.odometer.toLocaleString()} miles</SpecValue>
                        </SpecItem>
                      </div>
                      
                      {entry.advisory_notes && (
                        <MOTDetails>
                          <MOTDetailTitle>Advisory Notes</MOTDetailTitle>
                          {Array.isArray(entry.advisory_notes) ? (
                            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                              {entry.advisory_notes.map((note, index) => (
                                <li key={index}>
                                  <MOTDetailText>{note}</MOTDetailText>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <MOTDetailText>{entry.advisory_notes}</MOTDetailText>
                          )}
                        </MOTDetails>
                      )}
                      
                      {entry.failure_reasons && entry.failure_reasons.length > 0 && (
                        <MOTDetails>
                          <MOTDetailTitle>Failure Reasons</MOTDetailTitle>
                          {Array.isArray(entry.failure_reasons) ? (
                            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                              {entry.failure_reasons.map((reason, index) => (
                                <li key={index}>
                                  <MOTDetailText>{reason}</MOTDetailText>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <MOTDetailText>{entry.failure_reasons}</MOTDetailText>
                          )}
                        </MOTDetails>
                      )}
                      
                      <MOTDetails>
                        <MOTDetailTitle>MOT Expiry</MOTDetailTitle>
                        <MOTDetailText>
                          {entry.expiry_date ? formatDate(entry.expiry_date) : 'No expiry date (Failed test)'}
                        </MOTDetailText>
                      </MOTDetails>
                    </MOTEntry>
                  ))}
                </>
              )}
            </MOTHistorySection>
          )}
        </div>
      </ListingGrid>
    </Container>
  );
};

export default ListingDetailPage;