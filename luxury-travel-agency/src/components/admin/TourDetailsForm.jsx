import React, { useState } from 'react';
import styled from 'styled-components';
import RichTextEditor from '../common/RichTextEditor';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  min-height: 90px;
  font-size: 0.95rem;
  font-family: inherit;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const GalleryCard = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
`;

const GalleryImage = styled.div`
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const GalleryContent = styled.div`
  padding: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$variant === 'danger' ? '#fca5a5' : props.$variant === 'secondary' ? '#d1d5db' : '#6A1B82'};
  background: ${props => props.$variant === 'danger' ? 'transparent' : props.$variant === 'secondary' ? '#f3f4f6' : '#6A1B82'};
  color: ${props => props.$variant === 'danger' ? '#b91c1c' : props.$variant === 'secondary' ? '#374151' : '#fff'};
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    opacity: 0.9;
  }
`;

const AddGalleryForm = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 1rem;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// Copy from Default styled components
const CopyFromDefaultContainer = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
`;

const CopyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h5 {
    margin: 0;
    color: #92400e;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CopyOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CopyOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.$checked ? '#10b981' : 'white'};
  color: ${props => props.$checked ? 'white' : '#374151'};
  border-radius: 8px;
  border: 1px solid ${props => props.$checked ? '#10b981' : '#d1d5db'};
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.$checked ? '#059669' : '#9ca3af'};
  }
  
  input {
    display: none;
  }
`;

const PreviewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const PreviewContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
`;

const PreviewSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid ${props => props.$hasContent ? '#10b981' : '#fbbf24'};
  
  h6 {
    margin: 0 0 0.75rem 0;
    color: #1f2937;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
    white-space: pre-wrap;
  }
  
  ul {
    margin: 0;
    padding-left: 1.25rem;
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const ConflictWarning = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  color: #991b1b;
  font-size: 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

// Sub-package styled components
const SubPackageContainer = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const SubPackageHeader = styled.div`
  background: ${props => props.$expanded ? '#6A1B82' : '#f3f4f6'};
  color: ${props => props.$expanded ? 'white' : '#374151'};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$expanded ? '#5a1670' : '#e5e7eb'};
  }
`;

const SubPackageContent = styled.div`
  padding: ${props => props.$expanded ? '1.5rem' : '0'};
  max-height: ${props => props.$expanded ? '10000px' : '0'};
  overflow: ${props => props.$expanded ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  background: #fafafa;
`;

const SubPackageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TourDetailsForm = ({ details, onChange }) => {
  const [newGalleryItem, setNewGalleryItem] = useState({ image: '', title: '', description: '' });
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [showCopyPreview, setShowCopyPreview] = useState(null); // package index
  const [copyOptions, setCopyOptions] = useState({
    tourOverview: true,
    detailedOverview: true,
    itinerary: true,
    detailedItinerary: true,
    tourDates: true,
    otherInfo: true,
    termsAndConditions: true,
    pickupPoints: true,
    priceIncludes: true,
    highlights: true,
    importantNotes: true,
    hotels: true,
    starDifference: true,
    priceExcludes: true,
    additionalExcursions: true,
    optionalPackages: true
  });
  
  // Get default tour data (from main tour details)
  const getDefaultTourData = () => ({
    tourOverview: details.tourOverview || [],
    detailedOverview: details.detailedOverview || '',
    highlights: details.highlights || [],
    itinerary: details.itinerary || [],
    detailedItinerary: details.detailedItinerary || '',
    tourDates: details.tourDates || [],
    otherInfo: details.otherInfo || [],
    termsAndConditions: details.termsAndConditions || [],
    pickupPoints: details.pickupPoints || [],
    priceIncludes: details.priceIncludes || [],
    priceExcludes: details.priceExcludes || [],
    importantNotes: details.importantNotes || '',
    hotels: details.hotels || '',
    starDifference: details.starDifference || [],
    additionalExcursions: details.additionalExcursions || [],
    optionalPackages: details.optionalPackages || []
  });
  
  // Check if package has existing content for a field
  const packageHasContent = (pkg, field) => {
    const value = pkg[field];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return !!value;
  };
  
  // Get conflicts between default and package data
  const getConflicts = (pkgIndex) => {
    const pkg = (details.subPackages || [])[pkgIndex];
    if (!pkg) return [];
    
    const conflicts = [];
    const defaultData = getDefaultTourData();
    
    Object.keys(copyOptions).forEach(field => {
      if (copyOptions[field] && packageHasContent(pkg, field) && packageHasContent(defaultData, field === 'tourOverview' ? 'tourOverview' : field)) {
        conflicts.push(field);
      }
    });
    
    return conflicts;
  };
  
  // Apply default data to a package
  const applyDefaultToPackage = (pkgIndex, overwrite = false) => {
    const subPackages = [...(details.subPackages || [])];
    const pkg = { ...subPackages[pkgIndex] };
    const defaultData = getDefaultTourData();
    
    Object.keys(copyOptions).forEach(field => {
      if (copyOptions[field]) {
        const defaultValue = defaultData[field];
        const hasDefault = Array.isArray(defaultValue) ? defaultValue.length > 0 : (typeof defaultValue === 'string' ? defaultValue.trim().length > 0 : !!defaultValue);
        
        if (hasDefault) {
          const hasExisting = packageHasContent(pkg, field);
          if (!hasExisting || overwrite) {
            pkg[field] = JSON.parse(JSON.stringify(defaultValue)); // Deep clone
          }
        }
      }
    });
    
    subPackages[pkgIndex] = pkg;
    onChange({ ...details, subPackages });
    setShowCopyPreview(null);
  };
  
  const handleDetailsChange = (field, value) => {
    onChange({ ...details, [field]: value });
  };

  // Sub-package handlers
  const handleAddSubPackage = () => {
    const subPackages = details.subPackages || [];
    const newPackage = {
      name: '',
      duration: '',
      price: '',
      childPrice: '',
      description: '',
      highlights: [],
      itinerary: [],
      priceIncludes: [],
      tourDates: [],
    };
    onChange({
      ...details,
      subPackages: [...subPackages, newPackage]
    });
    setExpandedPackage(subPackages.length); // Auto-expand the new package
  };

  const handleRemoveSubPackage = (index) => {
    const subPackages = details.subPackages || [];
    onChange({
      ...details,
      subPackages: subPackages.filter((_, i) => i !== index)
    });
    if (expandedPackage === index) setExpandedPackage(null);
  };

  const handleUpdateSubPackage = (index, field, value) => {
    const subPackages = [...(details.subPackages || [])];
    subPackages[index] = { ...subPackages[index], [field]: value };
    onChange({
      ...details,
      subPackages
    });
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddGalleryImage = async () => {
    if (!newGalleryItem.image && !newGalleryItem.title) return;
    
    const galleryImages = details.galleryImages || [];
    onChange({
      ...details,
      galleryImages: [...galleryImages, { ...newGalleryItem }]
    });
    setNewGalleryItem({ image: '', title: '', description: '' });
  };

  const handleRemoveGalleryImage = (index) => {
    const galleryImages = details.galleryImages || [];
    onChange({
      ...details,
      galleryImages: galleryImages.filter((_, i) => i !== index)
    });
  };

  const handleGalleryFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setNewGalleryItem({ ...newGalleryItem, image: base64 });
      } catch (err) {
        console.error('Error converting image:', err);
      }
    }
  };

  return (
    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
      <h4 style={{ marginBottom: '1rem', color: '#6A1B82' }}>Tour Details</h4>
      
      <Field>
        <Label>Early Bird Offer</Label>
        <TextArea
          value={details.earlyBirdOffer}
          onChange={(e) => handleDetailsChange('earlyBirdOffer', e.target.value)}
          placeholder="Book 2026 Tours Now & Get upto 10% Off | Offer Ends on 31th Dec 2025."
        />
      </Field>
      
      <Field>
        <Label>Advance Booking Offer</Label>
        <TextArea
          value={details.advanceBookingOffer || ''}
          onChange={(e) => handleDetailsChange('advanceBookingOffer', e.target.value)}
          placeholder="Book early and save! Special discount for advance bookings."
        />
      </Field>
      
      <Field>
        <Label>Tour Overview (one per line)</Label>
        <TextArea
          value={(details.tourOverview || []).join('\n')}
          onChange={(e) => handleDetailsChange('tourOverview', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="Gretna Green – Explore the romantic village famous for runaway weddings\nWhisky Tasting at Gretna Green – Sample authentic Scottish whisky in a traditional setting\nGlasgow City Tour – Discover Glasgow Cathedral, the vibrant Main Square, and the prestigious University of Glasgow"
          rows="8"
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          These points appear as the bullet list under "Tour Overview" on the tour page.
        </p>
      </Field>
      
      <Field>
        <Label>Tour Overview (boxed, one per line)</Label>
        <TextArea
          value={details.detailedOverview || ''}
          onChange={(e) => handleDetailsChange('detailedOverview', e.target.value)}
          placeholder="Enter one highlight per line. Each line becomes a bullet with a tick on the tour page."
          rows="8"
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Add one line per point (no dashes needed). These show in the boxed "Tour Overview" section near the top of the tour page.
        </p>
      </Field>

      <Field>
        <Label>Additional Tour Highlights (one per line)</Label>
        <RichTextEditor
          value={Array.isArray(details.highlights) ? details.highlights.join('\n') : (details.highlights || '')}
          onChange={(val) => handleDetailsChange('highlights', val.split('\n').filter(h => h.trim()))}
          placeholder="(Optional) Extra highlights to show under Tour Highlights on the tour page."
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          These lines appear in the "Tour Highlights" section on the tour page. Use one line per highlight.
        </p>
      </Field>
      
      <Field>
        <Label>Important Notes</Label>
        <TextArea
          value={details.importantNotes || ''}
          onChange={(e) => handleDetailsChange('importantNotes', e.target.value)}
          placeholder="Enter any important notes or information for travelers."
          rows="4"
        />
      </Field>

      <Field>
        <Label>📋 Other Information</Label>
        <RichTextEditor
          value={details.otherInfo || ''}
          onChange={(val) => handleDetailsChange('otherInfo', val)}
          placeholder="Enter additional information about the tour. Use Bold for headings."
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Provide additional relevant details about the tour. Use <strong>Bold</strong> for headings and bullet lists for items.
        </p>
      </Field>
      
      <Field>
        <Label>📜 Terms & Conditions</Label>
        <RichTextEditor
          value={details.termsAndConditions || ''}
          onChange={(val) => handleDetailsChange('termsAndConditions', val)}
          placeholder="Enter terms and conditions. Use Bold for headings."
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          List the terms and conditions. Use <strong>Bold</strong> for section headings and bullet lists for items.
        </p>
      </Field>
      
      <Field>
        <Label>Tour Dates (Date and Time, one per line)</Label>
        <TextArea
          value={(details.tourDates || []).map(d => d.date || d).join('\n')}
          onChange={(e) => {
            const dates = e.target.value.split('\n').filter(line => line.trim()).map(line => {
              return { date: line.trim() };
            });
            handleDetailsChange('tourDates', dates);
          }}
          placeholder="15th January 2026 - 10:00 AM\n22nd January 2026 - 9:30 AM"
          rows="6"
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Enter each tour date and time on a separate line.
        </p>
      </Field>
      
      <Field>
        <Label>Hotels</Label>
        <TextArea
          value={details.hotels}
          onChange={(e) => handleDetailsChange('hotels', e.target.value)}
          placeholder="3 nights at Premier Inn or Holiday Inn Express Strathclyde or Similar"
        />
      </Field>
      
      <Field>
        <Label>✅ Price Includes (one per line)</Label>
        <TextArea
          value={details.priceIncludes.join('\n')}
          onChange={(e) => handleDetailsChange('priceIncludes', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="List what is included in the price, one per line:&#10;&#10;Return transportation by deluxe AC vehicle&#10;3 nights accommodation in 3/4* hotel with breakfast&#10;Professional English-speaking tour guide&#10;All entrance fees to attractions mentioned&#10;Ferry crossing to the Isle of Wight&#10;Complimentary bottled water on coach"
          rows="8"
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          List what is included in the price, one item per line. Each line appears with a checkmark on the tour page.
        </p>
      </Field>
      
      <Field>
        <Label>❌ Price Excludes (one per line)</Label>
        <TextArea
          value={(details.priceExcludes || []).join('\n')}
          onChange={(e) => handleDetailsChange('priceExcludes', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="List what is NOT included in the price, one per line:&#10;&#10;Personal expenses&#10;Travel insurance&#10;Optional activities not mentioned&#10;Tips and gratuities&#10;Drinks with meals"
          rows="6"
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          List what is NOT included in the price, one item per line. Each line appears with an X on the tour page.
        </p>
      </Field>
      
      <Field>
        <Label>The Star Difference (one per line)</Label>
        <TextArea
          value={details.starDifference.join('\n')}
          onChange={(e) => handleDetailsChange('starDifference', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="Indian Lunch included in Edinburgh&#10;Whiskey Tasting with a short introduction to the dram"
          rows="5"
        />
      </Field>
      
      <Field>
        <Label>📍 Pick Up Points</Label>
        <RichTextEditor
          value={details.pickupPoints || ''}
          onChange={(val) => handleDetailsChange('pickupPoints', val)}
          placeholder="Enter pick-up points. Use Bold for location names and add images if needed."
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          List pick-up locations with full addresses. Use <strong>Bold</strong> for location names and add images for maps or directions.
        </p>
      </Field>
      
      <Field>
        <Label>Additional Excursions (Format: Name | Adult Price | Child Price, one per line)</Label>
        <TextArea
          value={details.additionalExcursions.map(e => `${e.name} | ${e.adult} | ${e.child}`).join('\n')}
          onChange={(e) => {
            const excursions = e.target.value.split('\n').filter(line => line.trim()).map(line => {
              const [name, adult, child] = line.split('|').map(s => s.trim());
              return { name: name || '', adult: adult || '', child: child || '' };
            });
            handleDetailsChange('additionalExcursions', excursions);
          }}
          placeholder="Loch Lomond | £15 | £10 (5-15 Years)"
          rows="3"
        />
      </Field>
      
      <Field>
        <Label>🎁 Tour Packages (Optional) - Format: Name | Duration | Adult Price | Child Price | Description</Label>
        <TextArea
          value={(details.optionalPackages || []).map(p => 
            `${p.name} | ${p.duration || ''} | ${p.adultPrice || ''} | ${p.childPrice || ''} | ${p.description || ''}`
          ).join('\n')}
          onChange={(e) => {
            const packages = e.target.value.split('\n').filter(line => line.trim()).map(line => {
              const parts = line.split('|').map(s => s.trim());
              return {
                name: parts[0] || '',
                duration: parts[1] || '',
                adultPrice: parts[2] || '',
                childPrice: parts[3] || '',
                description: parts[4] || ''
              };
            });
            handleDetailsChange('optionalPackages', packages);
          }}
          placeholder="1 Day Package | 1 Day | £99 | £79 | Quick day trip exploring main attractions&#10;2 Day Package | 2 Days / 1 Night | £179 | £149 | Extended tour with overnight stay&#10;Premium Package | 3 Days / 2 Nights | £299 | £249 | Full experience with luxury accommodation"
          rows="6"
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          List any optional packages available for the tour. Each line creates a package option. Format: Name | Duration | Adult Price | Child Price | Description
        </p>
      </Field>
      
      <Field>
        <Label>Day-by-Day Itinerary (Format: Day Number | Title | Description, one per line)</Label>
        <TextArea
          value={(details.itinerary || []).map(day => `Day ${day.day} | ${day.title} | ${day.description}`).join('\n')}
          onChange={(e) => {
            const itinerary = e.target.value.split('\n').filter(line => line.trim()).map(line => {
              const parts = line.split('|').map(s => s.trim());
              const dayMatch = parts[0]?.match(/\d+/);
              const day = dayMatch ? dayMatch[0] : '';
              const title = parts[1] || '';
              const description = parts[2] || '';
              return { day, title, description };
            }).filter(d => d.day);
            handleDetailsChange('itinerary', itinerary);
          }}
          placeholder="Day 1 | London to Edinburgh | Depart from London, journey through scenic landscapes to Edinburgh&#10;Day 2 | Edinburgh City Tour | Visit Edinburgh Castle, Royal Mile, and Holyrood Palace&#10;Day 3 | Scottish Highlands | Explore the beautiful Scottish Highlands and Loch Ness&#10;Day 4 | Return to London | Journey back with wonderful memories"
          rows="8"
        />
      </Field>
      
      <Field>
        <Label>📖 Detailed Day-by-Day Itinerary (Full descriptions in paragraph form)</Label>
        <RichTextEditor
          value={details.detailedItinerary || ''}
          onChange={(val) => handleDetailsChange('detailedItinerary', val)}
          placeholder="Enter detailed day-by-day itinerary. Use Bold for headings like DAY 01, location names, etc."
        />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Provide a full day-by-day breakdown with detailed descriptions in paragraph form. Use <strong>Bold</strong> for headings like DAY 01:, DAY 02:, location names, and key highlights.
        </p>
      </Field>
      
      {/* Sub-Packages Section (for multi-package tours like Isle Wide Tour) */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
        <h4 style={{ marginBottom: '0.5rem', color: '#6A1B82' }}>📦 Tour Packages (Optional)</h4>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
          List any optional packages available for the tour, with brief descriptions (e.g., Day 1 Package, Day 2 Package).
          The main tour above represents Day One. Add additional day packages here if your tour spans multiple days.
        </p>
        
        {/* Existing Sub-Packages */}
        {(details.subPackages || []).map((pkg, pkgIndex) => (
          <SubPackageContainer key={pkgIndex}>
            <SubPackageHeader 
              $expanded={expandedPackage === pkgIndex}
              onClick={() => setExpandedPackage(expandedPackage === pkgIndex ? null : pkgIndex)}
            >
              <span style={{ fontWeight: 600 }}>
                {pkg.name || `Package ${pkgIndex + 1}`}
                {pkg.duration && ` - ${pkg.duration}`}
                {pkg.price && ` - £${pkg.price}`}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button 
                  $variant="danger" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleRemoveSubPackage(pkgIndex); 
                  }}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Remove
                </Button>
                <span>{expandedPackage === pkgIndex ? '▼' : '▶'}</span>
              </div>
            </SubPackageHeader>
            <SubPackageContent $expanded={expandedPackage === pkgIndex}>
              <SubPackageGrid>
                <Field style={{ marginTop: 0 }}>
                  <Label>Package Name *</Label>
                  <Input
                    value={pkg.name || ''}
                    onChange={(e) => handleUpdateSubPackage(pkgIndex, 'name', e.target.value)}
                    placeholder="e.g., 1-Day Tour, 2-Day Package"
                  />
                </Field>
                <Field style={{ marginTop: 0 }}>
                  <Label>Package Type</Label>
                  <select
                    value={pkg.packageType || 'optional'}
                    onChange={(e) => handleUpdateSubPackage(pkgIndex, 'packageType', e.target.value)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.95rem',
                      background: 'white'
                    }}
                  >
                    <option value="optional">Optional Package</option>
                    <option value="required">Required Package</option>
                  </select>
                </Field>
                <Field style={{ marginTop: 0 }}>
                  <Label>Duration</Label>
                  <Input
                    value={pkg.duration || ''}
                    onChange={(e) => handleUpdateSubPackage(pkgIndex, 'duration', e.target.value)}
                    placeholder="e.g., 1 Day, 2 Days / 1 Night"
                  />
                </Field>
                <Field style={{ marginTop: 0 }}>
                  <Label>Price (£)</Label>
                  <Input
                    type="number"
                    value={pkg.price || ''}
                    onChange={(e) => handleUpdateSubPackage(pkgIndex, 'price', e.target.value)}
                    placeholder="e.g., 99"
                  />
                </Field>
                <Field style={{ marginTop: 0 }}>
                  <Label>Child Price (£)</Label>
                  <Input
                    type="number"
                    value={pkg.childPrice || ''}
                    onChange={(e) => handleUpdateSubPackage(pkgIndex, 'childPrice', e.target.value)}
                    placeholder="e.g., 79"
                  />
                </Field>
              </SubPackageGrid>
              
              <Field>
                <Label>Package Description</Label>
                <TextArea
                  value={pkg.description || ''}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'description', e.target.value)}
                  placeholder="Brief description of this package option..."
                  rows="3"
                />
              </Field>
              
              <Field>
                <Label>Tour Overview (one per line)</Label>
                <TextArea
                  value={(pkg.tourOverview || []).join('\n')}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'tourOverview', e.target.value.split('\n').filter(h => h.trim()))}
                  placeholder="Gretna Green – Explore the romantic village famous for runaway weddings&#10;Whisky Tasting at Gretna Green – Sample authentic Scottish whisky&#10;Glasgow City Tour – Discover Glasgow Cathedral and the vibrant Main Square"
                  rows="8"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  These points appear as the bullet list under "Tour Overview" on the tour page.
                </p>
              </Field>
              
              <Field>
                <Label>Tour Overview (boxed, one per line)</Label>
                <TextArea
                  value={pkg.detailedOverview || ''}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'detailedOverview', e.target.value)}
                  placeholder="Enter one highlight per line. Each line becomes a bullet with a tick on the tour page."
                  rows="8"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Add one line per point (no dashes needed). These show in the boxed "Tour Overview" section near the top of the tour page.
                </p>
              </Field>

              <Field>
                <Label>Additional Tour Highlights (one per line)</Label>
                <RichTextEditor
                  value={Array.isArray(pkg.highlights) ? pkg.highlights.join('\n') : (pkg.highlights || '')}
                  onChange={(val) => handleUpdateSubPackage(pkgIndex, 'highlights', val.split('\n').filter(h => h.trim()))}
                  placeholder="(Optional) Extra highlights to show under Tour Highlights on the tour page."
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  These lines appear in the "Tour Highlights" section on the tour page. Use one line per highlight.
                </p>
              </Field>
              
              <Field>
                <Label>📋 Other Information</Label>
                <RichTextEditor
                  value={pkg.otherInfo || ''}
                  onChange={(val) => handleUpdateSubPackage(pkgIndex, 'otherInfo', val)}
                  placeholder="Provide additional relevant details. Use Bold for headings."
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Provide additional relevant details about the tour. Use <strong>Bold</strong> for headings.
                </p>
              </Field>
              
              <Field>
                <Label>🗓️ Day-by-Day Itinerary</Label>
                <div style={{ 
                  background: '#f0fdf4', 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  border: '1px solid #bbf7d0',
                  marginTop: '0.5rem'
                }}>
                  {(pkg.itinerary || []).map((day, dayIndex) => (
                    <div key={dayIndex} style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      marginBottom: '0.75rem',
                      border: '1px solid #e5e7eb',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ 
                          background: '#6A1B82', 
                          color: 'white', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          Day {day.day || dayIndex + 1}
                        </span>
                        <Button
                          $variant="danger"
                          onClick={() => {
                            const itinerary = [...(pkg.itinerary || [])];
                            itinerary.splice(dayIndex, 1);
                            handleUpdateSubPackage(pkgIndex, 'itinerary', itinerary);
                          }}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginLeft: 'auto' }}
                        >
                          Remove Day
                        </Button>
                      </div>
                      <Input
                        value={day.title || ''}
                        onChange={(e) => {
                          const itinerary = [...(pkg.itinerary || [])];
                          itinerary[dayIndex] = { ...itinerary[dayIndex], title: e.target.value };
                          handleUpdateSubPackage(pkgIndex, 'itinerary', itinerary);
                        }}
                        placeholder="Day Title (e.g., London to Edinburgh)"
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <TextArea
                        value={day.description || ''}
                        onChange={(e) => {
                          const itinerary = [...(pkg.itinerary || [])];
                          itinerary[dayIndex] = { ...itinerary[dayIndex], description: e.target.value };
                          handleUpdateSubPackage(pkgIndex, 'itinerary', itinerary);
                        }}
                        placeholder="Day description and activities..."
                        rows="2"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const itinerary = [...(pkg.itinerary || [])];
                      itinerary.push({
                        day: itinerary.length + 1,
                        title: '',
                        description: ''
                      });
                      handleUpdateSubPackage(pkgIndex, 'itinerary', itinerary);
                    }}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    + Add Day
                  </Button>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Build your itinerary day by day. Click "Add Day" to add more days.
                </p>
              </Field>
              
              <Field>
                <Label>✅ Price Includes (one per line)</Label>
                <TextArea
                  value={(pkg.priceIncludes || []).join('\n')}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'priceIncludes', e.target.value.split('\n').filter(h => h.trim()))}
                  placeholder="Luxury coach transportation&#10;Professional English-speaking guide&#10;All entrance fees to attractions&#10;Hotel accommodation (for multi-day tours)&#10;Breakfast at hotel&#10;Ferry tickets (where applicable)"
                  rows="6"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  List all items included in the package price. Each item appears as a bullet point.
                </p>
              </Field>
              
              <Field>
                <Label>Price Excludes (one per line)</Label>
                <TextArea
                  value={(pkg.priceExcludes || []).join('\n')}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'priceExcludes', e.target.value.split('\n').filter(h => h.trim()))}
                  placeholder="Personal expenses&#10;Travel insurance&#10;Optional activities"
                  rows="4"
                />
              </Field>
              
              <Field>
                <Label>🏨 Hotels / Accommodation</Label>
                <TextArea
                  value={pkg.hotels || ''}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'hotels', e.target.value)}
                  placeholder="3 nights at Premier Inn or Holiday Inn Express or Similar&#10;&#10;You can also list multiple hotels:&#10;Night 1: Edinburgh - Hilton Garden Inn&#10;Night 2: Glasgow - Holiday Inn Express"
                  rows="4"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Specify accommodation details for multi-day tours. Include hotel names or categories.
                </p>
              </Field>
              
              <Field>
                <Label>The Star Difference (one per line)</Label>
                <TextArea
                  value={(pkg.starDifference || []).join('\n')}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'starDifference', e.target.value.split('\n').filter(h => h.trim()))}
                  placeholder="Indian Lunch included&#10;Whiskey Tasting with introduction"
                  rows="3"
                />
              </Field>
              
              <Field>
                <Label>Additional Excursions (Format: Name | Adult Price | Child Price)</Label>
                <TextArea
                  value={(pkg.additionalExcursions || []).map(e => `${e.name} | ${e.adult} | ${e.child}`).join('\n')}
                  onChange={(e) => {
                    const excursions = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                      const [name, adult, child] = line.split('|').map(s => s.trim());
                      return { name: name || '', adult: adult || '', child: child || '' };
                    });
                    handleUpdateSubPackage(pkgIndex, 'additionalExcursions', excursions);
                  }}
                  placeholder="Chairlift Ride | £8 | £5"
                  rows="3"
                />
              </Field>
              
              <Field>
                <Label>⚠️ Important Notes</Label>
                <TextArea
                  value={pkg.importantNotes || ''}
                  onChange={(e) => handleUpdateSubPackage(pkgIndex, 'importantNotes', e.target.value)}
                  placeholder="Enter important notes for travelers:\n\n• Valid passport required for all travelers\n• Comfortable walking shoes recommended\n• Tour operates rain or shine\n• Minimum 10 passengers required for tour to operate\n• Children under 5 not recommended\n• Itinerary may vary due to weather or traffic conditions"
                  rows="6"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Critical information travelers must know. This will be highlighted on the tour page.
                </p>
              </Field>
              
              <Field>
                <Label>🎁 Tour Packages (Optional Add-ons)</Label>
                <TextArea
                  value={(pkg.optionalPackages || []).map(p => 
                    `${p.name} | ${p.duration || ''} | ${p.adultPrice || ''} | ${p.childPrice || ''} | ${p.description || ''}`
                  ).join('\n')}
                  onChange={(e) => {
                    const packages = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                      const parts = line.split('|').map(s => s.trim());
                      return {
                        name: parts[0] || '',
                        duration: parts[1] || '',
                        adultPrice: parts[2] || '',
                        childPrice: parts[3] || '',
                        description: parts[4] || ''
                      };
                    });
                    handleUpdateSubPackage(pkgIndex, 'optionalPackages', packages);
                  }}
                  placeholder="Thames River Cruise | 1 Hour | £25 | £15 | Scenic cruise along the Thames&#10;London Eye Experience | 30 mins | £35 | £25 | 360° views of London&#10;Afternoon Tea | 2 Hours | £45 | £30 | Traditional English tea at a 5-star hotel"
                  rows="6"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Format: Name | Duration | Adult Price | Child Price | Description. Optional extras that can be added to this tour.
                </p>
              </Field>
              
              <Field>
                <Label>📖 Detailed Day-by-Day Itinerary (Full descriptions in paragraph form)</Label>
                <RichTextEditor
                  value={pkg.detailedItinerary || ''}
                  onChange={(val) => handleUpdateSubPackage(pkgIndex, 'detailedItinerary', val)}
                  placeholder="Enter detailed day-by-day itinerary. Use Bold for headings."
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Provide a full day-by-day breakdown with detailed descriptions. Use <strong>Bold</strong> for headings.
                </p>
              </Field>
              
              <Field>
                <Label>📍 Pick Up Points</Label>
                <RichTextEditor
                  value={pkg.pickupPoints || ''}
                  onChange={(val) => handleUpdateSubPackage(pkgIndex, 'pickupPoints', val)}
                  placeholder="Enter pick-up points. Use Bold for location names."
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  List pick-up locations. Use <strong>Bold</strong> for location names and add images if needed.
                </p>
              </Field>
              
              <Field>
                <Label>📜 Terms & Conditions</Label>
                <RichTextEditor
                  value={pkg.termsAndConditions || ''}
                  onChange={(val) => handleUpdateSubPackage(pkgIndex, 'termsAndConditions', val)}
                  placeholder="Enter terms and conditions. Use Bold for headings."
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Enter terms and conditions. Use <strong>Bold</strong> for headings.
                </p>
              </Field>
              
              <Field>
                <Label>📅 Tour Dates (with Date and Time, one per line)</Label>
                <TextArea
                  value={(pkg.tourDates || []).map(d => {
                    if (typeof d === 'object') {
                      return d.time ? `${d.date} | ${d.time}` : d.date;
                    }
                    return d;
                  }).join('\n')}
                  onChange={(e) => {
                    const dates = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                      const parts = line.split('|').map(s => s.trim());
                      return {
                        date: parts[0] || line.trim(),
                        time: parts[1] || ''
                      };
                    });
                    handleUpdateSubPackage(pkgIndex, 'tourDates', dates);
                  }}
                  placeholder="15th January 2026 | 10:00 AM&#10;22nd January 2026 | 9:30 AM&#10;29th January 2026 | 8:00 AM&#10;5th February 2026 | 10:00 AM"
                  rows="6"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Enter each date with time in format: Date | Time (e.g., "15th January 2026 | 10:00 AM"). One per line.
                </p>
              </Field>
            </SubPackageContent>
          </SubPackageContainer>
        ))}
        
        {/* Add New Sub-Package Button */}
        <Button 
          onClick={handleAddSubPackage}
          style={{ marginTop: '1rem' }}
        >
          + Add Package Option
        </Button>
      </div>
      
      {/* Gallery Images Section */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
        <h4 style={{ marginBottom: '1rem', color: '#6A1B82' }}>📸 Sidebar Gallery Images</h4>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
          Add destination images that will appear on the tour detail page sidebar (like Edinburgh Castle, Glasgow Cathedral, etc.)
        </p>
        
        {/* Existing Gallery Images */}
        {(details.galleryImages || []).length > 0 && (
          <GalleryGrid>
            {(details.galleryImages || []).map((item, index) => (
              <GalleryCard key={index}>
                <GalleryImage style={{ backgroundImage: item.image ? `url(${item.image})` : 'none' }}>
                  {!item.image && '📷'}
                </GalleryImage>
                <GalleryContent>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1f2937' }}>{item.title || 'Untitled'}</strong>
                  {item.description && (
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0.5rem' }}>{item.description}</p>
                  )}
                  <Button $variant="danger" onClick={() => handleRemoveGalleryImage(index)} style={{ width: '100%', fontSize: '0.8rem' }}>
                    Remove
                  </Button>
                </GalleryContent>
              </GalleryCard>
            ))}
          </GalleryGrid>
        )}
        
        {/* Add New Gallery Image */}
        <AddGalleryForm style={{ marginTop: '1rem' }}>
          <Label>Add New Gallery Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleGalleryFileChange}
          />
          {newGalleryItem.image && (
            <img src={newGalleryItem.image} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }} />
          )}
          <Input
            placeholder="Image Title (e.g., Edinburgh Castle)"
            value={newGalleryItem.title}
            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
          />
          <Input
            placeholder="Short Description (optional)"
            value={newGalleryItem.description}
            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
          />
          <Button onClick={handleAddGalleryImage} disabled={!newGalleryItem.image && !newGalleryItem.title}>
            + Add Image
          </Button>
        </AddGalleryForm>
      </div>
    </div>
  );
};

export default TourDetailsForm;
