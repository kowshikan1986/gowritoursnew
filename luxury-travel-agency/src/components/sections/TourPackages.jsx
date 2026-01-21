import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { servicesData } from '../../data/servicesData';
import { fetchFrontendData, normalize } from '../../services/frontendData';
import { onDataChange } from '../../services/jsonDatabase';

// normalize is imported from frontendData

const SectionContainer = styled.section`
  padding: 8rem 0;
  background: white;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-snap-type: x mandatory;

  /* Hide scrollbar on WebKit */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c7b5d9;
    border-radius: 10px;
  }
`;

const PackageCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 450px;
  min-width: 360px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: #f5f5f5; /* Fallback */
  scroll-snap-align: start;

  @media (max-width: 768px) {
    min-width: 300px;
    height: 350px;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    min-width: 280px;
    height: 300px;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;

  ${PackageCard}:hover & {
    transform: scale(1.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.9) 100%
    );
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;

const PackageTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
  font-family: 'Playfair Display', serif;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PackageLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

  svg {
    width: 16px;
    height: 16px;
    color: #ffffff;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
  }
`;

const PackageDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ffffff;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const SubCategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SubCategoryChip = styled(Link)`
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
  text-decoration: none;
`;

const SubToggle = styled.button`
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.6rem;
`;

// Expandable tour details panel
const ExpandedDetailsOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
`;

const ExpandedDetailsCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
`;

const ExpandedHeader = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
`;

const ExpandedHeaderImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  }
`;

const ExpandedTitle = styled.h2`
  position: absolute;
  bottom: 1.5rem;
  left: 2rem;
  right: 2rem;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Playfair Display', serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  color: #333;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const ExpandedContent = styled.div`
  padding: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailLabel = styled.h4`
  color: #6A1B82;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.p`
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DetailItem = styled.div`
  background: #f8f5fa;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #6A1B82;
`;

const PackagesList = styled.div`
  display: grid;
  gap: 1rem;
`;

const PackageItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f5fa;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  
  &:hover {
    background: #efe8f3;
    transform: translateX(5px);
  }
`;

const PackageThumb = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 8px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const PackageInfo = styled.div`
  flex: 1;
`;

const PackageName = styled.h5`
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  font-size: 1rem;
  font-weight: 600;
`;

const PackageDesc = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ViewAllButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #6A1B82;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #7C2E9B;
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CategoryBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(106, 27, 130, 0.9);
  color: #ffffff;
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 10;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  letter-spacing: 0.5px;
`;

const CategoryName = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  z-index: 10;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ExploreButton = styled(Link)`
  background: #6A1B82;
  border: 2px solid #6A1B82;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(106, 27, 130, 0.3);

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(106, 27, 130, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(106, 27, 130, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
    stroke-width: 2.5px;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const ServiceCard = memo(({ service, index, forceServiceLink, isVehicleHire }) => {
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const hasPackages = service.packages && service.packages.length > 0;
  const [showSubs, setShowSubs] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);

  useEffect(() => {
    if (!hasPackages || service.packages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPackageIndex((prev) => (prev + 1) % service.packages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [hasPackages, service.packages?.length]);

  // Close expanded view on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowExpanded(false);
    };
    if (showExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showExpanded]);

  const currentData = hasPackages ? service.packages[currentPackageIndex] : service;
  
  // Resolve link: if forceServiceLink is true, link to the subcategory service page
  const linkTo = forceServiceLink 
    ? `/service/${service.id}`
    : (hasPackages && currentData.id 
      ? `/package/${currentData.id}` 
      : `/service/${service.id}`);
  const categorySlug = service.id || service.slug || normalize(service.title);

  const handleTitleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExpanded(true);
  };

  return (
    <>
      <PackageCard
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      >
        <CardImage image={currentData.image || service.image} />
        
        {/* Show Category Name if we are cycling packages inside a category */}
        {hasPackages && (
          <CategoryName>
            {service.title}
          </CategoryName>
        )}

        <CardContent>
          <PackageTitle 
            onClick={handleTitleClick}
            style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)', textUnderlineOffset: '4px' }}
            title="Click to view details"
          >
            {currentData.title}
          </PackageTitle>
          <PackageLocation>
            <MapPinIcon />
            {currentData.location || service.location}
          </PackageLocation>
          
          <PackageDescription>
            {currentData.description || currentData.shortDescription}
          </PackageDescription>

          {service.subcategories && service.subcategories.length > 0 && (
            <>
              <SubToggle type="button" onClick={() => setShowSubs((v) => !v)}>
                {showSubs ? 'Hide Subcategories' : 'View Subcategories'}
              </SubToggle>
              {showSubs && (
                <SubCategoryList>
                  {service.subcategories.map((sub) => (
                    <SubCategoryChip
                      key={sub.slug || sub.id}
                      to={`/service/${categorySlug}?sub=${sub.slug || sub.id || ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sub.name}
                    </SubCategoryChip>
                  ))}
                </SubCategoryList>
              )}
            </>
          )}

          <CardFooter>
            <ExploreButton to={linkTo} style={{ marginLeft: 'auto' }}>
              Enquire Now
              <ArrowRightIcon />
            </ExploreButton>
          </CardFooter>
        </CardContent>
      </PackageCard>

      {/* Expanded Details Modal */}
      <AnimatePresence>
        {showExpanded && (
          <ExpandedDetailsOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExpanded(false)}
          >
            <ExpandedDetailsCard
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExpandedHeader>
                <ExpandedHeaderImage image={currentData.image || service.image} />
                <CloseButton onClick={() => setShowExpanded(false)}>×</CloseButton>
                <ExpandedTitle>{service.title}</ExpandedTitle>
              </ExpandedHeader>
              
              <ExpandedContent>
                {/* Basic Info Grid */}
                <DetailGrid>
                  {service.location && (
                    <DetailItem>
                      <DetailLabel>Location</DetailLabel>
                      <DetailValue>{service.location}</DetailValue>
                    </DetailItem>
                  )}
                  {currentData.duration && (
                    <DetailItem>
                      <DetailLabel>Duration</DetailLabel>
                      <DetailValue>{currentData.duration}</DetailValue>
                    </DetailItem>
                  )}
                  {currentData.price && currentData.price !== 'Enquire Now' && (
                    <DetailItem>
                      <DetailLabel>Price</DetailLabel>
                      <DetailValue>{typeof currentData.price === 'number' ? `£${currentData.price}` : currentData.price}</DetailValue>
                    </DetailItem>
                  )}
                </DetailGrid>

                {/* Description */}
                {(service.fullDescription || service.shortDescription || currentData.description) && (
                  <DetailSection>
                    <DetailLabel>About This Tour</DetailLabel>
                    <DetailValue>
                      {service.fullDescription || service.shortDescription || currentData.description}
                    </DetailValue>
                  </DetailSection>
                )}

                {/* Tour Packages in this category */}
                {hasPackages && service.packages.length > 0 && (
                  <DetailSection>
                    <DetailLabel>Available Tours ({service.packages.length})</DetailLabel>
                    <PackagesList>
                      {service.packages.slice(0, 5).map((pkg) => (
                        <PackageItem key={pkg.id} to={`/package/${pkg.id}`} onClick={() => setShowExpanded(false)}>
                          {pkg.image && <PackageThumb image={pkg.image} />}
                          <PackageInfo>
                            <PackageName>{pkg.title}</PackageName>
                            {pkg.description && <PackageDesc>{pkg.description}</PackageDesc>}
                          </PackageInfo>
                          <ArrowRightIcon style={{ width: 20, height: 20, color: '#6A1B82' }} />
                        </PackageItem>
                      ))}
                    </PackagesList>
                    {service.packages.length > 5 && (
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        + {service.packages.length - 5} more tours available
                      </p>
                    )}
                  </DetailSection>
                )}

                {/* Subcategories */}
                {service.subcategories && service.subcategories.length > 0 && (
                  <DetailSection>
                    <DetailLabel>Subcategories</DetailLabel>
                    <SubCategoryList style={{ marginTop: '0.5rem' }}>
                      {service.subcategories.map((sub) => (
                        <SubCategoryChip
                          key={sub.slug || sub.id}
                          to={`/service/${categorySlug}?sub=${sub.slug || sub.id || ''}`}
                          onClick={() => setShowExpanded(false)}
                          style={{ background: '#6A1B82', color: 'white', border: 'none' }}
                        >
                          {sub.name}
                        </SubCategoryChip>
                      ))}
                    </SubCategoryList>
                  </DetailSection>
                )}

                {/* View All Button */}
                <ViewAllButton to={linkTo} onClick={() => setShowExpanded(false)}>
                  View All Details
                  <ArrowRightIcon />
                </ViewAllButton>
              </ExpandedContent>
            </ExpandedDetailsCard>
          </ExpandedDetailsOverlay>
        )}
      </AnimatePresence>
    </>
  );
});

// Styled components for L1 category tabs
const L1TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c7b5d9;
    border-radius: 10px;
  }
`;

const L1Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  border: 2px solid ${props => props.$active ? '#6A1B82' : '#e0e0e0'};
  background: ${props => props.$active ? '#6A1B82' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6A1B82;
    background: ${props => props.$active ? '#7C2E9B' : '#f8f4fa'};
  }
`;

// Loading skeleton for cards
const SkeletonCard = styled.div`
  min-width: 360px;
  height: 450px;
  border-radius: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const LoadingGrid = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
`;

const TourPackages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState(servicesData);
  const [tourL1Categories, setTourL1Categories] = useState([]); // All L1 tour categories with their L2 subcategories
  const [selectedL1, setSelectedL1] = useState(null); // Currently selected L1 category for Tours
  
  // State for other categories with same tabbed structure
  const [cruiseL1Categories, setCruiseL1Categories] = useState([]);
  const [selectedCruiseL1, setSelectedCruiseL1] = useState(null);
  
  const [transferL1Categories, setTransferL1Categories] = useState([]);
  const [selectedTransferL1, setSelectedTransferL1] = useState(null);
  
  const [vehicleL1Categories, setVehicleL1Categories] = useState([]);
  const [selectedVehicleL1, setSelectedVehicleL1] = useState(null);
  
  const [sriLankaL1Categories, setSriLankaL1Categories] = useState([]);
  const [selectedSriLankaL1, setSelectedSriLankaL1] = useState(null);
  
  const [otherL1Categories, setOtherL1Categories] = useState([]);
  const [selectedOtherL1, setSelectedOtherL1] = useState(null);
  
  // Keep old state for backward compatibility
  const [cruiseServices, setCruiseServices] = useState([]);
  const [transferServices, setTransferServices] = useState([]);
  const [vehicleServices, setVehicleServices] = useState([]);
  const [sriLankaServices, setSriLankaServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Use local database instead of API
        const data = await fetchFrontendData();
        const { allCategories, tours } = data;
        
        // Build category tree with tours and subcategories
        const categoryMap = new Map();
        allCategories.forEach(cat => {
          categoryMap.set(cat.id, {
            ...cat,
            tours: tours.filter(t => t.category_id === cat.id && t.is_active),
            subcategories: allCategories.filter(c => c.parent_id === cat.id),
          });
        });

        // Get root categories (no parent)
        const rootCategories = allCategories.filter(c => !c.parent_id).map(cat => categoryMap.get(cat.id));
        
        // Map database data to the structure used by the frontend
        const mappedServices = servicesData.map(staticService => {
          const staticSlug = normalize(staticService.id || staticService.title);
          // Find matching category from database
          const dbCategory = rootCategories.find(
            cat => normalize(cat.name) === staticSlug || normalize(cat.slug) === staticSlug
          );

          if (dbCategory) {
            // Map the nested tours
            const apiPackages = dbCategory.tours ? dbCategory.tours.map(tour => ({
              id: tour.slug,
              title: tour.title,
              price: 'Enquire Now',
              location: tour.location,
              description: tour.description,
              image: tour.featured_image || '',
              duration: tour.duration
            })) : [];

            const apiSubCategories = dbCategory.subcategories ? dbCategory.subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              image: sub.image || '',
            })) : [];

            // Use database data, fallback to static if needed
            return {
              ...staticService,
              image: dbCategory.image || staticService.image,
              packages: apiPackages.length > 0 ? apiPackages : staticService.packages,
              subcategories: apiSubCategories
            };
          }
          return staticService;
        });

        // Append any database categories not already mapped
        const usedSlugs = new Set(mappedServices.map(s => normalize(s.id || s.title)));
        const extraServices = rootCategories
          .filter(cat => !usedSlugs.has(normalize(cat.slug || cat.name)))
          .map(cat => {
            const apiPackages = cat.tours ? cat.tours.map(tour => ({
              id: tour.slug,
              title: tour.title,
              price: 'Enquire Now',
              location: tour.location,
              description: tour.description,
              image: tour.featured_image || '',
              duration: tour.duration
            })) : [];

            const apiSubCategories = cat.subcategories ? cat.subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              image: sub.image || '',
            })) : [];

            return {
              id: cat.slug || cat.id,
              title: cat.name,
              location: cat.name,
              price: 'Enquire Now',
              shortDescription: cat.description || '',
              fullDescription: cat.description || '',
              image: cat.image || '',
              packages: apiPackages,
              subcategories: apiSubCategories,
              features: [],
              seo: { title: cat.name, description: cat.description || '' },
            };
          });

        const combined = [...mappedServices, ...extraServices];

        // Find the "Tours" main category from database
        const toursRootCategory = rootCategories.find(cat => 
          normalize(cat.slug || cat.name) === 'tours'
        );
        
        // Helper function to map L2 subcategories to card format
        const mapL2ToCards = (l1Category) => {
          const l1Cat = categoryMap.get(l1Category.id) || l1Category;
          
          if (l1Cat.subcategories && l1Cat.subcategories.length > 0) {
            return l1Cat.subcategories.map(l2CatRaw => {
              const l2Cat = categoryMap.get(l2CatRaw.id) || l2CatRaw;
              const l2Tours = l2Cat.tours || [];
              const l2Slug = l2Cat.slug || l2CatRaw.slug || normalize(l2Cat.name || l2CatRaw.name);
              
              return {
                id: l2Slug,
                title: l2Cat.name,
                location: l2Cat.name,
                price: 'Enquire Now',
                shortDescription: l2Cat.description || '',
                fullDescription: l2Cat.description || '',
                image: l2Cat.image || (l2Tours.length > 0 ? l2Tours[0].featured_image : ''),
                packages: [],
                subcategories: [],
                features: [],
                seo: { title: l2Cat.name, description: l2Cat.description || '' },
              };
            });
          } else if (l1Cat.tours && l1Cat.tours.length > 0) {
            // If L1 has no L2 subcategories but has tours directly, show tours as cards
            return l1Cat.tours.map(tour => ({
              id: tour.slug,
              title: tour.title,
              location: tour.location || l1Cat.description || '',
              price: 'Enquire Now',
              shortDescription: tour.description || '',
              fullDescription: tour.description || '',
              image: tour.featured_image || l1Cat.image || '',
              packages: [],
              isTourPackage: true,
              subcategories: [],
              features: [],
              seo: { title: tour.title, description: tour.description || '' },
            }));
          }
          return [];
        };
        
        // Get ALL L1 tour subcategories (UK Tours, European Tours, World Tours, etc.)
        let allTourL1Categories = [];
        if (toursRootCategory && toursRootCategory.subcategories && toursRootCategory.subcategories.length > 0) {
          allTourL1Categories = toursRootCategory.subcategories.map(l1CatRaw => {
            const l1Cat = categoryMap.get(l1CatRaw.id) || l1CatRaw;
            const l2Cards = mapL2ToCards(l1Cat);
            
            return {
              id: l1Cat.slug || normalize(l1Cat.name),
              name: l1Cat.name,
              description: l1Cat.description || '',
              image: l1Cat.image || '',
              cards: l2Cards,
              sort_order: l1Cat.sort_order || l1CatRaw.sort_order || 999,
            };
          }).filter(l1 => l1.cards.length > 0) // Only include L1 categories that have L2 cards
            .sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999)); // Sort by sort_order
          
          console.log('TourPackages: All L1 Tour Categories:', allTourL1Categories.map(c => ({ name: c.name, cardCount: c.cards.length, sortOrder: c.sort_order })));
        }
        
        // Fallback: use first L1 category's L2 cards for backward compatibility
        let tourOnly = [];
        if (allTourL1Categories.length > 0) {
          // Use all L2 cards from all L1 categories flattened (for backward compat with services state)
          tourOnly = allTourL1Categories.flatMap(l1 => l1.cards);
        }

        // Helper function to convert database category subcategories to frontend format (like Tours)
        const mapCategorySubcategories = (mainCategory) => {
          if (!mainCategory) {
            return [];
          }

          // Custom airport order for airport-transfers
          const airportOrder = {
            'heathrow-lhr': 1,
            'gatwick-lgw': 2,
            'stansted-airport-stn': 3,
            'luton-airport-ltn': 4,
            'city-airport-lcy': 5
          };

          // Check if this is airport-transfers category
          const isAirportTransfers = normalize(mainCategory.slug || mainCategory.name || '') === 'airport-transfers';

          // If category has subcategories, show them (like Tours)
          if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
            // Sort subcategories - custom order for airports, default sort_order for others
            const sortedSubcategories = [...mainCategory.subcategories].sort((a, b) => {
              if (isAirportTransfers) {
                const orderA = airportOrder[normalize(a.slug || a.name || '')] || 999;
                const orderB = airportOrder[normalize(b.slug || b.name || '')] || 999;
                return orderA - orderB;
              }
              return (a.sort_order || 0) - (b.sort_order || 0);
            });

            return sortedSubcategories.map(subCat => {
              // Get tours for this subcategory
              const subCategoryTours = subCat.tours ? subCat.tours.map(tour => ({
                id: tour.slug,
                title: tour.title,
                price: 'Enquire Now',
                location: tour.location,
                description: tour.description,
                image: tour.featured_image || '',
                duration: tour.duration,
              })) : [];

              // Get nested subcategories if any
              const nestedSubs = subCat.subcategories ? subCat.subcategories.map(nested => ({
                id: nested.id,
                name: nested.name,
                slug: nested.slug,
                description: nested.description,
                image: nested.image || '',
              })) : [];

              return {
                id: subCat.slug || normalize(subCat.name),
                title: subCat.name,
                location: subCat.name,
                price: 'Enquire Now',
                shortDescription: subCat.description || '',
                fullDescription: subCat.description || '',
                image: subCat.image || '',
                packages: subCategoryTours,
                subcategories: nestedSubs,
                features: [],
                seo: { title: subCat.name, description: subCat.description || '' },
              };
            });
          }

          // If no subcategories but has tours, show tours as cards
          if (mainCategory.tours && mainCategory.tours.length > 0) {
            return mainCategory.tours.map(tour => ({
              id: tour.slug,
              title: tour.title,
              location: tour.location || '',
              price: 'Enquire Now',
              shortDescription: tour.description || '',
              fullDescription: tour.description || '',
              image: tour.featured_image || mainCategory.image || '',
              packages: [{
                id: tour.slug,
                title: tour.title,
                price: 'Enquire Now',
                location: tour.location,
                description: tour.description,
                image: tour.featured_image,
                duration: tour.duration,
              }],
              subcategories: [],
              features: [],
              seo: { title: tour.title, description: tour.description || '' },
            }));
          }

          // If no subcategories and no tours, show the category itself as a single card
          return [{
            id: mainCategory.slug || normalize(mainCategory.name),
            title: mainCategory.name,
            location: mainCategory.name,
            price: 'Enquire Now',
            shortDescription: mainCategory.description || '',
            fullDescription: mainCategory.description || '',
            image: mainCategory.image || '',
            packages: [],
            subcategories: [],
            features: [],
            seo: { title: mainCategory.name, description: mainCategory.description || '' },
          }];
        };

        // Helper function to build L1 categories with L2 cards for ANY main category
        const buildL1CategoriesWithL2Cards = (mainCategory) => {
          if (!mainCategory || !mainCategory.subcategories || mainCategory.subcategories.length === 0) {
            return [];
          }
          
          return mainCategory.subcategories.map(l1CatRaw => {
            const l1Cat = categoryMap.get(l1CatRaw.id) || l1CatRaw;
            const l2Cards = mapL2ToCards(l1Cat);
            
            return {
              id: l1Cat.slug || normalize(l1Cat.name),
              name: l1Cat.name,
              description: l1Cat.description || '',
              image: l1Cat.image || '',
              cards: l2Cards,
            };
          }).filter(l1 => l1.cards.length > 0);
        };

        // Get main categories and their subcategories (same format as Tours)
        const cruisesCat = rootCategories.find(cat => normalize(cat.slug || cat.name) === 'cruises');
        const transfersCat = rootCategories.find(cat => normalize(cat.slug || cat.name) === 'airport-transfers');
        const vehicleCat = rootCategories.find(cat => normalize(cat.slug || cat.name) === 'vehicle-hire');
        const sriLankaCat = rootCategories.find(cat => {
          const slug = normalize(cat.slug || cat.name);
          return slug === 'india-and-sri-lankan-tours' || 
                 slug === 'india-sri-lanka-tours' || 
                 slug === 'sri-lanka-tours' ||
                 slug === 'sri-lankan-tours';
        });
        const otherCat = rootCategories.find(cat => normalize(cat.slug || cat.name) === 'other-services');

        // Build L1 categories for each main category
        const cruiseL1Cats = buildL1CategoriesWithL2Cards(cruisesCat);
        const transferL1Cats = buildL1CategoriesWithL2Cards(transfersCat);
        const vehicleL1Cats = buildL1CategoriesWithL2Cards(vehicleCat);
        const sriLankaL1Cats = buildL1CategoriesWithL2Cards(sriLankaCat);
        const otherL1Cats = buildL1CategoriesWithL2Cards(otherCat);

        // Fallback: use old mapCategorySubcategories for backward compat
        const cruisesMapped = mapCategorySubcategories(cruisesCat);
        const transfersMapped = mapCategorySubcategories(transfersCat);
        const vehicleMapped = mapCategorySubcategories(vehicleCat);
        const sriLankaMapped = mapCategorySubcategories(sriLankaCat);
        const otherMapped = mapCategorySubcategories(otherCat);

        setServices(tourOnly);
        setTourL1Categories(allTourL1Categories);
        if (allTourL1Categories.length > 0) {
          setSelectedL1(allTourL1Categories[0].id);
        }
        
        // Set L1 categories for other main categories
        setCruiseL1Categories(cruiseL1Cats);
        if (cruiseL1Cats.length > 0) {
          setSelectedCruiseL1(cruiseL1Cats[0].id);
        }
        
        setTransferL1Categories(transferL1Cats);
        if (transferL1Cats.length > 0) {
          setSelectedTransferL1(transferL1Cats[0].id);
        }
        
        setVehicleL1Categories(vehicleL1Cats);
        if (vehicleL1Cats.length > 0) {
          setSelectedVehicleL1(vehicleL1Cats[0].id);
        }
        
        setSriLankaL1Categories(sriLankaL1Cats);
        if (sriLankaL1Cats.length > 0) {
          setSelectedSriLankaL1(sriLankaL1Cats[0].id);
        }
        
        setOtherL1Categories(otherL1Cats);
        if (otherL1Cats.length > 0) {
          setSelectedOtherL1(otherL1Cats[0].id);
        }
        
        // Keep old state for backward compat
        setCruiseServices(cruisesMapped);
        setTransferServices(transfersMapped);
        setVehicleServices(vehicleMapped);
        setSriLankaServices(sriLankaMapped);
        setOtherServices(otherMapped);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching services from database:', error);
        setIsLoading(false);
        // Fallback to static data is automatic since initial state is servicesData
      }
    };

    fetchServices();
    
    // Listen for database changes and reload
    const unsubscribe = onDataChange((type) => {
      console.log('TourPackages: Database changed, reloading...', type);
      if (type === 'categories' || type === 'tours') {
        fetchServices();
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Get the L2 cards for the currently selected L1 category
  const selectedL1Category = tourL1Categories.find(l1 => l1.id === selectedL1);
  const currentL2Cards = selectedL1Category?.cards || [];
  
  // Get L2 cards for other categories
  const selectedCruiseCategory = cruiseL1Categories.find(l1 => l1.id === selectedCruiseL1);
  const currentCruiseL2Cards = selectedCruiseCategory?.cards || [];
  
  const selectedTransferCategory = transferL1Categories.find(l1 => l1.id === selectedTransferL1);
  const currentTransferL2Cards = selectedTransferCategory?.cards || [];
  
  const selectedVehicleCategory = vehicleL1Categories.find(l1 => l1.id === selectedVehicleL1);
  const currentVehicleL2Cards = selectedVehicleCategory?.cards || [];
  
  const selectedSriLankaCategory = sriLankaL1Categories.find(l1 => l1.id === selectedSriLankaL1);
  const currentSriLankaL2Cards = selectedSriLankaCategory?.cards || [];
  
  const selectedOtherCategory = otherL1Categories.find(l1 => l1.id === selectedOtherL1);
  const currentOtherL2Cards = selectedOtherCategory?.cards || [];

  // Reusable component for rendering a tabbed category section
  const renderTabbedSection = (title, l1Categories, selectedL1Id, setSelectedL1Fn, l2Cards, keyPrefix, isVehicleHire = false) => {
    if (l1Categories.length === 0) return null;
    
    return (
      <>
        <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: '2rem' }}
          >
            {title}
          </SectionTitle>
        </SectionHeader>
        
        <L1TabsContainer>
          {l1Categories.map(l1Category => (
            <L1Tab
              key={l1Category.id}
              $active={selectedL1Id === l1Category.id}
              onClick={() => setSelectedL1Fn(l1Category.id)}
            >
              {l1Category.name}
            </L1Tab>
          ))}
        </L1TabsContainer>
        
        <Grid>
          {l2Cards.map((service, index) => (
            <ServiceCard 
              key={`${keyPrefix}-${selectedL1Id}-${service.id}`} 
              service={service} 
              index={index} 
              forceServiceLink={true}
              isVehicleHire={isVehicleHire}
            />
          ))}
        </Grid>
      </>
    );
  };

  return (
      <SectionContainer>
        <Container>
          {/* Loading Skeleton */}
          {isLoading && (
            <>
              <SectionHeader style={{ marginTop: 0, textAlign: 'left' }}>
                <SectionTitle style={{ fontSize: '2rem' }}>Tours Destinations</SectionTitle>
              </SectionHeader>
              <LoadingGrid>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </LoadingGrid>
            </>
          )}
          
          {/* Tours Section with L1 Tabs */}
          {!isLoading && tourL1Categories.length > 0 ? (
            <>
              <SectionHeader style={{ marginTop: 0, textAlign: 'left' }}>
                <SectionTitle
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: '2rem' }}
                >
                  Tours Destinations
                </SectionTitle>
              </SectionHeader>
              
              {/* L1 Category Tabs */}
              <L1TabsContainer>
                {tourL1Categories.map(l1Category => (
                  <L1Tab
                    key={l1Category.id}
                    $active={selectedL1 === l1Category.id}
                    onClick={() => setSelectedL1(l1Category.id)}
                  >
                    {l1Category.name}
                  </L1Tab>
                ))}
              </L1TabsContainer>
              
              {/* L2 Cards for Selected L1 Category */}
              <Grid>
                {currentL2Cards.map((service, index) => (
                  <ServiceCard 
                    key={`${selectedL1}-${service.id}`} 
                    service={service} 
                    index={index} 
                    forceServiceLink={true} 
                  />
                ))}
              </Grid>
            </>
          ) : !isLoading && services.length > 0 && (
            // Fallback to old "Tours Destinations" section if no L1 categories
            <>
              <SectionHeader style={{ marginTop: 0, textAlign: 'left' }}>
                <SectionTitle
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  style={{ fontSize: '2rem' }}
                >
                  Tours Destinations
                </SectionTitle>
              </SectionHeader>
              <Grid>
                {services.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} forceServiceLink={true} />
                ))}
              </Grid>
            </>
          )}

          {cruiseL1Categories.length > 0 ? (
            renderTabbedSection('Cruises', cruiseL1Categories, selectedCruiseL1, setSelectedCruiseL1, currentCruiseL2Cards, 'cruise')
          ) : cruiseServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Cruises
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {cruiseServices.map((service, index) => (
                <ServiceCard key={`cruise-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>)}
        
          {transferL1Categories.length > 0 ? (
            renderTabbedSection('Airport Transfers', transferL1Categories, selectedTransferL1, setSelectedTransferL1, currentTransferL2Cards, 'transfer')
          ) : transferServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Airport Transfers
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {transferServices.map((service, index) => (
                <ServiceCard key={`transfer-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>)}
        
          {vehicleL1Categories.length > 0 ? (
            renderTabbedSection('Vehicle Hire', vehicleL1Categories, selectedVehicleL1, setSelectedVehicleL1, currentVehicleL2Cards, 'vehicle', true)
          ) : vehicleServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Vehicle Hire
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {vehicleServices.map((service, index) => (
                <ServiceCard key={`vehicle-${service.id}`} service={service} index={index} isVehicleHire={true} />
              ))}
            </Grid>
          </>)}
        
          {sriLankaL1Categories.length > 0 ? (
            renderTabbedSection('Sri Lanka Tours', sriLankaL1Categories, selectedSriLankaL1, setSelectedSriLankaL1, currentSriLankaL2Cards, 'srilanka')
          ) : sriLankaServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Sri Lanka Tours
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {sriLankaServices.map((service, index) => (
                <ServiceCard key={`slt-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>)}
        
          {otherL1Categories.length > 0 ? (
            renderTabbedSection('Other Services', otherL1Categories, selectedOtherL1, setSelectedOtherL1, currentOtherL2Cards, 'other')
          ) : otherServices.length > 0 && (
          <>
            <SectionHeader style={{ marginTop: '2rem', textAlign: 'left' }}>
              <SectionTitle
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '2rem' }}
              >
                Other Services
              </SectionTitle>
            </SectionHeader>
            <Grid>
              {otherServices.map((service, index) => (
                <ServiceCard key={`other-${service.id}`} service={service} index={index} />
              ))}
            </Grid>
          </>)}
      </Container>
    </SectionContainer>
  );
};

export default TourPackages;
