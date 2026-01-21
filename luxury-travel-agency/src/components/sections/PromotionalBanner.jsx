import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getAds } from '../../services/jsonDatabase';

const BannerSection = styled.section`
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  padding: 3rem 0;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 968px) {
    flex-direction: column;
    text-align: center;
    padding: 0 1rem;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Title = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Playfair Display', serif;

  @media (max-width: 968px) {
    justify-content: center;
    font-size: 1.75rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;

  @media (max-width: 968px) {
    margin: 0 auto;
  }
`;

const TimerBadge = styled(motion.div)`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 968px) {
    flex-direction: column;
    width: 100%;
  }
`;

const PrimaryButton = styled(Link)`
  background: white;
  color: #6A1B82;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background: #f0f0f0;
  }

  @media (max-width: 968px) {
    width: 100%;
    max-width: 300px;
  }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }

  @media (max-width: 968px) {
    width: 100%;
    max-width: 300px;
  }
`;

// Floating shapes for background decoration
const Circle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: -1;
`;

const PromotionalBanner = () => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const ads = await getAds();
        // Get the first active ad
        const activeAd = ads.find(a => a.is_active);
        if (activeAd) {
          setAd(activeAd);
        }
      } catch (error) {
        console.error('Error loading promotional ad:', error);
      }
    };
    
    fetchAd();
  }, []);

  // Don't render if no active ad
  if (!ad) return null;

  return (
    <BannerSection>
      <Circle 
        style={{ width: '300px', height: '300px', top: '-100px', right: '-50px' }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <Circle 
        style={{ width: '200px', height: '200px', bottom: '-50px', left: '-50px' }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <Container>
        <ContentWrapper>
          <TimerBadge
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ClockIcon style={{ width: '18px' }} />
            Limited Time Offer!
          </TimerBadge>
          
          <Title
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            <TagIcon style={{ width: '32px' }} />
            {ad.title || 'Exclusive Travel Packages'}
          </Title>
          
          <Subtitle
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover amazing deals on luxury travel experiences!
          </Subtitle>
        </ContentWrapper>

        <ButtonGroup>
          {ad.link && (
            <PrimaryButton to={ad.link}>
              View Deals
            </PrimaryButton>
          )}
          <SecondaryButton to="/contact">
            Enquire Now
          </SecondaryButton>
        </ButtonGroup>
      </Container>
    </BannerSection>
  );
};

export default PromotionalBanner;
