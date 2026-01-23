import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchFrontendData } from '../../services/frontendData';

const HeroContainer = styled.section`
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
`;

const BackgroundImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.image || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'});
  background-size: cover;
  background-position: center center;
  background-attachment: scroll;
  animation: heroZoomIn 20s ease-out forwards;
  will-change: transform;
  
  @keyframes heroZoomIn {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.15);
    }
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
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(106, 27, 130, 0.2) 100%
    );
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 1000px;
  padding: 0 2rem;
  color: white;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: clamp(2.5rem, 10vw, 4rem);
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(106, 27, 130, 0.4);
  margin: 0 0.5rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(106, 27, 130, 0.5);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    margin: 0.5rem;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    margin: 0.5rem;
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 24px;
    height: 24px;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  @media (max-width: 768px) {
    bottom: 1rem;
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  width: ${props => props.size || '100px'};
  height: ${props => props.size || '100px'};
  background: rgba(255, 255, 255, ${props => props.opacity || '0.1'});
  border-radius: 50%;
  filter: blur(${props => props.blur || '40px'});
`;

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [heroItems, setHeroItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await fetchFrontendData();
        const activeBanners = (data.banners || []).filter(item => item.is_active);
        
        // Preload ALL images for instant transitions
        activeBanners.forEach(banner => {
          if (banner.background_image) {
            const img = new Image();
            img.src = resolveMediaUrl(banner.background_image);
          }
        });
        
        setHeroItems(activeBanners);
      } catch (e) {
        setHeroItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 6000); // Changed to 6 seconds for smoother transitions
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    return url;
  };
  
  const currentHero = heroItems[currentIndex] || {};

  const handleScrollToNext = () => {
    const nextSection = document.querySelector('#destinations');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Don't render while loading or if no banners
  if (isLoading || heroItems.length === 0) {
    return null;
  }

  return (
    <HeroContainer>
      <AnimatePresence mode="sync">
        <BackgroundImage
          key={resolveMediaUrl(currentHero.background_image) || 'default-hero'}
          image={resolveMediaUrl(currentHero.background_image)}
          initial={{ 
            opacity: 0
          }}
          animate={{ 
            opacity: 1,
            transition: {
              opacity: { duration: 1.2, ease: 'easeInOut' }
            }
          }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1.2, ease: 'easeInOut' }
          }}
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        />
      </AnimatePresence>
      
      <FloatingElements>
        <FloatingElement
          size="200px"
          opacity="0.15"
          blur="60px"
          initial={{ x: -100, y: -100 }}
          animate={{ 
            x: [-100, 100, -100],
            y: [-100, 100, -100]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <FloatingElement
          size="150px"
          opacity="0.1"
          blur="40px"
          initial={{ x: 200, y: 300 }}
          animate={{ 
            x: [200, -200, 200],
            y: [300, -100, 300]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </FloatingElements>

      <HeroContent>
        <AnimatePresence mode="sync">
          <HeroTitle
            key={`title-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {currentHero.title || 'Extraordinary Journeys'}
            <br />
            <span style={{ color: '#7c3aed' }}>{heroItems.length ? '' : 'Await'}</span>
          </HeroTitle>
        </AnimatePresence>
        
        <AnimatePresence mode="sync">
          <HeroSubtitle
            key={`subtitle-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {currentHero.subtitle || "Discover the world's most exclusive destinations with personalized luxury travel experiences crafted to perfection for the discerning traveler."}
          </HeroSubtitle>
        </AnimatePresence>

        <AnimatePresence mode="sync">
          <motion.div
            key={`cta-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <CTAButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentHero?.cta_link) {
                  window.location.href = currentHero.cta_link;
                } else {
                  window.location.href = '/service/tours';
                }
              }}
            >
              {currentHero?.cta_text || 'Explore Destinations'}
            </CTAButton>
            <SecondaryButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/contact-us'}
            >
              Plan Your Journey
            </SecondaryButton>
          </motion.div>
        </AnimatePresence>
      </HeroContent>

      <ScrollIndicator
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onClick={handleScrollToNext}
      >
        <ChevronDownIcon />
      </ScrollIndicator>
    </HeroContainer>
  );
};

export default Hero;
