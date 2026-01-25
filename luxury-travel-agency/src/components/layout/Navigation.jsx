import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchFrontendData, getCachedData, normalize } from '../../services/frontendData';
import { onDataChange } from '../../services/jsonDatabase';

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    position: fixed;
    top: 96px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 2rem;
    gap: 1rem;
    transform: ${props => props.$isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)'};
    opacity: ${props => props.$isMobileMenuOpen ? '1' : '0'};
    visibility: ${props => props.$isMobileMenuOpen ? 'visible' : 'hidden'};
    pointer-events: ${props => props.$isMobileMenuOpen ? 'auto' : 'none'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    height: calc(100vh - 96px);
    overflow-y: auto;
    z-index: 1200;
  }
`;

const NavItem = styled.div`
  position: relative;
  pointer-events: auto;
  
  &:focus-within > div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const NavLink = styled(motion.a)`
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  position: relative;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0;
  outline: none;

  &:hover, &:focus {
    color: #6A1B82;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #6A1B82;
    transition: width 0.3s ease;
  }

  &:hover::after, &:focus::after {
    width: 100%;
  }
  
  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }
  
  &[data-open="true"] svg {
    transform: rotate(180deg);
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.75rem 0;
    justify-content: center;
  }
`;

const CTAButton = styled(motion.button)`
  background: #6A1B82;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 2px solid #6A1B82;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 27, 130, 0.3);

  &:hover, &:focus {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106, 27, 130, 0.4);
    outline: none;
  }

  @media (max-width: 768px) {
    margin-top: 1rem;
    padding: 1rem 2rem;
    font-size: 1rem;
    width: 100%;
  }
`;

const DropdownPanel = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle at 20% 20%, rgba(122, 55, 180, 0.08), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(89, 131, 252, 0.08), transparent 40%),
    #ffffff;
  border: 1px solid #e2d9ff;
  border-radius: 18px;
  box-shadow: 0 22px 55px rgba(50, 30, 97, 0.18);
  padding: 1.2rem 1.5rem 1.5rem;
  min-width: 420px;
  max-width: 720px;
  z-index: 50;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  overflow: hidden;

  @media (max-width: 768px) {
    position: static;
    transform: none;
    width: 100%;
    box-shadow: none;
    border: 1px solid #ede9fe;
    margin-top: 0.5rem;
    max-width: none;
    border-radius: 12px;
    padding: 1rem;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(106, 27, 130, 0.08);
  pointer-events: auto;
`;

const DropdownTitle = styled.span`
  font-weight: 700;
  color: #1f2937;
  font-size: 1.05rem;
  letter-spacing: 0.01em;
`;

const DropdownSubtitle = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

const DropdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.7rem;
  pointer-events: auto;
`;

const DropdownPill = styled.button`
  width: 100%;
  text-align: left;
  background: linear-gradient(180deg, rgba(106, 27, 130, 0.06) 0%, rgba(106, 27, 130, 0.02) 100%);
  border: 1px solid rgba(106, 27, 130, 0.16);
  padding: 0.7rem 0.85rem;
  font-size: 0.9rem;
  color: #43325f;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  outline: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &::after {
    content: ${props => props.$hasChildren ? "'›'" : "''"};
    font-size: 1.1rem;
    color: #6A1B82;
    transition: transform 0.2s ease;
  }

  &:hover, &:focus {
    background: rgba(106, 27, 130, 0.16);
    color: #3f1b82;
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(76, 29, 149, 0.16);
  }
  
  &[data-expanded="true"] {
    background: rgba(106, 27, 130, 0.18);
    font-weight: 600;
    
    &::after {
      transform: rotate(90deg);
    }
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.3);
  }
`;

const L2Container = styled(motion.div)`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(106, 27, 130, 0.04);
  border-radius: 10px;
  margin-top: -0.2rem;
  border: 1px dashed rgba(106, 27, 130, 0.12);
`;

const L2Link = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 27, 130, 0.2);
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
  color: #43325f;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  pointer-events: auto !important;
  text-decoration: none;
  white-space: nowrap;
  outline: none;

  &:hover, &:focus {
    background: rgba(106, 27, 130, 0.15);
    color: #3f1b82;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(76, 29, 149, 0.12);
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.3);
  }
  
  &:active {
    background: rgba(106,27,130,0.22);
    transform: translateY(0);
  }
`;

// Animation variants
const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const l2Variants = {
  hidden: { 
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1,
    height: 'auto',
    transition: { 
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.04
    }
  },
  exit: { 
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  }
};

const l2ItemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  }
};

const Navigation = ({ isMobileMenuOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuCategories, setMenuCategories] = useState([]);
  const [openSlug, setOpenSlug] = useState(null);
  const [expandedSubSlug, setExpandedSubSlug] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Refs for timeouts and elements
  const hoverTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const l2TimeoutRef = useRef(null);
  const navRef = useRef(null);
  const dropdownRefs = useRef({});

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (l2TimeoutRef.current) {
      clearTimeout(l2TimeoutRef.current);
      l2TimeoutRef.current = null;
    }
  }, []);

  // Click-based toggle for dropdown (no hover)
  const handleToggleDropdown = useCallback((categorySlug, hasDropdown, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hasDropdown) {
      // Toggle: close if already open, open if closed
      if (openSlug === categorySlug) {
        setOpenSlug(null);
        setExpandedSubSlug(null);
      } else {
        setOpenSlug(categorySlug);
        setExpandedSubSlug(null);
      }
    }
  }, [openSlug]);

  // Click-based toggle for L2 submenu (no hover)
  const handleToggleL2 = useCallback((childSlug, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Toggle: close if already expanded, expand if closed
    setExpandedSubSlug(expandedSubSlug === childSlug ? null : childSlug);
  }, [expandedSubSlug]);

  // Close all menus
  const closeAllMenus = useCallback(() => {
    setOpenSlug(null);
    setExpandedSubSlug(null);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e, categorySlug, hasDropdown, childItems = []) => {
    const key = e.key;
    
    switch (key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (hasDropdown) {
          setOpenSlug(openSlug === categorySlug ? null : categorySlug);
        } else {
          navigate(`/service/${categorySlug}`);
          setOpenSlug(null);
          setExpandedSubSlug(null);
          if (onClose) onClose();
        }
        break;
      case 'Escape':
        setOpenSlug(null);
        setExpandedSubSlug(null);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (openSlug === categorySlug && childItems.length > 0) {
          setFocusedIndex(prev => Math.min(prev + 1, childItems.length - 1));
        } else if (hasDropdown) {
          setOpenSlug(categorySlug);
          setFocusedIndex(0);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex > 0) {
          setFocusedIndex(prev => prev - 1);
        } else if (focusedIndex === 0) {
          setFocusedIndex(-1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (childItems[focusedIndex]) {
          const childSlug = childItems[focusedIndex].slug || childItems[focusedIndex].id;
          setExpandedSubSlug(childSlug);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setExpandedSubSlug(null);
        break;
      case 'Tab':
        setOpenSlug(null);
        setExpandedSubSlug(null);
        break;
      default:
        break;
    }
  }, [openSlug, focusedIndex, navigate, onClose]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cached = getCachedData();
        if (cached && cached.allCategories && cached.allCategories.length > 0) {
          setMenuCategories(cached.allCategories);
          return;
        }
        
        const { categories, allCategories } = await fetchFrontendData();
        const roots = (allCategories && allCategories.length ? allCategories : categories) || [];
        setMenuCategories(roots.length > 0 ? roots : []);
      } catch (err) {
        console.error('Navigation: Failed to fetch categories:', err.message);
        setMenuCategories([]);
      }
    };
    
    fetchCategories();
    
    const unsubscribe = onDataChange((type) => {
      if (type === 'categories') fetchCategories();
    });
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchCategories();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('nav')) {
        setOpenSlug(null);
        setExpandedSubSlug(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && openSlug) {
      const ref = dropdownRefs.current[`${openSlug}-${focusedIndex}`];
      if (ref) ref.focus();
    }
  }, [focusedIndex, openSlug]);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(targetId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Nav ref={navRef} $isMobileMenuOpen={isMobileMenuOpen} role="navigation" aria-label="Main navigation">
      <NavItem>
        <NavLink
          href="/"
          role="menuitem"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname !== '/') navigate('/');
            setOpenSlug(null);
            setExpandedSubSlug(null);
            if (onClose) onClose();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Home
        </NavLink>
      </NavItem>

      {(() => {
        const rootCategories = (menuCategories || [])
          .filter((c) => !c.parent_id)
          .sort((a, b) => {
            const orderA = a.sort_order ?? 999;
            const orderB = b.sort_order ?? 999;
            if (orderA !== orderB) return orderA - orderB;
            return (a.name || '').localeCompare(b.name || '');
          });

        return rootCategories.map((category) => {
          const categorySlug = category.slug || category.id || normalize(category.name || '');
          const label = category._navLabel || category.name;
          
          const directChildren = (menuCategories || [])
            .filter((c) => c.parent_id === category.id || c.parent_id === categorySlug)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          
          const hasDropdown = directChildren.length > 0;
          const isOpen = openSlug === categorySlug;
          
          return (
            <NavItem
              key={categorySlug}
            >
              <NavLink
                href={`/service/${categorySlug}`}
                role="menuitem"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-haspopup={hasDropdown ? "true" : undefined}
                data-open={isOpen}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (hasDropdown) {
                    // Click toggles the dropdown on both mobile and desktop
                    handleToggleDropdown(categorySlug, hasDropdown);
                  } else {
                    // Navigate directly if no dropdown
                    navigate(`/service/${categorySlug}`);
                    closeAllMenus();
                    if (onClose) onClose();
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, categorySlug, hasDropdown, directChildren)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {label}
                {hasDropdown && <ChevronDownIcon />}
              </NavLink>
              
              <AnimatePresence>
                {hasDropdown && isOpen && (
                  <DropdownPanel
                    role="menu"
                    aria-label={`${label} submenu`}
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <DropdownHeader>
                      <DropdownTitle>{label}</DropdownTitle>
                      <DropdownSubtitle>{directChildren.length} options</DropdownSubtitle>
                    </DropdownHeader>
                    
                    <DropdownGrid role="group">
                      {directChildren.map((child, childIndex) => {
                        const childSlug = child.slug || child.id || normalize(child.name || '');
                        const grandchildren = (menuCategories || []).filter((c) => c.parent_id === child.id);
                        const hasGrandchildren = grandchildren.length > 0;
                        const isExpanded = expandedSubSlug === childSlug;
                        
                        // Sort grandchildren
                        const airportOrder = {
                          'heathrow-lhr': 1, 'gatwick-lgw': 2, 'stansted-airport-stn': 3,
                          'luton-airport-ltn': 4, 'city-airport-lcy': 5
                        };
                        const vehicleOrder = {
                          'saloon-car': 1, 'estate-car': 2, 'mpv': 3, 'mpv-plus': 4,
                          '8-seater': 5, '16-seater': 6, '23-seater': 7, '33-seater': 8,
                          '51-seater': 9, '83-seater': 10
                        };
                        
                        const sortedGrandchildren = [...grandchildren].sort((a, b) => {
                          const slugA = normalize(a.slug || a.name || '');
                          const slugB = normalize(b.slug || b.name || '');
                          if (childSlug === 'airport-transfers') {
                            return (airportOrder[slugA] || 999) - (airportOrder[slugB] || 999);
                          }
                          if (childSlug === 'vehicle-hire') {
                            return (vehicleOrder[slugA] || 999) - (vehicleOrder[slugB] || 999);
                          }
                          return (a.sort_order || 0) - (b.sort_order || 0);
                        });
                                          
                        // Check if parent is Cruises or Private Tours - redirect L2 to parent page
                        const isCruisesChild = categorySlug === 'cruises';
                        const isPrivateToursChild = categorySlug === 'private-tours';
                        const l2TargetSlug = isCruisesChild ? 'cruises' : (isPrivateToursChild ? 'private-tours' : childSlug);
                        
                        return (
                          <React.Fragment key={childSlug}>
                            <DropdownPill
                              ref={(el) => dropdownRefs.current[`${categorySlug}-${childIndex}`] = el}
                              type="button"
                              role="menuitem"
                              tabIndex={0}
                              $hasChildren={hasGrandchildren}
                              data-expanded={isExpanded}
                              aria-expanded={hasGrandchildren ? isExpanded : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (hasGrandchildren) {
                                  handleToggleL2(childSlug);
                                } else {
                                  navigate(`/service/${l2TargetSlug}`);
                                  closeAllMenus();
                                  if (onClose) onClose();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  if (hasGrandchildren) {
                                    handleToggleL2(childSlug);
                                  } else {
                                    navigate(`/service/${l2TargetSlug}`);
                                    closeAllMenus();
                                    if (onClose) onClose();
                                  }
                                }
                              }}
                            >
                              {child.name}
                            </DropdownPill>
                            
                            <AnimatePresence>
                              {hasGrandchildren && isExpanded && (
                                <L2Container
                                  variants={l2Variants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  role="group"
                                  aria-label={`${child.name} subcategories`}
                                >
                                  {sortedGrandchildren.map((grandchild) => {
                                    const grandchildSlug = grandchild.slug || grandchild.id || normalize(grandchild.name || '');
                                    const parentCategory = menuCategories.find(c => c.id === grandchild.parent_id);
                                    const parentSlug = parentCategory?.slug;
                                    const targetSlug = (parentSlug === 'airport-transfers' || parentSlug === 'vehicle-hire') 
                                      ? parentSlug 
                                      : grandchildSlug;
                                    
                                    return (
                                      <L2Link
                                        key={grandchildSlug}
                                        href={`/service/${targetSlug}`}
                                        role="menuitem"
                                        tabIndex={0}
                                        variants={l2ItemVariants}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          navigate(`/service/${targetSlug}`);
                                          closeAllMenus();
                                          if (onClose) onClose();
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`/service/${targetSlug}`);
                                            closeAllMenus();
                                            if (onClose) onClose();
                                          }
                                        }}
                                      >
                                        {grandchild.name}
                                      </L2Link>
                                    );
                                  })}
                                </L2Container>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </DropdownGrid>
                  </DropdownPanel>
                )}
              </AnimatePresence>
            </NavItem>
          );
        });
      })()}

      <NavItem>
        <NavLink
          href="/contact-us"
          role="menuitem"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            navigate('/contact-us');
            if (onClose) onClose();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact
        </NavLink>
      </NavItem>

      <CTAButton
        role="button"
        tabIndex={0}
        onClick={(e) => {
          handleNavClick(e, 'contact');
          if (onClose) onClose();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Book Now
      </CTAButton>
    </Nav>
  );
};

export default Navigation;
