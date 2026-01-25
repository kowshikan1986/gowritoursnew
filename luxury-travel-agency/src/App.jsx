import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import Home from './pages/Home';
import ContactUs from './pages/ContactUs';
import Destinations from './components/sections/Destinations';
import Accommodation from './pages/Accommodation';
import ServicePage from './pages/ServicePage';
import PackageDetailPage from './pages/PackageDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import CategoryEditPage from './pages/CategoryEditPage';
import TermsPage from './pages/TermsPage';
import { fetchFrontendData } from './services/frontendData';

const AppContainer = styled.div`
  min-height: 100vh;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  padding-top: ${props => props.$noHeader ? '0' : '80px'};
`;

function App() {
  // Preload data on app startup for instant first page load
  useEffect(() => {
    fetchFrontendData(); // Start loading data immediately
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <AppContainer>
      {!isAdminPage && <Header />}
      <MainContent $noHeader={isAdminPage}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Airport transfer subcategories redirect to parent */}
          <Route path="/service/heathrow-lhr" element={<Navigate to="/service/airport-transfers" replace />} />
          <Route path="/service/gatwick-lgw" element={<Navigate to="/service/airport-transfers" replace />} />
          <Route path="/service/stansted-airport-stn" element={<Navigate to="/service/airport-transfers" replace />} />
          <Route path="/service/luton-airport-ltn" element={<Navigate to="/service/airport-transfers" replace />} />
          <Route path="/service/city-airport-lcy" element={<Navigate to="/service/airport-transfers" replace />} />
          <Route path="/service/meet-greet-service" element={<Navigate to="/service/airport-transfers" replace />} />
          <Route path="/service/fleet-classes" element={<Navigate to="/service/airport-transfers" replace />} />
          
          {/* Vehicle hire subcategories redirect to parent */}
          <Route path="/service/mpv" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/8-seater" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/16-seater" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/23-seater" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/33-seater" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/51-seater" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/83-seater" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/estate-car" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/executive-suv" element={<Navigate to="/service/vehicle-hire" replace />} />
          <Route path="/service/premium-suv" element={<Navigate to="/service/vehicle-hire" replace />} />
          
          <Route path="/service/:id" element={<ServicePage />} />
          <Route path="/package/:id" element={<PackageDetailPage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/category/edit/:id" element={<CategoryEditPage />} />
        </Routes>
      </MainContent>
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <Footer />}
    </AppContainer>
  );
}

export default App;
