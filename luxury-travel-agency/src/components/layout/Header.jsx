import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { getCachedData } from '../../services/frontendData';
import { initDatabase, getLogos } from '../../services/jsonDatabase';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0; /* align to left edge */
  padding: 0 2rem 0 0; /* remove left padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 110px;

  @media (max-width: 768px) {
    padding: 0 1rem 0 0; /* remove left padding on mobile too */
    height: 96px;
  }
`;

const Logo = styled(motion.a)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: -0.02em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LogoImg = styled.img`
  height: 250px;
  width: auto;
  display: block;
  max-height: 100%;
  object-fit: contain;
  @media (max-width: 768px) {
    height: 120px;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #6A1B82;

  svg {
    width: 28px;
    height: 28px;
    color: #6A1B82;
  }

  @media (max-width: 768px) {
    display: block;
  }

  &:hover {
    background: rgba(106, 27, 130, 0.1);
  }
`;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // Try cached data first for instant display
        const cached = getCachedData();
        if (cached && cached.logos && cached.logos.length > 0) {
          const active = cached.logos.find(i => i.is_active) || cached.logos[0];
          setLogoUrl(active.image);
          return; // Use cached, skip fetch
        }
        
        // Only fetch if no cache
        await initDatabase();
        const logos = await getLogos();
        
        if (Array.isArray(logos) && logos.length > 0) {
          const active = logos.find(i => i.is_active) || logos[0];
          setLogoUrl(active.image);
        }
      } catch (e) {
        console.error('Error loading logo:', e);
      }
    };
    fetchLogo();
  }, []);

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL, return as-is
    if (url.startsWith('http')) return url;
    // If it's a base64 data URL, return as-is
    if (url.startsWith('data:')) return url;
    // Otherwise assume it's a relative path (shouldn't happen with our setup)
    return url;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <HeaderContainer className={isScrolled ? 'scrolled' : ''} role="banner">
      <HeaderContent>
        <Logo
          href="/"
          onClick={handleLogoClick}
          aria-label="GOWRI TOURS - Return to homepage"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {logoUrl && <LogoImg src={resolveMediaUrl(logoUrl)} alt="GOWRI TOURS logo" />}
        </Logo>

        <Navigation isMobileMenuOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <MobileMenuButton
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </MobileMenuButton>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
