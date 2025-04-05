import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { colors, spacing, typography, shadows } from '../../styles/styleGuide';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const InputContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  margin-bottom: ${spacing[4]};
`;

const Label = styled.label`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing[1]};
  color: ${colors.text.primary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const IconContainer = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  ${props => props.$position === 'left' ? 'left: 0;' : 'right: 0;'}
  width: 40px;
  color: ${colors.text.secondary};
  pointer-events: none;
`;

const StyledInput = styled.input<{ $hasError?: boolean; $hasIcon?: boolean; $iconPosition?: 'left' | 'right' }>`
  width: 100%;
  padding: ${spacing[2]} ${spacing[3]};
  padding-left: ${props => (props.$hasIcon && props.$iconPosition === 'left') ? spacing[10] : spacing[3]};
  padding-right: ${props => (props.$hasIcon && props.$iconPosition === 'right') ? spacing[10] : spacing[3]};
  border: 1px solid ${props => props.$hasError ? colors.state.error : colors.dark.border};
  border-radius: 6px;
  background-color: ${props => props.$hasError ? 'rgba(255, 61, 0, 0.05)' : colors.dark.background};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? colors.state.error : colors.primary.main};
    box-shadow: ${props => props.$hasError 
      ? `0 0 0 3px rgba(255, 61, 0, 0.15)` 
      : `0 0 0 3px rgba(56, 152, 236, 0.15)`};
  }
  
  &:hover {
    border-color: ${props => props.$hasError ? colors.state.error : colors.primary.main};
  }
  
  &::placeholder {
    color: ${colors.text.disabled};
  }
  
  &:disabled {
    background-color: rgba(30, 31, 34, 0.5);
    border-color: ${colors.dark.border};
    color: ${colors.text.disabled};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.state.error};
  font-size: ${typography.fontSize.xs};
  margin-top: ${spacing[1]};
`;

const HintText = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  margin-top: ${spacing[1]};
`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint, 
    fullWidth, 
    icon, 
    iconPosition = 'left', 
    ...props 
  }, ref) => {
    return (
      <InputContainer $fullWidth={fullWidth}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <InputWrapper>
          {icon && (
            <IconContainer $position={iconPosition}>
              {icon}
            </IconContainer>
          )}
          <StyledInput
            ref={ref}
            $hasError={!!error}
            $hasIcon={!!icon}
            $iconPosition={iconPosition}
            {...props}
          />
        </InputWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <HintText>{hint}</HintText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input; 