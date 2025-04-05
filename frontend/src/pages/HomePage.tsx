import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, mixins, shadows } from '../styles/styleGuide';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';

// Types
interface Listing {
  id: string;
  title: string;
  price: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  image_urls: string[];
}

// Styled components
const PageContainer = styled.div`
  width: 100%;
`;

const Hero = styled.section`
  background-color: ${colors.dark.background};
  padding: ${spacing[16]} ${spacing[6]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(18, 18, 18, 0.2) 0%, rgba(18, 18, 18, 0.9) 100%);
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: ${spacing[12]} ${spacing[4]};
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1597404294360-feeeda04612e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: ${typography.fontSize['5xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing[4]};
  color: white;
  
  @media (max-width: 768px) {
    font-size: ${typography.fontSize['4xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${typography.fontSize['xl']};
  color: ${colors.text.secondary};
  max-width: 700px;
  margin: 0 auto ${spacing[8]};
  
  @media (max-width: 768px) {
    font-size: ${typography.fontSize.lg};
  }
`;

const SearchBox = styled.div`
  background-color: ${colors.dark.surface};
  border-radius: ${spacing[3]};
  padding: ${spacing[6]};
  max-width: 800px;
  margin: 0 auto;
  box-shadow: ${shadows.xl};
`;

const SearchTitle = styled.h2`
  font-size: ${typography.fontSize['2xl']};
  margin-bottom: ${spacing[4]};
  text-align: center;
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${spacing[4]};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing[4]};
`;

const Section = styled.section`
  padding: ${spacing[16]} ${spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: ${spacing[12]} ${spacing[4]};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing[8]};
  text-align: center;
`;

const FeaturedListings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing[6]};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ListingCard = styled(Card)`
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ListingImage = styled.div`
  height: 200px;
  background-size: cover;
  background-position: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  margin: -${spacing[6]} -${spacing[6]} 0;
`;

const ListingContent = styled.div`
  padding-top: ${spacing[4]};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ListingTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  margin-bottom: ${spacing[2]};
`;

const ListingPrice = styled.div`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary.main};
  margin-bottom: ${spacing[2]};
`;

const ListingDetail = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing[4]};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing[8]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${spacing[12]};
  }
`;

const FeatureCard = styled.div`
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${colors.primary.main};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${spacing[4]};
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  margin-bottom: ${spacing[3]};
`;

const FeatureDescription = styled.p`
  color: ${colors.text.secondary};
  line-height: 1.6;
`;

const CTASection = styled.section`
  background-color: ${colors.primary.dark};
  padding: ${spacing[16]} ${spacing[6]};
  text-align: center;
  
  @media (max-width: 768px) {
    padding: ${spacing[12]} ${spacing[4]};
  }
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: ${typography.fontSize['3xl']};
  color: white;
  margin-bottom: ${spacing[4]};
`;

const CTAText = styled.p`
  font-size: ${typography.fontSize.lg};
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${spacing[8]};
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing[4]};
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
`;

const HomePage: React.FC = () => {
  const { apiClient } = useApi();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch featured listings on component mount
    const response = apiClient.getListings({ 
      page: 1, 
      per_page: 3,
      sort_by: 'price',
      sort_order: 'desc'
    });
    
    if (response.status === 'success') {
      setFeaturedListings(response.data.listings);
    }
  }, [apiClient]);

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationNumber(e.target.value);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim()) return;
    
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
      // Navigate programmatically to the vehicle lookup results page
      window.location.href = `/vehicle-lookup?registration=${registrationNumber}`;
    }, 1000);
  };

  // Format price to GBP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <PageContainer>
      <Hero>
        <HeroBackground />
        <HeroContent>
          <HeroTitle>Find Your Vehicle's History</HeroTitle>
          <HeroSubtitle>
            Get instant access to MOT history, tax status, and explore our vehicle listings
          </HeroSubtitle>
          
          <SearchBox>
            <SearchTitle>Check vehicle history by registration number</SearchTitle>
            <SearchForm onSubmit={handleRegistrationSubmit}>
              <Input
                placeholder="Enter registration (e.g. AB12CDE)"
                value={registrationNumber}
                onChange={handleRegistrationChange}
                fullWidth
              />
              <Button 
                type="submit" 
                size="large" 
                disabled={!registrationNumber.trim() || loading}
                isLoading={loading}
              >
                Search
              </Button>
            </SearchForm>
          </SearchBox>
        </HeroContent>
      </Hero>
      
      <Section>
        <SectionTitle>Featured Vehicles</SectionTitle>
        <FeaturedListings>
          {featuredListings.map(listing => (
            <ListingCard key={listing.id}>
              <ListingImage style={{ backgroundImage: `url(${listing.image_urls[0]})` }} />
              <ListingContent>
                <ListingPrice>{formatPrice(listing.price)}</ListingPrice>
                <ListingTitle>{listing.title}</ListingTitle>
                <ListingDetail>
                  {listing.vehicle.year} • {listing.vehicle.make} • {listing.vehicle.model}
                </ListingDetail>
                <Button as={Link} to={`/listings/${listing.id}`} fullWidth>
                  View Details
                </Button>
              </ListingContent>
            </ListingCard>
          ))}
        </FeaturedListings>
        
        <ButtonContainer>
          <Button as={Link} to="/listings" variant="secondary" size="large">
            View All Listings
          </Button>
        </ButtonContainer>
      </Section>
      
      <Section>
        <SectionTitle>Our Services</SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>MOT History</FeatureTitle>
            <FeatureDescription>
              Access the complete MOT testing history for any vehicle registered in the UK, including test results, advisory notices, and failure reasons.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Vehicle Details</FeatureTitle>
            <FeatureDescription>
              Get comprehensive information about any vehicle including make, model, color, engine size, fuel type, and first registration date.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Tax Status</FeatureTitle>
            <FeatureDescription>
              Check if a vehicle is taxed, when the tax is due to expire, or if it has a Statutory Off Road Notification (SORN) status.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </Section>
      
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to discover your vehicle's history?</CTATitle>
          <CTAText>
            Get started today with our easy-to-use vehicle lookup service or browse our extensive listings.
          </CTAText>
          <CTAButtons>
            <Button as={Link} to="/vehicle-lookup" size="large">
              Vehicle Lookup
            </Button>
            <Button as={Link} to="/listings" variant="secondary" size="large">
              Browse Listings
            </Button>
          </CTAButtons>
        </CTAContent>
      </CTASection>
    </PageContainer>
  );
};

export default HomePage; 