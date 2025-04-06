import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { colors, spacing, typography, shadows } from '../../styles/styleGuide';

const HeaderContainer = styled.header`
  background-color: ${colors.dark.surface};
  box-shadow: ${shadows.md};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${spacing[4]} ${spacing[6]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: ${spacing[4]};
    flex-direction: column;
    gap: ${spacing[4]};
  }
`;

const Logo = styled(Link)`
  font-family: ${typography.fontFamily.secondary};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  text-decoration: none;
  letter-spacing: ${typography.letterSpacing.tight};
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  
  &:hover {
    color: ${colors.primary.main};
    text-decoration: none;
  }
`;

const LogoImg = styled.img`
  height: 48px;
  width: auto;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandName = styled.span`
  line-height: 1;
  font-size: ${typography.fontSize['3xl']};
`;

const Tagline = styled.span`
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.regular};
  color: ${colors.text.secondary};
  line-height: 1;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${spacing[6]};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-around;
    gap: ${spacing[2]};
  }
`;

interface NavLinkProps {
  isActive: boolean;
}

const NavLink = styled(Link)<NavLinkProps>`
  color: ${props => props.isActive ? colors.primary.main : colors.text.secondary};
  font-weight: ${props => props.isActive ? typography.fontWeight.semibold : typography.fontWeight.medium};
  font-size: ${typography.fontSize.base};
  text-decoration: none;
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${colors.primary.main};
    transform: scaleX(${props => props.isActive ? 1 : 0});
    transform-origin: left;
    transition: transform 0.2s ease;
  }
  
  &:hover {
    color: ${colors.primary.main};
    text-decoration: none;
    
    &:after {
      transform: scaleX(1);
    }
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoImg src="/logo.png" alt="AutoBiography Logo" />
          <BrandText>
            <BrandName>AutoBiography</BrandName>
            <Tagline>Car history & analytics</Tagline>
          </BrandText>
        </Logo>
        <Nav>
          <NavLink to="/" isActive={isActive('/')}>
            Home
          </NavLink>
          <NavLink to="/listings" isActive={isActive('/listings')}>
            Listings
          </NavLink>
          <NavLink to="/vehicle-lookup" isActive={isActive('/vehicle-lookup')}>
            Vehicle Lookup
          </NavLink>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 