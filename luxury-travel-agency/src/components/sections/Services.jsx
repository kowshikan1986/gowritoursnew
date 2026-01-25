import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  UserGroupIcon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const ServicesContainer = styled.section`
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
  margin-bottom: 6rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ServiceCard = styled(motion.div)`
  background: #fafafa;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    background: white;
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border-color: rgba(106, 27, 130, 0.3);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const ServiceIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  transition: all 0.3s ease;

  ${ServiceCard}:hover & {
    transform: scale(1.1);
    box-shadow: 0 10px 30px rgba(106, 27, 130, 0.4);
  }

  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const ServiceDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ServiceFeatures = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
`;

const ServiceFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #555;
  font-size: 0.95rem;

  &::before {
    content: '✓';
    color: #6A1B82;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const CTAContainer = styled(motion.div)`
  text-align: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 30px;
  padding: 4rem 3rem;
  color: white;

  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const CTATitle = styled.h3`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(106, 27, 130, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(106, 27, 130, 0.5);
  }
`;

const Services = () => {
  const services = [
    {
      icon: <UserGroupIcon />,
      title: 'Personal Travel Concierge',
      description: 'Dedicated personal assistant available 24/7 to handle every detail of your journey.',
      features: [
        '24/7 Personal Assistant',
        'Custom Itinerary Planning',
        'Real-time Support',
        'Local Expert Recommendations'
      ]
    },
    {
      icon: <SparklesIcon />,
      title: 'Exclusive Experiences',
      description: 'Access to VIP events, private tours, and once-in-a-lifetime experiences.',
      features: [
        'Private Museum Tours',
        'VIP Event Access',
        'Exclusive Dining',
        'Behind-the-Scenes Access'
      ]
    },
    {
      icon: <ShieldCheckIcon />,
      title: 'Premium Protection',
      description: 'Comprehensive travel insurance and security services for peace of mind.',
      features: [
        'Premium Travel Insurance',
        'Medical Evacuation',
        'Security Services',
        '24/7 Emergency Support'
      ]
    },
    {
      icon: <GlobeAltIcon />,
      title: 'Global Network',
      description: 'Worldwide network of luxury partners and exclusive accommodations.',
      features: [
        '5-Star Hotels & Resorts',
        'Private Jet Charter',
        'Luxury Yacht Rentals',
        'Premium Car Services'
      ]
    },
    {
      icon: <ClockIcon />,
      title: 'Time-Saving Services',
      description: 'Fast-track services and priority access to save you valuable time.',
      features: [
        'Fast-Track Immigration',
        'Priority Check-in',
        'Express Security',
        'VIP Lounge Access'
      ]
    },
    {
      icon: <HeartIcon />,
      title: 'Wellness & Spa',
      description: 'Premium wellness experiences and spa treatments at world-class facilities.',
      features: [
        'Luxury Spa Treatments',
        'Wellness Retreats',
        'Personal Fitness Training',
        'Holistic Health Programs'
      ]
    }
  ];

  return (
    <ServicesContainer id="services">
      <Container>
        <SectionHeader>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Premium Services
          </SectionTitle>
          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Experience unparalleled luxury with our comprehensive range of premium travel services
          </SectionSubtitle>
        </SectionHeader>

        <ServicesGrid>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <ServiceIcon>{service.icon}</ServiceIcon>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServiceDescription>{service.description}</ServiceDescription>
              <ServiceFeatures>
                {service.features.map((feature, featureIndex) => (
                  <ServiceFeature key={featureIndex}>
                    {feature}
                  </ServiceFeature>
                ))}
              </ServiceFeatures>
            </ServiceCard>
          ))}
        </ServicesGrid>
      </Container>
    </ServicesContainer>
  );
};

export default Services;
