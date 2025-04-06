import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

/**
 * ScrollToTopLink component
 * 
 * A wrapper around React Router's Link component that automatically
 * scrolls to the top of the page when clicked.
 */
const ScrollToTopLink: React.FC<LinkProps> = ({ children, to, ...props }) => {
  const handleClick = () => {
    // Scroll to the top of the page with smooth animation
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <RouterLink
      to={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
};

export default ScrollToTopLink; 