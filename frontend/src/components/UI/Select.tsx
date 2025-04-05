import React, { forwardRef, SelectHTMLAttributes } from 'react';
import styled from 'styled-components';
import { colors, spacing, typography } from '../../styles/styleGuide';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: SelectOption[];
}

const SelectContainer = styled.div<{ $fullWidth?: boolean }>`
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

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledSelect = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${spacing[2]} ${spacing[3]};
  padding-right: ${spacing[8]};
  appearance: none;
  border: 1px solid ${props => props.$hasError ? colors.state.error : colors.dark.border};
  border-radius: 6px;
  background-color: ${props => props.$hasError ? 'rgba(255, 61, 0, 0.05)' : colors.dark.background};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};
  transition: all 0.2s ease;
  cursor: pointer;
  
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

const ChevronIcon = styled.div`
  position: absolute;
  right: ${spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${colors.text.secondary};
`;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    hint, 
    fullWidth, 
    options,
    ...props 
  }, ref) => {
    return (
      <SelectContainer $fullWidth={fullWidth}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <SelectWrapper>
          <StyledSelect
            ref={ref}
            $hasError={!!error}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <ChevronIcon>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M8 11L4 7H12L8 11Z" 
                fill="currentColor"
              />
            </svg>
          </ChevronIcon>
        </SelectWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <HintText>{hint}</HintText>}
      </SelectContainer>
    );
  }
);

Select.displayName = 'Select';

export default Select; 