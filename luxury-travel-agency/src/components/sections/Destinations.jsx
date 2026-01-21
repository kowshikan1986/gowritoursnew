import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { ArrowRightIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { getCategories } from '../../services/jsonDatabase';

const DestinationsContainer = styled.section`
  padding: 8rem 0;
  background: #fafafa;
  @media (max-width: 768px) {
    padding: 4rem 0;
  }
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

const DestinationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const DestinationCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 400px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    height: 320px;
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

  ${DestinationCard}:hover & {
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
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(106, 27, 130, 0.2) 100%
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
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DestinationName = styled.h3`
  font-size: clamp(1.2rem, 6vw, 1.8rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
`;

const DestinationLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DestinationDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  opacity: 0.8;
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #6A1B82;
  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;

const ExploreButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  &:hover {
    background: rgba(106, 27, 130, 0.3);
    border-color: #6A1B82;
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 6rem;
`;

const FeatureCard = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const FeatureTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const Destinations = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const categories = await getCategories();
        // Get main categories with images to display as destinations
        const mainCats = categories
          .filter(c => !c.parent_id && c.image) // Only main categories with images
          .slice(0, 6) // Limit to 6 destinations
          .map((cat, index) => ({
            id: cat.id,
            name: cat.name,
            location: cat.description?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Explore this destination',
            image: cat.image,
            description: cat.description?.replace(/<[^>]*>/g, '').substring(0, 150) || 'Discover amazing experiences',
            slug: cat.slug,
            rating: 4.8 + (index * 0.1)
          }));
        
        // If no categories with images, use fallback
        if (mainCats.length === 0) {
          setDestinations(fallbackDestinations);
        } else {
          setDestinations(mainCats);
        }
      } catch (error) {
        console.error('Error loading destinations:', error);
        setDestinations(fallbackDestinations);
      }
    };
    
    fetchDestinations();
  }, []);

  const fallbackDestinations = [
    {
      id: 1,
      name: 'Maldives Paradise',
      location: 'Indian Ocean',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Experience ultimate luxury in overwater villas surrounded by crystal-clear turquoise waters.',
      price: 'From $8,500',
      rating: 5.0
    },
    {
      id: 2,
      name: 'French Riviera',
      location: 'Côte d\'Azur, France',
      image: 'https://images.unsplash.com/photo-1533105079780-52b9be4ac207?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Discover glamour and sophistication along the Mediterranean coastline.',
      price: 'From $6,200',
      rating: 4.9
    },
    {
      id: 3,
      name: 'Santorini Dreams',
      location: 'Greek Islands',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Breathtaking sunsets and white-washed villages perched on volcanic cliffs.',
      price: 'From $5,800',
      rating: 4.8
    },
    {
      id: 4,
      name: 'Dubai Luxury',
      location: 'UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Experience opulence in the desert metropolis with world-class amenities.',
      price: 'From $7,900',
      rating: 4.9
    },
    {
      id: 5,
      name: 'Swiss Alps',
      location: 'Switzerland',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Luxury ski resorts and mountain retreats with stunning alpine views.',
    price: 'From $9,200',
      rating: 5.0
    },
    {
      id: 6,
      name: 'Bali Serenity',
      location: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Tropical paradise with ancient temples and pristine beaches.',
      price: 'From $4,500',
      rating: 4.7
    }
  ];

  const features = [
    {
      icon: <StarIcon />,
      title: '5-Star Experiences',
      description: 'Handpicked luxury accommodations and premium services'
    },
    {
      icon: <MapPinIcon />,
      title: 'Global Network',
      description: 'Access to exclusive destinations worldwide'
    },
    {
      icon: <ArrowRightIcon />,
      title: 'Seamless Travel',
      description: 'Effortless planning and execution of your journey'
    },
    {
      icon: <StarIcon />,
      title: 'Personalized Service',
      description: 'Tailored experiences to match your preferences'
    }
  ];

  return (
    <DestinationsContainer id="destinations">
      <Container>
        <SectionHeader>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Exclusive Destinations
          </SectionTitle>
          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover the world's most luxurious destinations, carefully curated for the discerning traveler
          </SectionSubtitle>
        </SectionHeader>

        <DestinationsGrid>
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredCard(destination.id)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ scale: 1.02 }}
            >
              <CardImage image={destination.image} />
              <CardContent>
                <DestinationName>{destination.name}</DestinationName>
                <DestinationLocation>
                  <MapPinIcon />
                  {destination.location}
                </DestinationLocation>
                <DestinationDescription>{destination.description}</DestinationDescription>
                <CardFooter>
                  <Price>{destination.price}</Price>
                  <ExploreButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore
                    <ArrowRightIcon />
                  </ExploreButton>
                </CardFooter>
              </CardContent>
            </DestinationCard>
          ))}
        </DestinationsGrid>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Container>
    </DestinationsContainer>
  );
};

export default Destinations;
