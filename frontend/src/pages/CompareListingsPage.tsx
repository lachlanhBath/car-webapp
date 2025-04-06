import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, shadows } from '../styles/styleGuide';
import Card from '../components/UI/Card';
import { default as UIButton } from '../components/UI/Button';
import { motion } from 'motion/react';
import CostEstimatorComponent from '../components/CostEstimator/CostEstimatorComponent';
import { useInView } from 'react-intersection-observer';

// Types from ListingDetailPage
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
  registration_source?: string;
  vin?: string | null;
  tax_status?: string;
  tax_due_date?: string;
  mot_status?: string;
  mot_expiry_date?: string;
  purchase_summary?: string;
  mot_repair_estimate?: string;
  expected_lifetime?: string;
  original_purchase_price?: number;
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

// Add MOT history types
interface MOTHistoryEntry {
  id: string;
  test_date: string;
  expiry_date: string;
  odometer: number;
  result: string;
  advisory_notes?: string[];
  failure_reasons?: string[];
}

// Add the styled components in one place, in alphabetical order

const AlignedSection = styled.div`
  margin-bottom: ${spacing[6]};
`;

const AIPoweredContainer = styled.div`
  line-height: 1.6;
`;

const AIBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.primary.main}20, #8355ff20);
  color: ${colors.primary.main};
  font-size: 12px;
  font-weight: ${typography.fontWeight.medium};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  
  svg {
    margin-right: ${spacing[1]};
  }
`;

// Add missing AI tag and MOT status badge components
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
    status?.toLowerCase() === 'valid' 
      ? colors.state.success + '30' 
      : status?.toLowerCase() === 'expired'
        ? colors.state.error + '30'
        : colors.state.warning + '30'};
  color: ${({ status }) => 
    status?.toLowerCase() === 'valid' 
      ? colors.state.success 
      : status?.toLowerCase() === 'expired'
        ? colors.state.error
        : colors.state.warning};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
`;

const ActionButton = styled.button`
  background-color: ${colors.primary.main};
  color: white;
  padding: ${spacing[3]} ${spacing[6]};
  border: none;
  border-radius: 8px;
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${colors.primary.dark};
  }

  &:disabled {
    background-color: ${colors.gray[400]};
    cursor: not-allowed;
  }
`;

const ComparisonContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  margin-bottom: ${spacing[8]};
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px dashed ${colors.primary.main};
    height: 100%;
    z-index: 1;
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    &::after {
      display: none;
    }
  }
`;

const ComparisonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]};
`;

const ComparisonDivider = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  z-index: 1;
  opacity: 0;
`;

const ComparisonHalf = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
  
  &:first-child {
    padding-right: ${spacing[12]};
  }
  
  &:last-child {
    padding-left: ${spacing[12]};
  }
  
  @media (max-width: 768px) {
    padding: ${spacing[4]};
    
    &:first-child, &:last-child {
      padding-left: ${spacing[4]};
      padding-right: ${spacing[4]};
    }
  }
`;

const ComparisonSection = styled.section`
  margin-top: ${spacing[10]};
  margin-bottom: ${spacing[10]};
  padding: ${spacing[4]} 0;
  position: relative;
  width: 100%;
  
  &::after {
    display: none;
  }
  
  @media (max-width: 768px) {
    &::after {
      display: none;
    }
  }
  
  h3 {
    font-size: ${typography.fontSize.lg};
    margin-bottom: ${spacing[4]};
    padding-bottom: ${spacing[2]};
    border-bottom: 1px solid ${colors.light.border};
  }
`;

const ComparisonSectionContent = styled.div`
  padding: ${spacing[6]};
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: ${shadows.sm};
  position: relative;
  z-index: 2;
`;

const ComparisonSide = styled.div`
  flex: 1;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${spacing[8]};
`;

const EmptyComparison = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 280px;
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  text-align: center;
  color: ${colors.text.secondary};
  box-shadow: ${shadows.sm};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${spacing[8]};
  background-color: ${colors.light.surface};
  border-radius: 12px;
  box-shadow: ${shadows.sm};
  min-height: 300px;
  
  h3 {
    margin-bottom: ${spacing[2]};
    color: ${colors.text.primary};
  }
  
  p {
    margin-bottom: ${spacing[6]};
    color: ${colors.text.secondary};
  }
`;

// Add SectionHeading and SectionTitle styled components
const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

// Add missing spec table components
const SpecTable = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing[4]};
`;

const SpecRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${spacing[3]};
`;

const SpecLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing[1]};
`;

const SpecValue = styled.span`
  font-weight: ${typography.fontWeight.medium};
`;

const ErrorContainer = styled.div`
  padding: ${spacing[6]};
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.state.error};
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  box-shadow: ${shadows.sm};
`;

const ExpectedLifetimeSection = styled.div`
  line-height: 1.6;
`;

const ListingHeader = styled.div`
  margin-bottom: ${spacing[4]};
`;

const ListingImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${colors.dark.surface};
  margin-bottom: ${spacing[4]};
`;

// Add missing image gallery components
const MainImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: ${spacing[2]} ${spacing[2]} 0 0;
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  padding: ${spacing[2]};
  gap: ${spacing[2]};
  overflow-x: auto;
`;

const Thumbnail = styled.div<{ isActive: boolean }>`
  width: 60px;
  height: 60px;
  border: 2px solid ${props => props.isActive ? colors.primary.main : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    border-color: ${props => props.isActive ? colors.primary.main : colors.primary.light};
  }
`;

const ListingLocation = styled.div`
  color: ${colors.text.secondary};
  display: flex;
  align-items: center;
  font-size: ${typography.fontSize.sm};
`;

const ListingPrice = styled.div`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary.main};
  margin-bottom: ${spacing[1]};
`;

const ListingTitle = styled.h2`
  font-size: ${typography.fontSize['2xl']};
  margin-bottom: ${spacing[2]};
  line-height: 1.3;
`;

const LoadingContainer = styled.div`
  padding: ${spacing[6]};
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.dark.surface};
  border-radius: 12px;
  box-shadow: ${shadows.sm};
  
  p {
    margin-left: ${spacing[3]};
    color: ${colors.text.secondary};
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid ${colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add MileageGraph and AnimatedMileageGraph components
const MileageGraph = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 8px;
  overflow: hidden;
  padding: 15px;
  box-shadow: ${shadows.sm};
  height: 280px;
  margin-bottom: ${spacing[4]};
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${spacing[6]};
`;

const PageTitle = styled.h1`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing[8]};
  text-align: center;
`;

// MOT History components
const MOTTimelineContainer = styled.div`
  padding: ${spacing[4]};
`;

const MOTTimeline = styled.div`
  position: relative;
  &:before {
    content: '';
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${colors.light.border};
  }
`;

const MOTTimelineItem = styled.div`
  display: flex;
  margin-bottom: ${spacing[5]};
  position: relative;
`;

const MOTTimelineDot = styled.div<{ result: string }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: ${props => props.result.toLowerCase() === 'pass' ? colors.state.success : colors.state.error};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: ${spacing[4]};
  z-index: 1;
`;

const MOTTimelineCard = styled.div`
  flex: 1;
  background: ${colors.dark.surface};
  border-radius: 8px;
  padding: ${spacing[4]};
  box-shadow: ${shadows.sm};
`;

const MOTTimelineDate = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[3]};
  font-weight: ${typography.fontWeight.medium};
`;

const MOTResult = styled.span<{ result: string }>`
  display: inline-block;
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  font-size: ${typography.fontSize.sm};
  background-color: ${props => props.result.toLowerCase() === 'pass' 
    ? `${colors.state.success}20` 
    : `${colors.state.error}20`};
  color: ${props => props.result.toLowerCase() === 'pass' 
    ? colors.state.success 
    : colors.state.error};
`;

const DetailsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  background: none;
  border: none;
  color: ${colors.primary.main};
  margin-top: ${spacing[2]};
  cursor: pointer;
  padding: ${spacing[1]} 0;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  
  &:hover {
    color: ${colors.primary.dark};
    text-decoration: underline;
  }
`;

const ExpandedDetails = styled.div`
  margin-top: ${spacing[4]};
  padding-top: ${spacing[4]};
  border-top: 1px solid ${colors.light.border};
`;

const MOTAdvisoriesTitle = styled.h4`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[2]};
`;

const MOTAdvisoriesList = styled.ul`
  padding-left: ${spacing[4]};
  margin: ${spacing[2]} 0;
`;

const MOTAdvisoryItem = styled.li`
  margin-bottom: ${spacing[2]};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
`;

const MOTFailureItem = styled.li`
  margin-bottom: ${spacing[2]};
  font-size: ${typography.fontSize.sm};
  color: ${colors.state.error};
`;

const AdvisoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[1]};
  background-color: ${`${colors.state.warning}20`};
  color: ${colors.state.warning};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  font-size: ${typography.fontSize.xs};
  margin-top: ${spacing[2]};
  
  svg {
    flex-shrink: 0;
  }
`;

// Repair Estimate Components
const RepairEstimateContainer = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 8px;
  padding: ${spacing[4]};
  margin-top: ${spacing[4]};
  border: 1px dashed ${colors.state.warning};
`;

const RepairEstimateTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  color: ${colors.state.warning};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing[2]};
  
  svg {
    flex-shrink: 0;
  }
`;

const RepairEstimateContent = styled.div`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

// SplitContainer component
const SplitContainer = styled.div`
  display: flex;
  gap: ${spacing[6]};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Creating a simple AnimatedMileageGraph component
const AnimatedMileageGraph: React.FC<{ motHistory: any[]; side: 'left' | 'right' }> = ({ motHistory, side }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const sortedData = [...motHistory].sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());
  
  // Calculate max mileage for scaling (add 10% padding to the top)
  const maxMileage = Math.max(...sortedData.map(item => item.odometer)) * 1.1;
  
  // Calculate dimensions
  const width = 100;
  const height = 100;
  const padding = 20;
  
  // Create data points
  const points = sortedData.map((item, index) => {
    const x = padding + (index / (sortedData.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((item.odometer / maxMileage) * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div ref={ref} style={{ 
      width: '100%', 
      height: '280px', 
      position: 'relative',
      backgroundColor: colors.light.surface,
      padding: spacing[4],
      borderRadius: '8px',
      boxShadow: shadows.sm
    }}>
      <h3 style={{ 
        fontSize: typography.fontSize.sm, 
        marginBottom: spacing[4],
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium
      }}>
        Mileage Progression
      </h3>
      
      <div style={{ height: '220px', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {inView && (
            <>
              {/* Grid lines */}
              <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#ddd" strokeWidth="0.5" />
              <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#ddd" strokeWidth="0.5" />
              
              {/* Horizontal grid lines */}
              <line x1={padding} y1={(height-padding)/2 + padding/2} x2={width-padding} y2={(height-padding)/2 + padding/2} stroke="#eee" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1={padding} y1={(height-padding)/4 + padding*3/4} x2={width-padding} y2={(height-padding)/4 + padding*3/4} stroke="#eee" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1={padding} y1={(height-padding)*3/4 + padding/4} x2={width-padding} y2={(height-padding)*3/4 + padding/4} stroke="#eee" strokeWidth="0.5" strokeDasharray="2,2" />
              
              {/* Vertical grid lines */}
              {sortedData.length > 2 && Array.from({ length: Math.min(5, sortedData.length) }).map((_, i) => {
                const x = padding + ((i+1) / (Math.min(6, sortedData.length))) * (width - 2 * padding);
                return (
                  <line 
                    key={`vgrid-${i}`}
                    x1={x} 
                    y1={padding} 
                    x2={x} 
                    y2={height-padding} 
                    stroke="#eee" 
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                );
              })}
              
              {/* Data area with slight opacity */}
              <path
                d={`
                  M ${padding},${height-padding}
                  L ${points.split(' ').join(' L ')}
                  L ${width-padding},${height-padding}
                  Z
                `}
                fill={side === 'left' ? `${colors.primary.main}15` : `${colors.secondary.main}15`}
              />
              
              {/* Data line with animation */}
              <motion.polyline
                points={points}
                fill="none"
                stroke={side === 'left' ? colors.primary.main : colors.secondary.main}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Data points with animation */}
              {sortedData.map((item, index) => {
                const x = padding + (index / (sortedData.length - 1 || 1)) * (width - 2 * padding);
                const y = height - padding - ((item.odometer / maxMileage) * (height - 2 * padding));
                
                return (
                  <motion.circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={side === 'left' ? colors.primary.main : colors.secondary.main}
                    stroke="white"
                    strokeWidth="1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
                  />
                );
              })}
            </>
          )}
        </svg>
        
        {/* Y-axis labels */}
        <div style={{ 
          position: 'absolute', 
          left: '0', 
          top: '0', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          paddingTop: '0',
          paddingBottom: '15px',
          fontSize: '10px',
          color: colors.text.secondary
        }}>
          <div>{Math.round(maxMileage).toLocaleString()} miles</div>
          <div>{Math.round(maxMileage*3/4).toLocaleString()}</div>
          <div>{Math.round(maxMileage/2).toLocaleString()}</div>
          <div>{Math.round(maxMileage/4).toLocaleString()}</div>
          <div>0</div>
        </div>
        
        {/* X-axis labels */}
        <div style={{ 
          position: 'absolute', 
          bottom: '-20px', 
          left: '30px', 
          right: '10px', 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '10px',
          color: colors.text.secondary
        }}>
          {sortedData.length > 0 && (
            <>
              <div>{new Date(sortedData[0].test_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}</div>
              {sortedData.length > 3 && (
                <>
                  <div>
                    {new Date(sortedData[Math.floor(sortedData.length / 3)].test_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
                  </div>
                  {sortedData.length > 4 && (
                    <div>
                      {new Date(sortedData[Math.floor(sortedData.length * 2 / 3)].test_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
                    </div>
                  )}
                </>
              )}
              <div>{new Date(sortedData[sortedData.length - 1].test_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component
const CompareListingsPage: React.FC = () => {
  const { listings, vehicles } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [leftListingId, setLeftListingId] = useState<string | null>(
    searchParams.get('left')
  );
  const [rightListingId, setRightListingId] = useState<string | null>(
    searchParams.get('right')
  );
  
  const [leftListing, setLeftListing] = useState<ListingDetail | null>(null);
  const [rightListing, setRightListing] = useState<ListingDetail | null>(null);
  
  const [leftLoading, setLeftLoading] = useState<boolean>(!!leftListingId);
  const [rightLoading, setRightLoading] = useState<boolean>(!!rightListingId);
  
  // Add state for MOT history loading
  const [leftMotLoading, setLeftMotLoading] = useState(false);
  const [rightMotLoading, setRightMotLoading] = useState(false);
  
  // Add state for MOT history errors
  const [leftMotError, setLeftMotError] = useState<string | null>(null);
  const [rightMotError, setRightMotError] = useState<string | null>(null);
  
  // Add state for active image indices
  const [leftActiveImageIndex, setLeftActiveImageIndex] = useState(0);
  const [rightActiveImageIndex, setRightActiveImageIndex] = useState(0);

  // Add MOT history state
  const [leftMOTHistory, setLeftMOTHistory] = useState<MOTHistoryEntry[]>([]);
  const [rightMOTHistory, setRightMOTHistory] = useState<MOTHistoryEntry[]>([]);
  const [leftExpandedItems, setLeftExpandedItems] = useState<Record<string | number, boolean>>({});
  const [rightExpandedItems, setRightExpandedItems] = useState<Record<string | number, boolean>>({});
  
  // Add function to fetch MOT history
  const fetchMotHistory = (vehicleId: string | number, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftMotLoading(true);
      setLeftMotError(null);
    } else {
      setRightMotLoading(true);
      setRightMotError(null);
    }
    
    vehicles.getVehicleMOTHistory(String(vehicleId))
      .then((historyData: any) => {
        if (historyData && historyData.mot_histories) {
          if (side === 'left') {
            setLeftMOTHistory(historyData.mot_histories);
          } else {
            setRightMOTHistory(historyData.mot_histories);
          }
        } else {
          if (side === 'left') {
            setLeftMOTHistory([]);
          } else {
            setRightMOTHistory([]);
          }
        }
      })
      .catch((err: Error) => {
        console.error(`Error fetching MOT history for ${side} vehicle:`, err);
        if (side === 'left') {
          setLeftMotError('Could not retrieve MOT history');
        } else {
          setRightMotError('Could not retrieve MOT history');
        }
      })
      .finally(() => {
        if (side === 'left') {
          setLeftMotLoading(false);
        } else {
          setRightMotLoading(false);
        }
      });
  };
  
  // Update the renderMileageHistory function to use the improved graph
  const renderMileageHistory = (motHistory: MOTHistoryEntry[], side: 'left' | 'right') => {
    if (motHistory.length < 2) {
      return (
        <div style={{ 
          padding: spacing[6],
          height: '280px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text.secondary,
          backgroundColor: colors.light.surface,
          borderRadius: '8px',
          boxShadow: shadows.sm
        }}>
          <p>Not enough MOT history data to show mileage graph.</p>
        </div>
      );
    }
    
    return <AnimatedMileageGraph motHistory={motHistory} side={side} />;
  };
  
  // Add toggle details function
  const toggleDetails = (id: string | number, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftExpandedItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } else {
      setRightExpandedItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };
  
  // Fetch the listings when IDs change
  useEffect(() => {
    if (leftListingId) {
      setLeftLoading(true);
      listings.getListingById(leftListingId)
        .then(data => {
          setLeftListing(data);
        })
        .catch(error => {
          console.error('Error fetching left listing:', error);
        })
        .finally(() => {
          setLeftLoading(false);
        });
    } else {
      setLeftListing(null);
    }
    
    if (rightListingId) {
      setRightLoading(true);
      listings.getListingById(rightListingId)
        .then(data => {
          setRightListing(data);
        })
        .catch(error => {
          console.error('Error fetching right listing:', error);
        })
        .finally(() => {
          setRightLoading(false);
        });
    } else {
      setRightListing(null);
    }
  }, [leftListingId, rightListingId, listings]);

  // Update URL when listing IDs change
  useEffect(() => {
    const params = new URLSearchParams();
    if (leftListingId) params.set('left', leftListingId);
    if (rightListingId) params.set('right', rightListingId);
    setSearchParams(params);
  }, [leftListingId, rightListingId, setSearchParams]);

  // Update useEffect to fetch real MOT history when listings are loaded
  useEffect(() => {
    if (leftListing?.vehicle?.id) {
      fetchMotHistory(leftListing.vehicle.id, 'left');
    } else if (leftListing?.vehicle?.registration) {
      // If we have registration but no ID, look up the vehicle first
      vehicles.lookupVehicleByRegistration(String(leftListing.vehicle.registration))
        .then((vehicleData: any) => {
          if (vehicleData && vehicleData.vehicle && vehicleData.vehicle.id) {
            fetchMotHistory(vehicleData.vehicle.id, 'left');
          }
        })
        .catch(error => {
          console.error('Error looking up left vehicle by registration:', error);
          setLeftMotError('Could not find MOT history');
          setLeftMotLoading(false);
        });
    }
    
    if (rightListing?.vehicle?.id) {
      fetchMotHistory(rightListing.vehicle.id, 'right');
    } else if (rightListing?.vehicle?.registration) {
      // If we have registration but no ID, look up the vehicle first
      vehicles.lookupVehicleByRegistration(String(rightListing.vehicle.registration))
        .then((vehicleData: any) => {
          if (vehicleData && vehicleData.vehicle && vehicleData.vehicle.id) {
            fetchMotHistory(vehicleData.vehicle.id, 'right');
          }
        })
        .catch(error => {
          console.error('Error looking up right vehicle by registration:', error);
          setRightMotError('Could not find MOT history');
          setRightMotLoading(false);
        });
    }
  }, [leftListing, rightListing, vehicles]);

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

  // Render listing details
  const renderListingDetails = (listing: ListingDetail | null, loading: boolean, side: 'left' | 'right') => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading listing details...</p>
        </LoadingContainer>
      );
    }

    if (!listing) {
      return (
        <EmptyState>
          <h3>No Vehicle Selected</h3>
          <p>Select a vehicle from the listings page to compare</p>
          <UIButton 
            as={Link} 
            to="/listings"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              navigate('/listings', { 
                state: { returnToCompare: true, side } 
              });
            }}
          >
            Browse Listings
          </UIButton>
        </EmptyState>
      );
    }

    return (
      <>
        <ListingHeader>
          <ListingTitle>{listing.title}</ListingTitle>
          <ListingPrice>{formatPrice(listing.price)}</ListingPrice>
          <ListingLocation>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
            </svg>
            {listing.location || 'Location unknown'} • Posted: {formatDate(listing.post_date)}
          </ListingLocation>
        </ListingHeader>

        <ListingImageGallery>
          <MainImage 
            src={listing.image_urls?.[side === 'left' ? leftActiveImageIndex : rightActiveImageIndex] || '/placeholder-car.jpg'} 
            alt={listing.title} 
          />
          
          {listing.image_urls.length > 1 && (
            <ThumbnailsContainer>
              {listing.image_urls.map((url, index) => (
                <Thumbnail 
                  key={index}
                  onClick={() => {
                    if (side === 'left') {
                      setLeftActiveImageIndex(index);
                    } else {
                      setRightActiveImageIndex(index);
                    }
                  }}
                  isActive={side === 'left' 
                    ? index === leftActiveImageIndex 
                    : index === rightActiveImageIndex
                  }
                >
                  <img src={url} alt={`Thumbnail ${index + 1}`} />
                </Thumbnail>
              ))}
            </ThumbnailsContainer>
          )}
        </ListingImageGallery>

        {/* Vehicle Specifications */}
        <AlignedSection>
          <SectionHeading>
            <SectionTitle>Vehicle Specifications</SectionTitle>
          </SectionHeading>
          <SpecTable>
            <SpecRow>
              <SpecLabel>Make</SpecLabel>
              <SpecValue>{listing.vehicle.make}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Model</SpecLabel>
              <SpecValue>{listing.vehicle.model || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Year</SpecLabel>
              <SpecValue>{listing.vehicle.year || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Mileage</SpecLabel>
              <SpecValue>{listing.vehicle.mileage ? `${listing.vehicle.mileage.toLocaleString()} miles` : 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Fuel Type</SpecLabel>
              <SpecValue>{listing.vehicle.fuel_type || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Transmission</SpecLabel>
              <SpecValue>{listing.vehicle.transmission || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Engine Size</SpecLabel>
              <SpecValue>{listing.vehicle.engine_size || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Body Type</SpecLabel>
              <SpecValue>{listing.vehicle.body_type || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Color</SpecLabel>
              <SpecValue>{listing.vehicle.color || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Doors</SpecLabel>
              <SpecValue>{listing.vehicle.doors || 'N/A'}</SpecValue>
            </SpecRow>
            <SpecRow>
              <SpecLabel>Registration</SpecLabel>
              <SpecValue>
                {listing.vehicle.registration_source === "ai_vision" ? (
                  <>
                    {listing.vehicle.registration}
                    <SmallAITag>AI</SmallAITag>
                  </>
                ) : listing.vehicle.registration || 'N/A'}
              </SpecValue>
            </SpecRow>
          </SpecTable>
        </AlignedSection>

        {/* AI Purchase Analysis */}
        {listing.vehicle.purchase_summary && (
          <AlignedSection>
            <SectionHeading>
              <SectionTitle>AI Purchase Analysis</SectionTitle>
              <AIBadge>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V16.01M12 8V12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                AI Powered
              </AIBadge>
            </SectionHeading>
            <AIPoweredContainer>
              <div dangerouslySetInnerHTML={{ __html: listing.vehicle.purchase_summary }} />
            </AIPoweredContainer>
          </AlignedSection>
        )}

        {/* MOT Status */}
        {listing.vehicle.mot_status && (
          <AlignedSection>
            <SectionHeading>
              <SectionTitle>MOT Status</SectionTitle>
            </SectionHeading>
            <div>
              <MOTStatusBadge status={listing.vehicle.mot_status}>
                {listing.vehicle.mot_status}
              </MOTStatusBadge>
              {listing.vehicle.mot_expiry_date && (
                <div style={{ marginTop: spacing[2] }}>
                  Expires: {formatDate(listing.vehicle.mot_expiry_date)}
                </div>
              )}
            </div>
          </AlignedSection>
        )}

        {/* Expected Lifetime */}
        {listing.vehicle.expected_lifetime && (
          <AlignedSection>
            <SectionHeading>
              <SectionTitle>Expected Lifetime</SectionTitle>
              <SmallAITag>AI</SmallAITag>
            </SectionHeading>
            <ExpectedLifetimeSection>{listing.vehicle.expected_lifetime}</ExpectedLifetimeSection>
          </AlignedSection>
        )}

        {/* Repair Estimate */}
        {listing.vehicle.mot_repair_estimate && (
          <AlignedSection>
            <SectionHeading>
              <SectionTitle>Estimated Repair Costs</SectionTitle>
              <SmallAITag>AI</SmallAITag>
            </SectionHeading>
            <RepairEstimateContainer>
              <RepairEstimateTitle>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Potential MOT Repair Costs
              </RepairEstimateTitle>
              <RepairEstimateContent>
                {listing.vehicle.mot_repair_estimate}
              </RepairEstimateContent>
            </RepairEstimateContainer>
          </AlignedSection>
        )}
      </>
    );
  };

  // Clear selections and start over
  const handleClearSelections = () => {
    setLeftListingId(null);
    setRightListingId(null);
  };

  return (
    <PageContainer>
      <PageTitle>Compare Vehicles</PageTitle>
      
      <ComparisonContainer>
        <ComparisonSide>
          <ComparisonContent>
            {renderListingDetails(leftListing, leftLoading, 'left')}
          </ComparisonContent>
        </ComparisonSide>
        
        <ComparisonSide>
          <ComparisonContent>
            {renderListingDetails(rightListing, rightLoading, 'right')}
          </ComparisonContent>
        </ComparisonSide>
      </ComparisonContainer>
      
      {/* Monthly Cost Estimator */}
      <ComparisonSection>
        <SectionHeading>
          <SectionTitle>Monthly Cost Estimator</SectionTitle>
        </SectionHeading>
        <SplitContainer>
          <ComparisonHalf>
            {leftListing ? (
              <CostEstimatorComponent listing={leftListing} />
            ) : (
              <EmptyComparison>No listing selected</EmptyComparison>
            )}
          </ComparisonHalf>
          <ComparisonDivider />
          <ComparisonHalf>
            {rightListing ? (
              <CostEstimatorComponent listing={rightListing} />
            ) : (
              <EmptyComparison>No listing selected</EmptyComparison>
            )}
          </ComparisonHalf>
        </SplitContainer>
      </ComparisonSection>

      {/* Mileage History Section */}
      <ComparisonSection>
        <SectionHeading>
          <SectionTitle>Mileage History</SectionTitle>
        </SectionHeading>
        <SplitContainer>
          <ComparisonHalf>
            {leftMotLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <p>Loading MOT data...</p>
              </LoadingContainer>
            ) : leftMotError ? (
              <ErrorContainer>
                <p>{leftMotError}</p>
              </ErrorContainer>
            ) : leftListing ? renderMileageHistory(leftMOTHistory, 'left') : (
              <EmptyComparison>No listing selected</EmptyComparison>
            )}
          </ComparisonHalf>
          <ComparisonDivider />
          <ComparisonHalf>
            {rightMotLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <p>Loading MOT data...</p>
              </LoadingContainer>
            ) : rightMotError ? (
              <ErrorContainer>
                <p>{rightMotError}</p>
              </ErrorContainer>
            ) : rightListing ? renderMileageHistory(rightMOTHistory, 'right') : (
              <EmptyComparison>No listing selected</EmptyComparison>
            )}
          </ComparisonHalf>
        </SplitContainer>
      </ComparisonSection>

      {/* MOT History Section */}
      <ComparisonSection>
        <SectionHeading>
          <SectionTitle>MOT Test History</SectionTitle>
        </SectionHeading>
        <SplitContainer>
          <ComparisonHalf>
            {leftMotLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <p>Loading MOT data...</p>
              </LoadingContainer>
            ) : leftMotError ? (
              <ErrorContainer>
                <p>{leftMotError}</p>
              </ErrorContainer>
            ) : leftListing && leftMOTHistory.length > 0 ? (
              <ComparisonSectionContent>
                <MOTTimelineContainer>
                  <MOTTimeline>
                    {leftMOTHistory.map((test) => (
                      <MOTTimelineItem key={test.id}>
                        <MOTTimelineDot result={test.result}>
                          {test.result.toLowerCase() === 'pass' ? '✓' : '✗'}
                        </MOTTimelineDot>
                        <MOTTimelineCard>
                          <MOTTimelineDate>
                            {new Date(test.test_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                            <MOTResult result={test.result}>{test.result}</MOTResult>
                          </MOTTimelineDate>
                          
                          <div>Odometer: {test.odometer.toLocaleString()} miles</div>
                          
                          {test.advisory_notes && (
                            <AdvisoryBadge>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Advisories: {Array.isArray(test.advisory_notes) ? test.advisory_notes.length : 1}
                            </AdvisoryBadge>
                          )}
                          
                          {test.failure_reasons && (
                            <DetailsToggle onClick={() => toggleDetails(test.id, 'left')}>
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ 
                                  transform: leftExpandedItems[test.id] 
                                    ? 'rotate(90deg)' 
                                    : 'none' 
                                }}
                              >
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {leftExpandedItems[test.id] ? 'Hide details' : 'Show details'}
                            </DetailsToggle>
                          )}
                          
                          {leftExpandedItems[test.id] && (
                            <ExpandedDetails>
                              {Array.isArray(test.failure_reasons) && test.failure_reasons.length > 0 && (
                                <div style={{ marginBottom: spacing[4] }}>
                                  <MOTAdvisoriesTitle>Failure Reasons</MOTAdvisoriesTitle>
                                  <MOTAdvisoriesList>
                                    {test.failure_reasons.map((reason, idx) => (
                                      <MOTFailureItem key={idx}>{reason}</MOTFailureItem>
                                    ))}
                                  </MOTAdvisoriesList>
                                </div>
                              )}
                              
                              {test.advisory_notes && Array.isArray(test.advisory_notes) && test.advisory_notes.length > 0 && (
                                <div>
                                  <MOTAdvisoriesTitle>Advisory Notices</MOTAdvisoriesTitle>
                                  <MOTAdvisoriesList>
                                    {test.advisory_notes.map((note, idx) => (
                                      <MOTAdvisoryItem key={idx}>{note}</MOTAdvisoryItem>
                                    ))}
                                  </MOTAdvisoriesList>
                                </div>
                              )}
                            </ExpandedDetails>
                          )}
                        </MOTTimelineCard>
                      </MOTTimelineItem>
                    ))}
                  </MOTTimeline>
                </MOTTimelineContainer>
              </ComparisonSectionContent>
            ) : (
              <EmptyComparison>
                {leftListing ? 'No MOT history available' : 'No listing selected'}
              </EmptyComparison>
            )}
          </ComparisonHalf>
          <ComparisonDivider />
          <ComparisonHalf>
            {rightMotLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <p>Loading MOT data...</p>
              </LoadingContainer>
            ) : rightMotError ? (
              <ErrorContainer>
                <p>{rightMotError}</p>
              </ErrorContainer>
            ) : rightListing && rightMOTHistory.length > 0 ? (
              <ComparisonSectionContent>
                <MOTTimelineContainer>
                  <MOTTimeline>
                    {rightMOTHistory.map((test) => (
                      <MOTTimelineItem key={test.id}>
                        <MOTTimelineDot result={test.result}>
                          {test.result.toLowerCase() === 'pass' ? '✓' : '✗'}
                        </MOTTimelineDot>
                        <MOTTimelineCard>
                          <MOTTimelineDate>
                            {new Date(test.test_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                            <MOTResult result={test.result}>{test.result}</MOTResult>
                          </MOTTimelineDate>
                          
                          <div>Odometer: {test.odometer.toLocaleString()} miles</div>
                          
                          {test.advisory_notes && (
                            <AdvisoryBadge>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Advisories: {Array.isArray(test.advisory_notes) ? test.advisory_notes.length : 1}
                            </AdvisoryBadge>
                          )}
                          
                          {test.failure_reasons && (
                            <DetailsToggle onClick={() => toggleDetails(test.id, 'right')}>
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ 
                                  transform: rightExpandedItems[test.id] 
                                    ? 'rotate(90deg)' 
                                    : 'none' 
                                }}
                              >
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {rightExpandedItems[test.id] ? 'Hide details' : 'Show details'}
                            </DetailsToggle>
                          )}
                          
                          {rightExpandedItems[test.id] && (
                            <ExpandedDetails>
                              {Array.isArray(test.failure_reasons) && test.failure_reasons.length > 0 && (
                                <div style={{ marginBottom: spacing[4] }}>
                                  <MOTAdvisoriesTitle>Failure Reasons</MOTAdvisoriesTitle>
                                  <MOTAdvisoriesList>
                                    {test.failure_reasons.map((reason, idx) => (
                                      <MOTFailureItem key={idx}>{reason}</MOTFailureItem>
                                    ))}
                                  </MOTAdvisoriesList>
                                </div>
                              )}
                              
                              {test.advisory_notes && Array.isArray(test.advisory_notes) && test.advisory_notes.length > 0 && (
                                <div>
                                  <MOTAdvisoriesTitle>Advisory Notices</MOTAdvisoriesTitle>
                                  <MOTAdvisoriesList>
                                    {test.advisory_notes.map((note, idx) => (
                                      <MOTAdvisoryItem key={idx}>{note}</MOTAdvisoryItem>
                                    ))}
                                  </MOTAdvisoriesList>
                                </div>
                              )}
                            </ExpandedDetails>
                          )}
                        </MOTTimelineCard>
                      </MOTTimelineItem>
                    ))}
                  </MOTTimeline>
                </MOTTimelineContainer>
              </ComparisonSectionContent>
            ) : (
              <EmptyComparison>
                {rightListing ? 'No MOT history available' : 'No listing selected'}
              </EmptyComparison>
            )}
          </ComparisonHalf>
        </SplitContainer>
      </ComparisonSection>
      
      <ControlsContainer>
        <UIButton 
          variant="secondary" 
          onClick={handleClearSelections}
        >
          Clear Comparison
        </UIButton>
        <UIButton 
          as={Link} 
          to="/listings"
        >
          Back to Listings
        </UIButton>
      </ControlsContainer>
    </PageContainer>
  );
};

export default CompareListingsPage; 