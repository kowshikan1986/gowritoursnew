import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getSettings } from '../services/jsonDatabase';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`;

const HeroSection = styled.section`
  padding: 6rem 2rem 3rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(106, 27, 130, 0.8) 0%, rgba(26, 26, 46, 0.9) 100%);
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
`;

const ContentSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
`;

const ContentCard = styled(motion.div)`
  background: #ffffff;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const TermsContent = styled.div`
  color: #374151;
  font-size: 1rem;
  line-height: 1.8;
  
  h1, h2, h3, h4, h5, h6 {
    color: #1a1a2e;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: 'Playfair Display', serif;
  }
  
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: #6A1B82;
    text-decoration: underline;
  }
  
  strong {
    color: #1a1a2e;
  }
`;

const LastUpdated = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const defaultTermsContent = `
<h2>1. Introduction</h2>
<p>Welcome to Gowri Tours. These Terms and Conditions govern your use of our services and website. By booking with us, you agree to these terms.</p>

<h2>2. Booking and Payment</h2>
<p>All bookings are subject to availability. A deposit is required at the time of booking, with the balance due before the departure date. Payments can be made via bank transfer, credit card, or other accepted methods.</p>

<h2>3. Cancellation Policy</h2>
<p>Cancellations made more than 30 days before departure will receive a full refund minus the deposit. Cancellations within 30 days of departure may incur charges. No refunds will be given for no-shows.</p>

<h2>4. Travel Insurance</h2>
<p>We strongly recommend that all travelers obtain comprehensive travel insurance covering cancellation, medical expenses, and personal belongings.</p>

<h2>5. Passport and Visa Requirements</h2>
<p>It is the traveler's responsibility to ensure they have valid travel documents, including passports and visas where required.</p>

<h2>6. Health and Safety</h2>
<p>Travelers should consult their doctor regarding vaccinations and health precautions for their destination. We reserve the right to refuse service to anyone who poses a health or safety risk.</p>

<h2>7. Changes to Itinerary</h2>
<p>We reserve the right to make changes to itineraries due to unforeseen circumstances, weather conditions, or safety concerns. Alternative arrangements of similar value will be provided where possible.</p>

<h2>8. Liability</h2>
<p>Gowri Tours acts as an agent for transportation, accommodation, and other services. We are not liable for any loss, damage, or injury arising from the services provided by third parties.</p>

<h2>9. Complaints</h2>
<p>Any complaints should be reported to our tour manager immediately. If not resolved, please submit a written complaint within 28 days of returning from your trip.</p>

<h2>10. Contact Information</h2>
<p>For any questions regarding these terms, please contact us at info@gowritours.com or call our customer service team.</p>
`;

const TermsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const termsContent = settings?.termsAndConditions || defaultTermsContent;
  const lastUpdated = settings?.termsUpdatedAt 
    ? new Date(settings.termsUpdatedAt).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : null;

  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Terms & Conditions
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Please read these terms carefully before booking with us
        </HeroSubtitle>
      </HeroSection>

      <ContentSection>
        <ContentCard
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {loading ? (
            <LoadingContainer>Loading...</LoadingContainer>
          ) : (
            <>
              <TermsContent dangerouslySetInnerHTML={{ __html: termsContent }} />
              {lastUpdated && (
                <LastUpdated>Last updated: {lastUpdated}</LastUpdated>
              )}
            </>
          )}
        </ContentCard>
      </ContentSection>
    </PageContainer>
  );
};

export default TermsPage;
