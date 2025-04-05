import React, { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, borderRadius, transitions } from '../../styles/styleGuide';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  as?: React.ElementType;
  to?: string;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return `
        background-color: ${colors.primary.main};
        color: ${colors.primary.contrast};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${colors.primary.dark};
        }
        
        &:active:not(:disabled) {
          background-color: ${colors.primary.dark};
        }
      `;
    
    case 'secondary':
      return `
        background-color: transparent;
        color: ${colors.primary.main};
        border: 1px solid ${colors.primary.main};
        
        &:hover:not(:disabled) {
          background-color: rgba(58, 134, 255, 0.05);
        }
        
        &:active:not(:disabled) {
          background-color: rgba(58, 134, 255, 0.1);
        }
      `;
    
    case 'tertiary':
      return `
        background-color: transparent;
        color: ${colors.text.primary};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        &:active:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.15);
        }
      `;
    
    default:
      return '';
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return `
        font-size: ${typography.fontSize.sm};
        padding: ${spacing[2]} ${spacing[4]};
      `;
    
    case 'medium':
      return `
        font-size: ${typography.fontSize.base};
        padding: ${spacing[3]} ${spacing[6]};
      `;
    
    case 'large':
      return `
        font-size: ${typography.fontSize.lg};
        padding: ${spacing[4]} ${spacing[8]};
      `;
    
    default:
      return '';
  }
};

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
  $withIcon: boolean;
  $iconPosition: 'left' | 'right';
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeight.medium};
  border-radius: ${borderRadius.md};
  transition: all ${transitions.duration.fast} ${transitions.easing.easeInOut};
  cursor: pointer;
  outline: none;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  gap: ${spacing[2]};
  flex-direction: ${props => props.$iconPosition === 'right' ? 'row-reverse' : 'row'};
  
  ${props => getVariantStyles(props.$variant)}
  ${props => getSizeStyles(props.$size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 2px ${colors.primary.main};
  }
`;

const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
`;

const LoadingSpinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: ${spacing[2]};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $withIcon={!!icon}
      $iconPosition={iconPosition}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && icon && <ButtonIcon>{icon}</ButtonIcon>}
      {children}
    </StyledButton>
  );
};

export default Button; 