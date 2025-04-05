import React from 'react';
import styled from 'styled-components';
import { colors, spacing, typography } from '../../styles/styleGuide';

const FooterContainer = styled.footer`
  background-color: ${colors.dark.surface};
  padding: ${spacing[8]} 0;
  margin-top: ${spacing[12]};
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${spacing[6]};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing[8]};
  
  @media (max-width: 768px) {
    padding: 0 ${spacing[4]};
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.primary};
`;

const FooterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterListItem = styled.li`
  margin-bottom: ${spacing[2]};
  
  a {
    color: ${colors.text.secondary};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${colors.primary.main};
    }
  }
`;

const FooterText = styled.p`
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[3]};
  font-size: ${typography.fontSize.sm};
  line-height: 1.6;
`;

const FooterCopyright = styled.div`
  text-align: center;
  padding-top: ${spacing[6]};
  margin-top: ${spacing[6]};
  border-top: 1px solid ${colors.dark.divider};
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${spacing[6]};
  padding-right: ${spacing[6]};
  
  @media (max-width: 768px) {
    padding-left: ${spacing[4]};
    padding-right: ${spacing[4]};
  }
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>VehicleLookup</FooterTitle>
          <FooterText>
            Your one-stop resource for vehicle information, MOT history,
            and finding your next vehicle from listings across the UK.
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Resources</FooterTitle>
          <FooterList>
            <FooterListItem>
              <a href="https://www.gov.uk/check-mot-history" target="_blank" rel="noopener noreferrer">
                Official MOT History
              </a>
            </FooterListItem>
            <FooterListItem>
              <a href="https://www.gov.uk/check-vehicle-tax" target="_blank" rel="noopener noreferrer">
                Check Vehicle Tax
              </a>
            </FooterListItem>
            <FooterListItem>
              <a href="https://www.gov.uk/vehicle-insurance" target="_blank" rel="noopener noreferrer">
                Vehicle Insurance
              </a>
            </FooterListItem>
          </FooterList>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Contact</FooterTitle>
          <FooterText>
            Have questions or feedback? We'd love to hear from you.
          </FooterText>
          <FooterText>
            Email: info@vehiclelookup.example.com
          </FooterText>
        </FooterSection>
      </FooterContent>
      
      <FooterCopyright>
        © {currentYear} VehicleLookup. All rights reserved. Built at Bath Hackathon 2025.
      </FooterCopyright>
    </FooterContainer>
  );
};

export default Footer; 