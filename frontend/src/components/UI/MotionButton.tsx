import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import Button from './Button';
import styled from 'styled-components';

// Define ButtonProps interface since it's not exported from Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text' | 'link';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  as?: React.ElementType;
  to?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  className?: string;
}

// Create a motion version of our Button
const MotionButtonBase = motion(Button);

// Add some styled components enhancements
const MotionButtonStyled = styled(MotionButtonBase)`
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0s;
  }
`;

interface MotionButtonProps extends ButtonProps {
  // Additional motion-specific props
  animateOnHover?: boolean;
  animateOnTap?: boolean;
  hoverScale?: number;
  tapScale?: number;
  initialAnimation?: boolean;
  delay?: number;
  children?: ReactNode;
}

const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  animateOnHover = true,
  animateOnTap = true,
  hoverScale = 1.05,
  tapScale = 0.95,
  initialAnimation = false,
  delay = 0,
  ...props
}) => {
  // Prepare hover animation props
  const hoverAnimation = animateOnHover 
    ? { 
        scale: hoverScale,
        y: -3,
      } 
    : {};
  
  // Prepare tap animation props
  const tapAnimation = animateOnTap 
    ? { 
        scale: tapScale,
      } 
    : {};
    
  // Prepare initial animation props
  const initialProps = initialAnimation 
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, delay }
      }
    : {};

  return (
    <MotionButtonStyled
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      {...initialProps}
      {...props}
    >
      {children}
    </MotionButtonStyled>
  );
};

export default MotionButton; 