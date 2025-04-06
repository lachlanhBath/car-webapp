import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useApi } from '../services/ApiContext';
import { colors, spacing, typography, mixins, shadows } from '../styles/styleGuide';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import { motion } from 'motion/react';

// Types
interface Vehicle {
  id: string;
  make: string;
  model: string | null;
  year: number;
  fuel_type: string;
  transmission: string | null;
  engine_size?: string;
  body_type?: string | null;
  doors?: number | null;
  color?: string;
  mileage?: number;
  registration?: string;
  registration_source?: string;
  vin?: string | null;
  mot_status?: string;
  mot_expiry_date?: string;
  tax_status?: string;
  tax_due_date?: string;
  purchase_summary?: string;
  mot_repair_estimate?: string;
  expected_lifetime?: string;
  listing?: {
    id: string | number;
    title: string;
    price: number;
    location?: string;
    source_url?: string;
    image_urls?: string[];
  };
}

// Styled components
const PageContainer = styled.div`
  width: 100%;
`;

const HeroSection = styled(motion.section)`
  min-height: 60vh;
  display: flex;
  align-items: center;
  background-color: ${colors.light.background};
  padding: ${spacing[12]} ${spacing[6]} ${spacing[8]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 100%);
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: ${spacing[8]} ${spacing[4]} ${spacing[6]};
    min-height: 50vh;
  }
`;

const HeroBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(125deg, ${colors.light.background}, ${colors.light.surface}, ${colors.gray[100]});
  overflow: hidden;
  z-index: 0;
  
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      ellipse at center,
      ${colors.primary.main}25 0%,
      ${colors.primary.main}10 30%,
      ${colors.primary.main}00 60%
    );
    transform-origin: center center;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 35%, ${colors.primary.main}15 0%, ${colors.primary.main}00 25%),
      radial-gradient(circle at 75% 70%, ${colors.primary.light}10 0%, ${colors.primary.light}00 25%);
    z-index: 2;
  }
`;

const HeroContent = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  text-align: center;
`;

const HeroTitle = styled(motion.h1)`
  font-size: ${typography.fontSize['5xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing[4]};
  color: ${colors.text.primary};
  background: linear-gradient(to right, ${colors.text.primary}, ${colors.primary.main});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(50, 205, 50, 0.1);
  letter-spacing: ${typography.letterSpacing.tight};
  
  @media (max-width: 768px) {
    font-size: ${typography.fontSize['4xl']};
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: ${typography.fontSize['xl']};
  color: ${colors.text.secondary};
  max-width: 700px;
  margin: 0 auto ${spacing[4]};
  line-height: ${typography.lineHeight.relaxed};
  text-shadow: none;
  
  @media (max-width: 768px) {
    font-size: ${typography.fontSize.lg};
  }
`;

const SearchBox = styled(motion.div)`
  background-color: ${colors.light.surface};
  border-radius: ${spacing[3]};
  padding: ${spacing[4]} ${spacing[6]};
  max-width: 800px;
  margin: 0 auto;
  box-shadow: ${shadows.lg};
  border: 1px solid ${colors.light.border};
`;

const SearchTitle = styled.h2`
  font-size: ${typography.fontSize['2xl']};
  margin-bottom: ${spacing[3]};
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
  padding: ${spacing[8]} ${spacing[6]} ${spacing[12]};
  max-width: 1200px;
  margin: 0 auto;
  
  &:first-of-type {
    margin-top: -${spacing[8]};
  }
  
  @media (max-width: 768px) {
    padding: ${spacing[6]} ${spacing[4]} ${spacing[8]};
    
    &:first-of-type {
      margin-top: -${spacing[6]};
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing[5]};
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
  color: ${colors.text.primary};
  
  a {
    color: ${colors.text.primary};
    text-decoration: none;
    
    &:hover {
      color: ${colors.text.primary};
    }
  }
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

const FeatureCard = styled(motion.div)`
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

// Add modern components from ListingsPage
const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, ${colors.dark.surface} 0%, ${colors.dark.border}40 50%, ${colors.dark.surface} 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  height: 380px;
  margin-bottom: ${spacing[6]};
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const AIBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, ${colors.primary.main}30, #8355ff30);
  color: ${colors.primary.main};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
  margin-bottom: ${spacing[2]};
  
  svg {
    margin-right: ${spacing[1]};
  }
`;

const SmallAITag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.primary.main}40, #8355ff40);
  color: ${colors.primary.main};
  font-size: 9px;
  font-weight: ${typography.fontWeight.bold};
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: ${spacing[1]};
`;

const MOTStatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  background-color: ${({ status }) => 
    status.toLowerCase() === 'valid' 
      ? colors.state.success + '30' 
      : status.toLowerCase() === 'expired'
        ? colors.state.error + '30'
        : colors.state.warning + '30'};
  color: ${({ status }) => 
    status.toLowerCase() === 'valid' 
      ? colors.state.success 
      : status.toLowerCase() === 'expired'
        ? colors.state.error
        : colors.state.warning};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: 4px;
`;

const ModernListingCard = styled(motion(Card))`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid ${colors.dark.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
`;

const ListingImageContainer = styled.div`
  position: relative;
  height: 220px;
  margin: -${spacing[6]} -${spacing[6]} 0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
`;

const ModernListingImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ModernListingPrice = styled.div`
  position: absolute;
  bottom: ${spacing[4]};
  right: ${spacing[4]};
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: ${spacing[2]} ${spacing[4]};
  border-radius: 8px;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.lg};
`;

const ListingSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[4]} ${spacing[5]};
  margin-bottom: ${spacing[5]};
  background-color: ${colors.dark.surface}40;
  padding: ${spacing[4]};
  border-radius: 8px;
  border: 1px solid ${colors.dark.border}40;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SpecLabel = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[1]};
  display: flex;
  align-items: center;
`;

const SpecValue = styled.span`
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary};
`;

const ListingLocation = styled.div`
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[4]};
  font-size: ${typography.fontSize.sm};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${spacing[2]};
    color: ${colors.primary.main};
  }
`;

const AIPoweredContainer = styled.div`
  margin-top: ${spacing[3]};
  margin-bottom: ${spacing[4]};
  padding: ${spacing[3]};
  background: linear-gradient(135deg, rgba(131, 85, 255, 0.05), rgba(131, 85, 255, 0.1));
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary.main}, #8355ff);
  }
`;

const PurchaseSummaryPreview = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin: ${spacing[2]} 0 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const QuickFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[2]};
  margin-bottom: ${spacing[4]};
`;

const QuickFilterChip = styled(motion.button)<{ $active?: boolean }>`
  background-color: ${props => props.$active ? `${colors.primary.main}15` : 'transparent'};
  border: 1px solid ${props => props.$active ? colors.primary.main : colors.dark.border};
  border-radius: 24px;
  padding: ${spacing[2]} ${spacing[4]};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${props => props.$active ? colors.primary.main : colors.text.primary};
  cursor: pointer;
`;

// Constants for quick filters
const QUICK_FILTERS = [
  { 
    id: 'electric',
    label: 'Electric Vehicles', 
    filters: { 
      fuelType: 'electric' 
    } 
  },
  { 
    id: 'under_10k',
    label: 'Under £10,000', 
    filters: { 
      maxPrice: 10000 
    } 
  },
  { 
    id: 'newest',
    label: '2022 or newer', 
    filters: { 
      yearFrom: 2022 
    } 
  },
  { 
    id: 'automatic',
    label: 'Automatic', 
    filters: { 
      transmission: 'automatic' 
    } 
  },
  { 
    id: 'bmw',
    label: 'BMW',
    filters: {
      make: 'BMW'
    }
  }
];

const HomePage: React.FC = () => {
  const { vehicles: vehiclesApi, listings: listingsApi } = useApi();
  const [registration, setRegistration] = useState('');
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, [listingsApi]);

  const fetchFeaturedVehicles = (filters = {}) => {
    setLoading(true);
    
    const params = {
      per_page: 6,
      ...filters
    };
    
    listingsApi.getListings(params)
      .then(response => {
        console.log('HomePage API response:', response);
        
        // Check if we have listings in the response
        if (response && response.listings && Array.isArray(response.listings)) {
          // Extract vehicles from listings based on the API response format
          const vehicles = response.listings
            .filter((listing: any) => listing && listing.vehicle) // Filter out listings without vehicle data
            .map((listing: any) => {
              const vehicle = listing.vehicle || {};
              
              return {
                id: `vehicle-${listing.id}`,
                make: vehicle.make || 'Unknown Make',
                model: vehicle.model || (vehicle.make ? listing.title?.replace(vehicle.make, '').trim() : listing.title || 'Unknown Model'),
                year: vehicle.year || new Date().getFullYear(),
                fuel_type: vehicle.fuel_type || '',
                transmission: vehicle.transmission || '',
                registration: vehicle.registration || '',
                mileage: vehicle.mileage || null,
                mot_status: vehicle.mot_status || null,
                mot_expiry_date: vehicle.mot_expiry_date || null,
                purchase_summary: vehicle.purchase_summary || null,
                listing: {
                  id: listing.id,
                  title: listing.title || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle',
                  price: typeof listing.price === 'string' ? parseFloat(listing.price) : (listing.price || 0),
                  location: listing.location || null,
                  source_url: listing.source_url || '',
                  image_urls: Array.isArray(listing.image_urls) ? listing.image_urls : []
                }
              };
            });
          
          setFeaturedVehicles(vehicles);
        } else {
          console.error('Invalid response format:', response);
          setFeaturedVehicles([]);
        }
      })
      .catch(error => {
        console.error('Error fetching featured vehicles:', error);
        setFeaturedVehicles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistration(e.target.value);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration.trim()) return;
    
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
      // Navigate programmatically to the vehicle lookup results page
      window.location.href = `/vehicle-lookup?registration=${registration}`;
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
  
  const handleQuickFilter = (filterId: string, filterValues: any) => {
    if (activeFilter === filterId) {
      // If clicking the already active filter, clear it
      setActiveFilter(null);
      fetchFeaturedVehicles();
    } else {
      // Otherwise, set the new filter
      setActiveFilter(filterId);
      fetchFeaturedVehicles(filterValues);
    }
  };

  return (
    <PageContainer>
      <HeroSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HeroBackground 
          animate={{ 
            background: [
              `linear-gradient(125deg, ${colors.light.background}, ${colors.light.surface}, ${colors.gray[100]})`,
              `linear-gradient(125deg, ${colors.light.surface}, ${colors.gray[50]}, ${colors.light.background})`,
              `linear-gradient(125deg, ${colors.gray[50]}, ${colors.light.background}, ${colors.light.surface})`,
              `linear-gradient(125deg, ${colors.light.background}, ${colors.light.surface}, ${colors.gray[100]})`
            ]
          }} 
          transition={{ 
            duration: 45, 
            repeat: Infinity,
            repeatType: "mirror",
            ease: "linear"
          }} 
        >
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `radial-gradient(ellipse at center, ${colors.primary.main}30 0%, ${colors.primary.main}15 30%, ${colors.primary.main}00 60%)`,
              zIndex: 1
            }}
            animate={{
              transform: ["rotate(0deg) scale(1)", "rotate(360deg) scale(1.05)", "rotate(720deg) scale(1)"]
            }}
            transition={{
              duration: 90,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Add floating particles effect */}
          <motion.div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 2,
              overflow: "hidden"
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  background: i % 3 === 0 
                    ? `${colors.primary.main}12`
                    : i % 3 === 1
                      ? `${colors.primary.light}10`
                      : `${colors.secondary.main}08`,
                  borderRadius: "50%",
                  width: `${15 + (i % 5) * 8}px`,
                  height: `${15 + (i % 5) * 8}px`,
                  top: `${10 + (i * 8) % 80}%`,
                  left: `${10 + (i * 9) % 85}%`,
                  filter: "blur(6px)"
                }}
                animate={{
                  y: [0, i % 2 === 0 ? -10 : -15, 0],
                  x: [0, i % 3 === 0 ? 8 : i % 3 === 1 ? -8 : 12, 0],
                  opacity: [0.2, 0.35, 0.2]
                }}
                transition={{
                  duration: 12 + i % 8,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </HeroBackground>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Find Your Vehicle's History
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Get instant access to MOT history, tax status, and explore our vehicle database
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>
      
      <Section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Featured Vehicles</SectionTitle>
        </motion.div>
        
        <QuickFiltersContainer>
          {QUICK_FILTERS.map((quickFilter, index) => (
            <QuickFilterChip
              key={quickFilter.id}
              $active={activeFilter === quickFilter.id}
              onClick={() => handleQuickFilter(quickFilter.id, quickFilter.filters)}
              whileHover={{ 
                y: -2, 
                borderColor: colors.primary.main,
                backgroundColor: `${colors.primary.main}10`
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2,
                delay: 0.1 * index 
              }}
            >
              {quickFilter.label}
            </QuickFilterChip>
          ))}
        </QuickFiltersContainer>
        
        {loading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : featuredVehicles.length > 0 ? (
          <FeaturedListings>
            {featuredVehicles.map((vehicle, index) => (
              <ModernListingCard 
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.1 * index,
                  duration: 0.5
                }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' 
                }}
              >
                <ListingImageContainer>
                  <ModernListingImage
                    src={vehicle.listing?.image_urls?.[0] || '/placeholder-car.jpg'}
                    alt={vehicle.listing?.title || `${vehicle.make} ${vehicle.model}`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                  />
                  {vehicle.listing && (
                    <ModernListingPrice>
                      {formatPrice(vehicle.listing.price)}
                    </ModernListingPrice>
                  )}
                </ListingImageContainer>
                
                <ListingContent>
                  <ListingTitle>
                    <Link to={`/listings/${vehicle.listing?.id}`}>
                      {vehicle.make} {vehicle.model}
                    </Link>
                  </ListingTitle>
                  
                  {vehicle.listing?.location && (
                    <ListingLocation>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                      </svg>
                      {vehicle.listing.location}
                    </ListingLocation>
                  )}
                  
                  <ListingSpecs>
                    <SpecItem>
                      <SpecLabel>Year</SpecLabel>
                      <SpecValue>{vehicle.year}</SpecValue>
                    </SpecItem>
                    
                    <SpecItem>
                      <SpecLabel>Fuel</SpecLabel>
                      <SpecValue>{vehicle.fuel_type || 'Unknown'}</SpecValue>
                    </SpecItem>
                    
                    <SpecItem>
                      <SpecLabel>Transmission</SpecLabel>
                      <SpecValue>{vehicle.transmission || 'Unknown'}</SpecValue>
                    </SpecItem>
                    
                    <SpecItem>
                      <SpecLabel>Mileage</SpecLabel>
                      <SpecValue>
                        {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Unknown'}
                      </SpecValue>
                    </SpecItem>
                  </ListingSpecs>
                  
                  {vehicle.purchase_summary && (
                    <AIPoweredContainer>
                      <AIBadge>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                          <path d="M2 17L12 22L22 17" fill="currentColor"/>
                          <path d="M2 12L12 17L22 12" fill="currentColor"/>
                        </svg>
                        AI Analysis
                      </AIBadge>
                      <PurchaseSummaryPreview>
                        {vehicle.purchase_summary}
                      </PurchaseSummaryPreview>
                    </AIPoweredContainer>
                  )}
                  
                  {vehicle.mot_status && (
                    <div style={{ marginBottom: spacing[4] }}>
                      <MOTStatusBadge status={vehicle.mot_status}>
                        MOT: {vehicle.mot_status}
                        {vehicle.mot_expiry_date && vehicle.mot_status.toLowerCase() === 'valid' && 
                          ` - Exp. ${new Date(vehicle.mot_expiry_date).toLocaleDateString('en-GB', { 
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit'
                          })}`
                        }
                      </MOTStatusBadge>
                    </div>
                  )}
                  
                  <Button 
                    as={Link} 
                    to={`/listings/${vehicle.listing?.id}`} 
                    fullWidth
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    iconPosition="right"
                  >
                    View Details
                  </Button>
                </ListingContent>
              </ModernListingCard>
            ))}
          </FeaturedListings>
        ) : (
          <motion.div 
            style={{ textAlign: 'center', padding: spacing[8] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>No featured vehicles available at the moment.</p>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ButtonContainer>
            <Button 
              as={Link} 
              to="/listings" 
              variant="secondary" 
              size="large"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              iconPosition="right"
            >
              View All Listings
            </Button>
          </ButtonContainer>
        </motion.div>
      </Section>
      
      <Section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Our Services</SectionTitle>
        </motion.div>
        
        <FeatureGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>MOT History</FeatureTitle>
            <FeatureDescription>
              Access the complete MOT testing history for any vehicle registered in the UK, including test results, advisory notices, and failure reasons.
            </FeatureDescription>
            <Button 
              as={Link} 
              to="/vehicle-lookup" 
              variant="secondary" 
              style={{ marginTop: spacing[4] }}
            >
              Check MOT History
            </Button>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Vehicle Details</FeatureTitle>
            <FeatureDescription>
              Get comprehensive information about any vehicle including make, model, color, engine size, fuel type, and first registration date.
            </FeatureDescription>
            <Button 
              as={Link} 
              to="/listings" 
              variant="secondary" 
              style={{ marginTop: spacing[4] }}
            >
              Browse Vehicles
            </Button>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </FeatureIcon>
            <FeatureTitle>Tax Status</FeatureTitle>
            <FeatureDescription>
              Check if a vehicle is taxed, when the tax is due to expire, or if it has a Statutory Off Road Notification (SORN) status.
            </FeatureDescription>
            <Button 
              as={Link} 
              to="/vehicle-lookup" 
              variant="secondary" 
              style={{ marginTop: spacing[4] }}
            >
              Check Tax Status
            </Button>
          </FeatureCard>
        </FeatureGrid>
      </Section>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Section style={{ padding: 0, marginBottom: spacing[16] }}>
          <AIPoweredContainer style={{ padding: spacing[8], textAlign: 'center' }}>
            <AIBadge style={{ margin: '0 auto', display: 'inline-flex' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" fill="currentColor"/>
                <path d="M2 12L12 17L22 12" fill="currentColor"/>
              </svg>
              AI-Powered Insights
            </AIBadge>
            <motion.h3 
              style={{ 
                fontSize: typography.fontSize['2xl'], 
                marginTop: spacing[4],
                marginBottom: spacing[4]
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Advanced AI Analysis for Your Vehicle
            </motion.h3>
            <motion.p 
              style={{ 
                color: colors.text.secondary,
                maxWidth: '800px',
                margin: '0 auto',
                marginBottom: spacing[6]
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Our platform utilizes artificial intelligence to analyze vehicle data, MOT history, and market trends 
              to provide you with valuable insights like purchase recommendations, expected lifetime, 
              and potential repair costs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button as={Link} to="/vehicle-lookup">
                Try AI Analysis
              </Button>
            </motion.div>
          </AIPoweredContainer>
        </Section>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <CTASection>
          <CTAContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <CTATitle>Ready to discover your vehicle's history?</CTATitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CTAText>
                Get started today with our easy-to-use vehicle lookup service.
              </CTAText>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CTAButtons>
                <Button 
                  as={Link} 
                  to="/vehicle-lookup" 
                  size="large"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  }
                  iconPosition="right"
                >
                  Vehicle Lookup
                </Button>
                <Button 
                  as={Link} 
                  to="/listings" 
                  size="large" 
                  variant="secondary"
                >
                  Browse Listings
                </Button>
              </CTAButtons>
            </motion.div>
          </CTAContent>
        </CTASection>
      </motion.div>
    </PageContainer>
  );
};

export default HomePage; 