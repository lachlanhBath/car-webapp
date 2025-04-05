import React from 'react';
import styled from 'styled-components';
import { colors, shadows, borderRadius, spacing } from '../../styles/styleGuide';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof spacing | string;
  onClick?: () => void;
  className?: string;
}

interface StyledCardProps {
  $variant: CardVariant;
  $padding: string;
  $clickable: boolean;
}

const getVariantStyles = (variant: CardVariant) => {
  switch (variant) {
    case 'elevated':
      return `
        background-color: ${colors.dark.surface};
        box-shadow: ${shadows.lg};
      `;
    
    case 'outlined':
      return `
        background-color: ${colors.dark.surface};
        border: 1px solid ${colors.dark.border};
        box-shadow: none;
      `;
    
    case 'flat':
      return `
        background-color: ${colors.dark.surface};
        box-shadow: none;
      `;
    
    default:
      return `
        background-color: ${colors.dark.surface};
        box-shadow: ${shadows.md};
      `;
  }
};

const StyledCard = styled.div<StyledCardProps>`
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  padding: ${props => props.$padding};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  ${props => getVariantStyles(props.$variant)}
  
  ${props => props.$clickable && `
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${shadows.lg};
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 6,
  onClick,
  className,
}) => {
  const paddingValue = typeof padding === 'string' ? padding : spacing[padding];
  
  return (
    <StyledCard
      $variant={variant}
      $padding={paddingValue}
      $clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      {children}
    </StyledCard>
  );
};

export default Card; 