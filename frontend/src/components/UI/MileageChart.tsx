import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing } from '../../styles/styleGuide';

interface MOTHistoryItem {
  id: string | number;
  test_date: string;
  expiry_date: string | null;
  odometer: number;
  result: string; 
  advisory_notes?: string[] | string;
  failure_reasons?: string[] | string | null;
}

interface MileageChartProps {
  motHistory: MOTHistoryItem[];
}

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  margin-top: ${spacing[4]};
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const AxisLine = styled.line`
  stroke: ${colors.text.secondary};
  stroke-width: 1;
`;

const GridLine = styled.line`
  stroke: ${colors.light.border};
  stroke-width: 1;
  stroke-dasharray: 4 4;
`;

const DataPoint = styled.circle`
  fill: white;
  stroke: ${colors.primary.main};
  stroke-width: 2;
  cursor: pointer;
  r: 4;

  &:hover {
    r: 6;
    stroke-width: 3;
  }
`;

const DataLine = styled.path`
  fill: none;
  stroke: ${colors.primary.main};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const AxisLabel = styled.text`
  fill: ${colors.text.secondary};
  font-size: 12px;
  text-anchor: middle;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${colors.text.secondary};
  text-align: center;
`;

const Tooltip = styled.div<{ x: number; y: number; visible: boolean }>`
  position: absolute;
  top: ${props => Math.max(props.y - 120, 0)}px;
  left: ${props => props.x < 300 ? props.x : Math.min(props.x - 150, window.innerWidth - 300)}px;
  background-color: ${colors.light.surface};
  padding: ${spacing[3]};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 10;
  width: 200px;
  border: 1px solid ${colors.light.border};
`;

const TooltipDate = styled.div`
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[1]};
`;

const TooltipMileage = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[2]};
`;

const TooltipResult = styled.div<{ passed: boolean }>`
  display: inline-block;
  font-size: ${typography.fontSize.xs};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  background-color: ${props => props.passed ? `${colors.state.success}20` : `${colors.state.error}20`};
  color: ${props => props.passed ? colors.state.success : colors.state.error};
  font-weight: ${typography.fontWeight.medium};
`;

const MileageChart: React.FC<MileageChartProps> = ({ motHistory }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    mileage: 0,
    result: ''
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  if (motHistory.length < 2) {
    return (
      <ChartContainer ref={containerRef}>
        <EmptyState>
          <p>Not enough MOT history data to generate a chart.</p>
          <p>At least 2 MOT tests are required.</p>
        </EmptyState>
      </ChartContainer>
    );
  }

  // Sort history by date
  const sortedHistory = [...motHistory].sort((a, b) => 
    new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  );

  // Set up margins and drawing area
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;

  // Get min and max values for axes
  const dateExtent = [
    new Date(sortedHistory[0].test_date).getTime(),
    new Date(sortedHistory[sortedHistory.length - 1].test_date).getTime()
  ];

  const mileages = sortedHistory.map(entry => entry.odometer);
  const minMileage = Math.min(...mileages);
  const maxMileage = Math.max(...mileages);
  
  // Buffer the mileage range by 5%
  const mileageBuffer = (maxMileage - minMileage) * 0.05;
  const yMin = Math.max(0, minMileage - mileageBuffer);
  const yMax = maxMileage + mileageBuffer;

  // Scaling functions
  const xScale = (date: number) => {
    return ((date - dateExtent[0]) / (dateExtent[1] - dateExtent[0])) * width + margin.left;
  };

  const yScale = (mileage: number) => {
    return height - ((mileage - yMin) / (yMax - yMin) * height) + margin.top;
  };

  // Create line path
  const linePath = sortedHistory.map((entry, i) => {
    const x = xScale(new Date(entry.test_date).getTime());
    const y = yScale(entry.odometer);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  // Generate X-axis ticks (dates)
  const xTicks = 5;
  const xTickValues = [];
  for (let i = 0; i <= xTicks; i++) {
    const tickDate = new Date(dateExtent[0] + (dateExtent[1] - dateExtent[0]) * (i / xTicks));
    xTickValues.push(tickDate);
  }

  // Generate Y-axis ticks (mileage)
  const yTicks = 5;
  const yTickValues = [];
  for (let i = 0; i <= yTicks; i++) {
    const tickMileage = yMin + ((yMax - yMin) * (i / yTicks));
    yTickValues.push(tickMileage);
  }

  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Format mileage with commas
  const formatMileage = (mileage: number) => {
    return mileage.toLocaleString();
  };

  // Handle showing tooltip on point hover
  const handlePointMouseEnter = (entry: MOTHistoryItem, x: number, y: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      visible: true,
      x,
      y,
      date: new Date(entry.test_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      mileage: entry.odometer,
      result: entry.result
    });
  };

  const handlePointMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <ChartContainer ref={containerRef}>
      <SVGContainer ref={svgRef}>
        {/* X and Y axes */}
        <AxisLine x1={margin.left} y1={height + margin.top} x2={width + margin.left} y2={height + margin.top} />
        <AxisLine x1={margin.left} y1={margin.top} x2={margin.left} y2={height + margin.top} />
        
        {/* X-axis label */}
        <AxisLabel x={margin.left + width / 2} y={height + margin.top + 30}>
          Test Date
        </AxisLabel>
        
        {/* Y-axis label */}
        <AxisLabel 
          x={0} 
          y={margin.top + height / 2} 
          transform={`rotate(-90, 15, ${margin.top + height / 2})`}
          textAnchor="middle"
        >
          Mileage
        </AxisLabel>
        
        {/* X-axis ticks */}
        {xTickValues.map((date, i) => (
          <g key={`x-tick-${i}`}>
            <line 
              x1={xScale(date.getTime())} 
              y1={height + margin.top} 
              x2={xScale(date.getTime())} 
              y2={height + margin.top + 5} 
              stroke={colors.text.secondary}
            />
            <AxisLabel 
              x={xScale(date.getTime())} 
              y={height + margin.top + 20}
            >
              {formatDate(date)}
            </AxisLabel>
          </g>
        ))}
        
        {/* Y-axis ticks and grid lines */}
        {yTickValues.map((mileage, i) => (
          <g key={`y-tick-${i}`}>
            <line 
              x1={margin.left - 5} 
              y1={yScale(mileage)} 
              x2={margin.left} 
              y2={yScale(mileage)} 
              stroke={colors.text.secondary}
            />
            <AxisLabel 
              x={margin.left - 10} 
              y={yScale(mileage)} 
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatMileage(mileage)}
            </AxisLabel>
            <GridLine 
              x1={margin.left} 
              y1={yScale(mileage)} 
              x2={width + margin.left} 
              y2={yScale(mileage)}
            />
          </g>
        ))}
        
        {/* Draw the line connecting points */}
        <DataLine d={linePath} />
        
        {/* Data points */}
        {sortedHistory.map((entry, i) => {
          const x = xScale(new Date(entry.test_date).getTime());
          const y = yScale(entry.odometer);
          const isPassed = entry.result.toLowerCase() === 'pass';
          
          return (
            <DataPoint 
              key={`point-${i}`}
              cx={x}
              cy={y}
              onMouseEnter={() => handlePointMouseEnter(entry, x, y)}
              onMouseLeave={handlePointMouseLeave}
              fill={isPassed ? 'white' : colors.state.error}
            />
          );
        })}
      </SVGContainer>
      
      {/* Tooltip */}
      <Tooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible}>
        <TooltipDate>{tooltip.date}</TooltipDate>
        <TooltipMileage>{tooltip.mileage.toLocaleString()} miles</TooltipMileage>
        <TooltipResult passed={tooltip.result.toLowerCase() === 'pass'}>
          {tooltip.result.toUpperCase()}
        </TooltipResult>
      </Tooltip>
    </ChartContainer>
  );
};

export default MileageChart; 