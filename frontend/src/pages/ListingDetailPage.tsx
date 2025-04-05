import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, mixins, shadows } from '../styles/styleGuide';

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

const MOTHistorySection = styled.div`
  grid-column: 1 / -1; // Span all columns
  margin-top: ${spacing[8]};
`;

const MOTSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: ${spacing[4]};
  }
`;

const MOTSummaryItem = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 8px;
  padding: ${spacing[4]};
  display: flex;
  flex-direction: column;
`;

const MOTSummaryLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing[2]};
`;

const MOTSummaryValue = styled.span<{ highlight?: boolean; color?: string }>`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => props.color ? props.color : props.highlight ? colors.primary.main : colors.text.primary};
`;

const MOTTimelineContainer = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  position: relative;
  box-shadow: ${shadows.md};
`;

const MOTTimeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 15px;
    width: 2px;
    background-color: ${colors.light.border};
  }
`;

const MOTTimelineItem = styled.div`
  position: relative;
  padding-left: 45px;
  padding-bottom: ${spacing[6]};
  
  &:last-child {
    padding-bottom: 0;
  }
`;

const StatusIndicator = styled.div<{ passed: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.passed ? colors.state.success : colors.state.error};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
`;

const MOTTimelineCard = styled.div`
  background-color: white;
  border: 1px solid ${colors.light.border};
  border-radius: 8px;
  padding: ${spacing[4]};
`;

const MOTTimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing[2]};
`;

const MOTTimelineDate = styled.div<{ passed: boolean }>`
  font-weight: ${typography.fontWeight.semibold};
  font-size: ${typography.fontSize.lg};
  color: ${props => props.passed ? colors.state.success : colors.state.error};
`;

const MOTTimelineLocation = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
`;

const MOTTimelineDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${spacing[2]};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MOTTimelineInfo = styled.div`
  flex: 1;
`;

const MOTTimelineMileage = styled.div`
  font-weight: ${typography.fontWeight.medium};
  margin-top: ${spacing[1]};
`;

const MOTTimelineExpiry = styled.div`
  text-align: right;
  
  @media (max-width: 768px) {
    text-align: left;
    margin-top: ${spacing[2]};
  }
`;

const AdvisoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${colors.state.warning}20;
  color: ${colors.text.secondary};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  font-size: ${typography.fontSize.xs};
  margin-top: ${spacing[2]};
  
  svg {
    margin-right: ${spacing[1]};
    color: ${colors.state.warning};
  }
`;

const DetailsToggle = styled.button`
  background: none;
  border: none;
  color: ${colors.primary.main};
  font-weight: ${typography.fontWeight.medium};
  font-size: ${typography.fontSize.sm};
  padding: ${spacing[2]} 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: ${spacing[2]};
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-right: ${spacing[1]};
    transition: transform 0.2s ease;
  }
`;

const ExpandedDetails = styled.div`
  margin-top: ${spacing[4]};
  border-top: 1px solid ${colors.light.border};
  padding-top: ${spacing[4]};
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
  const [expandedItems, setExpandedItems] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      listings.getListingById(id)
        .then(response => {
          console.log('Listing detail response:', response);
          // API might return the listing directly or nested in data.listing
          const listingData = response?.listing || response;
          
          if (listingData) {
            // Ensure vehicle object exists and has proper fallbacks
            if (!listingData.vehicle) {
              listingData.vehicle = {};
            }
            
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

  const toggleDetails = (id: string | number) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
        </div>
      </ListingGrid>
      
      {/* MOT History Section - Now outside the grid for full width */}
      {!motLoading && !motError && motHistory.length > 0 && (
        <MOTHistorySection>
          <DetailSection>
            <SectionTitle>MOT Test History</SectionTitle>
            
            <MOTSummary>
              <MOTSummaryItem>
                <MOTSummaryLabel>Total Tests</MOTSummaryLabel>
                <MOTSummaryValue>{motHistory.length}</MOTSummaryValue>
              </MOTSummaryItem>
              
              <MOTSummaryItem>
                <MOTSummaryLabel>Passed Tests</MOTSummaryLabel>
                <MOTSummaryValue color={colors.state.success}>
                  {motHistory.filter(test => test.result.toLowerCase() === 'pass').length}
                </MOTSummaryValue>
              </MOTSummaryItem>
              
              <MOTSummaryItem>
                <MOTSummaryLabel>Failed Tests</MOTSummaryLabel>
                <MOTSummaryValue color={colors.state.error}>
                  {motHistory.filter(test => test.result.toLowerCase() === 'fail').length}
                </MOTSummaryValue>
              </MOTSummaryItem>
              
              <MOTSummaryItem>
                <MOTSummaryLabel>Latest Test</MOTSummaryLabel>
                <MOTSummaryValue highlight>
                  {motHistory.length > 0 && 
                    (motHistory[0].result.toLowerCase() === 'pass' ? 'Passed' : 'Failed')}
                </MOTSummaryValue>
              </MOTSummaryItem>
            </MOTSummary>
            
            <MOTTimelineContainer>
              <MOTTimeline>
                {motHistory.map((test) => {
                  const isPassed = test.result.toLowerCase() === 'pass';
                  const isExpanded = expandedItems[test.id] || false;
                  const hasAdvisories = test.advisory_notes && (
                    Array.isArray(test.advisory_notes) 
                      ? test.advisory_notes.length > 0 
                      : typeof test.advisory_notes === 'string' && test.advisory_notes.trim() !== ''
                  );
                  const hasFailures = test.failure_reasons && (
                    Array.isArray(test.failure_reasons) 
                      ? test.failure_reasons.length > 0 
                      : typeof test.failure_reasons === 'string' && test.failure_reasons.trim() !== ''
                  );
                  
                  return (
                    <MOTTimelineItem key={test.id}>
                      <StatusIndicator passed={isPassed}>
                        {isPassed ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </StatusIndicator>
                      
                      <MOTTimelineCard>
                        <MOTTimelineHeader>
                          <MOTTimelineDate passed={isPassed}>
                            {isPassed ? 'Passed' : 'Failed'} - {formatDate(test.test_date)}
                          </MOTTimelineDate>
                          <MOTTimelineLocation>
                            MOT Test at Unknown
                          </MOTTimelineLocation>
                        </MOTTimelineHeader>
                        
                        <MOTTimelineDetails>
                          <MOTTimelineInfo>
                            <MOTSummaryLabel>Odometer Reading</MOTSummaryLabel>
                            <MOTTimelineMileage>{test.odometer.toLocaleString()} mi</MOTTimelineMileage>
                          </MOTTimelineInfo>
                          
                          {test.expiry_date && (
                            <MOTTimelineExpiry>
                              <MOTSummaryLabel>Expires</MOTSummaryLabel>
                              <MOTTimelineMileage>{formatDate(test.expiry_date)}</MOTTimelineMileage>
                            </MOTTimelineExpiry>
                          )}
                        </MOTTimelineDetails>
                        
                        {hasAdvisories && !isExpanded && (
                          <AdvisoryBadge>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 9V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Advisories: {Array.isArray(test.advisory_notes) ? test.advisory_notes.length : 1}
                          </AdvisoryBadge>
                        )}
                        
                        {(hasAdvisories || hasFailures) && (
                          <DetailsToggle onClick={() => toggleDetails(test.id)}>
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                            >
                              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </DetailsToggle>
                        )}
                        
                        {isExpanded && (
                          <ExpandedDetails>
                            {hasFailures && (
                              <div style={{ marginBottom: spacing[4] }}>
                                <MOTAdvisoriesTitle>Failure Reasons</MOTAdvisoriesTitle>
                                <MOTAdvisoriesList>
                                  {Array.isArray(test.failure_reasons) ? (
                                    test.failure_reasons.map((reason, idx) => (
                                      <MOTFailureItem key={idx}>{reason}</MOTFailureItem>
                                    ))
                                  ) : (
                                    <MOTFailureItem>{test.failure_reasons}</MOTFailureItem>
                                  )}
                                </MOTAdvisoriesList>
                              </div>
                            )}
                            
                            {hasAdvisories && (
                              <div>
                                <MOTAdvisoriesTitle>Advisory Notices</MOTAdvisoriesTitle>
                                <MOTAdvisoriesList>
                                  {Array.isArray(test.advisory_notes) ? (
                                    test.advisory_notes.map((note, idx) => (
                                      <MOTAdvisoryItem key={idx}>{note}</MOTAdvisoryItem>
                                    ))
                                  ) : (
                                    <MOTAdvisoryItem>{test.advisory_notes}</MOTAdvisoryItem>
                                  )}
                                </MOTAdvisoriesList>
                              </div>
                            )}
                          </ExpandedDetails>
                        )}
                      </MOTTimelineCard>
                    </MOTTimelineItem>
                  );
                })}
              </MOTTimeline>
            </MOTTimelineContainer>
          </DetailSection>
        </MOTHistorySection>
      )}
      
      {!motLoading && !motError && motHistory.length === 0 && (
        <MOTHistorySection>
          <DetailSection>
            <SectionTitle>MOT Test History</SectionTitle>
            <p>No MOT history available for this vehicle.</p>
          </DetailSection>
        </MOTHistorySection>
      )}
    </Container>
  );
};

export default ListingDetailPage;