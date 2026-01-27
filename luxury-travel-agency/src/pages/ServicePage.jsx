import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MapPinIcon, ArrowRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { servicesData } from '../data/servicesData';
import { fetchFrontendData, normalize, clearFrontendCache, getCachedData } from '../services/frontendData';
import { importAllCategories } from '../services/importData';
import { onDataChange } from '../services/jsonDatabase';

const PageContainer = styled.div`
  padding-top: 0;
`;

const HeroSection = styled.div`
  width: 100%;
  height: 450px;
  min-height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 4rem;
  overflow: hidden;
  border-radius: 30px;

  @media (max-width: 1024px) {
    height: 400px;
    border-radius: 25px;
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 280px;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    min-height: 220px;
    aspect-ratio: 4 / 3;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(0, 0, 0, 0.3) 40%,
      transparent 70%
    );
    z-index: 1;
    pointer-events: none;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  @media (max-width: 1024px) {
    img {
      object-position: center 30%;
    }
  }

  @media (max-width: 768px) {
    img {
      object-position: center 25%;
      min-height: 100%;
    }
  }

  @media (max-width: 480px) {
    img {
      object-position: center 20%;
      min-height: 100%;
    }
  }
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 800px;
  padding: 0 2rem;
  z-index: 2;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  font-family: 'Playfair Display', serif;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// Vertical layout for when no image is provided - About first, then Key Highlights below
const ContentSectionNoImage = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const DescriptionColumn = styled.div`
  h3 {
    font-size: 1.8rem;
    font-family: 'Playfair Display', serif;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #6A1B82, #9b4dca);
      border-radius: 2px;
    }
  }
  
  p, div {
    line-height: 1.9;
    color: #555;
    font-size: 1.1rem;
  }
`;

const HighlightsColumn = styled.div`
  background: linear-gradient(135deg, #f8f6fa 0%, #f0ebf5 100%);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(106, 27, 130, 0.1);
  
  h3 {
    font-size: 1.5rem;
    font-family: 'Playfair Display', serif;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, #6A1B82, #9b4dca);
      border-radius: 2px;
    }
  }
  
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.75rem;
  }
`;

const TextContent = styled.div`
  h2 {
    font-size: 2.5rem;
    font-family: 'Playfair Display', serif;

  a {
    margin-top: 1rem;
  }
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    
    span {
      color: #6A1B82;
    }
  
  a {
    margin-top: 1rem;
  }
    color: #666;
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  
  /* Rich text editor content styles */
  .ql-editor {
    padding: 0;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: #1a1a1a;
  }
  
  p {
    margin-bottom: 1rem;
    line-height: 1.8;
  }
  
  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 1.5rem 0;
  }
  
  blockquote {
    border-left: 4px solid #6A1B82;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #4a4a4a;
  }
  
  code {
    background: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  pre {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const FeatureItem = styled(motion.li)`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #4a4a4a;
  font-size: 1.05rem;

  &:before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: rgba(106, 27, 130, 0.1);
    color: #6A1B82;
    border-radius: 50%;
    margin-right: 1rem;
    font-weight: bold;
    font-size: 0.8rem;
  }
`;

const ImageContainer = styled(motion.div)`
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 500px;

  @media (max-width: 768px) {
    height: 300px;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    height: 250px;
    border-radius: 10px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  /* Purple accent border */
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid rgba(106, 27, 130, 0.2);
    border-radius: 20px;
    pointer-events: none;
  }
`;

const PackagesSection = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    font-family: 'Playfair Display', serif;
    color: #1a1a1a;
  }
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PackageCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 400px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;

  ${PackageCard}:hover & {
    transform: scale(1.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;

const PackageTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
`;

const PackageLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  font-size: 0.9rem;

  svg {
    width: 16px;
    height: 16px;
    color: #6A1B82;
  }
`;

const PackageDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
`;

const Price = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #6A1B82;
`;

const ExploreButton = styled(Link)`
  background: #6A1B82;
  border: 2px solid #6A1B82;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(106, 27, 130, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(106, 27, 130, 0.25);
  }
`;

const CTASection = styled.div`
  background: #f9fafb;
  padding: 5rem 2rem;
  text-align: center;
  margin-top: 2rem;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #6A1B82 0%, #6A1B82 100%);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 27, 130, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106, 27, 130, 0.4);
  }
`;

const NotFound = styled.div`
  height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  h1 {
    font-size: 3rem;
    color: #6A1B82;
    margin-bottom: 1rem;
  }

  p {
    color: #6b7280;
  }

  a {
    margin-top: 1rem;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 400px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    height: 300px;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    height: 250px;
  }
  text-decoration: none;
  display: block;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CategoryImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.5s ease;

  ${CategoryCard}:hover & {
    transform: scale(1.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
`;

const CategoryContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;

const CategoryName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
  color: #ffffff;
`;

const CategoryLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  font-size: 0.9rem;

  svg {
    width: 16px;
    height: 16px;
    color: #6A1B82;
  }
`;

const CategoryDesc = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ffffff;
`;

const CategoryFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
`;

const ViewDetailsButton = styled.div`
  background: #6A1B82;
  border: 2px solid #6A1B82;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  ${CategoryCard}:hover & {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(106, 27, 130, 0.3);
  }

  ${CategoryCard}:active & {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(106, 27, 130, 0.25);
  }
`;

const BookingFormSection = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1rem 2rem;
  }
`;

const BookingForm = styled.form`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 15px;
  }
`;

const FormTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #6A1B82;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FormSubtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6A1B82;
    background: white;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.1);
  }

  &::placeholder {
    color: #999;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 0.95rem;
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
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6A1B82;
    background: white;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 0.95rem;
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
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6A1B82;
    background: white;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.1);
  }

  &::placeholder {
    color: #999;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 0.95rem;
    min-height: 100px;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #6A1B82 0%, #7C2E9B 100%);
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
    box-shadow: 0 8px 25px rgba(106, 27, 130, 0.4);
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

const SelectionPanel = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
  background: #f9fafb;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SelectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SelectionTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #1f2937;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Chip = styled.button`
  border: 1px solid #e5e7eb;
  background: ${props => (props.$active ? '#6A1B82' : '#ffffff')};
  color: ${props => (props.$active ? '#ffffff' : '#1f2937')};
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(106, 27, 130, 0.15);
  }
`;

const VehicleHireGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const service = servicesData.find(s => s.id === id);
  
  // Use cached data immediately to avoid flash of loading state
  const cachedData = getCachedData();
  const [allCategories, setAllCategories] = useState(cachedData?.allCategories || []);
  const [tours, setTours] = useState(cachedData?.tours || []);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [seedingAttempted, setSeedingAttempted] = useState(false);
  
  // Booking form state (for airport-transfers page)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    pickupLocation: '',
    dropoffLocation: '',
    transferService: '',
    passengers: '',
    vehicleType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airportTransferCategories, setAirportTransferCategories] = useState([]);
  const [otherServicesCategories, setOtherServicesCategories] = useState([]);
  
  // Other Services form state
  const [otherServicesForm, setOtherServicesForm] = useState({
    name: '',
    email: '',
    phone: '',
    selectedService: '',
    message: ''
  });

  const TOUR_ROOT_SLUGS = [
    'uk-tours',
    'european-tours',
    'world-tours',
    'india-tours',
    'india-sri-lankan-tours',
    'sri-lanka-tours',
    'group-tours',
    'private-tours',
    'other-services',
    'cruises',
  ];

  const isTourRoot = (cat) => TOUR_ROOT_SLUGS.includes(normalize(cat?.slug || cat?.name || ''));

  const filterToursByCategory = (listId) => (tours || []).filter((t) => t.category_id === listId);

  const handleCategoryClick = (cat) => {
    setSelectedCategoryId(cat.id);
    setSelectedSubcategoryId(null);
  };

  const handleSubcategoryClick = (sub) => {
    setSelectedSubcategoryId(sub.id);
  };

  const findCategoryBySlug = (slug) => {
    console.log('🔍 findCategoryBySlug called with:', slug, '| allCategories count:', (allCategories || []).length);
    const found = (allCategories || []).find((c) => c.slug === slug || c.id === slug);
    console.log('🔍 Found category:', found?.name, '| Has image:', !!found?.image);
    return found;
  };

  const formatPrice = (value) => {
    if (value === 0 || value) {
      return `From £${value}`;
    }
    return 'From £—';
  };

  // Helper function to strip HTML tags from text
  const stripHtml = (html) => {
    if (!html) return '';
    // Create a temporary div element to parse HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // If the route id matches a category slug, build a service-like object so the page renders instead of 404
  const matchedCategory = React.useMemo(() => {
    if (!id || (allCategories || []).length === 0) return null;
    return (allCategories || []).find((c) => c.slug === id || c.id === id);
  }, [id, allCategories]);
  
  console.log('🖼️ matchedCategory for', id, ':', {
    name: matchedCategory?.name,
    hasImage: !!matchedCategory?.image,
    imageStart: matchedCategory?.image?.substring(0, 80),
    imageLength: matchedCategory?.image?.length,
    allCategoriesCount: (allCategories || []).length
  });
  
  // Compute derivedService with useMemo to react to category changes
  const derivedService = React.useMemo(() => {
    console.log('🔨 Building derivedService - service:', !!service, 'matchedCategory:', !!matchedCategory, 'id:', id);
    
    // PRIORITY: Database category over static servicesData for dynamic image support
    // Only use static servicesData if NO matching database category exists
    if (matchedCategory) {
      const imageToUse = matchedCategory.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80';
      // Don't fallback to hero image - content_image should be empty if not set
      const contentImageToUse = matchedCategory.content_image || '';
      console.log('🎯 derivedService building for', id, '| Image length:', imageToUse?.length, '| Content image:', contentImageToUse ? 'YES' : 'NONE');
      
      // Add cache busting for uploaded images
      let finalImage = imageToUse;
      if (imageToUse && imageToUse.startsWith('/uploads/')) {
        const timestamp = matchedCategory.updated_at ? new Date(matchedCategory.updated_at).getTime() : Date.now();
        finalImage = `${imageToUse}?v=${timestamp}`;
        console.log('🖼️ Added cache busting to image:', finalImage);
      }
      
      let finalContentImage = contentImageToUse;
      if (contentImageToUse && contentImageToUse.startsWith('/uploads/')) {
        const timestamp = matchedCategory.updated_at ? new Date(matchedCategory.updated_at).getTime() : Date.now();
        finalContentImage = `${contentImageToUse}?v=${timestamp}`;
      }
      
      // Parse highlights into features array
      let featuresArray = [];
      if (matchedCategory.highlights) {
        // Strip HTML and split by common delimiters
        const plainText = stripHtml(matchedCategory.highlights);
        // Split by commas, periods, or newlines
        featuresArray = plainText
          .split(/[,\n]|\. /)
          .map(item => item.trim())
          .filter(item => item.length > 3 && item.length < 200);
      }
      
      return {
        id: matchedCategory.slug || matchedCategory.id,
        title: matchedCategory.name,
        shortDescription: matchedCategory.description ? stripHtml(matchedCategory.description).substring(0, 200) : 'Browse experiences for this category.',
        fullDescription: matchedCategory.description || '',
        image: finalImage,
        content_image: finalContentImage,
        features: featuresArray,
        highlights: matchedCategory.highlights || '',
        packages: filterToursByCategory(matchedCategory.id).map((tour) => ({
          ...tour,
          price: tour.price,
        })),
        seo: {
          title: matchedCategory.name,
          description: matchedCategory.description || '',
        },
      };
    }
    
    if (id === 'tours') {
      // Check if we have a Tours category in the database with an image
      const toursCategory = (allCategories || []).find(c => c.slug === 'tours' || c.name === 'Tours');
      const toursImage = toursCategory?.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80';
      // Don't fallback to hero image - content_image should be empty if not set
      const toursContentImage = toursCategory?.content_image || '';
      
      // Add cache busting for uploaded images
      let finalToursImage = toursImage;
      if (toursImage && toursImage.startsWith('/uploads/')) {
        const timestamp = toursCategory?.updated_at ? new Date(toursCategory.updated_at).getTime() : Date.now();
        finalToursImage = `${toursImage}?v=${timestamp}`;
      }
      
      let finalContentImage = toursContentImage;
      if (toursContentImage && toursContentImage.startsWith('/uploads/')) {
        const timestamp = toursCategory?.updated_at ? new Date(toursCategory.updated_at).getTime() : Date.now();
        finalContentImage = `${toursContentImage}?v=${timestamp}`;
      }
      
      return {
        id: 'tours',
        title: 'Tours',
        shortDescription: toursCategory?.description ? stripHtml(toursCategory.description).substring(0, 200) : 'Explore our categories and packages.',
        fullDescription: toursCategory?.description || 'Browse all tour categories and drill down to see every package.',
        image: finalToursImage,
        content_image: finalContentImage,
        features: [],
        packages: [],
        seo: {
          title: 'Tours',
          description: toursCategory?.description || 'Discover tours by category and subcategory.',
        },
      };
    }
    
    // Fallback to static servicesData only if no database category matched
    if (service) return service;
    
    return null;
  }, [service, matchedCategory, id, allCategories]);

  useEffect(() => {
    if (derivedService) {
      document.title = `${derivedService.seo.title} | Luxury Travel Agency`;
      window.scrollTo(0, 0);
      
      // Check if this is an airport-transfers or other-services subcategory - redirect to main page
      if (matchedCategory && matchedCategory.parent_id) {
        const parentCategory = allCategories.find(c => c.id === matchedCategory.parent_id);
        const parentSlug = normalize(parentCategory?.slug || parentCategory?.name || '');
        
        if (parentSlug === 'airport-transfers') {
          // This is a subcategory of airport-transfers, redirect to main page
          navigate('/service/airport-transfers', { replace: true });
          return;
        }
        
        if (parentSlug === 'other-services') {
          // This is a subcategory of other-services, redirect to main page
          navigate('/service/other-services', { replace: true });
          return;
        }
        
        if (parentSlug === 'cruises') {
          // This is a subcategory of cruises, redirect to main page
          navigate('/service/cruises', { replace: true });
          return;
        }
      }
      
      // If this is an L2 subcategory (not a tour root) with packages, redirect to the first (and only) package
      // Tour roots like UK Tours should NOT redirect - they should show their L2 subcategories
      if (matchedCategory && matchedCategory.parent_id && !isTourRoot(matchedCategory) && derivedService.packages && derivedService.packages.length > 0) {
        const firstPackage = derivedService.packages[0];
        const packageSlug = firstPackage.slug || firstPackage.id;
        if (packageSlug) {
          navigate(`/package/${packageSlug}`, { replace: true });
        }
      }
    }
  }, [derivedService, matchedCategory, navigate, allCategories]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const populateAndSet = (cats, dbTours) => {
          setAllCategories(cats || []);
          setTours(dbTours || []);
          if (!selectedCategoryId && (cats || []).length > 0) {
            if (id === 'tours') {
              const tourRoots = (cats || []).filter((c) => !c.parent_id && isTourRoot(c));
              const firstTourRoot = tourRoots[0] || (cats || []).find((c) => !c.parent_id);
              if (firstTourRoot) {
                setSelectedCategoryId(firstTourRoot.id);
              }
            } else {
              const firstRoot = (cats || []).find((c) => !c.parent_id);
              if (firstRoot) {
                setSelectedCategoryId(firstRoot.id);
              }
            }
          }
        };

        const { allCategories: cats, tours: dbTours } = await fetchFrontendData();

        if ((cats || []).length === 0 && !seedingAttempted) {
          try {
            setSeedingAttempted(true);
            await importAllCategories();
            const { allCategories: seededCats, tours: seededTours } = await fetchFrontendData();
            populateAndSet(seededCats, seededTours);
            return;
          } catch (seedErr) {
            console.error('Seeding categories failed:', seedErr);
          }
        }

        populateAndSet(cats, dbTours);
      } catch (err) {
        console.error('Failed to load categories for Tours page', err);
        setAllCategories([]);
        setTours([]);
      }
    };
    
    // Load categories for this service page (safe no-op for non-tour pages)
    loadCategories();
    
    // Listen for database changes and reload
    const unsubscribe = onDataChange((type) => {
      console.log('ServicePage: Database changed, reloading...', type);
      if (type === 'categories' || type === 'tours') {
        // Clear cache and force refresh to get updated data
        clearFrontendCache();
        fetchFrontendData(true).then(({ allCategories: cats, tours: dbTours }) => {
          setAllCategories(cats || []);
          setTours(dbTours || []);
          console.log('🔄 Categories reloaded with fresh data, count:', (cats || []).length);
        });
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [id]);

  // Load airport transfer subcategories for booking form
  useEffect(() => {
    if (normalize(id) === 'airport-transfers') {
      const loadTransferCategories = async () => {
        try {
          const { allCategories: cats } = await fetchFrontendData();
          const airportTransfersMain = (cats || []).find(c => 
            normalize(c.slug || c.name || '') === 'airport-transfers'
          );
          
          if (airportTransfersMain) {
            const subcats = (cats || []).filter(c => 
              c.parent_id === airportTransfersMain.id
            ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            
            console.log('🔄 Loaded airport transfer subcategories:', subcats);
            setAirportTransferCategories(subcats);
          }
        } catch (err) {
          console.error('Error loading airport transfer categories:', err);
        }
      };
      
      loadTransferCategories();
      
      // Also listen for category changes to refresh
      const unsubscribe = onDataChange((type) => {
        if (type === 'categories') {
          console.log('🔄 Categories changed, reloading airport transfers...');
          loadTransferCategories();
        }
      });
      
      return () => unsubscribe();
    }
  }, [id]);

  // Load other-services subcategories for booking form
  useEffect(() => {
    if (normalize(id) === 'other-services') {
      const loadOtherServicesCategories = async () => {
        try {
          const { allCategories: cats } = await fetchFrontendData();
          const otherServicesMain = (cats || []).find(c => 
            normalize(c.slug || c.name || '') === 'other-services'
          );
          
          if (otherServicesMain) {
            const subcats = (cats || []).filter(c => 
              c.parent_id === otherServicesMain.id
            ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            
            console.log('🔄 Loaded other services subcategories:', subcats);
            setOtherServicesCategories(subcats);
          }
        } catch (err) {
          console.error('Error loading other services categories:', err);
        }
      };
      
      loadOtherServicesCategories();
      
      // Also listen for category changes to refresh
      const unsubscribe = onDataChange((type) => {
        if (type === 'categories') {
          console.log('🔄 Categories changed, reloading other services...');
          loadOtherServicesCategories();
        }
      });
      
      return () => unsubscribe();
    }
  }, [id]);

  // Handle booking form input changes
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Determine if this is airport transfer or vehicle hire
      const isAirportTransfer = normalize(id) === 'airport-transfers';
      const formType = isAirportTransfer ? 'Airport Transfer Booking' : 'Vehicle Hire Booking';
      
      // Build the message with all booking details
      const bookingDetails = `
${formType} Request

Name: ${bookingForm.name}
Email: ${bookingForm.email}
Phone: ${bookingForm.phone}

${isAirportTransfer ? `Pickup - Airport/Town: ${bookingForm.pickupLocation}
Drop-off: ${bookingForm.dropoffLocation}` : `Pickup Address: ${bookingForm.pickupAddress1}${bookingForm.pickupAddress2 ? ', ' + bookingForm.pickupAddress2 : ''}, ${bookingForm.pickupCity} ${bookingForm.pickupPostcode}
Pickup Date: ${bookingForm.pickupDate}
Pickup Time: ${bookingForm.pickupTime}`}

Passengers: ${bookingForm.passengers}
Vehicle Type: ${bookingForm.vehicleType}

${!isAirportTransfer && bookingForm.returnDate ? `Return Date: ${bookingForm.returnDate}
Return Time: ${bookingForm.returnTime}` : ''}

Additional Message: ${bookingForm.message || 'None'}
      `.trim();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          selectedPackage: formType,
          message: bookingDetails
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Thank you for your booking request! We will respond within 24 hours.');
        setBookingForm({
          name: '',
          email: '',
          phone: '',
          pickupLocation: '',
          dropoffLocation: '',
          transferService: '',
          passengers: '',
          vehicleType: '',
          message: '',
          pickupDate: '',
          pickupTime: '',
          pickupAddress1: '',
          pickupAddress2: '',
          pickupCity: '',
          pickupPostcode: '',
          dropoffSameAddress: '',
          dropoffAddress1: '',
          dropoffAddress2: '',
          dropoffCity: '',
          dropoffPostcode: '',
          returnDate: '',
          returnTime: ''
        });
      } else {
        alert(result.message || 'Failed to send booking request. Please try again or call us directly.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to send booking request: ' + (error.message || 'Network error. Please try again or call us directly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle other services form input changes
  const handleOtherServicesChange = (e) => {
    const { name, value } = e.target;
    setOtherServicesForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle other services form submission
  const handleOtherServicesSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formType = 'Other Services Enquiry';
      
      // Build the message with all enquiry details
      const enquiryDetails = `
${formType}

Name: ${otherServicesForm.name}
Email: ${otherServicesForm.email}
Phone: ${otherServicesForm.phone}

Selected Service: ${otherServicesForm.selectedService}

Message: ${otherServicesForm.message}
      `.trim();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: otherServicesForm.name,
          email: otherServicesForm.email,
          phone: otherServicesForm.phone,
          selectedPackage: formType,
          message: enquiryDetails
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Thank you for your enquiry! We will respond within 24 hours.');
        setOtherServicesForm({
          name: '',
          email: '',
          phone: '',
          selectedService: '',
          message: ''
        });
      } else {
        alert(result.message || 'Failed to send enquiry. Please try again or call us directly.');
      }
    } catch (error) {
      console.error('Error submitting other services enquiry:', error);
      alert('Failed to send enquiry: ' + (error.message || 'Network error. Please try again or call us directly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const rootCategories = (allCategories || [])
    .filter((c) => !c.parent_id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const displayRootCategories = (() => {
    if (id !== 'tours') {
      // When on a specific tour root (e.g., /service/uk-tours), ensure it is present
      if (matchedCategory && !matchedCategory.parent_id && !rootCategories.find((c) => c.id === matchedCategory.id)) {
        return [matchedCategory, ...rootCategories];
      }
      return rootCategories;
    }
    const tourRoots = rootCategories.filter((c) => isTourRoot(c));
    if (tourRoots.length) {
      // Include the matched category if not already captured
      if (matchedCategory && !matchedCategory.parent_id && !tourRoots.find((c) => c.id === matchedCategory.id)) {
        return [matchedCategory, ...tourRoots];
      }
      return tourRoots;
    }
    return rootCategories;
  })();

  const shouldShowSubcategories = id === 'tours' || (matchedCategory && isTourRoot(matchedCategory));
  
  console.log('🎯 shouldShowSubcategories check:', {
    id,
    shouldShowSubcategories,
    matchedCategoryName: matchedCategory?.name,
    matchedCategorySlug: matchedCategory?.slug,
    isTourRootResult: matchedCategory ? isTourRoot(matchedCategory) : 'no matchedCategory',
    normalizedSlug: matchedCategory ? normalize(matchedCategory.slug || matchedCategory.name || '') : 'N/A'
  });

  const selectedCategoryIdToUse = matchedCategory?.id
    || (displayRootCategories.some((c) => c.id === selectedCategoryId)
      ? selectedCategoryId
      : displayRootCategories[0]?.id)
    || null;

  // Prefer the matched tour root even if it lives under a parent (e.g., /service/uk-tours)
  const selectedCategory = (() => {
    if (matchedCategory && isTourRoot(matchedCategory)) {
      return matchedCategory;
    }
    return displayRootCategories.find((c) => c.id === selectedCategoryIdToUse) || null;
  })();
  const activeParentId = matchedCategory && isTourRoot(matchedCategory)
    ? matchedCategory.id
    : selectedCategoryIdToUse;

  // Find the "Tours" main category to get its children (UK Tours, European Tours, etc.)
  const toursMainCategory = (allCategories || []).find(c => 
    normalize(c.slug || c.name || '') === 'tours'
  );
  
  // L1 tour categories are children of the "Tours" main category
  const l1TourCategories = toursMainCategory
    ? (allCategories || [])
        .filter((c) => c.parent_id === toursMainCategory.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];

  // Custom airport order for airport-transfers
  const airportOrder = {
    'heathrow-lhr': 1,
    'gatwick-lgw': 2,
    'stansted-airport-stn': 3,
    'luton-airport-ltn': 4,
    'city-airport-lcy': 5
  };

  // Custom vehicle order for vehicle-hire
  const vehicleOrder = {
    'saloon-car': 1,
    'estate-car': 2,
    'mpv': 3,
    'mpv-plus': 4,
    '8-seater': 5,
    '16-seater': 6,
    '23-seater': 7,
    '33-seater': 8,
    '51-seater': 9,
    '83-seater': 10
  };

  // When on /service/tours, show L1 tour categories (UK Tours, European Tours, etc.)
  // When on /service/uk-tours, show L2 subcategories (Scotland, Wales, etc.)
  const childCategories = id === 'tours'
    ? l1TourCategories // Show L1 tour categories on Tours page
    : (allCategories || [])
        .filter((c) => c.parent_id === activeParentId)
        .sort((a, b) => {
          const normalizedSlug = normalize(a.slug || a.name || '');
          const normalizedSlugB = normalize(b.slug || b.name || '');
          
          // Special sorting for airport-transfers: use custom order
          if (id === 'airport-transfers' || (matchedCategory && normalize(matchedCategory.slug || matchedCategory.name || '') === 'airport-transfers')) {
            const orderA = airportOrder[normalizedSlug] || 999;
            const orderB = airportOrder[normalizedSlugB] || 999;
            return orderA - orderB;
          }
          
          // Special sorting for vehicle-hire: use custom order
          if (id === 'vehicle-hire' || (matchedCategory && normalize(matchedCategory.slug || matchedCategory.name || '') === 'vehicle-hire')) {
            const orderA = vehicleOrder[normalizedSlug] || 999;
            const orderB = vehicleOrder[normalizedSlugB] || 999;
            return orderA - orderB;
          }
          
          // Default sorting by sort_order field
          return (a.sort_order || 0) - (b.sort_order || 0);
        });

  console.log('🔍 ServicePage childCategories:', {
    id,
    activeParentId,
    matchedCategoryName: matchedCategory?.name,
    childCategoriesCount: childCategories.length,
    childCategories: childCategories.map(c => ({ name: c.name, hasImage: !!c.image, imageStart: c.image?.substring(0, 30) }))
  });

  console.log('ServicePage Debug:', {
    id,
    matchedCategory: matchedCategory?.name,
    matchedCategoryId: matchedCategory?.id,
    matchedCategoryParentId: matchedCategory?.parent_id,
    isTourRoot: matchedCategory ? isTourRoot(matchedCategory) : false,
    selectedCategory: selectedCategory?.name,
    activeParentId,
    childCategoriesCount: childCategories.length,
    childCategoryNames: childCategories.map(c => c.name),
    toursMainCategory: toursMainCategory?.name,
    l1TourCategoriesCount: l1TourCategories.length,
    l1TourCategoryNames: l1TourCategories.map(c => c.name),
    shouldShowSubcategories,
    allCategoriesCount: allCategories.length,
  });

  const selectedSubcategory = (allCategories || []).find((c) => c.id === selectedSubcategoryId) || null;
  const subChildCategories = (allCategories || [])
    .filter((c) => c.parent_id === selectedSubcategoryId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const renderTours = (items) => {
    if (!items || items.length === 0) {
      return <p style={{ color: '#6b7280' }}>No packages yet for this category.</p>;
    }

    return (
      <PackagesGrid>
        {items.map((tour, index) => (
          <PackageCard
            key={tour.id || tour.slug || index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <CardImage image={tour.featured_image || tour.image} />
            <CardContent>
              <PackageTitle>{tour.title}</PackageTitle>
              {tour.location && (
                <PackageLocation>
                  <MapPinIcon />
                  {tour.location}
                </PackageLocation>
              )}
              {tour.description && <PackageDescription>{tour.description}</PackageDescription>}
              <CardFooter>
                <Price>{formatPrice(tour.price)}</Price>
                <ExploreButton to={`/package/${tour.slug || tour.id}`}>
                  View Details
                  <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                </ExploreButton>
              </CardFooter>
            </CardContent>
          </PackageCard>
        ))}
      </PackagesGrid>
    );
  };


  // When navigating directly to a category slug, select it in the UI
  useEffect(() => {
    if (matchedCategory) {
      // If this is a tour root (e.g., UK Tours under Tours), select it directly so L2 shows
      if (isTourRoot(matchedCategory)) {
        setSelectedCategoryId(matchedCategory.id);
        setSelectedSubcategoryId(null);
        return;
      }

      const parentId = matchedCategory.parent_id;
      if (parentId) {
        setSelectedCategoryId(parentId);
        setSelectedSubcategoryId(matchedCategory.id);
      } else {
        setSelectedCategoryId(matchedCategory.id);
        setSelectedSubcategoryId(null);
      }
    }
  }, [matchedCategory]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sub = params.get('sub');
    if (sub && (allCategories || []).length > 0) {
      const subCat = (allCategories || []).find((c) => c.slug === sub || c.id === sub);
      if (subCat) {
        setSelectedCategoryId(subCat.parent_id || selectedCategoryId);
        setSelectedSubcategoryId(subCat.id);
      }
    }
  }, [location.search, allCategories]);

  const getImage = (item) => {
    const img = item?.image || item?.featured_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80';
    // Add timestamp to base64 images to prevent caching
    if (img && img.startsWith('data:image')) {
      return img; // Base64 images don't need cache busting
    }
    // Add cache busting for uploaded images using updated_at timestamp
    if (img && img.startsWith('/uploads/')) {
      const timestamp = item?.updated_at ? new Date(item.updated_at).getTime() : Date.now();
      return `${img}?v=${timestamp}`;
    }
    return img;
  };

  // Decide which tours to show based on selection: prefer subcategory -> category -> all
  const toursToRender = id === 'tours'
    ? (selectedSubcategoryId
        ? filterToursByCategory(selectedSubcategoryId)
        : selectedCategoryIdToUse
          ? filterToursByCategory(selectedCategoryIdToUse)
          : tours)
    : (derivedService?.packages || []);

  if (!derivedService) {
    // Show loading state with category name from URL
    const categoryName = id
      ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Loading';
    
    return (
      <PageContainer>
        <HeroSection>
          <HeroBackground>
            <img 
              src="/logo.png" 
              alt="Loading" 
              style={{ objectFit: 'contain', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            />
          </HeroBackground>
          <HeroContent>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {categoryName}
            </Title>
            <Subtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Loading...
            </Subtitle>
          </HeroContent>
        </HeroSection>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <HeroBackground>
          <img src={derivedService.image} alt={derivedService.title} />
        </HeroBackground>
        <HeroContent>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {derivedService.title}
          </Title>
          {/* Description hidden from hero for all categories - shown in content section instead */}
        </HeroContent>
      </HeroSection>

      {/* Check if there's a valid content image (not just hero fallback) */}
      {(() => {
        const contentImg = derivedService.content_image || derivedService.contentImage;
        const hasContentImage = contentImg && contentImg.trim() !== '' && !contentImg.includes('unsplash.com');
        
        if (hasContentImage) {
          // Original 2-column layout with image
          return (
            <ContentSection>
              <TextContent>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: derivedService.fullDescription }}
                    style={{ lineHeight: '1.8', color: '#666', fontSize: '1.1rem' }}
                  />
                  
                  {derivedService.features && derivedService.features.length > 0 && (
                    <>
                      <h3>Key Highlights</h3>
                      <FeaturesList>
                        {derivedService.features.map((feature, index) => (
                          <FeatureItem
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            {feature}
                          </FeatureItem>
                        ))}
                      </FeaturesList>
                    </>
                  )}
                </motion.div>
              </TextContent>

              <ImageContainer
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <img src={contentImg} alt={derivedService.title} />
              </ImageContainer>
            </ContentSection>
          );
        } else {
          // Vertical layout: About first, then Key Highlights below (no image)
          return (
            <ContentSectionNoImage>
              <DescriptionColumn>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: derivedService.fullDescription }}
                  />
                </motion.div>
              </DescriptionColumn>

              {derivedService.features && derivedService.features.length > 0 && (
                <HighlightsColumn>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h3>Key Highlights</h3>
                    <FeaturesList>
                      {derivedService.features.map((feature, index) => (
                        <FeatureItem
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          {feature}
                        </FeatureItem>
                      ))}
                    </FeaturesList>
                  </motion.div>
                </HighlightsColumn>
              )}
            </ContentSectionNoImage>
          );
        }
      })()}

      {/* Airport Transfers special layout with booking form */}
      {(() => {
        const normalizedId = normalize(id);
        const hasChildren = childCategories.length > 0;
        const shouldShow = normalizedId === 'airport-transfers' && hasChildren;
        console.log('🚕 Airport section check:', { id, normalizedId, hasChildren, childCategoriesLength: childCategories.length, shouldShow });
        return shouldShow;
      })() && (
        <BookingFormSection>
          {/* Left side - Subcategory cards */}
          <div>
            <SectionHeader style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Our Transfer Services
              </motion.h2>
            </SectionHeader>
            <CategoryGrid style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {childCategories.map((sub, index) => {
                const slug = sub.slug || sub.id || normalize(sub.name || '');
                const subImage = getImage(sub);
                const location = sub.location || null;
                
                console.log('🖼️ Airport transfer subcategory:', sub.name, 'Image:', sub.image?.substring(0, 50));
                
                const handleClick = (e) => {
                  // Prevent navigation for airport-transfers subcategories
                  e.preventDefault();
                  
                  if (e.ctrlKey || e.metaKey) {
                    // Allow admin edit with Ctrl/Cmd+Click
                    navigate(`/admin?tab=subcategories&edit=${sub.id}`);
                  }
                  // Otherwise, do nothing - stay on current page
                };
                
                return (
                  <CategoryCard
                    key={slug}
                    as={motion.div}
                    onClick={handleClick}
                    style={{ cursor: 'default' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CategoryImage $image={subImage} />
                    <CategoryContent>
                      <CategoryName>{sub.name}</CategoryName>
                      {sub.description && <CategoryDesc>{sub.description}</CategoryDesc>}
                    </CategoryContent>
                  </CategoryCard>
                );
              })}
            </CategoryGrid>
          </div>

          {/* Right side - Booking form */}
          <div>
            <BookingForm onSubmit={handleBookingSubmit}>
              <FormTitle>Book Your Transfer</FormTitle>
              <FormSubtitle>
                Complete the form below and we'll contact you within 24 hours.
              </FormSubtitle>
              
              <FormGroup>
                <FormLabel htmlFor="name">Full Name *</FormLabel>
                <FormInput
                  type="text"
                  id="name"
                  name="name"
                  value={bookingForm.name}
                  onChange={handleBookingInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="email">Email *</FormLabel>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={bookingForm.email}
                  onChange={handleBookingInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="phone">Phone *</FormLabel>
                <FormInput
                  type="tel"
                  id="phone"
                  name="phone"
                  value={bookingForm.phone}
                  onChange={handleBookingInputChange}
                  required
                  placeholder="+44 123 456 7890"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="pickupLocation">Pickup - Airport/Town *</FormLabel>
                <FormInput
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  value={bookingForm.pickupLocation}
                  onChange={handleBookingInputChange}
                  required
                  placeholder="e.g., Heathrow T5"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="dropoffLocation">Drop-off *</FormLabel>
                <FormInput
                  type="text"
                  id="dropoffLocation"
                  name="dropoffLocation"
                  value={bookingForm.dropoffLocation}
                  onChange={handleBookingInputChange}
                  required
                  placeholder="e.g., London Hotel"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="passengers">Passengers *</FormLabel>
                <FormInput
                  type="number"
                  id="passengers"
                  name="passengers"
                  value={bookingForm.passengers}
                  onChange={handleBookingInputChange}
                  required
                  min="1"
                  max="50"
                  placeholder="1"
                />
              </FormGroup>

              {/* Vehicle Type Selection - Conditional based on passengers */}
              <FormGroup>
                <FormLabel htmlFor="vehicleType">Choose Vehicle Type *</FormLabel>
                {parseInt(bookingForm.passengers) > 16 ? (
                  <div style={{
                    padding: '1rem',
                    background: '#fff3cd',
                    border: '2px solid #ffc107',
                    borderRadius: '10px',
                    color: '#856404',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    📞 For more than 16 passengers, please contact us via call or email
                  </div>
                ) : (
                  <FormSelect
                    id="vehicleType"
                    name="vehicleType"
                    value={bookingForm.vehicleType}
                    onChange={handleBookingInputChange}
                    required
                    disabled={!bookingForm.passengers}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="saloon-car">Saloon Car</option>
                    <option value="estate-car">Estate Car</option>
                    <option value="mpv">MPV</option>
                    <option value="mpv-plus">MPV+</option>
                    <option value="8-seater">8 Seater</option>
                    <option value="16-seater">16 Seater</option>
                  </FormSelect>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="message">Additional Notes</FormLabel>
                <FormTextarea
                  id="message"
                  name="message"
                  value={bookingForm.message}
                  onChange={handleBookingInputChange}
                  placeholder="Special requests..."
                  rows="3"
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    Book Transfer
                    <PaperAirplaneIcon />
                  </>
                )}
              </SubmitButton>
            </BookingForm>
          </div>
        </BookingFormSection>
      )}

      {/* Vehicle Hire subcategory cards with booking form */}
      {normalize(id) === 'vehicle-hire' && childCategories.length > 0 && (
        <PackagesSection>
          {console.log('🚗 Vehicle-hire section rendering with', childCategories.length, 'vehicles')}
          <SectionHeader style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Vehicle Options
            </motion.h2>
          </SectionHeader>
          
          <VehicleHireGrid>
            {/* Left side - Vehicle cards */}
            <CategoryGrid>
              {childCategories.map((sub, index) => {
                const slug = sub.slug || sub.id || normalize(sub.name || '');
                const subImage = getImage(sub);
                const location = sub.location || null;
                
                const handleClick = (e) => {
                  // Prevent navigation for vehicle-hire subcategories
                  e.preventDefault();
                  
                  if (e.ctrlKey || e.metaKey) {
                    // Allow admin edit with Ctrl/Cmd+Click
                    navigate(`/admin?tab=subcategories&edit=${sub.id}`);
                  }
                  // Otherwise, do nothing - stay on current page
                };
                
                return (
                  <CategoryCard
                    key={slug}
                    as={motion.div}
                    onClick={handleClick}
                    style={{ cursor: 'default' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CategoryImage $image={subImage} />
                    <CategoryContent>
                      <CategoryName>{sub.name}</CategoryName>
                      {sub.description && <CategoryDesc>{sub.description}</CategoryDesc>}
                    </CategoryContent>
                  </CategoryCard>
                );
              })}
            </CategoryGrid>

            {/* Right side - Booking form */}
            <BookingForm onSubmit={handleBookingSubmit}>
              <FormTitle>Book Now</FormTitle>
              <FormSubtitle>
                To book your vehicle hire, either give us a call on 020 8830 8611 or fill out the form below with your preferred dates and vehicle choice. We'll get back to you within one working day to discuss further.
              </FormSubtitle>

              <FormGroup>
                <FormLabel htmlFor="vh-name">Name *</FormLabel>
                <FormInput
                  type="text"
                  id="vh-name"
                  name="name"
                  placeholder="Your full name"
                  value={bookingForm.name}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="vh-email">Email *</FormLabel>
                <FormInput
                  type="email"
                  id="vh-email"
                  name="email"
                  placeholder="Your email address"
                  value={bookingForm.email}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="vh-phone">Phone *</FormLabel>
                <FormInput
                  type="tel"
                  id="vh-phone"
                  name="phone"
                  placeholder="Your phone number"
                  value={bookingForm.phone}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="pickupDate">Pick Up Date *</FormLabel>
                <FormInput
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={bookingForm.pickupDate}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="pickupTime">Pick Up Time *</FormLabel>
                <FormInput
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={bookingForm.pickupTime}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="pickupAddress1">Pick Up Address *</FormLabel>
                <FormInput
                  type="text"
                  id="pickupAddress1"
                  name="pickupAddress1"
                  placeholder="Address Line 1"
                  value={bookingForm.pickupAddress1}
                  onChange={handleBookingChange}
                  required
                />
                <FormInput
                  type="text"
                  name="pickupAddress2"
                  placeholder="Address Line 2 (Optional)"
                  value={bookingForm.pickupAddress2}
                  onChange={handleBookingChange}
                  style={{ marginTop: '0.5rem' }}
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <FormLabel htmlFor="pickupCity">City *</FormLabel>
                  <FormInput
                    type="text"
                    id="pickupCity"
                    name="pickupCity"
                    placeholder="City"
                    value={bookingForm.pickupCity}
                    onChange={handleBookingChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="pickupPostcode">Postcode *</FormLabel>
                  <FormInput
                    type="text"
                    id="pickupPostcode"
                    name="pickupPostcode"
                    placeholder="Postal / Zip Code"
                    value={bookingForm.pickupPostcode}
                    onChange={handleBookingChange}
                    required
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <FormLabel htmlFor="dropoffAddress1">Drop Off Address *</FormLabel>
                <FormInput
                  type="text"
                  id="dropoffAddress1"
                  name="dropoffAddress1"
                  placeholder="Address Line 1"
                  value={bookingForm.dropoffAddress1}
                  onChange={handleBookingChange}
                  required
                />
                <FormInput
                  type="text"
                  name="dropoffAddress2"
                  placeholder="Address Line 2 (Optional)"
                  value={bookingForm.dropoffAddress2}
                  onChange={handleBookingChange}
                  style={{ marginTop: '0.5rem' }}
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <FormLabel htmlFor="dropoffCity">City *</FormLabel>
                  <FormInput
                    type="text"
                    id="dropoffCity"
                    name="dropoffCity"
                    placeholder="City"
                    value={bookingForm.dropoffCity}
                    onChange={handleBookingChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="dropoffPostcode">Postcode *</FormLabel>
                  <FormInput
                    type="text"
                    id="dropoffPostcode"
                    name="dropoffPostcode"
                    placeholder="Postal / Zip Code"
                    value={bookingForm.dropoffPostcode}
                    onChange={handleBookingChange}
                    required
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <FormLabel htmlFor="returnDate">Return Date *</FormLabel>
                <FormInput
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={bookingForm.returnDate}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="returnTime">Return Time *</FormLabel>
                <FormInput
                  type="time"
                  id="returnTime"
                  name="returnTime"
                  value={bookingForm.returnTime}
                  onChange={handleBookingChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="passengers">Number of Passengers / Luggage *</FormLabel>
                <FormInput
                  type="number"
                  id="passengers"
                  name="passengers"
                  placeholder="Number of passengers"
                  value={bookingForm.passengers}
                  onChange={handleBookingChange}
                  required
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="vehicleType">Vehicle Type *</FormLabel>
                <FormSelect
                  id="vehicleType"
                  name="vehicleType"
                  value={bookingForm.vehicleType}
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  {childCategories.map(sub => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Sending...' : 'Submit Booking Request →'}
              </SubmitButton>
            </BookingForm>
          </VehicleHireGrid>
        </PackagesSection>
      )}

      {/* Other Services subcategory cards with enquiry form */}
      {normalize(id) === 'other-services' && childCategories.length > 0 && (
        <PackagesSection>
          {console.log('🔧 Other-services section rendering with', childCategories.length, 'services')}
          <SectionHeader style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Services
            </motion.h2>
          </SectionHeader>
          
          <VehicleHireGrid>
            {/* Left side - Service cards */}
            <CategoryGrid>
              {childCategories.map((sub, index) => {
                const slug = sub.slug || sub.id || normalize(sub.name || '');
                const subImage = getImage(sub);
                const location = sub.location || null;
                
                const handleClick = (e) => {
                  // Prevent navigation for other-services subcategories
                  e.preventDefault();
                  
                  if (e.ctrlKey || e.metaKey) {
                    // Allow admin edit with Ctrl/Cmd+Click
                    navigate(`/admin?tab=subcategories&edit=${sub.id}`);
                  }
                  // Otherwise, do nothing - stay on current page
                };
                
                return (
                  <CategoryCard
                    key={slug}
                    as={motion.div}
                    onClick={handleClick}
                    style={{ cursor: 'default' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CategoryImage $image={subImage} />
                    <CategoryContent>
                      <CategoryName>{sub.name}</CategoryName>
                      {sub.description && <CategoryDesc>{sub.description}</CategoryDesc>}
                    </CategoryContent>
                  </CategoryCard>
                );
              })}
            </CategoryGrid>

            {/* Right side - Enquiry form */}
            <BookingForm onSubmit={handleOtherServicesSubmit}>
              <FormTitle>Enquire Now</FormTitle>
              <FormSubtitle>
                For enquiries about our services, please fill out the form below. We'll get back to you within 24 hours.
              </FormSubtitle>

              <FormGroup>
                <FormLabel htmlFor="os-name">Name *</FormLabel>
                <FormInput
                  type="text"
                  id="os-name"
                  name="name"
                  placeholder="Your full name"
                  value={otherServicesForm.name}
                  onChange={handleOtherServicesChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="os-email">Email *</FormLabel>
                <FormInput
                  type="email"
                  id="os-email"
                  name="email"
                  placeholder="Your email address"
                  value={otherServicesForm.email}
                  onChange={handleOtherServicesChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="os-phone">Phone *</FormLabel>
                <FormInput
                  type="tel"
                  id="os-phone"
                  name="phone"
                  placeholder="Your phone number"
                  value={otherServicesForm.phone}
                  onChange={handleOtherServicesChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="os-service">Select Service *</FormLabel>
                <FormSelect
                  id="os-service"
                  name="selectedService"
                  value={otherServicesForm.selectedService}
                  onChange={handleOtherServicesChange}
                  required
                >
                  <option value="">Select a Service</option>
                  {childCategories.map(sub => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="os-message">Message *</FormLabel>
                <FormTextarea
                  id="os-message"
                  name="message"
                  placeholder="Please provide details about your enquiry..."
                  value={otherServicesForm.message}
                  onChange={handleOtherServicesChange}
                  required
                  rows={5}
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Sending...' : 'Submit Enquiry →'}
              </SubmitButton>
            </BookingForm>
          </VehicleHireGrid>
        </PackagesSection>
      )}

      {shouldShowSubcategories && childCategories.length > 0 && normalize(id) !== 'airport-transfers' && normalize(id) !== 'vehicle-hire' && normalize(id) !== 'other-services' && (
            <PackagesSection>
              <SectionHeader>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  {id === 'tours' ? 'Tour Categories' : `${selectedCategory?.name || derivedService.title}`}
                </motion.h2>
              </SectionHeader>
              <CategoryGrid>
                {childCategories.map((sub, index) => {
                  const slug = sub.slug || sub.id || normalize(sub.name || '');
                  const isOtherServices = normalize(id) === 'other-services';
                  const isSriLankaTours = normalize(id) === 'sri-lanka-tours';
                  const isCruises = normalize(id) === 'cruises';
                  const isPrivateTours = normalize(id) === 'private-tours';
                  const linkTarget = (isOtherServices || isSriLankaTours) ? '/contact-us' : (isCruises ? '/service/cruises' : (isPrivateTours ? '/service/private-tours' : `/service/${slug}`));
                  const subImage = getImage(sub);
                  const location = sub.location || null;
                  
                  const handleClick = (e) => {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      navigate(`/admin?tab=subcategories&edit=${sub.id}`);
                    }
                  };
                  
                  return (
                    <CategoryCard
                      key={slug}
                      as={Link}
                      to={linkTarget}
                      onClick={handleClick}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <CategoryImage $image={subImage} />
                      <CategoryContent>
                        <CategoryName>{sub.name}</CategoryName>
                        {location && (
                          <CategoryLocation>
                            <MapPinIcon />
                            {location}
                          </CategoryLocation>
                        )}
                        <CategoryFooter>
                          <ViewDetailsButton>
                            {(isOtherServices || isSriLankaTours || isPrivateTours) ? 'Enquire Now' : 'View Details'}
                            <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                          </ViewDetailsButton>
                        </CategoryFooter>
                      </CategoryContent>
                    </CategoryCard>
                  );
                })}
              </CategoryGrid>
            </PackagesSection>
      )}

      {toursToRender && toursToRender.length > 0 && !shouldShowSubcategories && (
        <PackagesSection>
          <SectionHeader>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Available Packages
            </motion.h2>
          </SectionHeader>
          <PackagesGrid>
            {toursToRender.map((pkg, index) => {
              const img = pkg.image || pkg.featured_image;
              const priceLabel = typeof pkg.price === 'number' ? formatPrice(pkg.price) : (pkg.price || 'From £—');
              const linkId = pkg.slug || pkg.id;
              return (
                <PackageCard
                  key={linkId || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CardImage image={img} />
                  <CardContent>
                    <PackageTitle>{pkg.title}</PackageTitle>
                    {pkg.location && (
                      <PackageLocation>
                        <MapPinIcon />
                        {pkg.location}
                      </PackageLocation>
                    )}
                    {pkg.description && <PackageDescription>{pkg.description}</PackageDescription>}
                    <CardFooter>
                      <Price>{priceLabel}</Price>
                      <ExploreButton to={`/package/${linkId}`}>
                        View Details
                        <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                      </ExploreButton>
                    </CardFooter>
                  </CardContent>
                </PackageCard>
              );
            })}
          </PackagesGrid>
        </PackagesSection>
      )}

      <CTASection>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '1rem', color: '#1a1a1a' }}>
            Ready to Plan Your Trip?
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Contact our travel experts today to customize your {derivedService.title} experience.
          </p>
          <CTAButton to="/contact-us">Inquire Now</CTAButton>
        </motion.div>
      </CTASection>
    </PageContainer>
  );
};

export default ServicePage;
