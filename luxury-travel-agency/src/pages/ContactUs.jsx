import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, EnvelopeIcon, UserIcon, MapPinIcon, CheckCircleIcon, CalendarIcon, CurrencyPoundIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getCategories, getTours } from '../services/jsonDatabase';

const Page = styled.div`
  background: #f9fafb;
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem 4rem;

  @media (max-width: 768px) {
    padding: 5rem 1rem 3rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -0.02em;
`;

const SubTitle = styled(motion.p)`
  color: #666;
  margin-top: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const AnimatedCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 2rem;
`;

const WideCard = styled(AnimatedCard)`
  grid-column: 1 / -1;
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #6A1B82;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    font-size: 0.85rem;
    color: #888;
  }

  strong {
    font-size: 1.05rem;
    color: #1a1a1a;
  }
`;

const Form = styled(motion.form)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  &:focus-within label {
    top: -10px;
    font-size: 0.75rem;
    color: #6A1B82;
  }
  &[data-has-value='true'] label {
    top: -10px;
    font-size: 0.75rem;
    color: #6A1B82;
  }
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 6px;
  color: #888;
  transition: all 0.2s ease;
  pointer-events: none;
`;

const IconLeft = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6A1B82;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.12);
  }
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  font-size: 1rem;
  outline: none;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.12);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  min-height: 180px;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.12);
  }
`;

const FullRow = styled.div`
  grid-column: 1 / -1;
`;

const Submit = styled.button`
  background: #6A1B82;
  color: #ffffff;
  border: 2px solid #6A1B82;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Progress = styled.div`
  height: 8px;
  background: #f0f0f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6A1B82 0%, #7C2E9B 100%);
  width: ${props => props.percent || 0}%;
  transition: width 0.3s ease;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a1a;
  }
  span {
    font-size: 0.9rem;
    color: #666;
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const SuccessCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 360px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$active ? '#6A1B82' : props.$completed ? '#7C2E9B' : '#e5e7eb'};
  color: ${props => props.$active || props.$completed ? 'white' : '#888'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const FormTypeTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const FormTypeTab = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$active ? '#6A1B82' : '#666'};
  border-bottom: 3px solid ${props => props.$active ? '#6A1B82' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;
  
  &:hover {
    color: #6A1B82;
  }
`;

const InterestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InterestCard = styled.div`
  padding: 1rem;
  border: 2px solid ${props => props.$selected ? '#6A1B82' : '#e5e7eb'};
  background: ${props => props.$selected ? 'rgba(106, 27, 130, 0.05)' : 'white'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    border-color: #6A1B82;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 27, 130, 0.15);
  }
  
  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.$selected ? '#6A1B82' : '#333'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #6A1B82;
  border: 2px solid #6A1B82;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContactUs = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    packageId: '',
    message: '',
    travelers: '1',
    budget: '',
    travelDates: '',
    interests: []
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const interestOptions = [
    { id: 'culture', label: 'Culture & Heritage', icon: '🏛️' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'relaxation', label: 'Relaxation & Spa', icon: '🧘' },
    { id: 'food', label: 'Culinary Experience', icon: '🍽️' },
    { id: 'wildlife', label: 'Wildlife & Nature', icon: '🦁' },
    { id: 'beach', label: 'Beach & Coastal', icon: '🏖️' }
  ];

  // Fetch categories and tours from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, toursData] = await Promise.all([
          getCategories(),
          getTours()
        ]);
        setCategories(categoriesData);
        setTours(toursData.filter(t => t.is_active));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleInterest = (interestId) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    
    setIsSubmitting(true);
    
    // Find selected package label
    const selectedTour = tours.find(t => t.id === form.packageId || t.slug === form.packageId);
    const selectedCategory = categories.find(c => c.id === form.packageId);
    
    let pkgLabel = 'N/A';
    if (selectedTour) {
      const tourCategory = categories.find(c => c.id === selectedTour.category_id);
      pkgLabel = tourCategory ? `${tourCategory.name} — ${selectedTour.title}` : selectedTour.title;
    } else if (selectedCategory) {
      pkgLabel = selectedCategory.name;
    }
    
    const interestsText = form.interests.length > 0 
      ? interestOptions.filter(opt => form.interests.includes(opt.id)).map(opt => opt.label).join(', ')
      : 'Not specified';
    
    try {
      // Send to your server API which handles email via nodemailer
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || '',
          travelers: form.travelers || '',
          budget: form.budget || '',
          travelDates: form.travelDates || '',
          selectedPackage: pkgLabel,
          interests: interestsText,
          message: form.message
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowSuccess(true);
        // Reset form fields
        setForm({
          name: '',
          email: '',
          phone: '',
          destination: '',
          packageId: '',
          message: '',
          travelers: '1',
          budget: '',
          travelDates: '',
          interests: []
        });
      } else {
        alert(result.message || 'Failed to send. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Please enter your name';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) errs.email = 'Enter a valid email address';
    if (!form.message || form.message.trim().length < 10) errs.message = 'Please enter at least 10 characters';
    setErrors(errs);
    const fields = ['name','email','message'];
    const filled = fields.filter(f => !errs[f]).length;
    setProgress(Math.round((filled/fields.length)*100));
  }, [form]);

  return (
    <Page>
      <Container>
        <Grid>
          <WideCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FormHeader>
              <h3>Get in Touch With Us</h3>
            </FormHeader>
            
            <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Please provide your name, email address, phone number, and your message. After a successful submission, we will respond to your email within 24 hours.
            </p>
            
            <Progress><ProgressFill percent={progress} /></Progress>
            
            <Form onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Field>
                <Label>Name *</Label>
                <InputWrapper data-has-value={Boolean(form.name)}>
                  <IconLeft><UserIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>Enter your name</FloatingLabel>
                  <Input name="name" value={form.name} onChange={update} required />
                </InputWrapper>
                {errors.name && <span style={{ color: '#e11d48', fontSize: '0.9rem' }}>{errors.name}</span>}
              </Field>

              <Field>
                <Label>Email Address *</Label>
                <InputWrapper data-has-value={Boolean(form.email)}>
                  <IconLeft><EnvelopeIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>your.email@example.com</FloatingLabel>
                  <Input type="email" name="email" value={form.email} onChange={update} required />
                </InputWrapper>
                {errors.email && <span style={{ color: '#e11d48', fontSize: '0.9rem' }}>{errors.email}</span>}
              </Field>

              <Field>
                <Label>Phone Number</Label>
                <InputWrapper data-has-value={Boolean(form.phone)}>
                  <IconLeft><PhoneIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>+44 20 8830 8611</FloatingLabel>
                  <Input name="phone" value={form.phone} onChange={update} />
                </InputWrapper>
              </Field>

              <Field>
                <Label>Preferred Travel Dates</Label>
                <InputWrapper data-has-value={Boolean(form.travelDates)}>
                  <IconLeft><CalendarIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>e.g., June 2025 or Flexible</FloatingLabel>
                  <Input name="travelDates" value={form.travelDates} onChange={update} />
                </InputWrapper>
              </Field>

              <FullRow>
                <Label>Your Message *</Label>
                <TextArea 
                  name="message" 
                  placeholder="Tell us about your inquiry or how we can help you..." 
                  value={form.message} 
                  onChange={update} 
                  required 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Min 10 characters</span>
                  <span style={{ color: '#6A1B82', fontSize: '0.85rem' }}>{form.message.length} chars</span>
                </div>
                {errors.message && <span style={{ color: '#e11d48', fontSize: '0.9rem' }}>{errors.message}</span>}
              </FullRow>

              <FullRow>
                <Submit type="submit" disabled={Object.keys(errors).length > 0 || isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Submit>
              </FullRow>
            </Form>
            <AnimatePresence>
              {showSuccess && (
                <SuccessOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSuccess(false)}
                >
                  <SuccessCard
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <CheckCircleIcon style={{ width: 48, height: 48, color: '#6A1B82', marginBottom: '0.75rem' }} />
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Message Sent!</h4>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>We will respond to your email within 24 hours.</p>
                    <Submit onClick={() => setShowSuccess(false)}>Close</Submit>
                  </SuccessCard>
                </SuccessOverlay>
              )}
            </AnimatePresence>
          </WideCard>
          
          <AnimatedCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Header style={{ marginBottom: '2rem' }}>
              <Title initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '2rem' }}>Get in Touch</Title>
              <SubTitle initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Plan Your Luxury Experience</SubTitle>
            </Header>
            
            <InfoItem>
              <IconWrap><PhoneIcon style={{ width: 20, height: 20 }} /></IconWrap>
              <InfoText>
                <span>Telephone</span>
                <strong>(+44) 208 830 8611</strong>
              </InfoText>
            </InfoItem>

            <InfoItem>
              <IconWrap><PhoneIcon style={{ width: 20, height: 20 }} /></IconWrap>
              <InfoText>
                <span>Mobile (8am – 6pm)</span>
                <strong>+44 7956 375803</strong>
              </InfoText>
            </InfoItem>

            <InfoItem>
              <IconWrap><EnvelopeIcon style={{ width: 20, height: 20 }} /></IconWrap>
              <InfoText>
                <span>E-mail</span>
                <strong>gowritour@gmail.com</strong>
                <span>Response within 24 hours</span>
              </InfoText>
            </InfoItem>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <IconWrap><ClockIcon style={{ width: 20, height: 20 }} /></IconWrap>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Opening Hours</h4>
              </div>
              <div style={{ marginLeft: '52px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontWeight: 500 }}>Monday – Friday</span>
                  <strong style={{ color: '#1a1a1a' }}>8 am – 6 pm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontWeight: 500 }}>Saturday</span>
                  <strong style={{ color: '#1a1a1a' }}>9 am – 6 pm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontWeight: 500 }}>Sunday</span>
                  <strong style={{ color: '#1a1a1a' }}>10 am – 5 pm</strong>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </Grid>
      </Container>
    </Page>
  );
};

export default ContactUs;
