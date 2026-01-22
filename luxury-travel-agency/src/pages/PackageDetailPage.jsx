import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, ClockIcon, CurrencyPoundIcon, CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { fetchFrontendData, clearFrontendCache } from '../services/frontendData';
import { onDataChange } from '../services/jsonDatabase';
import { servicesData } from '../data/servicesData';

const PageContainer = styled.div`
  padding-top: 0;
  background: #f9fafb;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  display: flex;
  align-items: flex-end;
  color: white;
  padding-bottom: 3rem;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: 450px;
    padding-bottom: 2.5rem;
  }

  @media (max-width: 768px) {
    height: 400px;
    padding-bottom: 2rem;
  }

  @media (max-width: 480px) {
    height: 350px;
    padding-bottom: 1.5rem;
  }
`;

const HeroImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
`;

const HeroOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;

  @media (max-width: 640px) {
    padding: 0 1rem;
  }
`;

const Badge = styled.span`
  background: #6A1B82;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-family: 'Playfair Display', serif;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 2rem;
  font-size: 1.1rem;
  opacity: 0.9;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: -3rem auto 0;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  position: relative;
  z-index: 2;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    margin-top: 2rem;
  }

  @media (max-width: 640px) {
    padding: 0 1rem 3rem;
    gap: 1.5rem;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow-x: hidden;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 12px;
  }

  /* Fix images inside rich text content */
  img {
    max-width: 100%;
    height: auto;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 968px) {
    margin-top: 2rem;
  }
`;

const BookingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 100px;

  @media (max-width: 968px) {
    position: relative;
    top: 0;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const PriceTag = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #6A1B82;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PriceNote = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const BookButton = styled(Link)`
  display: block;
  width: 100%;
  background: linear-gradient(135deg, #6A1B82 0%, #7C2E9B 100%);
  color: #FFFFFF;
  text-align: center;
  padding: 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(106, 27, 130, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(106, 27, 130, 0.45);
    background: linear-gradient(135deg, #7C2E9B 0%, #6A1B82 100%);
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(106, 27, 130, 0.4);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  font-family: 'Playfair Display', serif;
  border-bottom: 3px solid #6A1B82;
  padding-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #6A1B82;
    width: 28px;
    height: 28px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HighlightList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const HighlightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #4a4a4a;
  line-height: 1.5;

  svg {
    width: 20px;
    height: 20px;
    color: #10b981; /* Green check */
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ItineraryItem = styled.div`
  margin-bottom: 2rem;
  border-left: 2px solid #e5e7eb;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: '${props => props.day}';
    position: absolute;
    left: -1rem;
    top: 0;
    width: 2rem;
    height: 2rem;
    background: #6A1B82;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
  }
`;

const DayTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const DayDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 640px) {
    gap: 0;
    padding-bottom: 0.5rem;
  }
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 1rem 0.5rem;
  margin-right: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.active ? '#6A1B82' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#6A1B82' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: #6A1B82;
  }

  @media (max-width: 640px) {
    padding: 0.75rem 0.25rem;
    margin-right: 0.25rem;
    font-size: 0.85rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #1a1a1a;
  }

  tr:last-child td {
    border-bottom: none;
  }

  @media (max-width: 640px) {
    th, td {
      padding: 0.75rem 0.5rem;
      font-size: 0.9rem;
    }
  }
`;

const OfferBanner = styled.div`
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  color: #78350f;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
`;

const InfoBox = styled.div`
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  border-left: 4px solid #6A1B82;
`;

const OverviewCard = styled.div`
  background: linear-gradient(135deg, #f8f5ff 0%, #f3f4ff 100%);
  padding: 1.75rem;
  border-radius: 14px;
  border: 1px solid #e5d9ff;
  box-shadow: 0 10px 30px rgba(106, 27, 130, 0.08);
`;

const GalleryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

// Sub-package tabs (e.g., 1-Day Tour, 2-Day Tour)
const PackageTabsContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  background: #f3f4f6;
  border-radius: 16px;
  padding: 0.5rem;
  position: relative;
  overflow: hidden;
`;

const PackageTab = styled(motion.button)`
  background: ${props => props.active ? 'linear-gradient(135deg, #6A1B82 0%, #9333ea 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6A1B82'};
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  position: relative;
  z-index: 1;
  box-shadow: ${props => props.active ? '0 8px 25px rgba(106, 27, 130, 0.4)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #7C2E9B 0%, #a855f7 100%)' : 'rgba(106, 27, 130, 0.1)'};
  }

  @media (max-width: 640px) {
    padding: 1rem 1rem;
    font-size: 0.95rem;
  }
`;

const PackageInfo = styled(motion.div)`
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2px solid #d8b4fe;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  box-shadow: 0 10px 40px rgba(147, 51, 234, 0.15);
`;

const PackageInfoItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  .label {
    font-size: 0.75rem;
    color: #9333ea;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #6A1B82;
    font-family: 'Playfair Display', serif;
  }

  @media (max-width: 640px) {
    padding: 0.75rem;
    .value {
      font-size: 1.25rem;
    }
  }
`;

const PackageDescription = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid #9333ea;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  
  p {
    color: #4a4a4a;
    line-height: 1.7;
    margin: 0;
    font-size: 1.05rem;
  }
`;

const ItineraryCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-left: 5px solid ${props => props.$dayColor || '#6A1B82'};
  position: relative;
  overflow: hidden;

  &::before {
    content: 'Day ${props => props.$day}';
    position: absolute;
    top: 0;
    right: 0;
    background: ${props => props.$dayColor || '#6A1B82'};
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 0 16px 0 16px;
    font-weight: 700;
    font-size: 0.9rem;
  }
`;

const ItineraryTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
  padding-right: 80px;
`;

const ItineraryDescription = styled.p`
  color: #555;
  line-height: 1.8;
  font-size: 1rem;
`;

const GalleryImage = styled.div`
  width: 100%;
  height: 220px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.6) 100%);
    z-index: 1;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

const GalleryImageContent = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  color: white;
  z-index: 1;
  
  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-family: 'Playfair Display', serif;
  }
  
  p {
    font-size: 0.9rem;
    line-height: 1.4;
    opacity: 0.95;
    margin: 0;
  }
`;

// Enhanced Package Cards for multi-package display
const PackageCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PackageCard = styled(motion.div)`
  background: ${props => props.$active ? 'linear-gradient(135deg, #6A1B82 0%, #9333ea 100%)' : 'white'};
  color: ${props => props.$active ? 'white' : '#1a1a1a'};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? '#6A1B82' : '#e5e7eb'};
  transition: all 0.3s ease;
  min-width: 180px;
  max-width: 250px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(106, 27, 130, 0.15);
    border-color: #6A1B82;
  }
`;

const PackageCardBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  background: ${props => props.$type === 'required' ? '#dc2626' : '#10b981'};
  color: white;
  margin-bottom: 0.5rem;
`;

const PackageCardTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.3;
`;

const PackageCardPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const PackageCardDuration = styled.span`
  font-size: 0.85rem;
  opacity: 0.8;
`;

const ExpandableSection = styled(motion.div)`
  overflow: hidden;
  background: #fafafa;
  border-radius: 12px;
  margin-top: 1rem;
`;

const ExpandableContent = styled.div`
  padding: 1.5rem;
`;

const TCSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.$color || '#6A1B82'};
  
  h5 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #1a1a1a;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
      color: #4a4a4a;
      border-bottom: 1px solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      &::before {
        content: '${props => props.$icon || '•'}';
        position: absolute;
        left: 0;
      }
    }
  }
`;

const PackageDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [activePackage, setActivePackage] = useState(0); // For sub-packages
  const [expandedPackageDetails, setExpandedPackageDetails] = useState(null); // For expandable package cards
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Get active sub-package data (if exists), otherwise use main package data
  const hasSubPackages = packageData?.subPackages && packageData.subPackages.length > 0;
  const currentSubPackage = hasSubPackages ? packageData.subPackages[activePackage] : null;
  
  // Helper to get data from current sub-package or main package
  const getActiveData = (field) => {
    if (currentSubPackage && currentSubPackage[field] && 
        (Array.isArray(currentSubPackage[field]) ? currentSubPackage[field].length > 0 : currentSubPackage[field])) {
      return currentSubPackage[field];
    }
    return packageData?.[field];
  };

  // Get overview bullets - uses getActiveData to show sub-package specific content
  const detailedOverviewData = getActiveData('detailedOverview');
  const overviewBullets = detailedOverviewData
    ? detailedOverviewData
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    const fetchPackageData = async () => {
      setLoading(true);
      setNotFound(false);
      
      console.log('PackageDetailPage: Looking for package with id:', id);
      
      // Try fetching from frontend data service
      try {
        const { tours } = await fetchFrontendData();
        console.log('PackageDetailPage: Found tours:', tours.length, tours.map(t => ({ slug: t.slug, id: t.id, title: t.title })));
        
        const tour = tours.find(t => t.slug === id || String(t.id) === String(id));
        console.log('PackageDetailPage: Matched tour:', tour ? tour.title : 'NOT FOUND (slug: ' + id + ')');
        
        if (!tour && tours.length > 0) {
          console.log('PackageDetailPage: Available slugs:', tours.map(t => t.slug));
        }
        
        if (tour) {
          // Parse details_json
          let details = {};
          try {
            details = JSON.parse(tour.details_json || '{}');
            console.log('PackageDetailPage: Parsed tour details:', details);
          } catch (e) {
            console.error('Failed to parse tour details:', e);
          }
          
          // Map database tour to component structure
          setPackageData({
            id: tour.slug,
            title: tour.title,
            code: tour.tour_code,
            price: `£${tour.price}`,
            childPrice: tour.child_price ? `£${tour.child_price}` : null,
            duration: tour.duration,
            location: tour.location,
            description: tour.description,
            image: tour.featured_image,
            tourOverview: details.tourOverview || [],
            highlights: details.highlights || [],
            priceIncludes: details.priceIncludes || [],
            itinerary: details.itinerary || [],
            pickupPoints: details.pickupPoints || [],
            earlyBirdOffer: details.earlyBirdOffer || null,
            advanceBookingOffer: details.advanceBookingOffer || null,
            detailedOverview: details.detailedOverview || '',
            importantNotes: details.importantNotes || '',
            tourDates: details.tourDates || [],
            detailedItinerary: details.detailedItinerary || '',
            hotels: details.hotels || '',
            starDifference: details.starDifference || [],
            // Handle both old 'otherInformation' (string) and new 'otherInfo' (array) formats
            otherInfo: details.otherInfo || (details.otherInformation ? details.otherInformation.split('\n').filter(line => line.trim()) : []),
            termsAndConditions: details.termsAndConditions || [],
            additionalExcursions: details.additionalExcursions || [],
            galleryImages: details.galleryImages || [],
            // Sub-packages for multi-option tours (e.g., 1-Day, 2-Day options)
            subPackages: details.subPackages || [],
          });
          
          // Reset active package when loading new tour
          setActivePackage(0);
          
          document.title = `${tour.title} | Luxury Travel Agency`;
          window.scrollTo(0, 0);
          setLoading(false);
          return; // Exit if database fetch successful
        }
      } catch (error) {
        console.log('Fetching from frontend data failed, falling back to static data:', error);
      }

      // Fallback to static data from servicesData
      let foundPackage = null;
      for (const service of servicesData) {
        if (service.packages) {
          foundPackage = service.packages.find(p => p.id === id);
          if (foundPackage) break;
        }
      }
      
      if (foundPackage) {
        setPackageData(foundPackage);
        document.title = `${foundPackage.title} | Luxury Travel Agency`;
        window.scrollTo(0, 0);
      } else {
        console.log('PackageDetailPage: Package not found in database or static data');
        setNotFound(true);
      }
      
      setLoading(false);
    };

    fetchPackageData();
    
    // Listen for tour updates and reload
    const unsubscribe = onDataChange((type) => {
      console.log('PackageDetailPage: Data changed, reloading...', type);
      if (type === 'tours') {
        clearFrontendCache();
        fetchPackageData();
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading tour details...</p>
        </div>
      </PageContainer>
    );
  }

  if (notFound || !packageData) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Tour Not Found</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>The tour "{id}" could not be found.</p>
          <Link to="/service/tours" style={{ color: '#6A1B82', textDecoration: 'underline' }}>Browse all tours</Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <HeroImage 
          src={packageData.image} 
          alt={packageData.title}
          loading="eager"
          decoding="async"
        />
        <HeroOverlay />
        <HeroContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {packageData.code && <Badge>Code: {packageData.code}</Badge>}
            <Title>{packageData.title}</Title>
            <MetaInfo>
              <div><MapPinIcon /> {packageData.location}</div>
              <div><ClockIcon /> {packageData.duration}</div>
            </MetaInfo>
          </motion.div>
        </HeroContent>
      </HeroSection>

      <ContentContainer>
        <MainContent>
          {/* Sub-package tabs for multi-option tours */}
          {packageData.subPackages && packageData.subPackages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: '#1a1a1a', 
                marginBottom: '1rem',
                fontFamily: "'Playfair Display', serif"
              }}>
                🎯 Choose Your Package
              </h3>
              
              {/* Compact Package Cards */}
              <PackageCardsContainer>
                {packageData.subPackages.map((pkg, index) => (
                  <PackageCard
                    key={index}
                    $active={activePackage === index}
                    onClick={() => setActivePackage(index)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PackageCardBadge $type={pkg.packageType || 'optional'}>
                      {pkg.packageType === 'required' ? 'Required' : 'Optional'}
                    </PackageCardBadge>
                    <PackageCardTitle>{pkg.name || `Package ${index + 1}`}</PackageCardTitle>
                    {pkg.price && <PackageCardPrice>£{pkg.price}</PackageCardPrice>}
                    {pkg.duration && <PackageCardDuration>{pkg.duration}</PackageCardDuration>}
                  </PackageCard>
                ))}
              </PackageCardsContainer>
            </motion.div>
          )}
          
          <TabContainer>
            {/* Conditionally render Tour Overview tab only if overview data exists */}
            {(() => {
              const tourOverview = getActiveData('tourOverview');
              const highlights = getActiveData('highlights');
              const priceIncludes = getActiveData('priceIncludes');
              const priceExcludes = getActiveData('priceExcludes');
              const starDifference = getActiveData('starDifference');
              const hotels = getActiveData('hotels');
              const additionalExcursions = getActiveData('additionalExcursions');
              const importantNotes = getActiveData('importantNotes');
              const hasOverviewData = 
                (tourOverview && Array.isArray(tourOverview) && tourOverview.length > 0) ||
                (highlights && Array.isArray(highlights) && highlights.length > 0) ||
                (priceIncludes && Array.isArray(priceIncludes) && priceIncludes.length > 0) ||
                (priceExcludes && Array.isArray(priceExcludes) && priceExcludes.length > 0) ||
                (starDifference && Array.isArray(starDifference) && starDifference.length > 0) ||
                (hotels && typeof hotels === 'string' && hotels.trim().length > 0) ||
                (additionalExcursions && Array.isArray(additionalExcursions) && additionalExcursions.length > 0) ||
                (importantNotes && typeof importantNotes === 'string' && importantNotes.trim().length > 0);
              return hasOverviewData ? (
                <TabButton 
                  active={activeTab === 'overview'} 
                  onClick={() => setActiveTab('overview')}
                >
                  Tour Overview
                </TabButton>
              ) : null;
            })()}
            {/* Conditionally render Itinerary tab only if itinerary data exists */}
            {(() => {
              const itineraryArray = getActiveData('itinerary');
              const detailedItinerary = getActiveData('detailedItinerary');
              const hasItineraryData = (itineraryArray && Array.isArray(itineraryArray) && itineraryArray.length > 0) ||
                (detailedItinerary && typeof detailedItinerary === 'string' && detailedItinerary.trim().length > 0);
              return hasItineraryData ? (
                <TabButton 
                  active={activeTab === 'itinerary'} 
                  onClick={() => setActiveTab('itinerary')}
                >
                  Itinerary
                </TabButton>
              ) : null;
            })()}
            {/* Conditionally render Dates tab only if tour dates exist */}
            {(() => {
              const tourDates = getActiveData('tourDates');
              const hasDatesData = tourDates && Array.isArray(tourDates) && tourDates.length > 0;
              return hasDatesData ? (
                <TabButton 
                  active={activeTab === 'dates'} 
                  onClick={() => setActiveTab('dates')}
                >
                  Dates
                </TabButton>
              ) : null;
            })()}
            {/* Conditionally render Other Information tab only if data exists */}
            {(() => {
              const otherInfo = getActiveData('otherInfo');
              const termsAndConditions = getActiveData('termsAndConditions');
              const hasOtherInfoData = 
                (otherInfo && ((typeof otherInfo === 'string' && otherInfo.trim().length > 0) || (Array.isArray(otherInfo) && otherInfo.length > 0))) ||
                (termsAndConditions && ((typeof termsAndConditions === 'string' && termsAndConditions.trim().length > 0) || (Array.isArray(termsAndConditions) && termsAndConditions.length > 0)));
              return hasOtherInfoData ? (
                <TabButton 
                  active={activeTab === 'otherinfo'} 
                  onClick={() => setActiveTab('otherinfo')}
                >
                  Other Information
                </TabButton>
              ) : null;
            })()}
            {/* Conditionally render Pick Up tab only if pickup data exists */}
            {(() => {
              const pickupData = getActiveData('pickupPoints');
              const hasPickupData = pickupData && (
                (typeof pickupData === 'string' && pickupData.trim().length > 0) ||
                (Array.isArray(pickupData) && pickupData.length > 0)
              );
              return hasPickupData ? (
                <TabButton 
                  active={activeTab === 'pickup'} 
                  onClick={() => setActiveTab('pickup')}
                >
                  Pick Up
                </TabButton>
              ) : null;
            })()}
          </TabContainer>

          <AnimatePresence mode="wait">
            {/* Conditionally render Tour Overview tab content only if data exists */}
            {(() => {
              const tourOverview = getActiveData('tourOverview');
              const highlights = getActiveData('highlights');
              const priceIncludes = getActiveData('priceIncludes');
              const priceExcludes = getActiveData('priceExcludes');
              const starDifference = getActiveData('starDifference');
              const hotels = getActiveData('hotels');
              const additionalExcursions = getActiveData('additionalExcursions');
              const importantNotes = getActiveData('importantNotes');
              const hasOverviewData = 
                (tourOverview && Array.isArray(tourOverview) && tourOverview.length > 0) ||
                (highlights && Array.isArray(highlights) && highlights.length > 0) ||
                (priceIncludes && Array.isArray(priceIncludes) && priceIncludes.length > 0) ||
                (priceExcludes && Array.isArray(priceExcludes) && priceExcludes.length > 0) ||
                (starDifference && Array.isArray(starDifference) && starDifference.length > 0) ||
                (hotels && typeof hotels === 'string' && hotels.trim().length > 0) ||
                (additionalExcursions && Array.isArray(additionalExcursions) && additionalExcursions.length > 0) ||
                (importantNotes && typeof importantNotes === 'string' && importantNotes.trim().length > 0);
              return hasOverviewData && activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Early Bird Offer */}
                {packageData.earlyBirdOffer && (
                  <OfferBanner>
                    {packageData.earlyBirdOffer}
                  </OfferBanner>
                )}
                
                {/* Advance Booking Offer */}
                {packageData.advanceBookingOffer && (
                  <OfferBanner style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    {packageData.advanceBookingOffer}
                  </OfferBanner>
                )}
                
                <p style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#666' }}>
                  {getActiveData('description') || packageData.description}
                </p>
                
                {/* Tour Overview (boxed list) */}
                {overviewBullets.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle>Tour Overview</SectionTitle>
                    <OverviewCard>
                      <HighlightList>
                        {overviewBullets.map((point, idx) => (
                          <HighlightItem key={idx}>
                            <CheckCircleIcon />
                            {point}
                          </HighlightItem>
                        ))}
                      </HighlightList>
                    </OverviewCard>
                  </div>
                )}
                
                {/* Tour Overview points (plain list) */}
                {getActiveData('tourOverview') && getActiveData('tourOverview').length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Tour Overview</SectionTitle>
                    <HighlightList>
                      {getActiveData('tourOverview').map((highlight, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon />
                          {highlight}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}

                {/* Tour Highlights */}
                {getActiveData('highlights') && getActiveData('highlights').length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Tour Highlights</SectionTitle>
                    <HighlightList>
                      {getActiveData('highlights').map((highlight, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon />
                          {highlight}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}

                {/* Price Includes */}
                {getActiveData('priceIncludes') && getActiveData('priceIncludes').length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Price Includes</SectionTitle>
                    <HighlightList>
                      {getActiveData('priceIncludes').map((item, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon style={{ color: '#10b981' }} />
                          {item}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}
                
                {/* Price Excludes */}
                {getActiveData('priceExcludes') && getActiveData('priceExcludes').length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle style={{ borderColor: '#ef4444' }}>❌ Price Excludes</SectionTitle>
                    <HighlightList>
                      {getActiveData('priceExcludes').map((item, index) => (
                        <HighlightItem key={index}>
                          <span style={{ color: '#ef4444', marginRight: '0.5rem' }}>✕</span>
                          {item}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}
                
                {/* The Star Difference */}
                {getActiveData('starDifference') && getActiveData('starDifference').length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> The Star Difference</SectionTitle>
                    <HighlightList>
                      {getActiveData('starDifference').map((item, index) => (
                        <HighlightItem key={index}>
                          <CheckCircleIcon style={{ color: '#fbbf24' }} />
                          {item}
                        </HighlightItem>
                      ))}
                    </HighlightList>
                  </div>
                )}
                
                {/* Hotels */}
                {getActiveData('hotels') && (
                  <InfoBox>
                    <h4 style={{ marginBottom: '0.5rem', color: '#6A1B82' }}>🏨 Hotels / Accommodation</h4>
                    <p style={{ margin: 0, color: '#4a4a4a' }}>{getActiveData('hotels')}</p>
                  </InfoBox>
                )}
                
                {/* Additional Excursions */}
                {getActiveData('additionalExcursions') && getActiveData('additionalExcursions').length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <SectionTitle>🎯 Additional Excursions</SectionTitle>
                    <Table>
                      <thead>
                        <tr>
                          <th>Excursions</th>
                          <th>Adult</th>
                          <th>Child</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getActiveData('additionalExcursions').map((exc, index) => (
                          <tr key={index}>
                            <td>{exc.name}</td>
                            <td>{exc.adult}</td>
                            <td>{exc.child}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                
                {/* Important Notes */}
                {getActiveData('importantNotes') && (
                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fef3c7', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#d97706', fontSize: '1.25rem', fontWeight: 700 }}>⚠️ Important Notes</h4>
                    <p style={{ margin: 0, lineHeight: '1.8', color: '#78350f', whiteSpace: 'pre-wrap' }}>{getActiveData('importantNotes')}</p>
                  </div>
                )}
              </motion.div>
              ) : null;
            })()}

            {/* Conditionally render Itinerary tab content only if itinerary data exists */}
            {(() => {
              const itineraryArray = getActiveData('itinerary');
              const detailedItinerary = getActiveData('detailedItinerary');
              const hasItineraryData = (itineraryArray && Array.isArray(itineraryArray) && itineraryArray.length > 0) ||
                (detailedItinerary && typeof detailedItinerary === 'string' && detailedItinerary.trim().length > 0);
              return hasItineraryData && activeTab === 'itinerary' ? (
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {itineraryArray && itineraryArray.length > 0 && (
                  <div>
                    <SectionTitle><CalendarIcon /> Day-wise Itinerary</SectionTitle>
                    {itineraryArray.map((item) => (
                      <ItineraryItem key={item.day} day={item.day}>
                        <DayTitle>Day {item.day}: {item.title}</DayTitle>
                        <DayDescription>{item.description}</DayDescription>
                      </ItineraryItem>
                    ))}
                  </div>
                )}
                
                {/* Detailed Day-by-Day Itinerary */}
                {detailedItinerary && detailedItinerary.trim().length > 0 && (
                  <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <SectionTitle><CalendarIcon /> Detailed Day-by-Day Itinerary</SectionTitle>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
                      <div 
                        style={{ lineHeight: '1.8', color: '#4a4a4a', fontFamily: 'inherit', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: detailedItinerary }}
                        className="detailed-itinerary-content"
                      />
                      <style>{`
                        .detailed-itinerary-content { max-width: 100%; overflow-x: hidden; }
                        .detailed-itinerary-content strong { font-weight: 700; color: #1f2937; }
                        .detailed-itinerary-content b { font-weight: 700; color: #1f2937; }
                        .detailed-itinerary-content em { font-style: italic; }
                        .detailed-itinerary-content i { font-style: italic; }
                        .detailed-itinerary-content u { text-decoration: underline; }
                        .detailed-itinerary-content h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #6A1B82; }
                        .detailed-itinerary-content h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #6A1B82; }
                        .detailed-itinerary-content h3 { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.4rem; color: #374151; }
                        .detailed-itinerary-content p { margin-bottom: 0.75rem; word-wrap: break-word; }
                        .detailed-itinerary-content ul, .detailed-itinerary-content ol { margin: 0.5rem 0 0.75rem 1.5rem; }
                        .detailed-itinerary-content li { margin-bottom: 0.25rem; }
                        .detailed-itinerary-content img { max-width: 100%; height: auto; }
                        .detailed-itinerary-content table { width: 100%; overflow-x: auto; display: block; }
                        @media (max-width: 640px) {
                          .detailed-itinerary-content h1 { font-size: 1.25rem; }
                          .detailed-itinerary-content h2 { font-size: 1.1rem; }
                          .detailed-itinerary-content h3 { font-size: 1rem; }
                        }
                      `}</style>
                    </div>
                  </div>
                )}
              </motion.div>
              ) : null;
            })()}

            {/* Conditionally render Dates tab content only if tour dates exist */}
            {(() => {
              const tourDates = getActiveData('tourDates');
              const hasDatesData = tourDates && Array.isArray(tourDates) && tourDates.length > 0;
              return hasDatesData && activeTab === 'dates' ? (
              <motion.div
                key="dates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <SectionTitle><CalendarIcon /> Available Tour Date{tourDates.length > 1 ? 's' : ''}</SectionTitle>
                <HighlightList>
                  {tourDates.map((dateInfo, index) => (
                    <HighlightItem key={index}>
                      <CalendarIcon />
                      {dateInfo.date || dateInfo}
                    </HighlightItem>
                  ))}
                </HighlightList>
              </motion.div>
              ) : null;
            })()}

            {/* Conditionally render Other Information tab content only if data exists */}
            {(() => {
              const otherInfo = getActiveData('otherInfo');
              const termsAndConditions = getActiveData('termsAndConditions');
              const hasOtherInfoData = 
                (otherInfo && ((typeof otherInfo === 'string' && otherInfo.trim().length > 0) || (Array.isArray(otherInfo) && otherInfo.length > 0))) ||
                (termsAndConditions && ((typeof termsAndConditions === 'string' && termsAndConditions.trim().length > 0) || (Array.isArray(termsAndConditions) && termsAndConditions.length > 0)));
              return hasOtherInfoData && activeTab === 'otherinfo' ? (
              <motion.div
                key="otherinfo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Other Information */}
                {getActiveData('otherInfo') && (
                  (typeof getActiveData('otherInfo') === 'string' && getActiveData('otherInfo').trim()) ||
                  (Array.isArray(getActiveData('otherInfo')) && getActiveData('otherInfo').length > 0)
                ) && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Other Information</SectionTitle>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      {typeof getActiveData('otherInfo') === 'string' ? (
                        <div 
                          style={{ lineHeight: '1.8', color: '#4a4a4a', fontFamily: 'inherit' }}
                          dangerouslySetInnerHTML={{ __html: getActiveData('otherInfo') }}
                          className="rich-text-content"
                        />
                      ) : (
                        <HighlightList>
                          {getActiveData('otherInfo').map((item, index) => (
                            <HighlightItem key={index}>
                              <CheckCircleIcon />
                              {item}
                            </HighlightItem>
                          ))}
                        </HighlightList>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Terms & Conditions */}
                {getActiveData('termsAndConditions') && (
                  (typeof getActiveData('termsAndConditions') === 'string' && getActiveData('termsAndConditions').trim()) ||
                  (Array.isArray(getActiveData('termsAndConditions')) && getActiveData('termsAndConditions').length > 0)
                ) && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SectionTitle><CheckCircleIcon /> Terms & Conditions</SectionTitle>
                    <div style={{ background: '#fff9f0', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f5e6d3' }}>
                      {typeof getActiveData('termsAndConditions') === 'string' ? (
                        <div 
                          style={{ lineHeight: '1.8', color: '#4a4a4a', fontFamily: 'inherit' }}
                          dangerouslySetInnerHTML={{ __html: getActiveData('termsAndConditions') }}
                          className="rich-text-content"
                        />
                      ) : (
                        <HighlightList>
                          {getActiveData('termsAndConditions').map((item, index) => (
                            <HighlightItem key={index}>
                              <CheckCircleIcon />
                              {item}
                            </HighlightItem>
                          ))}
                        </HighlightList>
                      )}
                    </div>
                  </div>
                )}

                {(!getActiveData('otherInfo')) && 
                 (!getActiveData('termsAndConditions')) && (
                  <p>No additional information available for this tour.</p>
                )}
                
                <style>{`
                  .rich-text-content strong { font-weight: 700; color: #1f2937; }
                  .rich-text-content b { font-weight: 700; color: #1f2937; }
                  .rich-text-content em { font-style: italic; }
                  .rich-text-content i { font-style: italic; }
                  .rich-text-content u { text-decoration: underline; }
                  .rich-text-content h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #6A1B82; }
                  .rich-text-content h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #6A1B82; }
                  .rich-text-content h3 { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.4rem; color: #374151; }
                  .rich-text-content p { margin-bottom: 0.75rem; }
                  .rich-text-content ul, .rich-text-content ol { margin: 0.5rem 0 0.75rem 1.5rem; }
                  .rich-text-content li { margin-bottom: 0.25rem; }
                `}</style>
              </motion.div>
              ) : null;
            })()}

            {/* Conditionally render Pick Up tab content only if data exists */}
            {activeTab === 'pickup' && (() => {
              const pickupData = getActiveData('pickupPoints');
              const hasPickupData = pickupData && (
                (typeof pickupData === 'string' && pickupData.trim().length > 0) ||
                (Array.isArray(pickupData) && pickupData.length > 0)
              );
              return hasPickupData ? (
              <motion.div
                key="pickup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <SectionTitle><MapPinIcon /> Pick Up Points</SectionTitle>
                {getActiveData('pickupPoints') ? (
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    {typeof getActiveData('pickupPoints') === 'string' ? (
                      <div 
                        style={{ lineHeight: '1.8', color: '#4a4a4a', fontFamily: 'inherit' }}
                        dangerouslySetInnerHTML={{ __html: getActiveData('pickupPoints') }}
                        className="rich-text-content"
                      />
                    ) : Array.isArray(getActiveData('pickupPoints')) && getActiveData('pickupPoints').length > 0 ? (
                      getActiveData('pickupPoints').map((point, index) => (
                        <div key={index} style={{ 
                          padding: '0.75rem 0', 
                          borderBottom: index < getActiveData('pickupPoints').length - 1 ? '1px solid #f3f4f6' : 'none',
                          color: '#4a4a4a',
                          lineHeight: '1.6'
                        }}>
                          {point.location}{point.time ? ` - ${point.time}` : ''}
                        </div>
                      ))
                    ) : (
                      <p>Pick up points coming soon. Please contact us for details.</p>
                    )}
                  </div>
                ) : (
                  <p>Pick up points coming soon. Please contact us for details.</p>
                )}
              </motion.div>
              ) : null;
            })()}

          </AnimatePresence>
        </MainContent>

        <Sidebar>
          <BookingCard>
            <AnimatePresence mode="wait">
              <motion.div
                key={hasSubPackages ? activePackage : 'default'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {hasSubPackages && currentSubPackage ? (
                  <>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#6A1B82', 
                      fontWeight: 600, 
                      marginBottom: '0.5rem',
                      background: '#f3e8ff',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      {currentSubPackage.name}
                    </div>
                    <PriceTag>£{currentSubPackage.price}</PriceTag>
                    <PriceNote>Per adult • {currentSubPackage.duration}</PriceNote>
                    {currentSubPackage.childPrice && (
                      <div style={{ 
                        fontSize: '1rem', 
                        color: '#666', 
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        Child: <strong style={{ color: '#6A1B82' }}>£{currentSubPackage.childPrice}</strong>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <PriceTag>{packageData.price}</PriceTag>
                    <PriceNote>Per person</PriceNote>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <BookButton to="/contact-us">Book This Tour</BookButton>
            
            {/* Tour Gallery */}
            {packageData.galleryImages && packageData.galleryImages.length > 0 ? (
              <GalleryGrid>
                {packageData.galleryImages.map((item, index) => (
                  <GalleryImage key={index}>
                    <img src={item.image} alt={item.title || `Gallery ${index + 1}`} />
                    <GalleryImageContent>
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                    </GalleryImageContent>
                  </GalleryImage>
                ))}
              </GalleryGrid>
            ) : (
              <GalleryGrid>
                <GalleryImage>
                  <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop" alt="Edinburgh Castle" />
                  <GalleryImageContent>
                    <h4>Edinburgh Castle</h4>
                    <p>Explore the historic fortress overlooking Scotland's capital</p>
                  </GalleryImageContent>
                </GalleryImage>
                
                <GalleryImage>
                  <img src="https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=2071&auto=format&fit=crop" alt="Glasgow Cathedral" />
                  <GalleryImageContent>
                    <h4>Glasgow Cathedral</h4>
                    <p>Visit the stunning medieval cathedral in the heart of Glasgow</p>
                  </GalleryImageContent>
                </GalleryImage>
                
                <GalleryImage>
                  <img src="https://images.unsplash.com/photo-1580709413627-83c5e5e6df80?q=80&w=2070&auto=format&fit=crop" alt="Scottish Highlands" />
                  <GalleryImageContent>
                    <h4>Scottish Highlands</h4>
                    <p>Discover breathtaking landscapes and scenic routes</p>
                  </GalleryImageContent>
                </GalleryImage>
              </GalleryGrid>
            )}
          </BookingCard>
        </Sidebar>
      </ContentContainer>
    </PageContainer>
  );
};

export default PackageDetailPage;
