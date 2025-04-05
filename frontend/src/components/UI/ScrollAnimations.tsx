import React, { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import styled from 'styled-components';

// Simple fade-in on scroll component
interface FadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  direction = 'up', 
  duration = 0.5, 
  delay = 0, 
  distance = 30,
  once = true,
  className,
  style
}) => {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      default: return { y: distance };
    }
  };

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ 
        opacity: 0, 
        ...getDirectionOffset() 
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0, 
        transition: { 
          duration, 
          delay 
        } 
      }}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation
interface StaggerContainerProps {
  children: ReactNode;
  staggerAmount?: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerAmount = 0.1,
  duration = 0.5,
  delay = 0,
  className,
  style
}) => {
  // Create variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerAmount,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration }
    }
  };

  // Clone children with animation variants
  const animatedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        variants: itemVariants
      });
    }
    return child;
  });

  return (
    <motion.div
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      {animatedChildren}
    </motion.div>
  );
};

// Parallax container that moves at different speeds based on scroll position
interface ParallaxProps {
  children: ReactNode;
  speed?: number; // 0 = normal scroll, 0.5 = half speed, 2 = twice speed
  className?: string;
  style?: React.CSSProperties;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className,
  style
}) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <motion.div
      className={className}
      style={{
        ...style,
        y
      }}
    >
      {children}
    </motion.div>
  );
};

// Text reveal animation
const RevealContainer = styled(motion.div)`
  overflow: hidden;
  display: inline-block;
`;

const RevealText = styled(motion.span)`
  display: inline-block;
`;

interface TextRevealProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  once?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  duration = 0.5,
  delay = 0,
  once = true
}) => {
  return (
    <RevealContainer
      initial={{ opacity: 1 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once }}
    >
      <RevealText
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        transition={{ 
          duration,
          delay,
          ease: [0.6, 0.01, -0.05, 0.95]
        }}
        viewport={{ once }}
      >
        {children}
      </RevealText>
    </RevealContainer>
  );
}; 