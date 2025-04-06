import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, typography } from '../../styles/styleGuide';

// Interface for the vehicle details
interface Vehicle {
  id?: string;
  make: string;
  model: string | null;
  year: number;
  fuel_type: string;
}

// Interface for the listing
interface ListingDetail {
  id: number | string;
  title: string;
  price: string | number;
  vehicle: Vehicle;
}

// Styled components
const CostCalculator = styled.div`
  background-color: ${colors.light.surface};
  padding: ${spacing[6]};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CostForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${spacing[4]};
  margin-bottom: ${spacing[4]};
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioInput = styled.input`
  margin-right: ${spacing[1]};
`;

const CostResults = styled.div<{ visible: boolean }>`
  margin-top: ${spacing[4]};
  padding-top: ${spacing[4]};
  border-top: 1px solid ${colors.light.border};
  opacity: ${props => props.visible ? 1 : 0};
  height: ${props => props.visible ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.3s ease;
`;

const TotalCost = styled.div`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary.main};
  text-align: center;
  margin-bottom: ${spacing[4]};
`;

const VisualizationToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing[4]};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? colors.primary.main : 'transparent'};
  color: ${props => props.active ? colors.primary.contrast : colors.text.primary};
  border: 1px solid ${props => props.active ? colors.primary.main : colors.light.border};
  padding: ${spacing[2]} ${spacing[4]};
  border-radius: 30px;
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  margin: 0 ${spacing[1]}; /* Add margin to create a gap between buttons */
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? colors.primary.main : `${colors.primary.main}10`};
    border-color: ${colors.primary.main};
  }
`;

const CostBarChart = styled.div`
  width: 100%;
`;

const CostBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing[1]};
  font-size: ${typography.fontSize.sm};
`;

const CostBar = styled.div<{ width: number; color: string }>`
  height: 24px;
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  border-radius: 4px;
  margin-bottom: ${spacing[3]};
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
    background-size: 200% 100%;
  }
`;

// Main component
const CostEstimatorComponent: React.FC<{ listing: ListingDetail }> = ({ listing }) => {
  const [weeklyMiles, setWeeklyMiles] = useState('');
  const [driverAge, setDriverAge] = useState('30');
  const [drivingStyle, setDrivingStyle] = useState('normal');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<any | null>(null);
  const [visualizationType, setVisualizationType] = useState<'bar' | 'area'>('bar');

  const calculateMonthlyCosts = () => {
    if (!listing || !listing.vehicle) {
      setCalculationError('Vehicle information not available');
      return;
    }
    
    if (!weeklyMiles || weeklyMiles.trim() === '') {
      setCalculationError('Please enter weekly miles driven');
      return;
    }
    
    const milesValue = parseFloat(weeklyMiles);
    if (isNaN(milesValue) || milesValue < 0) {
      setCalculationError('Please enter a valid number of miles');
      return;
    }
    
    const ageValue = parseInt(driverAge, 10);
    if (isNaN(ageValue) || ageValue < 17 || ageValue > 100) {
      setCalculationError('Please enter a valid driver age between 17 and 100');
      return;
    }
    
    setIsCalculating(true);
    setCalculationError(null);
    
    // Mock cost calculation for demo
    setTimeout(() => {
      const fuelCost = milesValue * 0.15;
      const baseMaintenance = listing.vehicle.make === 'BMW' || listing.vehicle.make === 'Mercedes' ? 120 : 80;
      const maintenanceCost = baseMaintenance + (parseInt(listing.vehicle.year.toString()) < 2018 ? 40 : 0);
      const taxCost = listing.vehicle.fuel_type === 'electric' ? 0 : 25;
      const insuranceCost = (101 - ageValue) * 2 + (drivingStyle === 'aggressive' ? 50 : drivingStyle === 'eco' ? -20 : 0);
      
      const totalCost = Math.round(fuelCost + maintenanceCost + taxCost + insuranceCost);
      
      const mockCostEstimate = {
        vehicle_id: listing.vehicle.id || 1,
        make: listing.vehicle.make,
        model: listing.vehicle.model || 'Model',
        estimated_monthly_cost: {
          total: totalCost,
          fuel: Math.round(fuelCost),
          maintenance: maintenanceCost,
          tax: taxCost,
          insurance: Math.round(insuranceCost)
        },
        parameters: {
          weekly_miles: milesValue,
          driving_style: drivingStyle,
          driver_age: ageValue
        }
      };
      
      setCostEstimate(mockCostEstimate);
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <CostCalculator>
      <p>Estimate your monthly operating costs based on your driving habits.</p>
      <CostForm>
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2] }}>
            Weekly miles driven
          </label>
          <input
            type="number"
            value={weeklyMiles}
            onChange={(e) => setWeeklyMiles(e.target.value)}
            placeholder="e.g. 200"
            min="0"
            style={{
              width: '100%',
              padding: spacing[3],
              borderRadius: '8px',
              border: `1px solid ${colors.dark.border}`,
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2] }}>
            Driver age
          </label>
          <input
            type="number"
            value={driverAge}
            onChange={(e) => setDriverAge(e.target.value)}
            placeholder="e.g. 30"
            min="17"
            max="100"
            style={{
              width: '100%',
              padding: spacing[3],
              borderRadius: '8px',
              border: `1px solid ${colors.dark.border}`,
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          />
        </div>
      </CostForm>
      
      <div style={{ marginBottom: spacing[4] }}>
        <label style={{ display: 'block', marginBottom: spacing[2] }}>
          Driving style
        </label>
        <RadioGroup>
          <RadioLabel>
            <RadioInput
              type="radio"
              name={`drivingStyle-${listing?.id}`}
              value="eco"
              checked={drivingStyle === 'eco'}
              onChange={() => setDrivingStyle('eco')}
            />
            Eco
          </RadioLabel>
          <RadioLabel>
            <RadioInput
              type="radio"
              name={`drivingStyle-${listing?.id}`}
              value="normal"
              checked={drivingStyle === 'normal'}
              onChange={() => setDrivingStyle('normal')}
            />
            Normal
          </RadioLabel>
          <RadioLabel>
            <RadioInput
              type="radio"
              name={`drivingStyle-${listing?.id}`}
              value="aggressive"
              checked={drivingStyle === 'aggressive'}
              onChange={() => setDrivingStyle('aggressive')}
            />
            Aggressive
          </RadioLabel>
        </RadioGroup>
      </div>
      
      <button 
        onClick={calculateMonthlyCosts} 
        disabled={!weeklyMiles || isCalculating}
        style={{
          backgroundColor: colors.primary.main,
          color: colors.primary.contrast,
          border: 'none',
          borderRadius: '8px',
          padding: `${spacing[3]} ${spacing[6]}`,
          fontWeight: typography.fontWeight.medium,
          cursor: !weeklyMiles || isCalculating ? 'not-allowed' : 'pointer',
          opacity: !weeklyMiles || isCalculating ? 0.7 : 1,
          width: '100%',
          fontSize: typography.fontSize.base
        }}
      >
        {isCalculating ? 'Calculating...' : 'Calculate Monthly Costs'}
      </button>
      
      {calculationError && (
        <div style={{ color: colors.state.error, marginTop: spacing[4] }}>
          {calculationError}
        </div>
      )}
      
      <CostResults visible={!!costEstimate}>
        {costEstimate && (
          <>
            <TotalCost>
              £{costEstimate.estimated_monthly_cost.total} per month
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
              <CostBarChart>
                <h4 style={{ marginBottom: spacing[3], textAlign: 'center' }}>Cost Breakdown</h4>
                
                {/* Fuel Bar */}
                <CostBarLabel>
                  <span>Fuel</span>
                  <span>£{costEstimate.estimated_monthly_cost.fuel}</span>
                </CostBarLabel>
                <CostBar 
                  width={(costEstimate.estimated_monthly_cost.fuel / costEstimate.estimated_monthly_cost.total) * 100}
                  color="#4285F4"
                />
                
                {/* Maintenance Bar */}
                <CostBarLabel>
                  <span>Maintenance</span>
                  <span>£{costEstimate.estimated_monthly_cost.maintenance}</span>
                </CostBarLabel>
                <CostBar 
                  width={(costEstimate.estimated_monthly_cost.maintenance / costEstimate.estimated_monthly_cost.total) * 100}
                  color="#FBBC05"
                />
                
                {/* Tax Bar */}
                <CostBarLabel>
                  <span>Road Tax</span>
                  <span>£{costEstimate.estimated_monthly_cost.tax}</span>
                </CostBarLabel>
                <CostBar 
                  width={(costEstimate.estimated_monthly_cost.tax / costEstimate.estimated_monthly_cost.total) * 100}
                  color="#34A853"
                />
                
                {/* Insurance Bar */}
                <CostBarLabel>
                  <span>Insurance</span>
                  <span>£{costEstimate.estimated_monthly_cost.insurance}</span>
                </CostBarLabel>
                <CostBar 
                  width={(costEstimate.estimated_monthly_cost.insurance / costEstimate.estimated_monthly_cost.total) * 100}
                  color="#EA4335"
                />
              </CostBarChart>
            ) : (
              <div style={{ height: '250px', marginTop: spacing[6] }}>
                <h4 style={{ marginBottom: spacing[3], textAlign: 'center' }}>Cost Projection Over Time</h4>
                <p style={{ textAlign: 'center', fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  Showing estimated costs over the next 12 months
                </p>
              </div>
            )}
          </>
        )}
      </CostResults>
    </CostCalculator>
  );
};

export default CostEstimatorComponent; 