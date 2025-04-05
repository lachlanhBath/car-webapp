import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors, spacing, typography } from '../styles/styleGuide';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: ${spacing[8]};
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: ${typography.fontSize['6xl']};
  color: ${colors.primary.main};
  margin-bottom: ${spacing[4]};
  line-height: 1;
`;

const ErrorTitle = styled.h2`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing[6]};
`;

const ErrorMessage = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  max-width: 600px;
  margin-bottom: ${spacing[8]};
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background-color: ${colors.primary.main};
  color: white;
  padding: ${spacing[3]} ${spacing[6]};
  border-radius: 4px;
  font-weight: ${typography.fontWeight.medium};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${colors.primary.dark};
    text-decoration: none;
    color: white;
  }
`;

const NotFoundPage: React.FC = () => {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>Page Not Found</ErrorTitle>
      <ErrorMessage>
        The page you are looking for doesn't exist or has been moved.
        Please check the URL or navigate back to the homepage.
      </ErrorMessage>
      <HomeButton to="/">Back to Home</HomeButton>
    </NotFoundContainer>
  );
};

export default NotFoundPage; 