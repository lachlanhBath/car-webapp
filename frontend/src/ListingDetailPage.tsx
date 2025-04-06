import React from 'react';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { colors, typography, spacing } from '../styles/theme';

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

const CompareButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing[4]};
  
  svg {
    margin-right: ${spacing[2]};
  }
`;

const ListingDetailPage: React.FC = () => {
  const handleCompare = () => {
    // Implement the compare logic here
  };

  return (
    <div>
      {/* Vehicle specs section */}
      <CompareButton 
        onClick={handleCompare}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Compare with Other Vehicles
      </CompareButton>
    </div>
  );
};

export default ListingDetailPage; 