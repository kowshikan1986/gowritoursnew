// PostgreSQL Database Service
// This connects to the PostgreSQL database and provides CRUD operations

import axios from 'axios';
import { clearFrontendCache } from './frontendData';

// Database configuration from environment variables
const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || 'ec2-43-205-140-222.ap-south-1.compute.amazonaws.com',
  port: import.meta.env.VITE_DB_PORT || 5432,
  database: import.meta.env.VITE_DB_NAME || 'gowritour',
  user: import.meta.env.VITE_DB_USER || 'admin',
  password: import.meta.env.VITE_DB_PASSWORD || 'London25@',
};

// API endpoint - this will be handled by the backend server
const API_BASE = '/api';

let isInitialized = false;

// Event listeners for data changes
const dataChangeListeners = [];

// BroadcastChannel for cross-tab communication
const broadcast = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('db-updates') 
  : null;

// Listen for updates from other tabs
if (broadcast) {
  broadcast.onmessage = (event) => {
    console.log('📡 Received update from another tab:', event.data);
    clearFrontendCache();
    dataChangeListeners.forEach(callback => callback(event.data.type));
  };
}

export const onDataChange = (callback) => {
  dataChangeListeners.push(callback);
  return () => {
    const index = dataChangeListeners.indexOf(callback);
    if (index > -1) {
      dataChangeListeners.splice(index, 1);
    }
  };
};

const notifyDataChange = (type) => {
  console.log('🔔 Database changed:', type);
  clearFrontendCache(); // Clear cache when data changes
  
  // Notify other tabs via BroadcastChannel
  if (broadcast) {
    broadcast.postMessage({ type, timestamp: Date.now() });
    console.log('📡 Broadcasted update to other tabs');
  }
  
  // Notify listeners in current tab
  dataChangeListeners.forEach(callback => callback(type));
};

// Initialize database connection
export const initDatabase = async () => {
  if (isInitialized) {
    return true;
  }

  try {
    console.log('Initializing PostgreSQL database connection...');
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    if (response.data.status === 'ok') {
      console.log('✅ PostgreSQL database connected successfully');
      isInitialized = true;
      return true;
    }
  } catch (error) {
    console.warn('⚠️ PostgreSQL not connected yet:', error.message);
    console.warn('The app will continue to load, but data will be empty until the database is available.');
    // Don't throw - let the app load with empty data
    return false;
  }
};

export const isDatabaseReady = () => isInitialized;

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE}/categories`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching categories:', error.message);
    return [];
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_BASE}/categories/${slug}`, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.warn('Error fetching category:', error.message);
    return null;
  }
};

export const createCategory = async (data) => {
  try {
    // Upload image to local folder if present
    let imagePath = '';
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      imagePath = uploadResponse.data.path;
    }
    
    const payload = {
      name: data.name,
      description: data.description,
      image: imagePath,
      parent_id: data.parent_id,
      visible: data.visible,
      sort_order: data.sort_order
    };
    
    const response = await axios.post(`${API_BASE}/categories`, payload);
    notifyDataChange('categories');
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (slug, data) => {
  try {
    // Upload hero image to local folder if new file present
    let imagePath = undefined;
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      imagePath = uploadResponse.data.path;
    }
    
    // Upload content image to local folder if new file present
    let contentImagePath = undefined;
    if (data.contentImageFile) {
      const formData = new FormData();
      formData.append('image', data.contentImageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      contentImagePath = uploadResponse.data.path;
    }
    
    const payload = {
      name: data.name,
      description: data.description,
      highlights: data.highlights,
      parent_id: data.parent_id,
      visible: data.visible,
      sort_order: data.sort_order
    };
    
    // Only include image in payload if it's being updated
    if (imagePath !== undefined) {
      payload.image = imagePath;
    }
    
    // Only include content_image in payload if it's being updated
    if (contentImagePath !== undefined) {
      payload.content_image = contentImagePath;
    }
    
    console.log('📦 Updating category', slug, 'with image:', imagePath ? 'YES (' + imagePath + ')' : 'NO (keeping existing)', '| content_image:', contentImagePath ? 'YES' : 'NO');
    
    const response = await axios.put(`${API_BASE}/categories/${slug}`, payload);
    notifyDataChange('categories');
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (slug) => {
  try {
    console.log('🗑️ deleteCategory called with slug:', slug);
    await axios.delete(`${API_BASE}/categories/${slug}`);
    notifyDataChange('categories');
    console.log('✅ Category deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    console.error('   Slug used:', slug);
    console.error('   Response:', error.response?.data);
    console.error('   Status:', error.response?.status);
    
    // Provide more helpful error message
    if (error.response?.status === 404) {
      throw new Error(`Category "${slug}" not found in database. It may have been already deleted.`);
    }
    throw error;
  }
};

export const deleteCategoryByName = async (name) => {
  try {
    await axios.delete(`${API_BASE}/categories/by-name/${name}`);
    notifyDataChange('categories');
  } catch (error) {
    console.error('Error deleting category by name:', error);
    throw error;
  }
};

// ==================== TOURS ====================
export const getTours = async () => {
  try {
    const response = await axios.get(`${API_BASE}/tours`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching tours:', error.message);
    return [];
  }
};

export const getTourBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_BASE}/tours/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tour:', error);
    return null;
  }
};

export const createTour = async (data) => {
  try {
    console.log('createTour called with data:', {
      ...data,
      featured_imageFile: data.featured_imageFile ? 'File object present' : 'No file',
      details: data.details
    });
    
    // Upload image to local folder if present
    let featuredImagePath = '';
    if (data.featured_imageFile) {
      console.log('Uploading featured image to local folder...');
      const formData = new FormData();
      formData.append('image', data.featured_imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      featuredImagePath = uploadResponse.data.path; // e.g., '/uploads/123456.jpg'
      console.log('Featured image uploaded:', featuredImagePath);
    } else {
      console.warn('No featured_imageFile found in data');
    }
    
    const payload = {
      ...data,
      featured_image: featuredImagePath,
      details: JSON.stringify(data.details || {}), // Stringify details for database
      category_id: data.category_id || data.category
    };
    
    // Remove the file object before sending
    delete payload.featured_imageFile;
    
    console.log('Sending tour payload:', {
      ...payload,
      featured_image: payload.featured_image || 'empty',
      details: 'stringified'
    });
    
    const response = await axios.post(`${API_BASE}/tours`, payload);
    console.log('Tour created successfully:', response.data);
    notifyDataChange('tours');
    return response.data;
  } catch (error) {
    console.error('Error creating tour:', error);
    throw error;
  }
};

export const updateTour = async (slug, data) => {
  try {
    // Upload image to local folder if new file present
    let featuredImagePath = data.featured_image;
    if (data.featured_imageFile) {
      console.log('Uploading new featured image to local folder...');
      const formData = new FormData();
      formData.append('image', data.featured_imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      featuredImagePath = uploadResponse.data.path; // e.g., '/uploads/123456.jpg'
      console.log('Featured image uploaded:', featuredImagePath);
    }
    
    const payload = {
      ...data,
      featured_image: featuredImagePath,
      details: JSON.stringify(data.details || {}), // Stringify details for database
      category_id: data.category_id || data.category
    };
    
    // Remove the file object before sending
    delete payload.featured_imageFile;
    
    const response = await axios.put(`${API_BASE}/tours/${slug}`, payload);
    notifyDataChange('tours');
    return response.data;
  } catch (error) {
    console.error('Error updating tour:', error);
    throw error;
  }
};

export const deleteTour = async (slug) => {
  try {
    await axios.delete(`${API_BASE}/tours/${slug}`);
    notifyDataChange('tours');
  } catch (error) {
    console.error('Error deleting tour:', error);
    throw error;
  }
};

// ==================== HERO BANNERS ====================
export const getHeroBanners = async () => {
  try {
    const response = await axios.get(`${API_BASE}/hero-banners`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Error fetching hero banners:', error.message);
    return [];
  }
};

export const getHeroBannerById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/hero-banners/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hero banner:', error);
    return null;
  }
};

export const createHeroBanner = async (data) => {
  try {
    // Upload image to local folder if present
    let imagePath = '';
    if (data.background_imageFile) {
      const formData = new FormData();
      formData.append('image', data.background_imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      imagePath = uploadResponse.data.path;
    } else if (data.imageFile) {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      imagePath = uploadResponse.data.path;
    }
    
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      cta_text: data.cta_text,
      cta_link: data.cta_link,
      background_image: imagePath,
      image: imagePath, // Also send as image for backend
      is_active: data.is_active
    };
    
    const response = await axios.post(`${API_BASE}/hero-banners`, payload);
    notifyDataChange('banners');
    return response.data;
  } catch (error) {
    console.error('Error creating hero banner:', error);
    throw error;
  }
};

export const updateHeroBanner = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/hero-banners/${id}`, data);
    notifyDataChange('banners');
    return response.data;
  } catch (error) {
    console.error('Error updating hero banner:', error);
    throw error;
  }
};

export const deleteHeroBanner = async (id) => {
  try {
    await axios.delete(`${API_BASE}/hero-banners/${id}`);
    notifyDataChange('banners');
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    throw error;
  }
};

// ==================== LOGOS ====================
export const getLogos = async () => {
  try {
    const response = await axios.get(`${API_BASE}/logos`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching logos:', error);
    return [];
  }
};

export const getLogoById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/logos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logo:', error);
    return null;
  }
};

export const createLogo = async (data) => {
  try {
    // Upload image to local folder if present
    let imagePath = '';
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      
      const uploadResponse = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      imagePath = uploadResponse.data.path;
    }
    
    const payload = {
      title: data.title,
      name: data.title, // Map title to name for backend
      image: imagePath,
      image_url: imagePath, // Also send as image_url for compatibility
      is_active: data.is_active
    };
    
    const response = await axios.post(`${API_BASE}/logos`, payload);
    notifyDataChange('logos');
    return response.data;
  } catch (error) {
    console.error('Error creating logo:', error);
    throw error;
  }
};

export const updateLogo = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/logos/${id}`, data);
    notifyDataChange('logos');
    return response.data;
  } catch (error) {
    console.error('Error updating logo:', error);
    throw error;
  }
};

export const deleteLogo = async (id) => {
  try {
    await axios.delete(`${API_BASE}/logos/${id}`);
    notifyDataChange('logos');
  } catch (error) {
    console.error('Error deleting logo:', error);
    throw error;
  }
};

// ==================== ADS ====================
export const getAds = async () => {
  try {
    const response = await axios.get(`${API_BASE}/ads`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
};

export const createAd = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/ads`, data);
    notifyDataChange('ads');
    return response.data;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
};

export const updateAd = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/ads/${id}`, data);
    notifyDataChange('ads');
    return response.data;
  } catch (error) {
    console.error('Error updating ad:', error);
    throw error;
  }
};

export const deleteAd = async (id) => {
  try {
    await axios.delete(`${API_BASE}/ads/${id}`);
    notifyDataChange('ads');
  } catch (error) {
    console.error('Error deleting ad:', error);
    throw error;
  }
};

// Dummy functions for compatibility
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const exportDatabase = async () => {
  console.log('Export not available for PostgreSQL - use pg_dump instead');
};

export const importDatabase = async () => {
  console.log('Import not available for PostgreSQL - use pg_restore instead');
};
