import React from 'react';
import styled from 'styled-components';
import Hero from '../components/sections/Hero';
import TourPackages from '../components/sections/TourPackages';

const PageTitle = styled.div`
  background: linear-gradient(135deg, #6A1B82 0%, #4a1259 100%);
  color: white;
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 0;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  p {
    font-size: 1.1rem;
    margin-top: 0.5rem;
    opacity: 0.9;
  }
`;

const ToursPage = () => {
  return (
    <>
      <Hero />
      <PageTitle>
        <h1>Our Tours</h1>
        <p>Explore our exclusive tour packages</p>
      </PageTitle>
      <TourPackages />
    </>
  );
};

export default ToursPage;
