import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { fetchFrontendData } from '../../services/frontendData';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  color: white;
  padding: 1.25rem 0 0.75rem;
  margin-top: 2rem;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 2rem;
  }
`;

const FooterSection = styled(motion.div)`
  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #ffffff;
  }

  p, li {
    color: #ffffff;
    line-height: 1.5;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  a {
    color: #ffffff;
    text-decoration: none;
    transition: color 0.3s ease;
    cursor: pointer;

    &:hover {
      color: #ffffff;
    }
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
    color: #6A1B82;
    flex-shrink: 0;
  }

  span {
    color: #ffffff;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SocialLink = styled(motion.a)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
    color: #ffffff;
    transition: color 0.3s ease;
  }

  &:hover svg {
    color: #6A1B82;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  text-align: center;
  color: #ffffff;
  font-size: 0.8rem;
`;

const Footer = () => {
  const [rootCategories, setRootCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    // Load main categories for Quick Links and Featured Services
    const loadCategories = async () => {
      try {
        const { allCategories } = await fetchFrontendData();
        const roots = (allCategories || [])
          .filter(cat => !cat.parent_id && cat.visible)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .slice(0, 6); // Show max 6 main categories
        setRootCategories(roots);
        
        // Featured Services - show main tour categories (subcategories of "Tours")
        const toursCategory = (allCategories || []).find(c => c.slug === 'tours');
        if (toursCategory) {
          const tourSubcategories = (allCategories || [])
            .filter(cat => cat.parent_id === toursCategory.id && cat.visible)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .slice(0, 6);
          setFeaturedServices(tourSubcategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const quickLinks = [
    { name: 'Home', path: '/' },
    ...rootCategories.map(cat => ({
      name: cat.name,
      path: `/service/${cat.slug || cat.id}`
    })),
    { name: 'Contact', path: '/contact-us' }
  ];

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3>GOWRI TOURS</h3>
          <p>
            Crafting extraordinary travel experiences for discerning travelers. 
            Your journey to luxury and exclusivity begins here.
          </p>
          <SocialLinks>
            <SocialLink href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </SocialLink>
            <SocialLink href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
            </SocialLink>
            <SocialLink href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/></svg>
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <h3>Quick Links</h3>
          <ul>
            {quickLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.path}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </FooterSection>

        <FooterSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3>Featured Services</h3>
          <ul>
            {featuredServices.map((service) => (
              <li key={service.id}>
                <Link to={`/service/${service.slug || service.id}`}>
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </FooterSection>

        <FooterSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3>Contact Info</h3>
          <ContactItem>
            <PhoneIcon />
            <span>Telephone: +44 20 8830 8611</span>
          </ContactItem>
          <ContactItem>
            <PhoneIcon />
            <span>Mobile: 07956 375 803</span>
          </ContactItem>
          <ContactItem>
            <EnvelopeIcon />
            <span>gowritour@gmail.com</span>
          </ContactItem>
          <ContactItem style={{ alignItems: 'flex-start' }}>
            <MapPinIcon style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Gowri Tours & Travels LTD<br />
              Suite 208, Stanmore Business and Innovation Centre,Howard Road,<br />
              Stanmore, HA7 1BT<br />
              Registration No: 16379099
            </span>
          </ContactItem>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
        © 2026 GOWRI TOURS. All rights reserved. | 
          <Link to="/terms" style={{ color: '#ffffff', marginLeft: '0.5rem' }}>Terms of Service</Link>
        </motion.div>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
