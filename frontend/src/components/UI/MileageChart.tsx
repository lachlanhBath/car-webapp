import React, { useMemo } from 'react';
import styled from 'styled-components';
import { colors, spacing, typography } from '../../styles/styleGuide';

interface MOTHistory {
  id: string;
  test_date: string;
  expiry_date: string;
  odometer: number;
  result: string;
  advisory_notes: string;
  failure_reasons: string | null;
}

interface MileageChartProps {
  motHistory: MOTHistory[];
  height?: number;
  width?: string;
  className?: string;
  valueRating?: number;
}

// Styled components
const ChartContainer = styled.div<{ $width: string }>`
  width: ${props => props.$width};
  display: flex;
  gap: ${spacing[4]};
  align-items: stretch;
`;

const Card = styled.div`
  background-color: ${colors.light.surface};
  border-radius: 12px;
  padding: ${spacing[6]};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MileageCard = styled(Card)`
  flex: 1;
`;

const ValueRatingCard = styled(Card)`
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MileageChartWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100%;
`;

const ValueRatingWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const CardTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.primary};
`;

const ValueRatingTitle = styled.h4`
  font-size: ${typography.fontSize.base};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.primary};
  text-align: center;
  font-weight: ${typography.fontWeight.semibold};
`;

const ValueRatingBar = styled.div`
  height: 200px;
  width: 30px;
  background: linear-gradient(to top, #e53e3e, #f6ad55, #48bb78);
  position: relative;
  border-radius: 4px;
  margin: ${spacing[4]} 0;
`;

const ValueRatingIndicator = styled.div<{ $position: number }>`
  position: absolute;
  width: 40px;
  height: 4px;
  background-color: ${colors.text.primary};
  left: -5px;
  bottom: ${props => props.$position}%;
  border-radius: 2px;
  
  &::after {
    content: '';
    position: absolute;
    right: -5px;
    top: -8px;
    border-left: 10px solid ${colors.text.primary};
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
  }
`;

const ValueRatingValue = styled.div`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-top: ${spacing[2]};
  color: ${colors.text.primary};
`;

const ValueRatingLabel = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-top: ${spacing[1]};
`;

const ChartAreaContainer = styled.div`
  position: relative;
  margin-top: ${spacing[4]};
`;

const ChartCanvas = styled.div<{ $height: number }>`
  position: relative;
  height: ${props => `${props.$height}px`};
  margin-left: 50px; /* Space for Y-axis */
  border-bottom: 1px solid ${colors.light.border}; /* Bottom border for X-axis */
  overflow: visible;
`;

const XAxis = styled.div`
  position: relative;
  height: 30px;
  margin-left: 50px; /* Align with Y-axis width */
`;

const YAxis = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 50px;
  border-right: 1px solid ${colors.light.border};
`;

const XLabel = styled.div`
  position: absolute;
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  transform: translateX(-50%);
  text-align: center;
`;

const YLabel = styled.div`
  position: absolute;
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  right: ${spacing[2]};
  transform: translateY(50%);
`;

const ChartSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const Line = styled.path`
  stroke: ${colors.primary.main};
  stroke-width: 1.5;
  fill: none;
  vector-effect: non-scaling-stroke;
`;

const DataPoint = styled.div<{ 
  $top: number, 
  $left: number, 
  $isVisible: boolean
}>`
  position: absolute;
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  transform: translate(-50%, -120%);
  background-color: ${colors.light.surface};
  border: 1px solid ${colors.light.border};
  border-radius: 4px;
  padding: ${spacing[2]};
  font-size: ${typography.fontSize.sm};
  pointer-events: none;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 120px;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.base};
`;

// Add interactive tooltip support
const HoverPoint = styled.circle`
  fill: ${colors.primary.main};
  stroke: white;
  stroke-width: 1;
  r: 3;
  cursor: pointer;
  opacity: 0.9;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    r: 4;
  }
`;

// Get a color based on rating value (0-10)
const getRatingColor = (rating: number): string => {
  if (rating <= 2.5) return '#e53e3e'; // Red for poor value
  if (rating <= 5) return '#ed8936';   // Orange for average value
  if (rating <= 7.5) return '#ecc94b'; // Yellow for good value
  return '#48bb78';                    // Green for excellent value
};

// Get a text label based on rating value
const getRatingLabel = (rating: number): string => {
  if (rating <= 2.5) return 'Poor Value';
  if (rating <= 5) return 'Average Value';
  if (rating <= 7.5) return 'Good Value';
  return 'Excellent Value';
};

const MileageChart: React.FC<MileageChartProps> = ({ 
  motHistory, 
  height = 250,
  width = '100%',
  className,
  valueRating = 5
}) => {
  const [activePoint, setActivePoint] = React.useState<number | null>(null);
  
  const chartData = useMemo(() => {
    // Sort the history by date (oldest to newest)
    return [...motHistory].sort((a, b) => 
      new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
    );
  }, [motHistory]);
  
  const plotData = useMemo(() => {
    if (chartData.length === 0) return { points: [], maxMileage: 0, timeRange: [] as string[], yearPositions: {} as Record<string, number> };
    
    const dates = chartData.map(item => new Date(item.test_date));
    const mileages = chartData.map(item => item.odometer);
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const maxMileage = Math.max(...mileages);
    
    // Round up the max mileage to a nice round number for the scale
    const roundedMaxMileage = Math.ceil(maxMileage / 10000) * 10000;
    
    // Calculate full years for x-axis
    const minYear = minDate.getFullYear() - 1; // Add one year padding before
    const maxYear = maxDate.getFullYear() + 1; // Add one year padding after
    
    // Create a consistent range for x-axis
    const paddedMinDate = new Date(minYear, 0, 1); // January 1st of min year
    const paddedMaxDate = new Date(maxYear, 11, 31); // December 31st of max year
    
    // Total milliseconds in the range from start of min year to end of max year
    const totalRange = paddedMaxDate.getTime() - paddedMinDate.getTime();
    
    // Calculate positions for year labels as percentages
    const yearPositions: Record<string, number> = {};
    const timeRange: string[] = [];
    
    // Add each year in the range to the x-axis labels
    for (let year = minYear; year <= maxYear; year++) {
      const yearDate = new Date(year, 0, 1);
      const position = ((yearDate.getTime() - paddedMinDate.getTime()) / totalRange) * 100;
      yearPositions[year] = position;
      timeRange.push(year.toString());
    }
    
    // Calculate x and y positions for each point using the same scale as year labels
    const points = chartData.map((item, index) => {
      const date = new Date(item.test_date);
      
      // Calculate x position using the same scale as year labels
      const xPercent = ((date.getTime() - paddedMinDate.getTime()) / totalRange) * 100;
      
      // Calculate y position - invert the axis since SVG 0 is at the top
      const yPercent = 100 - ((item.odometer / roundedMaxMileage) * 100);
      
      return { 
        x: xPercent, 
        y: yPercent, 
        date: item.test_date,
        mileage: item.odometer,
        year: date.getFullYear(),
        month: date.getMonth(),
        originalIndex: index
      };
    });
    
    return { 
      points, 
      maxMileage: roundedMaxMileage,
      timeRange,
      yearPositions,
      minYear,
      maxYear,
      paddedMinDate,
      paddedMaxDate
    };
  }, [chartData]);
  
  // Generate SVG path for the line
  const linePath = useMemo(() => {
    if (plotData.points.length < 2) return '';
    
    return plotData.points.reduce((path, point, i) => {
      if (i === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  }, [plotData.points]);
  
  // Format date as MMM YYYY
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };
  
  // Format mileage with commas
  const formatMileage = (mileage: number): string => {
    return mileage.toLocaleString('en-US');
  };
  
  if (motHistory.length === 0) {
    return (
      <ChartContainer $width={width} className={className}>
        <MileageCard>
          <CardTitle>Mileage History</CardTitle>
          <NoDataMessage>No mileage data available</NoDataMessage>
        </MileageCard>
        
        <ValueRatingCard>
          <ValueRatingTitle>Value Rating</ValueRatingTitle>
          <ValueRatingWrapper>
            <ValueRatingBar>
              <ValueRatingIndicator $position={(valueRating / 10) * 100} />
            </ValueRatingBar>
            <div>
              <ValueRatingValue style={{ color: getRatingColor(valueRating) }}>
                {valueRating}/10
              </ValueRatingValue>
              <ValueRatingLabel>{getRatingLabel(valueRating)}</ValueRatingLabel>
            </div>
          </ValueRatingWrapper>
        </ValueRatingCard>
      </ChartContainer>
    );
  }
  
  // Generate y-axis labels with round numbers
  const yAxisLabels = [
    { value: 0, position: '0%' },
    { value: plotData.maxMileage / 4, position: '25%' },
    { value: plotData.maxMileage / 2, position: '50%' },
    { value: (plotData.maxMileage * 3) / 4, position: '75%' },
    { value: plotData.maxMileage, position: '100%' }
  ];
  
  // Calculate the value rating position (0-10 to 0-100%)
  const ratingPosition = (valueRating / 10) * 100;
  
  return (
    <ChartContainer $width={width} className={className}>
      <MileageCard>
        <CardTitle>Mileage History</CardTitle>
        <MileageChartWrapper>
          <ChartAreaContainer>
            <YAxis>
              {yAxisLabels.map((label, index) => (
                <YLabel key={index} style={{ bottom: label.position }}>
                  {formatMileage(Math.round(label.value))}
                </YLabel>
              ))}
            </YAxis>
            
            <ChartCanvas $height={height} className="chart-canvas">
              {/* Main chart area with line and points */}
              <ChartSVG 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                className="chart-svg"
              >
                {/* Line connecting the points */}
                {plotData.points.length > 1 && (
                  <Line d={linePath} vectorEffect="non-scaling-stroke" />
                )}
                
                {/* Data points */}
                {plotData.points.map((point, i) => (
                  <HoverPoint 
                    key={i}
                    cx={point.x} 
                    cy={point.y}
                    onMouseEnter={() => setActivePoint(i)}
                    onMouseLeave={() => setActivePoint(null)}
                  />
                ))}
              </ChartSVG>
              
              {/* Tooltips rendered outside of SVG for better positioning */}
              {plotData.points.map((point, i) => (
                <DataPoint 
                  key={i}
                  $top={point.y} 
                  $left={point.x} 
                  $isVisible={activePoint === i}
                >
                  <div><strong>{formatDate(point.date)}</strong></div>
                  <div>Mileage: {formatMileage(point.mileage)}</div>
                </DataPoint>
              ))}
            </ChartCanvas>
            
            {/* X-axis with year labels */}
            <XAxis>
              {plotData.timeRange.map((year, i) => {
                // Calculate position relative to the chart area
                const position = plotData.yearPositions[year];
                
                return (
                  <XLabel 
                    key={i} 
                    style={{ 
                      left: `${position}%`, 
                      bottom: 0 
                    }}
                  >
                    {year}
                  </XLabel>
                );
              })}
            </XAxis>
          </ChartAreaContainer>
        </MileageChartWrapper>
      </MileageCard>
      
      <ValueRatingCard>
        <ValueRatingTitle>Value Rating</ValueRatingTitle>
        <ValueRatingWrapper>
          <ValueRatingBar>
            <ValueRatingIndicator $position={ratingPosition} />
          </ValueRatingBar>
          <div>
            <ValueRatingValue style={{ color: getRatingColor(valueRating) }}>
              {valueRating}/10
            </ValueRatingValue>
            <ValueRatingLabel>{getRatingLabel(valueRating)}</ValueRatingLabel>
          </div>
        </ValueRatingWrapper>
      </ValueRatingCard>
    </ChartContainer>
  );
};

export default MileageChart; 