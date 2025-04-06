import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, shadows } from '../styles/styleGuide';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { motion } from 'framer-motion';

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
  text-align: center;
`;

const PageContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing[6]} ${spacing[6]};
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
`;

const Subtitle = styled(motion.p)`
  font-size: ${typography.fontSize.xl};
  color: ${colors.text.secondary};
  max-width: 700px;
  margin: 0 auto ${spacing[6]};
  line-height: ${typography.lineHeight.relaxed};
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

// Add these missing styled components
const MOTAdvisoriesTitle = styled.h4`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[2]};
  color: ${colors.text.primary};
`;

const MOTAdvisoriesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MOTFailureItem = styled.li`
  padding: ${spacing[2]} 0;
  position: relative;
  padding-left: ${spacing[6]};
  color: ${colors.text.secondary};
  line-height: 1.5;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    width: 16px;
    height: 16px;
    background-color: ${colors.state.error}30;
    border-radius: 50%;
  }
  
  &:after {
    content: '✕';
    position: absolute;
    left: 5px;
    top: 8px;
    font-size: 10px;
    color: ${colors.state.error};
  }
`;

const MOTAdvisoryItem = styled.li`
  padding: ${spacing[2]} 0;
  position: relative;
  padding-left: ${spacing[6]};
  color: ${colors.text.secondary};
  line-height: 1.5;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    width: 16px;
    height: 16px;
    background-color: ${colors.state.warning}20;
    border-radius: 50%;
  }
  
  &:after {
    content: '!';
    position: absolute;
    left: 7px;
    top: 8px;
    font-size: 10px;
    color: ${colors.state.warning};
    font-weight: bold;
  }
`;

const ExpandedDetails = styled.div`
  margin-top: ${spacing[4]};
  border-top: 1px solid ${colors.light.border};
  padding-top: ${spacing[4]};
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

  const fetchVehicleInfo = (registration: string) => {
    setLoading(true);
    setError(null);
    
    vehicles.lookupVehicleByRegistration(registration)
      .then(response => {
        console.log('Vehicle lookup response:', response);
        
        // Check if we have a valid vehicle response
        if (response && response.vehicle) {
          const vehicleData = response.vehicle;
          
          // Ensure vehicle has all necessary properties with fallbacks
          const processedVehicle = {
            ...vehicleData,
            make: vehicleData.make || 'Unknown',
            model: vehicleData.model || 'Unknown',
            year: vehicleData.year || null,
            fuel_type: vehicleData.fuel_type || 'Unknown',
            transmission: vehicleData.transmission || 'Unknown',
            engine_size: vehicleData.engine_size || null,
            color: vehicleData.color || null,
            body_type: vehicleData.body_type || null,
            registration: vehicleData.registration || registration,
            mileage: vehicleData.mileage || null,
            tax_status: vehicleData.tax_status || 'Unknown',
            tax_due_date: vehicleData.tax_due_date || null,
            mot_status: vehicleData.mot_status || 'Unknown',
            mot_expiry_date: vehicleData.mot_expiry_date || null
          };
          
          setVehicleData(processedVehicle);
          
          // If the vehicle has an ID, fetch its MOT history
          if (vehicleData.id) {
            fetchMotHistory(vehicleData.id);
          } else {
            setMotHistory([]);
          }
        } else {
          setError('No vehicle found with that registration');
        }
      })
      .catch(err => {
        console.error('Error fetching vehicle data:', err);
        setError('Error fetching vehicle data. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const fetchMotHistory = (vehicleId: string) => {
    setLoading(true);
    
    vehicles.getVehicleMOTHistory(vehicleId)
      .then(response => {
        console.log('MOT history response:', response);
        
        if (response && response.mot_histories && Array.isArray(response.mot_histories)) {
          // Ensure each MOT history entry has proper data structure
          const processedHistory = response.mot_histories.map((entry: any) => ({
            id: entry.id || `mot-${Math.random().toString(36).substr(2, 9)}`,
            test_date: entry.test_date || new Date().toISOString(),
            expiry_date: entry.expiry_date || null,
            odometer: entry.odometer || 0,
            result: entry.result || 'Unknown',
            advisory_notes: entry.advisory_notes || [],
            failure_reasons: entry.failure_reasons || null
          }));
          
          setMotHistory(processedHistory);
        } else {
          setMotHistory([]);
        }
      })
      .catch(err => {
        console.error('Error fetching MOT history:', err);
        setMotHistory([]);
      })
      .finally(() => {
        setLoading(false);
      });
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
            Vehicle Lookup
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Enter a registration number to check MOT history, tax status and more
          </Subtitle>
          <SearchForm onSubmit={handleSubmit}>
            <Input
              placeholder="Enter registration (e.g. AB12CDE)"
              value={registration}
              onChange={handleInputChange}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !registration.trim()}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </SearchForm>
        </PageHeaderContent>
      </PageHeader>
      
      <PageContent>
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
              </VehicleHeader>
              
              <StatusSection>
                <StatusCard $status={getTaxStatus(vehicleData.tax_status, vehicleData.tax_due_date)}>
                  <StatusTitle>Tax Status</StatusTitle>
                  <StatusValue $status={getTaxStatus(vehicleData.tax_status, vehicleData.tax_due_date)}>
                    {vehicleData.tax_status}
                  </StatusValue>
                  {vehicleData.tax_due_date && (
                    <div>Valid until {formatDate(vehicleData.tax_due_date)}</div>
                  )}
                </StatusCard>
                
                <StatusCard $status={getMotStatus(vehicleData.mot_status, vehicleData.mot_expiry_date)}>
                  <StatusTitle>MOT Status</StatusTitle>
                  <StatusValue $status={getMotStatus(vehicleData.mot_status, vehicleData.mot_expiry_date)}>
                    {vehicleData.mot_status}
                  </StatusValue>
                  {vehicleData.mot_expiry_date && (
                    <div>Valid until {formatDate(vehicleData.mot_expiry_date)}</div>
                  )}
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
                    <DetailValue>{vehicleData.mileage?.toLocaleString() || 'Not available'} miles</DetailValue>
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
                  {motHistory.map((entry) => (
                    <TimelineItem 
                      key={entry.id} 
                      $result={entry.result.toLowerCase() === 'pass' ? 'pass' : 'fail'}
                    >
                      <TimelineDate>{formatDate(entry.test_date)}</TimelineDate>
                      <TimelineContent>
                        <TimelineResult $result={entry.result.toLowerCase() === 'pass' ? 'pass' : 'fail'}>
                          {entry.result}
                        </TimelineResult>
                        <div>Odometer: {entry.odometer.toLocaleString()} miles</div>
                        
                        {entry.result.toLowerCase() === 'fail' && entry.failure_reasons && (
                          <DetailSection>
                            <DetailLabel>Failure Reasons:</DetailLabel>
                            <ul>
                              {Array.isArray(entry.failure_reasons) 
                                ? entry.failure_reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                  ))
                                : <li>{entry.failure_reasons}</li>
                              }
                            </ul>
                          </DetailSection>
                        )}
                        
                        {entry.advisory_notes && (
                          <DetailSection>
                            <DetailLabel>Advisory Notes:</DetailLabel>
                            <ul>
                              {Array.isArray(entry.advisory_notes) 
                                ? entry.advisory_notes.map((note, index) => (
                                    <li key={index}>{note}</li>
                                  ))
                                : <li>{entry.advisory_notes}</li>
                              }
                            </ul>
                          </DetailSection>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </TimelineContainer>
              ) : (
                <p>No MOT history available for this vehicle.</p>
              )}
            </MOTHistoryCard>
          </ResultsContainer>
        ) : (
          <EmptyState>
            <h2>Enter a Registration Number</h2>
            <p>Enter a UK vehicle registration number to view its details and MOT history.</p>
          </EmptyState>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default VehicleLookupPage; 