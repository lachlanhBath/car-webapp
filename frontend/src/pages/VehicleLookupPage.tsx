import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, shadows } from '../styles/styleGuide';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

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

interface MOTHistory {
  id: string;
  test_date: string;
  expiry_date: string;
  odometer: number;
  result: string;
  advisory_notes: string[] | string;
  failure_reasons: string[] | string | null;
}

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing[6]};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing[4]};
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[8]};
  max-width: 800px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ResultsContainer = styled.div`
  display: grid;
  gap: ${spacing[8]};
`;

const VehicleCard = styled(Card)`
  margin-bottom: ${spacing[6]};
`;

const VehicleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing[6]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${spacing[4]};
  }
`;

const VehicleTitle = styled.h2`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing[2]};
`;

const VehicleSubtitle = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.lg};
`;

const StatusSection = styled.div`
  display: flex;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const StatusCard = styled.div<{ $status: 'valid' | 'warning' | 'error' }>`
  background-color: ${props => {
    switch (props.$status) {
      case 'valid':
        return 'rgba(0, 200, 83, 0.1)';
      case 'warning':
        return 'rgba(255, 214, 0, 0.1)';
      case 'error':
        return 'rgba(255, 61, 0, 0.1)';
      default:
        return 'rgba(0, 0, 0, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'valid':
        return colors.state.success;
      case 'warning':
        return colors.state.warning;
      case 'error':
        return colors.state.error;
      default:
        return colors.dark.border;
    }
  }};
  border-radius: 8px;
  padding: ${spacing[4]};
  flex: 1;
`;

const StatusTitle = styled.div`
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[1]};
`;

const StatusValue = styled.div<{ $status: 'valid' | 'warning' | 'error' }>`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => {
    switch (props.$status) {
      case 'valid':
        return colors.state.success;
      case 'warning':
        return colors.state.warning;
      case 'error':
        return colors.state.error;
      default:
        return colors.text.primary;
    }
  }};
`;

const DetailCard = styled(Card)`
  margin-bottom: ${spacing[6]};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing[6]};
`;

const DetailSection = styled.div`
  margin-bottom: ${spacing[4]};
`;

const DetailTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  margin-bottom: ${spacing[4]};
`;

const DetailItem = styled.div`
  margin-bottom: ${spacing[3]};
`;

const DetailLabel = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing[1]};
`;

const DetailValue = styled.div`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
`;

const MOTHistoryCard = styled(Card)`
  margin-bottom: ${spacing[6]};
`;

const TimelineContainer = styled.div`
  position: relative;
  margin-top: ${spacing[6]};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 24px;
    width: 2px;
    background-color: ${colors.dark.border};
  }
`;

const TimelineItem = styled.div<{ $result: 'pass' | 'fail' }>`
  position: relative;
  padding-left: ${spacing[12]};
  padding-bottom: ${spacing[6]};

  &:last-child {
    padding-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 18px;
    top: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: ${props => props.$result === 'pass' ? colors.state.success : colors.state.error};
    z-index: 1;
  }
`;

const TimelineDate = styled.div`
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[2]};
`;

const TimelineContent = styled.div`
  background-color: ${colors.dark.surface};
  border-radius: 8px;
  padding: ${spacing[4]};
`;

const TimelineResult = styled.div<{ $result: 'pass' | 'fail' }>`
  display: inline-block;
  background-color: ${props => props.$result === 'pass' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 61, 0, 0.1)'};
  color: ${props => props.$result === 'pass' ? colors.state.success : colors.state.error};
  padding: ${spacing[1]} ${spacing[3]};
  border-radius: 4px;
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing[3]};
`;

const TimelineMileage = styled.div`
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[3]};
`;

const AdvisorySection = styled.div`
  margin-top: ${spacing[3]};
  border-top: 1px solid ${colors.dark.border};
  padding-top: ${spacing[3]};
`;

const AdvisoryTitle = styled.div`
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing[2]};
`;

const AdvisoryList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const AdvisoryItem = styled.li`
  position: relative;
  padding-left: ${spacing[4]};
  margin-bottom: ${spacing[2]};
  
  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: ${colors.text.secondary};
  }
`;

const FailureItem = styled(AdvisoryItem)`
  color: ${colors.state.error};
  
  &::before {
    color: ${colors.state.error};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing[8]};
  background-color: ${colors.dark.surface};
  border-radius: 8px;
  
  h2 {
    margin-bottom: ${spacing[4]};
  }
  
  p {
    color: ${colors.text.secondary};
    margin-bottom: ${spacing[6]};
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${spacing[8]};
  background-color: rgba(255, 61, 0, 0.05);
  border: 1px solid ${colors.state.error};
  border-radius: 8px;
  
  h2 {
    color: ${colors.state.error};
    margin-bottom: ${spacing[4]};
  }
  
  p {
    color: ${colors.text.secondary};
    margin-bottom: ${spacing[6]};
  }
`;

// Main component
const VehicleLookupPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles } = useApi();
  const { id } = useParams<{ id: string }>();
  const registrationParam = searchParams.get('registration');
  
  const [registration, setRegistration] = useState(registrationParam || '');
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [motHistory, setMotHistory] = useState<MOTHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If we have an ID parameter, fetch the vehicle details
    if (id) {
      setLoading(true);
      setError(null);
      
      vehicles.getVehicleById(id)
        .then(response => {
          if (response.data && response.data.vehicle) {
            setVehicleData(response.data.vehicle);
            return vehicles.getVehicleMOTHistory(id);
          } else {
            throw new Error('Vehicle not found');
          }
        })
        .then(response => {
          if (response.data && response.data.mot_histories) {
            setMotHistory(response.data.mot_histories);
          }
        })
        .catch(err => {
          console.error('Error fetching vehicle details:', err);
          setError('Failed to load vehicle details. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // If we have a registration parameter, look up the vehicle
    else if (registrationParam) {
      lookupVehicle(registrationParam);
    }
  }, [id, registrationParam, vehicles]);
  
  const lookupVehicle = (reg: string) => {
    setLoading(true);
    setError(null);
    
    // Lookup vehicle data
    vehicles.lookupVehicleByRegistration(reg)
      .then(response => {
        if (response.data && response.data.vehicle) {
          setVehicleData(response.data.vehicle);
          return vehicles.getVehicleMOTHistory(response.data.vehicle.id);
        } else {
          throw new Error('Vehicle not found');
        }
      })
      .then(response => {
        if (response.data && response.data.mot_histories) {
          setMotHistory(response.data.mot_histories);
        }
      })
      .catch(err => {
        console.error('Error looking up vehicle:', err);
        setError('Failed to find vehicle information for this registration number. Please check the registration and try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration.trim()) return;
    
    // Update URL params
    setSearchParams({ registration });
    
    // Do the lookup
    lookupVehicle(registration);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistration(e.target.value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTaxStatus = (taxStatus: string, dueDate: string) => {
    if (taxStatus === 'Untaxed') {
      return 'error';
    } else {
      // Check if tax is due in the next 30 days
      const today = new Date();
      const due = new Date(dueDate);
      const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysUntilDue <= 30 ? 'warning' : 'valid';
    }
  };

  const getMotStatus = (motStatus: string, expiryDate: string) => {
    if (motStatus === 'Expired') {
      return 'error';
    } else {
      // Check if MOT is due in the next 30 days
      const today = new Date();
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysUntilExpiry <= 30 ? 'warning' : 'valid';
    }
  };

  return (
    <PageContainer>
      <Title>Vehicle Lookup</Title>
      
      <SearchForm onSubmit={handleSubmit}>
        <Input
          label="Registration Number"
          placeholder="Enter UK registration (e.g. AB12CDE)"
          value={registration}
          onChange={handleInputChange}
          fullWidth
        />
        <Button 
          type="submit" 
          size="large" 
          disabled={!registration.trim() || loading}
          isLoading={loading}
        >
          Search
        </Button>
      </SearchForm>
      
      {loading ? (
        <EmptyState>
          <h2>Looking up vehicle information...</h2>
        </EmptyState>
      ) : error ? (
        <ErrorState>
          <h2>Vehicle Not Found</h2>
          <p>{error}</p>
        </ErrorState>
      ) : vehicleData ? (
        <ResultsContainer>
          <VehicleCard>
            <VehicleHeader>
              <div>
                <VehicleTitle>{vehicleData.make} {vehicleData.model} {vehicleData.variant}</VehicleTitle>
                <VehicleSubtitle>Registration: {vehicleData.registration}</VehicleSubtitle>
              </div>
              <Button as={Link} to="/listings" variant="secondary">
                Find similar vehicles
              </Button>
            </VehicleHeader>
            
            <StatusSection>
              <StatusCard $status={getTaxStatus(vehicleData.tax_status, vehicleData.tax_due_date)}>
                <StatusTitle>Tax Status</StatusTitle>
                <StatusValue $status={getTaxStatus(vehicleData.tax_status, vehicleData.tax_due_date)}>
                  {vehicleData.tax_status}
                </StatusValue>
                <DetailLabel>Due: {formatDate(vehicleData.tax_due_date)}</DetailLabel>
              </StatusCard>
              
              <StatusCard $status={getMotStatus(vehicleData.mot_status, vehicleData.mot_expiry_date)}>
                <StatusTitle>MOT Status</StatusTitle>
                <StatusValue $status={getMotStatus(vehicleData.mot_status, vehicleData.mot_expiry_date)}>
                  {vehicleData.mot_status}
                </StatusValue>
                <DetailLabel>Expires: {formatDate(vehicleData.mot_expiry_date)}</DetailLabel>
              </StatusCard>
            </StatusSection>
          </VehicleCard>
          
          <DetailCard>
            <DetailTitle>Vehicle Details</DetailTitle>
            <DetailGrid>
              <DetailSection>
                <DetailItem>
                  <DetailLabel>Make</DetailLabel>
                  <DetailValue>{vehicleData.make}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Model</DetailLabel>
                  <DetailValue>{vehicleData.model}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Variant</DetailLabel>
                  <DetailValue>{vehicleData.variant}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Year</DetailLabel>
                  <DetailValue>{vehicleData.year}</DetailValue>
                </DetailItem>
              </DetailSection>
              
              <DetailSection>
                <DetailItem>
                  <DetailLabel>Fuel Type</DetailLabel>
                  <DetailValue>{vehicleData.fuel_type}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Transmission</DetailLabel>
                  <DetailValue>{vehicleData.transmission}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Engine Size</DetailLabel>
                  <DetailValue>{vehicleData.engine_size}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Body Type</DetailLabel>
                  <DetailValue>{vehicleData.body_type}</DetailValue>
                </DetailItem>
              </DetailSection>
              
              <DetailSection>
                <DetailItem>
                  <DetailLabel>Color</DetailLabel>
                  <DetailValue>{vehicleData.color}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Doors</DetailLabel>
                  <DetailValue>{vehicleData.doors}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Mileage</DetailLabel>
                  <DetailValue>{vehicleData.mileage.toLocaleString()} miles</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>VIN</DetailLabel>
                  <DetailValue>{vehicleData.vin}</DetailValue>
                </DetailItem>
              </DetailSection>
            </DetailGrid>
          </DetailCard>
          
          <MOTHistoryCard>
            <DetailTitle>MOT History</DetailTitle>
            
            {motHistory.length > 0 ? (
              <TimelineContainer>
                {motHistory.map((test) => (
                  <TimelineItem key={test.id} $result={test.result.toLowerCase() as 'pass' | 'fail'}>
                    <TimelineDate>{formatDate(test.test_date)}</TimelineDate>
                    <TimelineContent>
                      <TimelineResult $result={test.result.toLowerCase() as 'pass' | 'fail'}>
                        {test.result.toUpperCase()}
                      </TimelineResult>
                      <TimelineMileage>
                        Odometer reading: {test.odometer.toLocaleString()} miles
                      </TimelineMileage>
                      
                      {test.result.toLowerCase() === 'fail' && test.failure_reasons && (
                        <AdvisorySection>
                          <AdvisoryTitle>Failure Reason(s):</AdvisoryTitle>
                          <AdvisoryList>
                            {Array.isArray(test.failure_reasons) ? (
                              test.failure_reasons.map((reason, index) => (
                                <FailureItem key={`${test.id}-${index}`}>{reason}</FailureItem>
                              ))
                            ) : (
                              <FailureItem>{test.failure_reasons}</FailureItem>
                            )}
                          </AdvisoryList>
                        </AdvisorySection>
                      )}
                      
                      {test.advisory_notes && (
                        <AdvisorySection>
                          <AdvisoryTitle>Advisory Notes:</AdvisoryTitle>
                          <AdvisoryList>
                            {Array.isArray(test.advisory_notes) ? (
                              test.advisory_notes.map((note, index) => (
                                <AdvisoryItem key={`${test.id}-${index}`}>{note}</AdvisoryItem>
                              ))
                            ) : (
                              <AdvisoryItem>{test.advisory_notes}</AdvisoryItem>
                            )}
                          </AdvisoryList>
                        </AdvisorySection>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </TimelineContainer>
            ) : (
              <EmptyState>
                <p>No MOT history available for this vehicle.</p>
              </EmptyState>
            )}
          </MOTHistoryCard>
        </ResultsContainer>
      ) : (
        <EmptyState>
          <h2>Enter a Registration Number</h2>
          <p>Enter a UK vehicle registration number to view its details and MOT history.</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default VehicleLookupPage; 