import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, mixins, shadows } from '../styles/styleGuide';
import Input from '../components/UI/Input';

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

// Add interface for the cost estimate response
interface CostEstimateResponse {
  vehicle_id: number;
  make: string;
  model: string;
  estimated_monthly_cost: {
    total: number;
    fuel: number;
    maintenance: number;
    tax: number;
    insurance: number;
  };
  parameters: {
    weekly_miles: number;
    driving_style: string;
    driver_age: number;
  };
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

// Add new styled components for the mileage graph
const MileageGraphSection = styled.div`
  grid-column: 1 / -1; // Span all columns
  margin-top: ${spacing[8]};
`;

const MileageGraph = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  box-shadow: ${shadows.md};
`;

const SVGContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: ${spacing[4]};
`;

// Add this new component for the mileage graph
const MileageLineGraph: React.FC<{ motHistory: MOTHistoryEntry[] }> = ({ motHistory }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);
  
  // Define margin for the graph
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;
  
  // Skip rendering if dimensions are not available yet
  if (width <= 0 || height <= 0) {
    return (
      <SVGContainer>
        <svg ref={svgRef} width="100%" height="100%" />
      </SVGContainer>
    );
  }
  
  // Sort history by date (oldest to newest)
  const sortedHistory = [...motHistory].sort((a, b) => 
    new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  );
  
  // Extract years and mileage data
  const dataPoints = sortedHistory.map(entry => ({
    date: new Date(entry.test_date),
    year: new Date(entry.test_date).getFullYear(),
    mileage: entry.odometer
  }));
  
  // If we don't have enough data points, show a message
  if (dataPoints.length < 2) {
    return (
      <SVGContainer>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p>Not enough mileage data to generate a graph.</p>
          <p>At least 2 MOT tests with odometer readings are required.</p>
        </div>
      </SVGContainer>
    );
  }
  
  // Get min and max values for axes
  const minYear = Math.min(...dataPoints.map(d => d.year));
  const maxYear = Math.max(...dataPoints.map(d => d.year));
  const minMileage = Math.min(...dataPoints.map(d => d.mileage));
  const maxMileage = Math.max(...dataPoints.map(d => d.mileage));
  
  // Create scale functions
  const xScale = (x: number) => {
    return ((x - minYear) / (maxYear - minYear || 1)) * width;
  };
  
  const yScale = (y: number) => {
    return height - ((y - minMileage) / (maxMileage - minMileage || 1)) * height;
  };
  
  // Generate path for the line
  const pathData = dataPoints.map((point, i) => {
    const x = xScale(point.year) + margin.left;
    const y = yScale(point.mileage) + margin.top;
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');
  
  // Generate x-axis ticks (years)
  const xTicks = [];
  for (let year = minYear; year <= maxYear; year++) {
    const x = xScale(year) + margin.left;
    xTicks.push(
      <g key={`x-tick-${year}`} transform={`translate(${x}, ${height + margin.top})`}>
        <line y2="6" stroke={colors.text.secondary} />
        <text
          y="22"
          textAnchor="middle"
          fontSize="12"
          fill={colors.text.secondary}
        >
          {year}
        </text>
      </g>
    );
  }
  
  // Generate y-axis ticks (mileage)
  const yTickCount = 5;
  const yTicks = [];
  for (let i = 0; i <= yTickCount; i++) {
    const mileage = minMileage + (i / yTickCount) * (maxMileage - minMileage);
    const y = yScale(mileage) + margin.top;
    yTicks.push(
      <g key={`y-tick-${i}`} transform={`translate(${margin.left}, ${y})`}>
        <line x2="-6" stroke={colors.text.secondary} />
        <text
          x="-10"
          dy="0.32em"
          textAnchor="end"
          fontSize="12"
          fill={colors.text.secondary}
        >
          {Math.round(mileage).toLocaleString()}
        </text>
        <line
          x2={width}
          stroke={colors.light.border}
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      </g>
    );
  }
  
  return (
    <SVGContainer>
      <svg ref={svgRef} width="100%" height="100%">
        {/* X-axis */}
        <line
          x1={margin.left}
          y1={height + margin.top}
          x2={width + margin.left}
          y2={height + margin.top}
          stroke={colors.text.secondary}
        />
        
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height + margin.top}
          stroke={colors.text.secondary}
        />
        
        {/* X and Y axis ticks */}
        {xTicks}
        {yTicks}
        
        {/* Axis labels */}
        <text
          x={width / 2 + margin.left}
          y={height + margin.top + 40}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill={colors.text.secondary}
        >
          Year
        </text>
        
        <text
          x={-height / 2 - margin.top}
          y="15"
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill={colors.text.secondary}
          transform="rotate(-90)"
        >
          Mileage
        </text>
        
        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke={colors.primary.main}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {dataPoints.map((point, i) => {
          const x = xScale(point.year) + margin.left;
          const y = yScale(point.mileage) + margin.top;
          return (
            <g key={`point-${i}`}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke={colors.primary.main}
                strokeWidth="2"
              />
              <title>{`Year: ${point.year}, Mileage: ${point.mileage.toLocaleString()}`}</title>
            </g>
          );
        })}
      </svg>
    </SVGContainer>
  );
};

// Add missing styled components for MOT details
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

// Add styled components for the cost calculator
const CostCalculatorSection = styled.div`
  grid-column: 1 / -1;
  margin-top: ${spacing[8]};
`;

const CostCalculator = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  box-shadow: ${shadows.md};
`;

const CostForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

interface CostResultsProps {
  visible: boolean;
}

const CostResults = styled.div<CostResultsProps>`
  background-color: ${colors.primary.main}10;
  padding: ${spacing[6]};
  border-radius: 8px;
  margin-top: ${spacing[4]};
  display: ${props => props.visible ? 'block' : 'none'};
`;

const CostBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing[4]};
  margin-top: ${spacing[4]};
`;

const CostItem = styled.div`
  text-align: center;
  padding: ${spacing[4]};
  background-color: white;
  border-radius: 8px;
  box-shadow: ${shadows.sm};
`;

const CostValue = styled.div`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary.main};
  margin-bottom: ${spacing[2]};
`;

const CostLabel = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
`;

const TotalCost = styled.div`
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${spacing[4]};
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${spacing[4]};
  margin-top: ${spacing[2]};
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  cursor: pointer;
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${colors.light.border}50;
  }
`;

const RadioInput = styled.input`
  cursor: pointer;
`;

// Add this new styled component for the bar chart
const CostBarChart = styled.div`
  padding: ${spacing[6]};
  margin: ${spacing[4]} 0;
  background-color: ${colors.light.surface};
  border-radius: 10px;
  box-shadow: ${shadows.md};
  border: 1px solid ${colors.light.border};
`;

const CostBar = styled.div`
  height: 30px;
  margin: ${spacing[2]} 0;
  background-color: ${colors.light.border};
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const CostBarFill = styled.div<{ width: string; color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.width};
  background-color: ${props => props.color};
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
`;

const CostBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing[1]};
`;

const ResultsLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing[6]};
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

// Add a styled component for the visualization toggle switch
const VisualizationToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing[4]};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? colors.primary.main : colors.light.border};
  color: ${props => props.active ? colors.primary.contrast : colors.text.secondary};
  border: none;
  padding: ${spacing[2]} ${spacing[4]};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  
  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

// Add a styled component for the stacked area chart
const CostAreaChart = styled.div`
  padding: ${spacing[6]};
  margin: ${spacing[4]} 0;
  background-color: ${colors.light.surface};
  border-radius: 10px;
  box-shadow: ${shadows.md};
  border: 1px solid ${colors.light.border};
  height: 300px;
`;

// Add state for forecast period
const SliderContainer = styled.div`
  margin: ${spacing[4]} 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${spacing[2]};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
`;

const StyledSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: ${colors.light.border};
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${colors.primary.main};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${colors.primary.main};
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }
  }
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
  const [weeklyMiles, setWeeklyMiles] = useState('');
  const [drivingStyle, setDrivingStyle] = useState('normal');
  const [costEstimate, setCostEstimate] = useState<CostEstimateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<'bar' | 'area'>('bar');
  const [driverAge, setDriverAge] = useState('30');
  // Move the forecastPeriod state hook inside the component
  const [forecastPeriod, setForecastPeriod] = useState(12);

  // Update the monthly increase factors to a flat 5% per month for all categories
  const MONTHLY_INCREASE = {
    fuel: 1.05, // 5% increase per month for fuel
    maintenance: 1.05, // 5% increase per month for maintenance
    tax: 1.05, // 5% increase per month for tax
    insurance: 1.05 // 5% increase per month for insurance
  };

  // Update the generateTimeSeriesData function to accept a custom period
  const generateTimeSeriesData = (costEstimate: CostEstimateResponse, months: number = 12) => {
    const timeSeriesData = [];
    // Start with the initial monthly costs
    let currentCosts = {
      fuel: costEstimate.estimated_monthly_cost.fuel,
      maintenance: costEstimate.estimated_monthly_cost.maintenance,
      tax: costEstimate.estimated_monthly_cost.tax,
      insurance: costEstimate.estimated_monthly_cost.insurance
    };
    
    // Track cumulative costs
    let cumulativeCosts = {
      fuel: 0,
      maintenance: 0,
      tax: 0,
      insurance: 0,
      total: 0
    };

    // Generate data for the specified number of months
    for (let month = 0; month < months; month++) {
      // For first month, use original values, otherwise apply compounding increases
      if (month > 0) {
        // Apply monthly increases with compounding effect
        currentCosts = {
          fuel: currentCosts.fuel * MONTHLY_INCREASE.fuel,
          maintenance: currentCosts.maintenance * MONTHLY_INCREASE.maintenance,
          tax: currentCosts.tax * MONTHLY_INCREASE.tax,
          insurance: currentCosts.insurance * MONTHLY_INCREASE.insurance
        };
      }

      // Calculate monthly total
      const monthlyTotal = 
        currentCosts.fuel + 
        currentCosts.maintenance + 
        currentCosts.tax + 
        currentCosts.insurance;
      
      // Add current month costs to cumulative totals
      cumulativeCosts.fuel += currentCosts.fuel;
      cumulativeCosts.maintenance += currentCosts.maintenance;
      cumulativeCosts.tax += currentCosts.tax;
      cumulativeCosts.insurance += currentCosts.insurance;
      cumulativeCosts.total += monthlyTotal;

      // Round all cumulative values to 2 decimal places
      const roundedCumulative = {
        fuel: Math.round(cumulativeCosts.fuel * 100) / 100,
        maintenance: Math.round(cumulativeCosts.maintenance * 100) / 100,
        tax: Math.round(cumulativeCosts.tax * 100) / 100,
        insurance: Math.round(cumulativeCosts.insurance * 100) / 100,
        total: Math.round(cumulativeCosts.total * 100) / 100
      };

      timeSeriesData.push({
        month: month + 1,
        fuel: roundedCumulative.fuel,
        maintenance: roundedCumulative.maintenance,
        tax: roundedCumulative.tax,
        insurance: roundedCumulative.insurance,
        total: roundedCumulative.total,
        // Keep the monthly (non-cumulative) values for reference
        monthly: {
          fuel: Math.round(currentCosts.fuel * 100) / 100,
          maintenance: Math.round(currentCosts.maintenance * 100) / 100,
          tax: Math.round(currentCosts.tax * 100) / 100,
          insurance: Math.round(currentCosts.insurance * 100) / 100,
          total: Math.round(monthlyTotal * 100) / 100
        }
      });
    }

    return timeSeriesData;
  };

  // Update the StackedAreaChart component to handle dynamic month ranges
  interface StackedAreaChartProps {
    data: any[];
  }

  const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ data }) => {
    const svgRef = React.useRef<SVGSVGElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    }, []);
    
    // Define margin for the graph
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    
    // Skip rendering if dimensions are not available yet
    if (width <= 0 || height <= 0) {
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
      );
    }
    
    // Define scales
    const xScale = (x: number) => (x - 1) * (width / 11); // 12 months (0-11)
    const yMax = Math.max(...data.map(d => d.total)) * 1.1; // Add 10% margin
    const yScale = (y: number) => height - (y / yMax) * height;
    
    // Calculate the optimal x-axis tick interval based on the number of months
    const getXTickInterval = (monthCount: number) => {
      if (monthCount <= 12) return 1; // Every month for up to 1 year
      if (monthCount <= 24) return 2; // Every 2 months for up to 2 years
      if (monthCount <= 36) return 3; // Every 3 months for up to 3 years
      if (monthCount <= 48) return 4; // Every 4 months for up to 4 years
      return 6; // Every 6 months for longer periods
    };
    
    const monthCount = data.length;
    const xTickInterval = getXTickInterval(monthCount);
    
    // X-axis ticks (months) with dynamic intervals
    const xTicks = [];
    for (let month = 1; month <= monthCount; month++) {
      if (month === 1 || month === monthCount || month % xTickInterval === 0) {
        const x = xScale(month) + margin.left;
        xTicks.push(
          <g key={`x-tick-${month}`} transform={`translate(${x}, ${height + margin.top})`}>
            <line y2="6" stroke={colors.text.secondary} />
            <text
              y="22"
              textAnchor="middle"
              fontSize="12"
              fill={colors.text.secondary}
            >
              {month <= 12 ? `Month ${month}` : formatMonthLabel(month)}
            </text>
          </g>
        );
      }
    }
    
    // Helper function to format month labels for longer periods
    function formatMonthLabel(month: number) {
      const years = Math.floor((month - 1) / 12);
      const months = ((month - 1) % 12) + 1;
      
      if (months === 1) {
        return `${years} ${years === 1 ? 'Year' : 'Years'}`;
      } else {
        return `${years}y ${months}m`;
      }
    }
    
    // Generate paths for the stacked areas
    const categories = [
      { key: 'insurance', color: '#B6A4FE', label: 'Insurance' },
      { key: 'tax', color: '#6CB2EB', label: 'Road Tax' },
      { key: 'maintenance', color: colors.secondary.main, label: 'Maintenance' },
      { key: 'fuel', color: colors.primary.light, label: 'Fuel' }
    ];
    
    // Create stacked data
    const stackedData = data.map(d => {
      let sum = 0;
      const stacked: any = { month: d.month };
      
      // Calculate stacked values from bottom to top
      categories.forEach(cat => {
        const start = sum;
        sum += d[cat.key];
        stacked[`${cat.key}Start`] = start;
        stacked[`${cat.key}End`] = sum;
      });
      
      return stacked;
    });
    
    // Generate area paths
    const areaPaths = categories.map(cat => {
      const key = cat.key;
      const points: [number, number][] = [];
      
      // Add points from left to right
      stackedData.forEach(d => {
        points.push([xScale(d.month) + margin.left, yScale(d[`${key}End`]) + margin.top]);
      });
      
      // Add points from right to left (bottom part of the area)
      for (let i = stackedData.length - 1; i >= 0; i--) {
        points.push([
          xScale(stackedData[i].month) + margin.left, 
          yScale(stackedData[i][`${key}Start`]) + margin.top
        ]);
      }
      
      // Generate SVG path
      const pathData = points.map((point, i) => {
        return `${i === 0 ? 'M' : 'L'} ${point[0]},${point[1]}`;
      }).join(' ') + ' Z'; // Close the path
      
      return { path: pathData, color: cat.color, key: cat.key, label: cat.label };
    });
    
    // Y-axis ticks (cost)
    const yTickCount = 5;
    const yTicks = [];
    for (let i = 0; i <= yTickCount; i++) {
      const value = (i / yTickCount) * yMax;
      const y = yScale(value) + margin.top;
      yTicks.push(
        <g key={`y-tick-${i}`} transform={`translate(${margin.left}, ${y})`}>
          <line x2="-6" stroke={colors.text.secondary} />
          <text
            x="-10"
            dy="0.32em"
            textAnchor="end"
            fontSize="12"
            fill={colors.text.secondary}
          >
            £{Math.round(value).toLocaleString()}
          </text>
          <line
            x2={width}
            stroke={colors.light.border}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </g>
      );
    }
    
    // First, add the monthly total line to show acceleration
    const monthlyTotalsPoints: [number, number][] = data.map((point, i) => {
      return [
        xScale(point.month) + margin.left, 
        yScale(point.monthly.total) + margin.top
      ];
    });

    // Generate the monthly totals line path
    const monthlyTotalsPath = monthlyTotalsPoints
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[0]},${point[1]}`)
      .join(' ');

    // Add previous vs current month indicators to show acceleration
    // Add this in the render part of the StackedAreaChart SVG
    // Add this after the stacked area paths
    {/* Add monthly cost line to show acceleration trend */}
    <path
      d={monthlyTotalsPath}
      fill="none"
      stroke="#FF5252"
      strokeWidth="2"
      strokeDasharray="3,3"
      strokeLinecap="round"
    />

    // Add month-over-month cost indicators
    {data.slice(1).map((point, i) => {
      const currentMonth = point.month;
      const prevMonth = currentMonth - 1;
      const currentCost = point.monthly.total;
      const prevCost = data[i].monthly.total;
      const increase = ((currentCost - prevCost) / prevCost * 100).toFixed(1);
      
      // Only show every other month for clarity
      if (currentMonth % 3 !== 0) return null;
      
      return (
        <g key={`increase-${currentMonth}`}>
          <line
            x1={xScale(prevMonth) + margin.left}
            y1={yScale(prevCost) + margin.top}
            x2={xScale(currentMonth) + margin.left}
            y2={yScale(currentCost) + margin.top}
            stroke="#FF5252"
            strokeWidth="2"
          />
          <text
            x={xScale(currentMonth - 0.5) + margin.left}
            y={yScale((prevCost + currentCost) / 2) + margin.top - 8}
            fontSize="10"
            fill="#FF5252"
            textAnchor="middle"
          >
            +{increase}%
          </text>
        </g>
      );
    })}

    // Update the legend to include the monthly cost increase line
    // Modify the legend section
    const legend = (
      <g transform={`translate(${margin.left + 20}, ${margin.top})`}>
        <text x="0" y="-10" fontSize="12" fontWeight="500" fill={colors.text.secondary}>
          Cumulative Costs
        </text>
        {categories.map((cat, i) => (
          <g key={cat.key} transform={`translate(0, ${i * 20 + 10})`}>
            <rect width="15" height="15" fill={cat.color} />
            <text x="20" y="12" fontSize="12" fill={colors.text.secondary}>{cat.label}</text>
          </g>
        ))}
        <g transform={`translate(0, ${categories.length * 20 + 20})`}>
          <line x1="0" x2="15" y1="7" y2="7" stroke="#FF5252" strokeWidth="2" strokeDasharray="3,3" />
          <text x="20" y="12" fontSize="12" fill="#FF5252">Monthly Cost Trend</text>
        </g>
      </g>
    );
    
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <svg ref={svgRef} width="100%" height="100%">
          {/* X-axis */}
          <line
            x1={margin.left}
            y1={height + margin.top}
            x2={width + margin.left}
            y2={height + margin.top}
            stroke={colors.text.secondary}
          />
          
          {/* Y-axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height + margin.top}
            stroke={colors.text.secondary}
          />
          
          {/* X and Y axis ticks */}
          {xTicks}
          {yTicks}
          
          {/* Axis labels */}
          <text
            x={width / 2 + margin.left}
            y={height + margin.top + 40}
            textAnchor="middle"
            fontSize="14"
            fontWeight="500"
            fill={colors.text.secondary}
          >
            Month
          </text>
          
          <text
            x={-height / 2 - margin.top}
            y="15"
            textAnchor="middle"
            fontSize="14"
            fontWeight="500"
            fill={colors.text.secondary}
            transform="rotate(-90)"
          >
            Cumulative Cost (£)
          </text>
          
          {/* Stacked area paths */}
          {areaPaths.map(area => (
            <path
              key={area.key}
              d={area.path}
              fill={area.color}
              opacity={0.8}
              stroke={area.color}
              strokeWidth="1"
            />
          ))}
          
          {/* Legend */}
          {legend}
        </svg>
      </div>
    );
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      listings.getListingById(id)
        .then((response: any) => {
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
        .catch((err: Error) => {
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
        .then((historyData: any) => {
          if (historyData && historyData.mot_histories) {
            setMotHistory(historyData.mot_histories);
          } else {
            setMotHistory([]);
          }
        })
        .catch((err: Error) => {
          console.error('Error fetching MOT history:', err);
          setMotError('Could not retrieve MOT history');
        })
        .finally(() => {
          setMotLoading(false);
        });
    } else {
      // Otherwise lookup by registration
      vehicles.lookupVehicleByRegistration(registration)
        .then((vehicleData: any) => {
          if (vehicleData && vehicleData.vehicle && vehicleData.vehicle.id) {
            return vehicles.getVehicleMOTHistory(vehicleData.vehicle.id);
          } else {
            throw new Error('Vehicle ID not found');
          }
        })
        .then((historyData: any) => {
          if (historyData && historyData.mot_histories) {
            setMotHistory(historyData.mot_histories);
          } else {
            setMotHistory([]);
          }
        })
        .catch((error: Error) => {
          console.error('Error looking up vehicle by registration:', error);
          setCalculationError(`Error: Could not find vehicle information for registration ${registration}`);
          setIsCalculating(false);
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

  const calculateMonthlyCosts = () => {
    console.log('Calculate button clicked with input values:', { weeklyMiles, drivingStyle, driverAge });
    
    if (!weeklyMiles) {
      console.log('Weekly miles missing, not calculating');
      setCalculationError('Please enter your weekly mileage');
      return;
    }
    
    if (!driverAge) {
      console.log('Driver age missing, not calculating');
      setCalculationError('Please enter driver age');
      return;
    }
    
    const ageValue = parseInt(driverAge, 10);
    if (isNaN(ageValue) || ageValue < 17 || ageValue > 100) {
      console.log('Invalid driver age:', driverAge);
      setCalculationError('Please enter a valid driver age between 17 and 100');
      return;
    }
    
    console.log('Starting API calculation');
    setIsCalculating(true);
    setCalculationError(null);
    
    // Check if we have a vehicle ID
    const vehicleId = listing?.vehicle?.id;
    const registration = listing?.vehicle?.registration;
    
    console.log('Vehicle data available:', { 
      id: vehicleId, 
      registration: registration,
      make: listing?.vehicle?.make,
      model: listing?.vehicle?.model
    });
    
    // If no vehicle ID but we have registration, lookup by registration first
    if (!vehicleId && registration) {
      console.log('No vehicle ID available, but registration found:', registration);
      console.log('Looking up vehicle by registration');
      
      // Lookup vehicle by registration
      vehicles.lookupVehicleByRegistration(registration)
        .then((vehicleData: any) => {
          console.log('Vehicle lookup response:', vehicleData);
          
          if (vehicleData && vehicleData.vehicle && vehicleData.vehicle.id) {
            // We have a vehicle ID from the lookup, now call the cost estimate endpoint
            const lookupVehicleId = vehicleData.vehicle.id;
            console.log('Found vehicle ID from registration lookup:', lookupVehicleId);
            
            fetchCostEstimate(lookupVehicleId);
          } else {
            throw new Error('Vehicle ID not found from registration lookup');
          }
        })
        .catch(error => {
          console.error('Error looking up vehicle by registration:', error);
          setCalculationError(`Error: Could not find vehicle information for registration ${registration}`);
          setIsCalculating(false);
        });
      return;
    }
    
    // If we have a vehicle ID, use it directly
    if (vehicleId) {
      console.log('Vehicle ID available, using it directly:', vehicleId);
      fetchCostEstimate(vehicleId);
      return;
    }
    
    // If no ID or registration is available, show an error
    console.error('No vehicle ID or registration available');
    setCalculationError('Cannot calculate costs: No vehicle information available');
    setIsCalculating(false);
  };

  const fetchCostEstimate = (vehicleId: string | number) => {
    // Use the correct endpoint that matches our Rails route
    const endpoint = `/api/v1/vehicles/${vehicleId}/operating_cost_estimate`;
    
    console.log(`Fetching cost estimate from: ${endpoint}`);
    
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weekly_miles: parseFloat(weeklyMiles),
        driving_style: drivingStyle,
        driver_age: parseInt(driverAge, 10)
      })
    })
    .then(response => {
      console.log(`API response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Successfully received cost estimate:', data);
      setCostEstimate(data);
    })
    .catch(error => {
      console.error('Error calculating costs:', error);
      setCalculationError(`Error calculating monthly costs: ${error.message}`);
    })
    .finally(() => {
      console.log('Calculation attempt complete');
      setIsCalculating(false);
    });
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
      
      {!loading && !error && listing && (
        <CostCalculatorSection>
          <DetailSection>
            <SectionTitle>Monthly Cost Estimator</SectionTitle>
            <CostCalculator>
              <p>Estimate your monthly operating costs based on your driving habits.</p>
              <CostForm>
                <div>
                  <Input
                    label="Weekly miles driven"
                    type="number"
                    value={weeklyMiles}
                    onChange={(e) => setWeeklyMiles(e.target.value)}
                    placeholder="e.g. 200"
                    min="0"
                  />
                </div>
                <div>
                  <Input
                    label="Driver age"
                    type="number"
                    value={driverAge}
                    onChange={(e) => setDriverAge(e.target.value)}
                    placeholder="e.g. 30"
                    min="17"
                    max="100"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: spacing[2] }}>
                    Driving style
                  </label>
                  <RadioGroup>
                    <RadioLabel>
                      <RadioInput
                        type="radio"
                        name="drivingStyle"
                        value="eco"
                        checked={drivingStyle === 'eco'}
                        onChange={() => setDrivingStyle('eco')}
                      />
                      Eco
                    </RadioLabel>
                    <RadioLabel>
                      <RadioInput
                        type="radio"
                        name="drivingStyle"
                        value="normal"
                        checked={drivingStyle === 'normal'}
                        onChange={() => setDrivingStyle('normal')}
                      />
                      Normal
                    </RadioLabel>
                    <RadioLabel>
                      <RadioInput
                        type="radio"
                        name="drivingStyle"
                        value="aggressive"
                        checked={drivingStyle === 'aggressive'}
                        onChange={() => setDrivingStyle('aggressive')}
                      />
                      Aggressive
                    </RadioLabel>
                  </RadioGroup>
                </div>
              </CostForm>
              
              <button 
                onClick={() => {
                  console.log('Calculate button clicked');
                  calculateMonthlyCosts();
                }} 
                disabled={!weeklyMiles || !driverAge || isCalculating}
                style={{
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrast,
                  border: 'none',
                  borderRadius: '8px',
                  padding: `${spacing[3]} ${spacing[6]}`,
                  fontWeight: typography.fontWeight.medium,
                  cursor: !weeklyMiles || !driverAge || isCalculating ? 'not-allowed' : 'pointer',
                  opacity: !weeklyMiles || !driverAge || isCalculating ? 0.7 : 1,
                  width: '100%',
                  fontSize: typography.fontSize.base,
                  transition: 'background-color 0.2s ease'
                }}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Monthly Costs'}
              </button>
              
              {calculationError && (
                <div style={{ color: colors.state.error, marginTop: spacing[4] }}>
                  {calculationError}
                </div>
              )}
              
              <CostResults 
                visible={!!costEstimate}
                style={{ 
                  border: 'none',
                  borderRadius: '12px', 
                  padding: spacing[6], 
                  boxShadow: shadows.lg,
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #FF9900, #FF5E62, #FF2A5F, #FF00CC, #BA00FF, #7100FF, #4400FF, #2D18FF) border-box',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  position: 'relative'
                }}
              >
                {costEstimate && (
                  <>
                    <TotalCost>
                      £{costEstimate.estimated_monthly_cost.total} per month
                      {forecastPeriod > 12 && (
                        <div style={{ 
                          fontSize: typography.fontSize.lg, 
                          color: colors.text.secondary, 
                          marginTop: spacing[2],
                          fontWeight: typography.fontWeight.normal 
                        }}>
                          Total over {forecastPeriod} months: £{Math.round(generateTimeSeriesData(costEstimate, forecastPeriod)[forecastPeriod-1].total)}
                        </div>
                      )}
                    </TotalCost>
                    
                    <VisualizationToggle>
                      <ToggleButton 
                        active={visualizationType === 'bar'} 
                        onClick={() => setVisualizationType('bar')}
                      >
                        Bar Chart
                      </ToggleButton>
                      <ToggleButton 
                        active={visualizationType === 'area'} 
                        onClick={() => setVisualizationType('area')}
                      >
                        Cost Over Time
                      </ToggleButton>
                    </VisualizationToggle>
                    
                    {visualizationType === 'bar' ? (
                      <CostBarChart style={{ 
                        padding: spacing[6],
                        margin: `${spacing[4]} 0`,
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '10px',
                        boxShadow: shadows.md, 
                        border: '1px solid #dee2e6'
                      }}>
                        <h4 style={{ marginBottom: spacing[3], textAlign: 'center' }}>Cost Breakdown</h4>
                        
                        {/* Fuel Bar */}
                        <CostBarLabel>
                          <span>Fuel</span>
                          <span>£{costEstimate.estimated_monthly_cost.fuel}</span>
                        </CostBarLabel>
                        <CostBar>
                          <CostBarFill 
                            width={`${(costEstimate.estimated_monthly_cost.fuel / costEstimate.estimated_monthly_cost.total) * 100}%`} 
                            color={colors.primary.light}
                          />
                        </CostBar>
                        
                        {/* Maintenance Bar */}
                        <CostBarLabel>
                          <span>Maintenance</span>
                          <span>£{costEstimate.estimated_monthly_cost.maintenance}</span>
                        </CostBarLabel>
                        <CostBar>
                          <CostBarFill 
                            width={`${(costEstimate.estimated_monthly_cost.maintenance / costEstimate.estimated_monthly_cost.total) * 100}%`} 
                            color={colors.secondary.main}
                          />
                        </CostBar>
                        
                        {/* Tax Bar */}
                        <CostBarLabel>
                          <span>Road Tax</span>
                          <span>£{costEstimate.estimated_monthly_cost.tax}</span>
                        </CostBarLabel>
                        <CostBar>
                          <CostBarFill 
                            width={`${(costEstimate.estimated_monthly_cost.tax / costEstimate.estimated_monthly_cost.total) * 100}%`} 
                            color="#6CB2EB"
                          />
                        </CostBar>
                        
                        {/* Insurance Bar */}
                        <CostBarLabel>
                          <span>Insurance</span>
                          <span>£{costEstimate.estimated_monthly_cost.insurance}</span>
                        </CostBarLabel>
                        <CostBar>
                          <CostBarFill 
                            width={`${(costEstimate.estimated_monthly_cost.insurance / costEstimate.estimated_monthly_cost.total) * 100}%`} 
                            color="#B6A4FE"
                          />
                        </CostBar>
                      </CostBarChart>
                    ) : (
                      <CostAreaChart>
                        <h4 style={{ marginBottom: spacing[3], textAlign: 'center' }}>
                          Cumulative Cost Over {forecastPeriod} Months (with 5% Monthly Increase)
                        </h4>
                        
                        <SliderContainer>
                          <SliderLabel>
                            <span>Forecast Period</span>
                            <span>{forecastPeriod} months {forecastPeriod >= 12 ? `(${(forecastPeriod / 12).toFixed(1)} years)` : ''}</span>
                          </SliderLabel>
                          <StyledSlider
                            type="range"
                            min="6"
                            max="60"
                            step="1"
                            value={forecastPeriod}
                            onChange={(e) => setForecastPeriod(parseInt(e.target.value, 10))}
                          />
                        </SliderContainer>
                        
                        <StackedAreaChart data={generateTimeSeriesData(costEstimate, forecastPeriod)} />
                      </CostAreaChart>
                    )}
                  </>
                )}
              </CostResults>
            </CostCalculator>
          </DetailSection>
        </CostCalculatorSection>
      )}
      
      {/* Add Mileage Graph Section - Before MOT History */}
      {!motLoading && !motError && motHistory.length > 0 && (
        <MileageGraphSection>
          <DetailSection>
            <SectionTitle>Mileage History</SectionTitle>
            <MileageGraph>
              <MileageLineGraph motHistory={motHistory} />
            </MileageGraph>
          </DetailSection>
        </MileageGraphSection>
      )}
      
      {/* MOT History Section - Now after the mileage graph */}
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
                  
                  // Fix the failure_reasons check
                  const hasFailures = test.failure_reasons && (
                    Array.isArray(test.failure_reasons) 
                      ? test.failure_reasons.length > 0 
                      : typeof test.failure_reasons === 'string' && String(test.failure_reasons).trim() !== ''
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