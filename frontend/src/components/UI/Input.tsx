import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, borderRadius } from '../../styles/styleGuide';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface StyledInputContainerProps {
  $fullWidth?: boolean;
  $hasError?: boolean;
}

interface StyledInputProps {
  $size: 'small' | 'medium' | 'large';
  $hasLeftIcon?: boolean;
  $hasRightIcon?: boolean;
  $hasError?: boolean;
}

const getSizePadding = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return `${spacing[2]} ${spacing[3]}`;
    case 'large':
      return `${spacing[4]} ${spacing[5]}`;
    default:
      return `${spacing[3]} ${spacing[4]}`;
  }
};

const getHeight = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return '32px';
    case 'large':
      return '48px';
    default:
      return '40px';
  }
};

const getFontSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return typography.fontSize.sm;
    case 'large':
      return typography.fontSize.lg;
    default:
      return typography.fontSize.base;
  }
};

const InputContainer = styled.div<StyledInputContainerProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${spacing[4]};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
`;

const InputLabel = styled.label`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing[2]};
  color: ${colors.text.secondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$position === 'left' ? `left: ${spacing[3]};` : `right: ${spacing[3]};`}
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  pointer-events: none;
`;

const StyledInput = styled.input<StyledInputProps>`
  height: ${props => getHeight(props.$size)};
  padding: ${props => getSizePadding(props.$size)};
  font-size: ${props => getFontSize(props.$size)};
  font-family: ${typography.fontFamily.primary};
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$hasError ? colors.state.error : colors.dark.border};
  border-radius: ${borderRadius.md};
  color: ${colors.text.primary};
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  
  ${props => props.$hasLeftIcon && `padding-left: ${spacing[8]};`}
  ${props => props.$hasRightIcon && `padding-right: ${spacing[8]};`}
  
  &:focus {
    border-color: ${props => props.$hasError ? colors.state.error : colors.primary.main};
    box-shadow: 0 0 0 1px ${props => props.$hasError ? colors.state.error : colors.primary.main};
  }
  
  &:disabled {
    background-color: rgba(255, 255, 255, 0.02);
    color: ${colors.text.disabled};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${colors.text.hint};
  }
`;

const InputMessage = styled.span<{ $isError?: boolean }>`
  font-size: ${typography.fontSize.sm};
  margin-top: ${spacing[1]};
  color: ${props => props.$isError ? colors.state.error : colors.text.hint};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  id,
  disabled,
  ...props
}) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <InputContainer $fullWidth={fullWidth} $hasError={!!error}>
      {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}
      
      <InputWrapper>
        {leftIcon && (
          <IconWrapper $position="left">
            {leftIcon}
          </IconWrapper>
        )}
        
        <StyledInput
          id={inputId}
          $size={size}
          $hasLeftIcon={!!leftIcon}
          $hasRightIcon={!!rightIcon}
          $hasError={!!error}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <IconWrapper $position="right">
            {rightIcon}
          </IconWrapper>
        )}
      </InputWrapper>
      
      {(error || hint) && (
        <InputMessage $isError={!!error}>
          {error || hint}
        </InputMessage>
      )}
    </InputContainer>
  );
};

export default Input; 