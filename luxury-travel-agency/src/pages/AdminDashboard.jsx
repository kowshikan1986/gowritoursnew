import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/common/RichTextEditor';
import HierarchicalSubcategoryView from '../components/admin/HierarchicalSubcategoryView';
import TourDetailsForm from '../components/admin/TourDetailsForm';
import {
  initDatabase,
  getTours,
  getCategories,
  getHeroBanners,
  getLogos,
  getAds,
  getSettings,
  updateSettings,
  createTour,
  updateTour,
  deleteTour,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoryByName,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  createLogo,
  updateLogo,
  deleteLogo,
  exportDatabase,
  importDatabase,
} from '../services/jsonDatabase';
import { clearFrontendCache } from '../services/frontendData';
import { importAllCategories } from '../services/importData';

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: ${(p) => (p.$active ? '#6A1B82' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : '#111827')};
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

const Flex = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 220px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  min-height: 90px;
  font-size: 0.95rem;
`;

const Select = styled.select`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
`;

const Button = styled.button`
  padding: 0.75rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  background: ${(p) => (p.$variant === 'outline' ? '#fff' : '#6A1B82')};
  color: ${(p) => (p.$variant === 'outline' ? '#111827' : '#fff')};
  border: ${(p) => (p.$variant === 'outline' ? '1px solid #d1d5db' : 'none')};
  box-shadow: ${(p) =>
    p.$variant === 'outline' ? 'none' : '0 10px 20px rgba(106,27,130,0.25)'};
`;

const List = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const Item = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #6A1B82;
    box-shadow: 0 4px 12px rgba(106, 27, 130, 0.1);
    background: #fafafa;
  }
`;

const Tag = styled.span`
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${(p) => (p.$variant === 'warn' ? '#fef3c7' : '#e0e7ff')};
  color: ${(p) => (p.$variant === 'warn' ? '#92400e' : '#3730a3')};
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
  font-weight: 600;
`;

const Info = styled.div`
  color: #4b5563;
`;

const sections = [
  { key: 'tours', label: 'Tours' },
  { key: 'categories', label: 'Categories' },
  { key: 'subcategories', label: 'Subcategories' },
  { key: 'categorytree', label: 'Category Tree' },
  { key: 'hero', label: 'Hero Banners' },
  { key: 'ads', label: 'Ads' },
  { key: 'logos', label: 'Logos' },
  { key: 'settings', label: 'Settings' },
];

const AdminDashboard = () => {
  console.log('🚀 AdminDashboard component mounting');
  console.log('Current URL:', window.location.href);
  const location = useLocation();
  const navigate = useNavigate();
  console.log('Location pathname:', location.pathname);
  
  // Prevent any automatic redirects
  useEffect(() => {
    console.log('AdminDashboard mounted, pathname:', location.pathname);
    return () => {
      console.log('AdminDashboard unmounting');
    };
  }, []);
  const [active, setActive] = useState('tours');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [user, setUser] = useState(null); // User is null until logged in
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [ads, setAds] = useState([]);
  const [logos, setLogos] = useState([]);
  const [settings, setSettings] = useState({ termsAndConditions: '', privacyPolicy: '' });
  const [settingsForm, setSettingsForm] = useState({ termsAndConditions: '', privacyPolicy: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [tourForm, setTourForm] = useState({
    title: '',
    price: '',
    duration: '',
    location: '',
    description: '',
    category: '',
    is_active: true,
    is_featured: false,
    featured_image: null,
    tour_code: '',
    details: {
      earlyBirdOffer: '',
      tourOverview: [],
      highlights: [],
      priceIncludes: [],
      hotels: '',
      starDifference: [],
      additionalExcursions: [],
      pickupPoints: [],
      itinerary: [],
      detailedItinerary: '',
      galleryImages: [], // Array of { image: base64, title: string, description: string }
    },
  });

  // Tour Edit State
  const [editTourSlug, setEditTourSlug] = useState(null);
  const [duplicatingTour, setDuplicatingTour] = useState(null);
  const [tourEditForm, setTourEditForm] = useState({
    title: '',
    price: '',
    duration: '',
    location: '',
    description: '',
    category: '',
    is_active: true,
    is_featured: false,
    featured_image: null,
    tour_code: '',
    details: {
      earlyBirdOffer: '',
      tourOverview: [],
      highlights: [],
      priceIncludes: [],
      hotels: '',
      starDifference: [],
      additionalExcursions: [],
      pickupPoints: [],
      itinerary: [],
      detailedItinerary: '',
      galleryImages: [],
    },
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: null,
    contentImage: null,
  });
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [categoryEditForm, setCategoryEditForm] = useState({
    name: '',
    description: '',
    image: null,
    contentImage: null,
  });

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    priority: 10,
    is_active: true,
    background_image: null,
  });
  
  // Banner Edit State
  const [editBannerId, setEditBannerId] = useState(null);
  const [bannerEditForm, setBannerEditForm] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    is_active: true,
    background_image: null,
  });
  const [logoForm, setLogoForm] = useState({
    title: '',
    image: null,
    is_active: true,
  });
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    description: '',
    mainCategory: '',
    parentCategory: '',
    image: null,
  });
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);
  const [subCategoryEditForm, setSubCategoryEditForm] = useState({
    name: '',
    description: '',
    mainCategory: '',
    parentCategory: '',
    image: null,
  });

  const resolveMedia = (url) => {
    if (!url) return '';
    // If it's a base64 data URL, return as-is
    if (url.startsWith('data:')) return url;
    // Otherwise, assume it's a URL
    return url.startsWith('http') ? url : url;
  };

  // Check for existing session on mount
  useEffect(() => {
    console.log('Checking for existing session');
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Found saved user:', userData);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('adminUser');
      }
    } else {
      console.log('No saved user found - staying on login page');
    }
    // Add a small delay to ensure component stays mounted
    const timer = setTimeout(() => {
      console.log('Session check completed');
    }, 100);
    return () => {
      console.log('AdminDashboard component unmounting');
      clearTimeout(timer);
    };
  }, []);

  // Initialize database on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError('Failed to initialize database: ' + (err.message || 'Unknown error'));
        setDbInitialized(true);
      }
    };
    init();
  }, []);

  // Handle URL parameters for auto-opening edit forms
  useEffect(() => {
    if (!dbInitialized) return;
    
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const editId = params.get('edit');
    
    if (tab) {
      setActive(tab);
    }
    
    if (editId && tab === 'subcategories') {
      // Wait for data to load, then open edit form
      setTimeout(() => {
        const sub = subCategories.find(s => s.id === parseInt(editId));
        if (sub) {
          handleStartEditSubCategory(sub);
        }
      }, 300);
    }
  }, [location.search, dbInitialized, subCategories]);

  useEffect(() => {
    if (dbInitialized) {
      fetchData(active, true); // Always force refresh in admin
    }
  }, [active, dbInitialized]);

  // Login handler
  const handleLogin = (e) => {
    console.log('Login handler called with form:', loginForm);
    e.preventDefault();
    setLoginError('');

    // Admin credentials (CHANGE THESE FOR PRODUCTION!)
    // Default: admin / G0wr!T0ur$
    const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'G0wr!T0ur$';

    console.log('Checking credentials:', { username: loginForm.username, password: loginForm.password });
    console.log('Expected:', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      console.log('Login successful!');
      const userData = { username: loginForm.username, is_staff: true };
      setUser(userData);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setLoginForm({ username: '', password: '' });
    } else {
      console.log('Login failed!');
      setLoginError('Invalid username or password');
    }
  };

  // Logout handler
  const handleLogout = () => {
    console.log('Logging out...');
    setUser(null);
    localStorage.removeItem('adminUser');
    // Only navigate if we're not already on the home page
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const fetchData = async (key, forceRefresh = false) => {
    if (!dbInitialized) return;
    setError('');
    setLoading(true);
    try {
      // Clear cache if force refresh
      if (forceRefresh) {
        clearFrontendCache();
      }
      
      if (key === 'tours') {
        const allCategories = await getCategories();
        const allTours = await getTours();
        setTours(allTours);
        setCategories(allCategories);
      } else if (key === 'categories') {
        const allCategories = await getCategories();
        setCategories(allCategories);
        const subs = allCategories.filter(c => c.parent_id);
        setSubCategories(subs);
      } else if (key === 'subcategories') {
        const allCategories = await getCategories();
        setCategories(allCategories);
        const subs = allCategories.filter(c => c.parent_id);
        setSubCategories(subs);
      } else if (key === 'categorytree') {
        const allCategories = await getCategories();
        setCategories(allCategories);
        const subs = allCategories.filter(c => c.parent_id);
        setSubCategories(subs);
      } else if (key === 'hero') {
        const allBanners = await getHeroBanners();
        setBanners(allBanners);
      } else if (key === 'ads') {
        const allAds = await getAds();
        setAds(allAds);
      } else if (key === 'logos') {
        const allLogos = await getLogos();
        setLogos(allLogos);
      } else if (key === 'settings') {
        const settingsData = await getSettings();
        setSettings(settingsData);
        setSettingsForm({
          termsAndConditions: settingsData.termsAndConditions || '',
          privacyPolicy: settingsData.privacyPolicy || '',
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = async () => {
    if (!tourForm.title) {
      setError('Title is required for a tour.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await createTour({
        title: tourForm.title,
        price: tourForm.price,
        duration: tourForm.duration,
        location: tourForm.location,
        description: tourForm.description,
        category: tourForm.category,
        is_active: tourForm.is_active,
        is_featured: tourForm.is_featured,
        featured_imageFile: tourForm.featured_image,
        tour_code: tourForm.tour_code,
        details: tourForm.details,
      });
      setTourForm({
        title: '',
        price: '',
        duration: '',
        location: '',
        description: '',
        category: '',
        is_active: true,
        is_featured: false,
        featured_image: null,
        tour_code: '',
        details: {
          earlyBirdOffer: '',
          tourOverview: [],
          highlights: [],
          priceIncludes: [],
          hotels: '',
          starDifference: [],
          additionalExcursions: [],
          pickupPoints: [],
          itinerary: [],
          detailedItinerary: '',
        },
      });
      setDuplicatingTour(null); // Clear duplicating state after successful creation
      fetchData('tours');
    } catch (err) {
      setError(err.message || 'Unable to create tour');
    } finally {
      setLoading(false);
    }
  };

  const toggleTourFlag = async (tour, field) => {
    try {
      await updateTour(tour.slug, { [field]: !tour[field] });
      fetchData('tours');
    } catch (err) {
      setError(err.message || `Unable to update ${field}`);
    }
  };

  const handleDeleteTour = async (tour) => {
    if (!tour) return;
    setError('');
    setLoading(true);
    try {
      await deleteTour(tour.slug);
      fetchData('tours');
    } catch (err) {
      setError(err.message || 'Unable to delete tour');
    } finally {
      setLoading(false);
    }
  };

  // Handle duplicating a tour
  const handleDuplicateTour = (tour) => {
    let parsedDetails = {
      earlyBirdOffer: '',
      tourOverview: [],
      highlights: [],
      priceIncludes: [],
      hotels: '',
      starDifference: [],
      additionalExcursions: [],
      pickupPoints: [],
      itinerary: [],
      detailedItinerary: '',
      galleryImages: [],
    };
    try {
      if (tour.details_json) {
        parsedDetails = { ...parsedDetails, ...JSON.parse(tour.details_json) };
      }
    } catch (e) {
      console.error('Error parsing tour details:', e);
    }
    
    // Pre-fill the tour form with the tour data but mark as duplicate
    setDuplicatingTour(tour);
    setTourForm({
      title: `${tour.title} (Copy)`,
      price: tour.price || '',
      duration: tour.duration || '',
      location: tour.location || '',
      description: tour.description || '',
      category: tour.category_id || '',
      is_active: true,
      is_featured: false,
      featured_image: null, // User should upload new image or we could copy it
      tour_code: tour.tour_code ? `${tour.tour_code}-COPY` : '',
      details: parsedDetails,
    });
  };

  const handleCancelDuplicate = () => {
    setDuplicatingTour(null);
    setTourForm({
      title: '',
      price: '',
      duration: '',
      location: '',
      description: '',
      category: '',
      is_active: true,
      is_featured: false,
      featured_image: null,
      tour_code: '',
      details: {
        earlyBirdOffer: '',
        tourOverview: [],
        highlights: [],
        priceIncludes: [],
        hotels: '',
        starDifference: [],
        additionalExcursions: [],
        pickupPoints: [],
        itinerary: [],
        detailedItinerary: '',
        galleryImages: [],
      },
    });
  };

  const handleStartEditTour = (tour) => {
    setEditTourSlug(tour.slug);
    let parsedDetails = {
      earlyBirdOffer: '',
      tourOverview: [],
      highlights: [],
      priceIncludes: [],
      hotels: '',
      starDifference: [],
      additionalExcursions: [],
      pickupPoints: [],
      itinerary: [],
      detailedItinerary: '',
      galleryImages: [],
    };
    try {
      if (tour.details_json) {
        parsedDetails = { ...parsedDetails, ...JSON.parse(tour.details_json) };
      }
    } catch (e) {
      console.error('Error parsing tour details:', e);
    }
    setTourEditForm({
      title: tour.title || '',
      price: tour.price || '',
      duration: tour.duration || '',
      location: tour.location || '',
      description: tour.description || '',
      category: tour.category_id || '',
      is_active: tour.is_active,
      is_featured: tour.is_featured,
      featured_image: null,
      tour_code: tour.tour_code || '',
      details: parsedDetails,
    });
  };

  const handleCancelEditTour = () => {
    setEditTourSlug(null);
    setTourEditForm({
      title: '',
      price: '',
      duration: '',
      location: '',
      description: '',
      category: '',
      is_active: true,
      is_featured: false,
      featured_image: null,
      tour_code: '',
      details: {
        earlyBirdOffer: '',
        tourOverview: [],
        highlights: [],
        priceIncludes: [],
        hotels: '',
        starDifference: [],
        additionalExcursions: [],
        pickupPoints: [],
        itinerary: [],
        detailedItinerary: '',
        galleryImages: [],
      },
    });
  };

  const handleUpdateTour = async () => {
    if (!editTourSlug) return;
    
    setError('');
    setLoading(true);
    try {
      await updateTour(editTourSlug, {
        title: tourEditForm.title,
        price: tourEditForm.price,
        duration: tourEditForm.duration,
        location: tourEditForm.location,
        description: tourEditForm.description,
        category_id: tourEditForm.category,
        is_active: tourEditForm.is_active,
        is_featured: tourEditForm.is_featured,
        featured_imageFile: tourEditForm.featured_image,
        tour_code: tourEditForm.tour_code,
        details: tourEditForm.details,
      });
      handleCancelEditTour();
      fetchData('tours');
    } catch (err) {
      setError(err.message || 'Unable to update tour');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      setError('Category name is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await createCategory({
        name: categoryForm.name,
        description: categoryForm.description,
        imageFile: categoryForm.image,
        contentImageFile: categoryForm.contentImage,
      });
      console.log('Category saved to SQL database:', result);
      setCategoryForm({ name: '', description: '', image: null, contentImage: null });
      await fetchData('categories');
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.message || 'Unable to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditCategoryId(cat.id);
    setCategoryEditForm({
      name: cat.name || '',
      description: cat.description || '',
      image: null,
    });
  };

  const getRootParentId = (categoryId) => {
    let current = categories.find((c) => c.id === categoryId);
    while (current && current.parent_id) {
      current = categories.find((c) => c.id === current.parent_id);
    }
    return current ? current.id : categoryId;
  };

  const handleStartEditSubCategoryFromCategories = (sub) => {
    if (!sub) return;
    const mainId = sub.parent_id ? getRootParentId(sub.parent_id) : '';
    setActive('subcategories');
    setEditSubCategoryId(sub.id);
    setSubCategoryEditForm({
      name: sub.name || '',
      description: sub.description || '',
      mainCategory: mainId,
      parentCategory: sub.parent_id || '',
      image: null,
    });
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryId) return;
    const cat = categories.find((c) => c.id === editCategoryId);
    if (!cat) return;
    
    console.log('🚀 AdminDashboard updating category:', {
      slug: cat.slug,
      name: categoryEditForm.name,
      hasImageFile: !!categoryEditForm.image,
      imageFileName: categoryEditForm.image?.name,
      hasContentImageFile: !!categoryEditForm.contentImage,
      contentImageFileName: categoryEditForm.contentImage?.name
    });
    
    setError('');
    setLoading(true);
    try {
      await updateCategory(cat.slug, {
        name: categoryEditForm.name,
        description: categoryEditForm.description || '',
        imageFile: categoryEditForm.image,
        contentImageFile: categoryEditForm.contentImage,
      });
      setEditCategoryId(null);
      setCategoryEditForm({ name: '', description: '', image: null, contentImage: null });
      fetchData('categories');
    } catch (err) {
      setError(err.message || 'Unable to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCategoryImage = async (cat) => {
    setError('');
    setLoading(true);
    try {
      await updateCategory(cat.slug, { image: '' });
      fetchData('categories');
    } catch (err) {
      setError(err.message || 'Unable to remove image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!cat) return;
    setError('');
    setLoading(true);
    try {
      await deleteCategory(cat.slug);
      setEditCategoryId(null);
      await fetchData('categories', true); // Force refresh cache
    } catch (err) {
      setError(err.message || 'Unable to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubCategory = async () => {
    const parentId = subCategoryForm.parentCategory || subCategoryForm.mainCategory;
    if (!subCategoryForm.name || !parentId) {
      setError('Please select a main category and (if available) a parent subcategory.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await createCategory({
        name: subCategoryForm.name,
        description: subCategoryForm.description || '',
        parent_id: parentId,
        imageFile: subCategoryForm.image,
      });
      console.log('Subcategory saved to SQL database:', result);
      setSubCategoryForm({
        name: '',
        description: '',
        mainCategory: '',
        parentCategory: '',
        image: null,
      });
      await fetchData('subcategories');
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error saving subcategory:', err);
      setError(err.message || 'Unable to create subcategory');
    } finally {
      setLoading(false);
    }
  };

  const resolveParentChain = (sub) => {
    // sub is a category with parent_id
    if (!sub.parent_id) return { mainId: '', parentId: '' };
    
    const parent = categories.find((c) => c.id === sub.parent_id);
    if (!parent) return { mainId: '', parentId: sub.parent_id };
    
    // If parent also has a parent, it's nested deeper
    if (parent.parent_id) {
      return { mainId: parent.parent_id, parentId: parent.id };
    }
    // Parent is a main category
    return { mainId: parent.id, parentId: '' };
  };

  const handleStartEditSubCategory = (sub) => {
    const chain = resolveParentChain(sub);
    setEditSubCategoryId(sub.id);
    setSubCategoryEditForm({
      name: sub.name || '',
      description: sub.description || '',
      mainCategory: chain.mainId || '',
      parentCategory: chain.parentId || '',
      image: null,
    });
  };

  const handleUpdateSubCategory = async () => {
    if (!editSubCategoryId) return;
    const sub = subCategories.find((s) => s.id === editSubCategoryId);
    if (!sub) return;
    const parentId = subCategoryEditForm.parentCategory || subCategoryEditForm.mainCategory;
    if (!subCategoryEditForm.name || !parentId) {
      setError('Subcategory name and parent category are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateCategory(sub.slug, {
        name: subCategoryEditForm.name,
        description: subCategoryEditForm.description || '',
        parent_id: parentId,
        imageFile: subCategoryEditForm.image,
      });
      setEditSubCategoryId(null);
      setSubCategoryEditForm({
        name: '',
        description: '',
        mainCategory: '',
        parentCategory: '',
        image: null,
      });
      fetchData('subcategories');
    } catch (err) {
      setError(err.message || 'Unable to update subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSubCategoryImage = async (sub) => {
    setError('');
    setLoading(true);
    try {
      await updateCategory(sub.slug, { image: '' });
      fetchData('subcategories');
    } catch (err) {
      setError(err.message || 'Unable to remove subcategory image');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLogo = async () => {
    if (!logoForm.title || !logoForm.image) {
      setError('Logo title and image are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createLogo({
        title: logoForm.title,
        is_active: logoForm.is_active,
        imageFile: logoForm.image,
      });
      setLogoForm({ title: '', image: null, is_active: true });
      fetchData('logos');
    } catch (err) {
      setError(err.message || 'Unable to create logo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogo = async (logo) => {
    setError('');
    setLoading(true);
    try {
      await deleteLogo(logo.id);
      fetchData('logos');
    } catch (err) {
      setError(err.message || 'Unable to delete logo');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLogo = async (logo) => {
    setError('');
    setLoading(true);
    try {
      await updateLogo(logo.id, { is_active: !logo.is_active });
      fetchData('logos');
    } catch (err) {
      setError(err.message || 'Unable to update logo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubCategory = async (sub) => {
    if (!sub) return;
    setError('');
    setLoading(true);
    try {
      await deleteCategory(sub.slug);
      setEditSubCategoryId(null);
      await fetchData('subcategories', true); // Force refresh cache
    } catch (err) {
      setError(err.message || 'Unable to delete subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setError('');
    setSettingsSaving(true);
    try {
      const updatedSettings = await updateSettings({
        termsAndConditions: settingsForm.termsAndConditions,
        privacyPolicy: settingsForm.privacyPolicy,
      });
      setSettings(updatedSettings);
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Unable to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCreateBanner = async () => {
    if (!bannerForm.title) {
      setError('Banner title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createHeroBanner({
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        cta_text: bannerForm.cta_text,
        cta_link: bannerForm.cta_link,
        priority: bannerForm.priority,
        is_active: bannerForm.is_active,
        background_imageFile: bannerForm.background_image,
      });
      setBannerForm({
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        priority: 10,
        is_active: true,
        background_image: null,
      });
      fetchData('hero');
    } catch (err) {
      setError(err.message || 'Unable to create banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    if (!banner) return;
    setError('');
    setLoading(true);
    try {
      await deleteHeroBanner(banner.id);
      fetchData('hero');
    } catch (err) {
      setError(err.message || 'Unable to delete banner');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBanner = (banner) => {
    setEditBannerId(banner.id);
    setBannerEditForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      is_active: banner.is_active,
      background_image: null, // Will be updated if user uploads new image
    });
  };

  const handleUpdateBanner = async () => {
    if (!bannerEditForm.title) {
      setError('Banner title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const updateData = {
        title: bannerEditForm.title,
        subtitle: bannerEditForm.subtitle,
        cta_text: bannerEditForm.cta_text,
        cta_link: bannerEditForm.cta_link,
        is_active: bannerEditForm.is_active,
      };

      // Only include image if a new one was uploaded
      if (bannerEditForm.background_image) {
        const reader = new FileReader();
        const imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(bannerEditForm.background_image);
        });
        updateData.image = imageData;
      }

      await updateHeroBanner(editBannerId, updateData);
      setEditBannerId(null);
      setBannerEditForm({
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        is_active: true,
        background_image: null,
      });
      fetchData('hero', true); // Force refresh
    } catch (err) {
      setError(err.message || 'Unable to update banner');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBanner = async (banner) => {
    if (!banner) return;
    setError('');
    setLoading(true);
    try {
      await updateHeroBanner(banner.id, { is_active: !banner.is_active });
      fetchData('hero');
    } catch (err) {
      setError(err.message || 'Unable to update banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {console.log('🎨 Rendering AdminDashboard, user:', user)}
      {/* Show login screen if not authenticated */}
      {!user ? (
        <Card style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 20px 50px rgba(106, 27, 130, 0.2)', border: '2px solid #6A1B82' }}>
          <Title style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#6A1B82' }}>Admin Login</Title>
          <Info style={{ textAlign: 'center', marginBottom: '2rem' }}>Please enter your credentials to access the admin dashboard</Info>
          
          {loginError && <ErrorMsg style={{ marginBottom: '1rem', textAlign: 'center' }}>{loginError}</ErrorMsg>}
          
          <form onSubmit={handleLogin}>
            <Field style={{ marginBottom: '1.5rem' }}>
              <Label>Username</Label>
              <Input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="Enter username"
                required
                autoFocus
              />
            </Field>
            <Field style={{ marginBottom: '2rem' }}>
              <Label>Password</Label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </Field>
            <Button type="submit" style={{ width: '100%', padding: '1rem' }}>
              Login
            </Button>
          </form>
          
          <Info style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
            Default credentials: admin / G0wr!T0ur$
          </Info>
          <Info style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>
            Change these in the source code or use environment variables for production use
          </Info>
        </Card>
      ) : (
        // Show admin dashboard if authenticated
        <>
      <Header>
        <div>
          <Title>Admin Dashboard</Title>
          <Info>Manage tours, categories, hero banners, ads and logos.</Info>
        </div>
        {user && (
          <Tabs>
            {sections.map((s) => (
              <Tab
                key={s.key}
                $active={active === s.key}
                onClick={() => setActive(s.key)}
              >
                {s.label}
              </Tab>
            ))}
          </Tabs>
        )}
      </Header>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {loading && <Info>Loading...</Info>}
      {!dbInitialized && (
        <Card style={{ padding: '2rem', textAlign: 'center' }}>
          <Title>Initializing Database...</Title>
          <Info>Please wait while we connect to the database.</Info>
          <Info style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>This may take a few moments.</Info>
        </Card>
      )}

      {user && (
        <Card>
          <Flex style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{user.username}</strong>
            </div>
            <Flex style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                $variant="outline"
                onClick={handleLogout}
                style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Logout
              </Button>
              <Button
                $variant="outline"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError('');
                    const result = await importAllCategories();
                    await fetchData('categories'); // Refresh categories view
                    const successMsg = `Successfully imported ${result.success} categories${result.errors > 0 ? ` (${result.errors} errors)` : ''}`;
                    console.log(successMsg);
                    alert(successMsg); // Show success message
                    setError(''); // Clear any errors
                  } catch (err) {
                    setError('Failed to import categories: ' + err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Import All Categories
              </Button>
              <Button
                $variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.sqlite,application/x-sqlite3';
                  input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        setLoading(true);
                        await importDatabase(file);
                        fetchData(active);
                        setError('');
                      } catch (err) {
                        setError('Failed to import database: ' + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }
                  };
                  input.click();
                }}
              >
                Import DB File
              </Button>
              <Button $variant="outline" onClick={exportDatabase}>
                Export DB
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {user && dbInitialized && active === 'tours' && (
        <>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{duplicatingTour ? 'Duplicate Tour' : 'Create Tour'}</h3>
              {duplicatingTour && (
                <Button $variant="outline" onClick={handleCancelDuplicate} style={{ color: '#b91c1c', borderColor: '#fca5a5' }}>
                  Cancel Duplicate
                </Button>
              )}
            </div>
            {duplicatingTour && (
              <div style={{ 
                background: '#f3e8ff', 
                border: '1px solid #9b59b6', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                marginBottom: '1rem',
                color: '#6b21a8'
              }}>
                📋 You are duplicating: <strong>{duplicatingTour.title}</strong>. Modify the details below and save.
              </div>
            )}
            <Flex>
              <Field>
                <Label>Title</Label>
                <Input
                  value={tourForm.title}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Price (per person)</Label>
                <Input
                  type="number"
                  value={tourForm.price}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, price: e.target.value })
                  }
                  placeholder="e.g., 500"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Enter amount without £ symbol</p>
              </Field>
              <Field>
                <Label>Duration</Label>
                <Input
                  value={tourForm.duration}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, duration: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Location</Label>
                <Input
                  value={tourForm.location}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, location: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Category (Select L2 subcategory like Scotland, Wales, etc.)</Label>
                <Select
                  value={tourForm.category}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {(() => {
                    const cats = categories || [];
                    if (cats.length === 0) return null;
                    
                    // Build tree structure
                    const rootCats = cats.filter(c => !c.parent_id);
                    const getChildren = (parentId) => cats.filter(c => c.parent_id === parentId);
                    
                    const options = [];
                    
                    rootCats.forEach((root, rootIndex) => {
                      const isLastRoot = rootIndex === rootCats.length - 1;
                      const children = getChildren(root.id);
                      const hasChildren = children.length > 0;
                      
                      // Add root category
                      options.push(
                        <option key={root.id} value={root.id}>
                          {isLastRoot ? '└── ' : '├── '}{root.name}{hasChildren ? ' ▸' : ''}
                        </option>
                      );
                      
                      // Add children (L2)
                      children.forEach((child, childIndex) => {
                        const isLastChild = childIndex === children.length - 1;
                        const grandChildren = getChildren(child.id);
                        const hasGrandChildren = grandChildren.length > 0;
                        
                        options.push(
                          <option key={child.id} value={child.id}>
                            {'    '}{isLastChild ? '└── ' : '├── '}{child.name}{hasGrandChildren ? ' ▸' : ''}
                          </option>
                        );
                        
                        // Add grandchildren (L3)
                        grandChildren.forEach((grandChild, grandIndex) => {
                          const isLastGrand = grandIndex === grandChildren.length - 1;
                          options.push(
                            <option key={grandChild.id} value={grandChild.id}>
                              {'        '}{isLastGrand ? '└── ' : '├── '}{grandChild.name}
                            </option>
                          );
                        });
                      });
                    });
                    
                    return options;
                  })()}
                </Select>
              </Field>
              <Field>
                <Label>Featured Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setTourForm({ ...tourForm, featured_image: e.target.files[0] })
                  }
                />
              </Field>
              <Field>
                <Label>Description</Label>
                <TextArea
                  value={tourForm.description}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, description: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Tour Code</Label>
                <Input
                  value={tourForm.tour_code}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, tour_code: e.target.value })
                  }
                  placeholder="e.g., SCTL"
                />
              </Field>
            </Flex>
            <Flex>
              <Field>
                <Label>Active</Label>
                <Select
                  value={tourForm.is_active ? 'yes' : 'no'}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, is_active: e.target.value === 'yes' })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
              <Field>
                <Label>Featured</Label>
                <Select
                  value={tourForm.is_featured ? 'yes' : 'no'}
                  onChange={(e) =>
                    setTourForm({
                      ...tourForm,
                      is_featured: e.target.value === 'yes',
                    })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
            </Flex>
            
            <TourDetailsForm 
              details={tourForm.details}
              onChange={(newDetails) => setTourForm({ ...tourForm, details: newDetails })}
            />
            
            <Button onClick={handleCreateTour}>{duplicatingTour ? 'Create Duplicate' : 'Save Tour'}</Button>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Tours ({tours.length})</h3>
              {tours.length === 0 && (
                <Info style={{ margin: 0 }}>
                  No tours yet. Create a tour using the form above or check the browser console for any errors.
                </Info>
              )}
            </div>
            {(() => {
              // Group tours by category
              const toursByCategory = {};
              const uncategorizedTours = [];
              
              tours.forEach((tour) => {
                const categoryId = tour.category_id;
                if (categoryId && categories.find(c => c.id === categoryId)) {
                  if (!toursByCategory[categoryId]) {
                    toursByCategory[categoryId] = [];
                  }
                  toursByCategory[categoryId].push(tour);
                } else {
                  uncategorizedTours.push(tour);
                }
              });

              // Sort categories by name
              const sortedCategoryIds = Object.keys(toursByCategory).sort((a, b) => {
                const catA = categories.find(c => c.id === a);
                const catB = categories.find(c => c.id === b);
                return (catA?.name || '').localeCompare(catB?.name || '');
              });

              return (
                <>
                  {sortedCategoryIds.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId);
                    const categoryTours = toursByCategory[categoryId];
                    if (!category || !categoryTours.length) return null;

                    return (
                      <div key={categoryId} style={{ marginBottom: '2rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          marginBottom: '1rem',
                          paddingBottom: '0.75rem',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                          {category.image && (
                            <img
                              src={resolveMedia(category.image)}
                              alt={category.name}
                              style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 6 }}
                            />
                          )}
                          <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#374151' }}>
                            {category.name}
                          </h4>
                          <Info style={{ margin: 0 }}>
                            ({categoryTours.length} tour{categoryTours.length !== 1 ? 's' : ''})
                          </Info>
                        </div>
                        <List>
                          {categoryTours.map((t) => (
                            <Item key={t.id || t.slug} style={{ marginLeft: category.image ? '3.5rem' : '0', flexDirection: 'column', alignItems: 'stretch' }}>
                              {editTourSlug === t.slug ? (
                                // Edit Form
                                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                  <h4 style={{ margin: '0 0 1rem 0' }}>Edit Tour: {t.title}</h4>
                                  <Flex style={{ flexWrap: 'wrap' }}>
                                    <Field>
                                      <Label>Title</Label>
                                      <Input
                                        value={tourEditForm.title}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, title: e.target.value })}
                                      />
                                    </Field>
                                    <Field>
                                      <Label>Price (per person)</Label>
                                      <Input
                                        type="number"
                                        value={tourEditForm.price}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, price: e.target.value })}
                                        placeholder="e.g., 500"
                                      />
                                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Enter amount without £ symbol</p>
                                    </Field>
                                    <Field>
                                      <Label>Duration</Label>
                                      <Input
                                        value={tourEditForm.duration}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, duration: e.target.value })}
                                      />
                                    </Field>
                                    <Field>
                                      <Label>Location</Label>
                                      <Input
                                        value={tourEditForm.location}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, location: e.target.value })}
                                      />
                                    </Field>
                                    <Field>
                                      <Label>Category</Label>
                                      <Select
                                        value={tourEditForm.category}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, category: e.target.value })}
                                      >
                                        <option value="">Select category</option>
                                        {(() => {
                                          const cats = categories || [];
                                          if (cats.length === 0) return null;
                                          const rootCats = cats.filter(c => !c.parent_id);
                                          const getChildren = (parentId) => cats.filter(c => c.parent_id === parentId);
                                          const options = [];
                                          rootCats.forEach((root, rootIndex) => {
                                            const isLastRoot = rootIndex === rootCats.length - 1;
                                            const children = getChildren(root.id);
                                            const hasChildren = children.length > 0;
                                            options.push(<option key={root.id} value={root.id}>{isLastRoot ? '└── ' : '├── '}{root.name}{hasChildren ? ' ▸' : ''}</option>);
                                            children.forEach((child, childIndex) => {
                                              const isLastChild = childIndex === children.length - 1;
                                              const grandChildren = getChildren(child.id);
                                              const hasGrandChildren = grandChildren.length > 0;
                                              options.push(<option key={child.id} value={child.id}>{'    '}{isLastChild ? '└── ' : '├── '}{child.name}{hasGrandChildren ? ' ▸' : ''}</option>);
                                              grandChildren.forEach((grandChild, grandIndex) => {
                                                const isLastGrand = grandIndex === grandChildren.length - 1;
                                                options.push(<option key={grandChild.id} value={grandChild.id}>{'        '}{isLastGrand ? '└── ' : '├── '}{grandChild.name}</option>);
                                              });
                                            });
                                          });
                                          return options;
                                        })()}
                                      </Select>
                                    </Field>
                                    <Field>
                                      <Label>Tour Code</Label>
                                      <Input
                                        value={tourEditForm.tour_code}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, tour_code: e.target.value })}
                                      />
                                    </Field>
                                    <Field>
                                      <Label>Featured Image</Label>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, featured_image: e.target.files[0] })}
                                      />
                                      {t.featured_image && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current image:</p>
                                          <img
                                            src={t.featured_image}
                                            alt={t.title}
                                            style={{ width: '200px', height: 'auto', borderRadius: '8px', marginTop: '0.5rem' }}
                                          />
                                        </div>
                                      )}
                                    </Field>
                                    <Field style={{ flexBasis: '100%' }}>
                                      <Label>Description</Label>
                                      <TextArea
                                        value={tourEditForm.description}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, description: e.target.value })}
                                      />
                                    </Field>
                                  </Flex>
                                  <Flex style={{ marginTop: '1rem' }}>
                                    <Field>
                                      <Label>Active</Label>
                                      <Select
                                        value={tourEditForm.is_active ? 'yes' : 'no'}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, is_active: e.target.value === 'yes' })}
                                      >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                      </Select>
                                    </Field>
                                    <Field>
                                      <Label>Featured</Label>
                                      <Select
                                        value={tourEditForm.is_featured ? 'yes' : 'no'}
                                        onChange={(e) => setTourEditForm({ ...tourEditForm, is_featured: e.target.value === 'yes' })}
                                      >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                      </Select>
                                    </Field>
                                  </Flex>
                                  <TourDetailsForm
                                    details={tourEditForm.details}
                                    onChange={(newDetails) => setTourEditForm({ ...tourEditForm, details: newDetails })}
                                  />
                                  <Flex style={{ marginTop: '1rem', gap: '0.5rem' }}>
                                    <Button onClick={handleUpdateTour}>Save Changes</Button>
                                    <Button $variant="outline" onClick={handleCancelEditTour}>Cancel</Button>
                                  </Flex>
                                </div>
                              ) : (
                                // Normal Display
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <div style={{ flex: '1 1 auto' }}>
                                    <strong>{t.title}</strong>
                                    <Info>
                                      £{t.price} · {t.location} · {t.duration || 'Duration not specified'}
                                    </Info>
                                    {t.description && (
                                      <Info style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {t.description.length > 100 
                                          ? `${t.description.substring(0, 100)}...` 
                                          : t.description}
                                      </Info>
                                    )}
                                  </div>
                                  {t.featured_image && (
                                    <img
                                      src={resolveMedia(t.featured_image)}
                                      alt={t.title}
                                      style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8, marginRight: '1rem' }}
                                    />
                                  )}
                                  <Flex>
                                    <Tag $variant={t.is_active ? undefined : 'warn'}>
                                      {t.is_active ? 'Active' : 'Inactive'}
                                    </Tag>
                                    <Tag>{t.is_featured ? 'Featured' : 'Standard'}</Tag>
                                    <Button
                                      $variant="outline"
                                      onClick={() => handleStartEditTour(t)}
                                      style={{ color: '#2563eb', borderColor: '#93c5fd' }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      $variant="outline"
                                      onClick={() => handleDuplicateTour(t)}
                                      style={{ color: '#9b59b6', borderColor: '#d8b4fe' }}
                                    >
                                      Duplicate
                                    </Button>
                                    <Button
                                      $variant="outline"
                                      onClick={() => toggleTourFlag(t, 'is_active')}
                                    >
                                      Toggle Active
                                    </Button>
                                    <Button
                                      $variant="outline"
                                      onClick={() => toggleTourFlag(t, 'is_featured')}
                                    >
                                      Toggle Featured
                                    </Button>
                                    <Button
                                      $variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete tour "${t.title}"?`)) {
                                          handleDeleteTour(t);
                                        }
                                      }}
                                      style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                                    >
                                      Delete
                                    </Button>
                                  </Flex>
                                </div>
                              )}
                            </Item>
                          ))}
                        </List>
                      </div>
                    );
                  })}

                  {uncategorizedTours.length > 0 && (
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#6b7280' }}>
                        Uncategorized Tours ({uncategorizedTours.length})
                      </h4>
                      <List>
                        {uncategorizedTours.map((t) => (
                          <Item key={t.id || t.slug} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            {editTourSlug === t.slug ? (
                              // Edit Form
                              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 1rem 0' }}>Edit Tour: {t.title}</h4>
                                <Flex style={{ flexWrap: 'wrap' }}>
                                  <Field>
                                    <Label>Title</Label>
                                    <Input
                                      value={tourEditForm.title}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, title: e.target.value })}
                                    />
                                  </Field>
                                  <Field>
                                    <Label>Price (per person)</Label>
                                    <Input
                                      type="number"
                                      value={tourEditForm.price}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, price: e.target.value })}
                                      placeholder="e.g., 500"
                                    />
                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Enter amount without £ symbol</p>
                                  </Field>
                                  <Field>
                                    <Label>Duration</Label>
                                    <Input
                                      value={tourEditForm.duration}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, duration: e.target.value })}
                                    />
                                  </Field>
                                  <Field>
                                    <Label>Location</Label>
                                    <Input
                                      value={tourEditForm.location}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, location: e.target.value })}
                                    />
                                  </Field>
                                  <Field>
                                    <Label>Category</Label>
                                    <Select
                                      value={tourEditForm.category}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, category: e.target.value })}
                                    >
                                      <option value="">Select category</option>
                                      {(() => {
                                        const cats = categories || [];
                                        if (cats.length === 0) return null;
                                        const rootCats = cats.filter(c => !c.parent_id);
                                        const getChildren = (parentId) => cats.filter(c => c.parent_id === parentId);
                                        const options = [];
                                        rootCats.forEach((root, rootIndex) => {
                                          const isLastRoot = rootIndex === rootCats.length - 1;
                                          const children = getChildren(root.id);
                                          const hasChildren = children.length > 0;
                                          options.push(<option key={root.id} value={root.id}>{isLastRoot ? '└── ' : '├── '}{root.name}{hasChildren ? ' ▸' : ''}</option>);
                                          children.forEach((child, childIndex) => {
                                            const isLastChild = childIndex === children.length - 1;
                                            const grandChildren = getChildren(child.id);
                                            const hasGrandChildren = grandChildren.length > 0;
                                            options.push(<option key={child.id} value={child.id}>{'    '}{isLastChild ? '└── ' : '├── '}{child.name}{hasGrandChildren ? ' ▸' : ''}</option>);
                                            grandChildren.forEach((grandChild, grandIndex) => {
                                              const isLastGrand = grandIndex === grandChildren.length - 1;
                                              options.push(<option key={grandChild.id} value={grandChild.id}>{'        '}{isLastGrand ? '└── ' : '├── '}{grandChild.name}</option>);
                                            });
                                          });
                                        });
                                        return options;
                                      })()}
                                    </Select>
                                  </Field>
                                  <Field>
                                    <Label>Tour Code</Label>
                                    <Input
                                      value={tourEditForm.tour_code}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, tour_code: e.target.value })}
                                    />
                                  </Field>
                                  <Field>
                                    <Label>Featured Image</Label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, featured_image: e.target.files[0] })}
                                    />
                                    {t.featured_image && (
                                      <div style={{ marginTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current image:</p>
                                        <img
                                          src={t.featured_image}
                                          alt={t.title}
                                          style={{ width: '200px', height: 'auto', borderRadius: '8px', marginTop: '0.5rem' }}
                                        />
                                      </div>
                                    )}
                                  </Field>
                                  <Field style={{ flexBasis: '100%' }}>
                                    <Label>Description</Label>
                                    <TextArea
                                      value={tourEditForm.description}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, description: e.target.value })}
                                    />
                                  </Field>
                                </Flex>
                                <Flex style={{ marginTop: '1rem' }}>
                                  <Field>
                                    <Label>Active</Label>
                                    <Select
                                      value={tourEditForm.is_active ? 'yes' : 'no'}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, is_active: e.target.value === 'yes' })}
                                    >
                                      <option value="yes">Yes</option>
                                      <option value="no">No</option>
                                    </Select>
                                  </Field>
                                  <Field>
                                    <Label>Featured</Label>
                                    <Select
                                      value={tourEditForm.is_featured ? 'yes' : 'no'}
                                      onChange={(e) => setTourEditForm({ ...tourEditForm, is_featured: e.target.value === 'yes' })}
                                    >
                                      <option value="yes">Yes</option>
                                      <option value="no">No</option>
                                    </Select>
                                  </Field>
                                </Flex>
                                <TourDetailsForm
                                  details={tourEditForm.details}
                                  onChange={(newDetails) => setTourEditForm({ ...tourEditForm, details: newDetails })}
                                />
                                <Flex style={{ marginTop: '1rem', gap: '0.5rem' }}>
                                  <Button onClick={handleUpdateTour}>Save Changes</Button>
                                  <Button $variant="outline" onClick={handleCancelEditTour}>Cancel</Button>
                                </Flex>
                              </div>
                            ) : (
                              // Normal Display
                              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <div>
                                  <strong>{t.title}</strong>
                                  <Info>
                                    £{t.price} · {t.location} · {t.duration || 'Duration not specified'}
                                  </Info>
                                </div>
                                <Flex style={{ marginLeft: 'auto' }}>
                                  <Tag $variant={t.is_active ? undefined : 'warn'}>
                                    {t.is_active ? 'Active' : 'Inactive'}
                                  </Tag>
                                  <Tag>{t.is_featured ? 'Featured' : 'Standard'}</Tag>
                                  <Button
                                    $variant="outline"
                                    onClick={() => handleStartEditTour(t)}
                                    style={{ color: '#2563eb', borderColor: '#93c5fd' }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    $variant="outline"
                                    onClick={() => handleDuplicateTour(t)}
                                    style={{ color: '#9b59b6', borderColor: '#d8b4fe' }}
                                  >
                                    Duplicate
                                  </Button>
                                  <Button
                                    $variant="outline"
                                    onClick={() => toggleTourFlag(t, 'is_active')}
                                  >
                                    Toggle Active
                                  </Button>
                                  <Button
                                    $variant="outline"
                                    onClick={() => toggleTourFlag(t, 'is_featured')}
                                  >
                                    Toggle Featured
                                  </Button>
                                  <Button
                                    $variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Delete tour "${t.title}"?`)) {
                                        handleDeleteTour(t);
                                      }
                                    }}
                                    style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                                  >
                                    Delete
                                  </Button>
                                </Flex>
                              </div>
                            )}
                          </Item>
                        ))}
                      </List>
                    </div>
                  )}

                  {tours.length === 0 && <Info>No tours yet.</Info>}
                </>
              );
            })()}
          </Card>
        </>
      )}

      {user && dbInitialized && active === 'categories' && (
        <>
          <Card>
            <h3>Create Category</h3>
            <Flex>
              <Field>
                <Label>Name</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                />
              </Field>
              <Field style={{ flexBasis: '100%' }}>
                <Label>Detailed Description (Rich Text)</Label>
                <RichTextEditor
                  value={categoryForm.description}
                  onChange={(value) => setCategoryForm({ ...categoryForm, description: value })}
                  placeholder="Add detailed description with formatting, images, lists, etc..."
                />
              </Field>
              <Field>
                <Label>Hero Image (Banner)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, image: e.target.files[0] })
                  }
                />
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Displayed at the top of the service page</small>
              </Field>
              <Field>
                <Label>Content Image (Info Section)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, contentImage: e.target.files[0] })
                  }
                />
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Displayed next to "Experience Luxury" section</small>
              </Field>
            </Flex>
            <Button onClick={handleCreateCategory}>Save Category</Button>
          </Card>
          <Card>
            <h3>Main Categories</h3>
            <Info style={{ marginBottom: '1rem', color: '#6A1B82', fontWeight: 500 }}>💡 Click on any category to edit it</Info>
            <List>
              {categories
                .filter((c) => !c.parent_id)
                .map((c) => (
                <Item 
                  key={c.id || c.slug}
                  onClick={() => navigate(`/admin/category/edit/${c.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ flex: '1 1 auto', minWidth: 220 }}>
                    {editCategoryId === c.id ? (
                      <>
                        <Field>
                          <Label>Name</Label>
                          <Input
                            value={categoryEditForm.name}
                            onChange={(e) =>
                              setCategoryEditForm({ ...categoryEditForm, name: e.target.value })
                            }
                          />
                        </Field>
                        <Field style={{ flexBasis: '100%' }}>
                          <Label>Detailed Description (Rich Text)</Label>
                          <RichTextEditor
                            value={categoryEditForm.description}
                            onChange={(value) =>
                              setCategoryEditForm({
                                ...categoryEditForm,
                                description: value,
                              })
                            }
                            placeholder="Add detailed description with formatting, images, lists, etc..."
                          />
                        </Field>
                        <Field>
                          <Label>Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setCategoryEditForm({
                                ...categoryEditForm,
                                image: e.target.files[0],
                              })
                            }
                          />
                        </Field>
                      </>
                    ) : (
                      <>
                        <strong>{c.name}</strong>
                        <Info>{c.description || 'No description'}</Info>
                        {subCategories.filter((s) => s.parent_id === c.id).length > 0 && (
                          <Info>
                            {subCategories.filter((s) => s.parent_id === c.id).length} subcategories
                          </Info>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {subCategories
                            .filter((s) => s.parent_id === c.id)
                            .map((s) => (
                              <div
                                key={s.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/category/edit/${s.id}`);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  background: '#f3e8ff',
                                  color: '#4c1d95',
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  border: '1px solid #e9d5ff',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#e9d5ff';
                                  e.currentTarget.style.borderColor = '#6A1B82';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f3e8ff';
                                  e.currentTarget.style.borderColor = '#e9d5ff';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                title="Click to edit subcategory"
                              >
                                {s.image && (
                                  <img
                                    src={resolveMedia(s.image)}
                                    alt={s.name}
                                    style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }}
                                  />
                                )}
                                <span>{s.name}</span>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                  {c.image && (
                    <img
                      src={resolveMedia(c.image)}
                      alt={c.name}
                      style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                  <Flex>
                    {editCategoryId === c.id ? (
                      <>
                        <Button onClick={handleUpdateCategory}>Save</Button>
                        <Button
                          $variant="outline"
                          onClick={() => {
                            setEditCategoryId(null);
                            setCategoryEditForm({ name: '', description: '', image: null });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          $variant="outline"
                          onClick={() => handleDeleteCategory(c)}
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button $variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditCategory(c);
                        }}>
                          Edit
                        </Button>
                        <Button 
                          $variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete category "${c.name}"? This will also delete all its subcategories.`)) {
                              handleDeleteCategory(c);
                            }
                          }}
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    <Button $variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      handleClearCategoryImage(c);
                    }}>
                      Remove Image
                    </Button>
                  </Flex>
                </Item>
              ))}
            </List>
            {!categories.filter((c) => !c.parent_id).length && <Info>No categories yet.</Info>}
          </Card>
        </>
      )}

      {user && dbInitialized && active === 'subcategories' && (
        <>
          <Card>
            <h3>Create Subcategory</h3>
            <Flex>
              <Field>
                <Label>Name</Label>
                <Input
                  value={subCategoryForm.name}
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, name: e.target.value })
                  }
                />
              </Field>
              <Field style={{ flexBasis: '100%' }}>
                <Label>Detailed Description (Rich Text)</Label>
                <RichTextEditor
                  value={subCategoryForm.description}
                  onChange={(value) =>
                    setSubCategoryForm({ ...subCategoryForm, description: value })
                  }
                  placeholder="Add detailed description with formatting, images, lists, etc..."
                />
              </Field>
              <Field>
                <Label>Main Category</Label>
                <Select
                  value={subCategoryForm.mainCategory}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      mainCategory: e.target.value,
                      parentCategory: '',
                    })
                  }
                >
                  <option value="">Select main category</option>
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              </Field>
              <Field>
                <Label>Parent Subcategory (if applicable)</Label>
                <Select
                  value={subCategoryForm.parentCategory}
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, parentCategory: e.target.value })
                  }
                  disabled={!subCategoryForm.mainCategory}
                >
                  <option value="">
                    {subCategoryForm.mainCategory ? 'Select parent subcategory (optional)' : 'Select main first'}
                  </option>
                  {categories
                    .filter((c) => c.parent_id === subCategoryForm.mainCategory)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              </Field>
              <Field>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, image: e.target.files[0] })
                  }
                />
              </Field>
            </Flex>
            <Button onClick={handleCreateSubCategory}>Save Subcategory</Button>
          </Card>

          <Card>
            <h3>Subcategories (Hierarchical View)</h3>
            <Info style={{ marginBottom: '1rem', color: '#6A1B82', fontWeight: 500 }}>💡 Click on any subcategory to edit it - grouped by parent category</Info>
            <HierarchicalSubcategoryView categories={categories} resolveMedia={resolveMedia} />
          </Card>
        </>
      )}

      {user && dbInitialized && active === 'categorytree' && (
        <Card>
          <h3>Category Hierarchy Tree</h3>
          <Info style={{ marginBottom: '1rem' }}>View all categories in a hierarchical structure: Main → L1 Sub → L2 Sub</Info>
          
          {categories.filter(c => !c.parent_id).length === 0 ? (
            <Info>No categories yet.</Info>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {categories
                .filter(c => !c.parent_id)
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map((mainCat) => {
                  const l1Subs = categories.filter(c => c.parent_id === mainCat.id);
                  
                  return (
                    <div 
                      key={mainCat.id}
                      style={{
                        border: '2px solid #6A1B82',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        background: '#faf5ff'
                      }}
                    >
                      {/* Main Category */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: l1Subs.length > 0 ? '1rem' : '0' }}>
                        {mainCat.image && (
                          <img
                            src={resolveMedia(mainCat.image)}
                            alt={mainCat.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #6A1B82' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#6A1B82' }}>
                            📁 {mainCat.name}
                          </h4>
                          {mainCat.description && (
                            <Info style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                              {mainCat.description}
                            </Info>
                          )}
                        </div>
                        <Tag style={{ background: '#6A1B82', color: '#fff' }}>Main Category</Tag>
                      </div>

                      {/* L1 Subcategories */}
                      {l1Subs.length > 0 && (
                        <div style={{ marginLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {l1Subs
                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                            .map((l1Sub) => {
                              const l2Subs = categories.filter(c => c.parent_id === l1Sub.id);
                              
                              return (
                                <div
                                  key={l1Sub.id}
                                  style={{
                                    border: '1px solid #a855f7',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    background: '#fff'
                                  }}
                                >
                                  {/* L1 Subcategory */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: l2Subs.length > 0 ? '0.75rem' : '0' }}>
                                    {l1Sub.image && (
                                      <img
                                        src={resolveMedia(l1Sub.image)}
                                        alt={l1Sub.name}
                                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #a855f7' }}
                                      />
                                    )}
                                    <div style={{ flex: 1 }}>
                                      <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#7c3aed' }}>
                                        ↳ {l1Sub.name}
                                      </h5>
                                      {l1Sub.description && (
                                        <Info style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                                          {l1Sub.description}
                                        </Info>
                                      )}
                                    </div>
                                    <Tag style={{ background: '#e9d5ff', color: '#6b21a8' }}>L1 Sub</Tag>
                                  </div>

                                  {/* L2 Subcategories */}
                                  {l2Subs.length > 0 && (
                                    <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      {l2Subs
                                        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                        .map((l2Sub) => (
                                          <div
                                            key={l2Sub.id}
                                            style={{
                                              border: '1px solid #ddd6fe',
                                              borderRadius: '6px',
                                              padding: '0.75rem',
                                              background: '#faf5ff',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.5rem'
                                            }}
                                          >
                                            {l2Sub.image && (
                                              <img
                                                src={resolveMedia(l2Sub.image)}
                                                alt={l2Sub.name}
                                                style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }}
                                              />
                                            )}
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#8b5cf6' }}>
                                                ↳↳ {l2Sub.name}
                                              </div>
                                              {l2Sub.description && (
                                                <Info style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                                                  {l2Sub.description}
                                                </Info>
                                              )}
                                            </div>
                                            <Tag style={{ background: '#f3e8ff', color: '#7c3aed', fontSize: '0.75rem' }}>L2 Sub</Tag>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      {user && dbInitialized && active === 'hero' && (
        <>
          <Card>
            <h3>Create Hero Banner</h3>
            <Flex>
              <Field>
                <Label>Title</Label>
                <Input
                  value={bannerForm.title}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Subtitle</Label>
                <Input
                  value={bannerForm.subtitle}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, subtitle: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>CTA Text</Label>
                <Input
                  value={bannerForm.cta_text}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, cta_text: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>CTA Link</Label>
                <Input
                  value={bannerForm.cta_link}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, cta_link: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={bannerForm.priority}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, priority: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Background Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBannerForm({
                      ...bannerForm,
                      background_image: e.target.files[0],
                    })
                  }
                />
              </Field>
            </Flex>
            <Flex>
              <Field>
                <Label>Active</Label>
                <Select
                  value={bannerForm.is_active ? 'yes' : 'no'}
                  onChange={(e) =>
                    setBannerForm({
                      ...bannerForm,
                      is_active: e.target.value === 'yes',
                    })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
            </Flex>
            <Button onClick={handleCreateBanner}>Save Banner</Button>
          </Card>
          <Card>
            <h3>Hero Banners</h3>
            <List>
              {banners.map((b) => (
                <Item key={b.id}>
                  {editBannerId === b.id ? (
                    // Edit Mode
                    <div style={{ width: '100%' }}>
                      <Flex style={{ marginBottom: '1rem' }}>
                        <Field style={{ flex: 1 }}>
                          <Label>Title *</Label>
                          <Input
                            value={bannerEditForm.title}
                            onChange={(e) => setBannerEditForm({ ...bannerEditForm, title: e.target.value })}
                          />
                        </Field>
                        <Field style={{ flex: 1 }}>
                          <Label>Subtitle</Label>
                          <Input
                            value={bannerEditForm.subtitle}
                            onChange={(e) => setBannerEditForm({ ...bannerEditForm, subtitle: e.target.value })}
                          />
                        </Field>
                      </Flex>
                      <Flex style={{ marginBottom: '1rem' }}>
                        <Field style={{ flex: 1 }}>
                          <Label>CTA Text</Label>
                          <Input
                            value={bannerEditForm.cta_text}
                            onChange={(e) => setBannerEditForm({ ...bannerEditForm, cta_text: e.target.value })}
                          />
                        </Field>
                        <Field style={{ flex: 1 }}>
                          <Label>CTA Link</Label>
                          <Input
                            value={bannerEditForm.cta_link}
                            onChange={(e) => setBannerEditForm({ ...bannerEditForm, cta_link: e.target.value })}
                          />
                        </Field>
                      </Flex>
                      <Flex style={{ marginBottom: '1rem' }}>
                        <Field style={{ flex: 1 }}>
                          <Label>Background Image (optional - leave empty to keep current)</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBannerEditForm({ ...bannerEditForm, background_image: e.target.files[0] })}
                          />
                        </Field>
                        <Field>
                          <Label>Active</Label>
                          <Select
                            value={bannerEditForm.is_active ? 'yes' : 'no'}
                            onChange={(e) => setBannerEditForm({ ...bannerEditForm, is_active: e.target.value === 'yes' })}
                          >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </Select>
                        </Field>
                      </Flex>
                      <Flex>
                        <Button onClick={handleUpdateBanner} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button $variant="outline" onClick={() => setEditBannerId(null)}>
                          Cancel
                        </Button>
                      </Flex>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div>
                        <strong>{b.title}</strong>
                        <Info>{b.subtitle || 'No subtitle'}</Info>
                        <Tag $variant={b.is_active ? undefined : 'warn'}>
                          {b.is_active ? 'Active' : 'Inactive'}
                        </Tag>
                      </div>
                      {b.background_image && (
                        <img
                          src={resolveMedia(b.background_image)}
                          alt={b.title}
                          style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8 }}
                        />
                      )}
                      <Flex>
                        <Button $variant="outline" onClick={() => handleEditBanner(b)}>
                          Edit
                        </Button>
                        <Button $variant="outline" onClick={() => handleToggleBanner(b)}>
                          {b.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          $variant="outline"
                          onClick={() => {
                            if (window.confirm(`Delete banner "${b.title}"?`)) {
                              handleDeleteBanner(b);
                            }
                          }}
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </>
                  )}
                </Item>
              ))}
            </List>
            {!banners.length && <Info>No hero banners yet.</Info>}
          </Card>
        </>
      )}

      {user && dbInitialized && active === 'ads' && (
        <Card>
          <h3>Ads</h3>
          <List>
            {ads.map((a) => (
              <Item key={a.id}>
                <div>
                  <strong>{a.title}</strong>
                  <Info>Priority {a.priority}</Info>
                </div>
                {a.image && (
                  <img
                    src={resolveMedia(a.image)}
                    alt={a.title}
                    style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8 }}
                  />
                )}
              </Item>
            ))}
          </List>
          {!ads.length && <Info>No ads yet.</Info>}
          <Info>Creation/edit for ads can be added next; API is wired at /api/ads/.</Info>
        </Card>
      )}

      {user && dbInitialized && active === 'logos' && (
        <Card>
          <h3>Logos</h3>
          <Flex style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <Field style={{ minWidth: 240 }}>
              <Label>Title</Label>
              <Input
                value={logoForm.title}
                onChange={(e) => setLogoForm({ ...logoForm, title: e.target.value })}
              />
            </Field>
            <Field style={{ minWidth: 200 }}>
              <Label>Active</Label>
              <Select
                value={logoForm.is_active ? 'yes' : 'no'}
                onChange={(e) =>
                  setLogoForm({ ...logoForm, is_active: e.target.value === 'yes' })
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>
            <Field style={{ minWidth: 260 }}>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setLogoForm({ ...logoForm, image: e.target.files ? e.target.files[0] : null })
                }
              />
            </Field>
            <Button onClick={handleCreateLogo} disabled={loading}>
              {loading ? 'Saving...' : 'Add Logo'}
            </Button>
          </Flex>

          <List>
            {logos.map((l) => (
              <Item key={l.id}>
                <div>
                  <strong>{l.title}</strong>
                  <Tag $variant={l.is_active ? undefined : 'warn'}>
                    {l.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
                {l.image && (
                  <img
                    src={resolveMedia(l.image)}
                    alt={l.title}
                    style={{ width: 80, height: 50, objectFit: 'contain', borderRadius: 8 }}
                  />
                )}
                <Flex>
                  <Button $variant="outline" onClick={() => handleToggleLogo(l)}>
                    {l.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button 
                    $variant="outline" 
                    onClick={() => {
                      if (window.confirm(`Delete logo "${l.title}"?`)) {
                        handleDeleteLogo(l);
                      }
                    }}
                    style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                  >
                    Delete
                  </Button>
                </Flex>
              </Item>
            ))}
          </List>
          {!logos.length && <Info>No logos yet.</Info>}
        </Card>
      )}

      {user && dbInitialized && active === 'settings' && (
        <Card>
          <h3>Website Settings</h3>
          <Info style={{ marginBottom: '1.5rem' }}>
            Manage Terms & Conditions and other website content that appears on public pages.
          </Info>
          
          <Field style={{ marginBottom: '2rem' }}>
            <Label style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Terms & Conditions</Label>
            <Info style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              This content will be displayed on the Terms & Conditions page (/terms). Use HTML formatting.
            </Info>
            <RichTextEditor
              value={settingsForm.termsAndConditions}
              onChange={(content) => setSettingsForm({ ...settingsForm, termsAndConditions: content })}
            />
          </Field>
          
          <Flex style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button 
              onClick={handleSaveSettings} 
              disabled={settingsSaving}
              style={{ minWidth: '150px' }}
            >
              {settingsSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Flex>
          
          {settings.termsUpdatedAt && (
            <Info style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
              Last updated: {new Date(settings.termsUpdatedAt).toLocaleString()}
            </Info>
          )}
        </Card>
      )}
      </>
      )}
    </Page>
  );
};

export default AdminDashboard;

