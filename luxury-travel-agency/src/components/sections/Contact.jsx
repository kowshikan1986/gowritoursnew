import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { fetchFrontendData, normalize } from '../../services/frontendData';

const ContactContainer = styled.section`
  padding: 8rem 0;
  background: #fafafa;
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

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactInfo = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const InfoTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ContactIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const ContactDetails = styled.div`
  flex: 1;
`;

const ContactLabel = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const ContactText = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const ContactForm = styled.form`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #6A1B82;
    background: white;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6A1B82;
    background: white;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    background: white;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    transferService: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airportTransferCategories, setAirportTransferCategories] = useState([]);

  useEffect(() => {
    const loadTransferCategories = async () => {
      try {
        const { allCategories } = await fetchFrontendData();
        // Find Airport Transfers main category
        const airportTransfersMain = (allCategories || []).find(c => 
          normalize(c.slug || c.name || '') === 'airport-transfers'
        );
        
        if (airportTransfersMain) {
          // Get subcategories of Airport Transfers
          const subcats = (allCategories || []).filter(c => 
            c.parent_id === airportTransfersMain.id
          ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          
          setAirportTransferCategories(subcats);
        }
      } catch (err) {
        console.error('Error loading airport transfer categories:', err);
      }
    };
    
    loadTransferCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your inquiry! We will contact you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        destination: '',
        transferService: '',
        message: ''
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <PhoneIcon />,
      label: 'Telephone',
      text: '+44 20 8830 8611',
      subtext: 'Main Office'
    },
    {
      icon: <PhoneIcon />,
      label: 'Mobile',
      text: '07956 375 803',
      subtext: '24/7 Support'
    },
    {
      icon: <EnvelopeIcon />,
      label: 'E-mail',
      text: 'gowritour@gmail.com',
      subtext: 'Response within 24 hours'
    }
  ];

  return (
    <ContactContainer id="contact">
      <Container>
        <SectionHeader>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Start Your Journey
          </SectionTitle>
          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Contact our luxury travel specialists to begin planning your extraordinary experience
          </SectionSubtitle>
        </SectionHeader>

        <ContactContent>
          <ContactInfo
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <InfoTitle>Get in Touch</InfoTitle>
            {contactInfo.map((item, index) => (
              <ContactItem key={index}>
                <ContactIcon>{item.icon}</ContactIcon>
                <ContactDetails>
                  <ContactLabel>{item.label}</ContactLabel>
                  <ContactText>{item.text}</ContactText>
                  <ContactText style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {item.subtext}
                  </ContactText>
                </ContactDetails>
              </ContactItem>
            ))}
          </ContactInfo>

          <ContactForm
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
          >
            <FormTitle>Plan Your Luxury Experience</FormTitle>
            
            <FormGroup>
              <FormLabel htmlFor="name">Full Name *</FormLabel>
              <FormInput
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="email">Email Address *</FormLabel>
              <FormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="phone">Phone Number</FormLabel>
              <FormInput
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="destination">Preferred Destination</FormLabel>
              <FormInput
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Where would you like to travel?"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="transferService">Airport Transfer Service</FormLabel>
              <FormSelect
                id="transferService"
                name="transferService"
                value={formData.transferService}
                onChange={handleInputChange}
              >
                <option value="">Select a service (optional)</option>
                {airportTransferCategories.map((subcat) => (
                  <option key={subcat.id} value={subcat.id}>
                    {subcat.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="message">Message *</FormLabel>
              <FormTextarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Tell us about your dream luxury travel experience..."
              />
            </FormGroup>

            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                'Sending Message...'
              ) : (
                <>
                  Send Message
                  <PaperAirplaneIcon />
                </>
              )}
            </SubmitButton>
          </ContactForm>
        </ContactContent>
      </Container>
    </ContactContainer>
  );
};

export default Contact;
