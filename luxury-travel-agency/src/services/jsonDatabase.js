/**
 * JSON File Database - No PostgreSQL required
 * All data stored in /data/database.json
 */

const API_BASE = '/api';

// Helper to normalize slugs
export const normalize = (str = '') =>
  str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ==================== DATA CHANGE NOTIFICATION ====================
const dataChangeListeners = [];

// Subscribe to data changes
export const onDataChange = (callback) => {
  dataChangeListeners.push(callback);
  // Return unsubscribe function
  return () => {
    const index = dataChangeListeners.indexOf(callback);
    if (index > -1) {
      dataChangeListeners.splice(index, 1);
    }
  };
};

// Notify all listeners of data change
const notifyDataChange = (type) => {
  console.log('📢 JSON Database: Notifying data change:', type);
  // Dynamically import frontendData to avoid circular dependency
  import('./frontendData').then(({ clearFrontendCache }) => {
    clearFrontendCache();
  }).catch(() => {});
  dataChangeListeners.forEach(callback => callback(type));
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  const response = await fetch(`${API_BASE}/categories`);
  return response.json();
};

export const getCategoryBySlug = async (slug) => {
  const response = await fetch(`${API_BASE}/categories/${slug}`);
  return response.json();
};

export const createCategory = async (data) => {
  // Upload hero image to local folder if present
  let imagePath = '';
  if (data.imageFile) {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    imagePath = uploadData.path;
  }
  
  // Upload content image to local folder if present
  let contentImagePath = '';
  if (data.contentImageFile) {
    const formData = new FormData();
    formData.append('image', data.contentImageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    contentImagePath = uploadData.path;
  }
  
  const payload = {
    name: data.name,
    description: data.description,
    image: imagePath,
    content_image: contentImagePath,
    highlights: data.highlights,
    parent_id: data.parent_id,
    visible: data.visible,
    sort_order: data.sort_order
  };
  
  const response = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  notifyDataChange('categories');
  return result;
};

export const updateCategory = async (slug, data) => {
  // Upload hero image to local folder if new file present
  let imagePath = undefined;
  if (data.imageFile) {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    imagePath = uploadData.path;
  }
  
  // Upload content image to local folder if new file present
  let contentImagePath = undefined;
  if (data.contentImageFile) {
    const formData = new FormData();
    formData.append('image', data.contentImageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    contentImagePath = uploadData.path;
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
  
  // Handle delete content image flag
  if (data.deleteContentImage === true) {
    payload.delete_content_image = true;
  } else if (contentImagePath !== undefined) {
    // Only include content_image in payload if it's being updated
    payload.content_image = contentImagePath;
  }
  
  const response = await fetch(`${API_BASE}/categories/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  notifyDataChange('categories');
  return result;
};

export const deleteCategory = async (slug) => {
  await fetch(`${API_BASE}/categories/${slug}`, { method: 'DELETE' });
  notifyDataChange('categories');
};

export const deleteCategoryByName = async (name) => {
  await fetch(`${API_BASE}/categories/by-name/${name}`, { method: 'DELETE' });
  notifyDataChange('categories');
};

// ==================== TOURS ====================
export const getTours = async () => {
  const response = await fetch(`${API_BASE}/tours`);
  return response.json();
};

export const getTourBySlug = async (slug) => {
  const response = await fetch(`${API_BASE}/tours/${slug}`);
  return response.json();
};

export const createTour = async (data) => {
  // Upload image to local folder if present
  let featuredImagePath = '';
  if (data.featured_imageFile) {
    const formData = new FormData();
    formData.append('image', data.featured_imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    featuredImagePath = uploadData.path;
  }
  
  const payload = {
    ...data,
    featured_image: featuredImagePath,
    details: JSON.stringify(data.details || {}),
    category_id: data.category_id || data.category
  };
  
  delete payload.featured_imageFile;
  
  const response = await fetch(`${API_BASE}/tours`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  notifyDataChange('tours');
  return result;
};

export const updateTour = async (slug, data) => {
  // Upload image to local folder if new file present
  let featuredImagePath = data.featured_image;
  if (data.featured_imageFile) {
    const formData = new FormData();
    formData.append('image', data.featured_imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    featuredImagePath = uploadData.path;
  }
  
  const payload = {
    ...data,
    details: JSON.stringify(data.details || {}),
    category_id: data.category_id || data.category
  };
  
  // Only include featured_image if a new image was uploaded
  if (featuredImagePath) {
    payload.featured_image = featuredImagePath;
  } else {
    delete payload.featured_image;
  }
  
  delete payload.featured_imageFile;
  
  const response = await fetch(`${API_BASE}/tours/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  notifyDataChange('tours');
  return result;
};

export const deleteTour = async (slug) => {
  await fetch(`${API_BASE}/tours/${slug}`, { method: 'DELETE' });
  notifyDataChange('tours');
};

// ==================== HERO BANNERS ====================
export const getHeroBanners = async () => {
  const response = await fetch(`${API_BASE}/hero-banners`);
  return response.json();
};

export const getHeroBannerById = async (id) => {
  const response = await fetch(`${API_BASE}/hero-banners/${id}`);
  return response.json();
};

export const createHeroBanner = async (data) => {
  // Upload image to local folder if present
  let imagePath = '';
  if (data.background_imageFile) {
    const formData = new FormData();
    formData.append('image', data.background_imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    imagePath = uploadData.path;
  } else if (data.imageFile) {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    imagePath = uploadData.path;
  }
  
  const payload = {
    title: data.title,
    subtitle: data.subtitle,
    cta_text: data.cta_text,
    cta_link: data.cta_link,
    background_image: imagePath,
    image: imagePath,
    is_active: data.is_active
  };
  
  const response = await fetch(`${API_BASE}/hero-banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return response.json();
};

export const updateHeroBanner = async (id, data) => {
  const response = await fetch(`${API_BASE}/hero-banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

export const deleteHeroBanner = async (id) => {
  await fetch(`${API_BASE}/hero-banners/${id}`, { method: 'DELETE' });
};

// ==================== LOGOS ====================
export const getLogos = async () => {
  const response = await fetch(`${API_BASE}/logos`);
  return response.json();
};

export const getLogoById = async (id) => {
  const response = await fetch(`${API_BASE}/logos/${id}`);
  return response.json();
};

export const createLogo = async (data) => {
  // Upload image to local folder if present
  let imagePath = '';
  if (data.imageFile) {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    imagePath = uploadData.path;
  }
  
  const payload = {
    title: data.title,
    name: data.title,
    image: imagePath,
    image_url: imagePath,
    is_active: data.is_active
  };
  
  const response = await fetch(`${API_BASE}/logos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return response.json();
};

export const updateLogo = async (id, data) => {
  const response = await fetch(`${API_BASE}/logos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

export const deleteLogo = async (id) => {
  await fetch(`${API_BASE}/logos/${id}`, { method: 'DELETE' });
};

// ==================== ADS ====================
export const getAds = async () => {
  const response = await fetch(`${API_BASE}/ads`);
  return response.json();
};

export const createAd = async (data) => {
  const response = await fetch(`${API_BASE}/ads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

export const updateAd = async (id, data) => {
  const response = await fetch(`${API_BASE}/ads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

export const deleteAd = async (id) => {
  await fetch(`${API_BASE}/ads/${id}`, { method: 'DELETE' });
};

// ==================== SETTINGS ====================
export const getSettings = async () => {
  const response = await fetch(`${API_BASE}/settings`);
  return response.json();
};

export const updateSettings = async (data) => {
  const response = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  notifyDataChange('settings-updated');
  return response.json();
};

// Initialize database (no-op for JSON)
export const initDatabase = async () => {
  console.log('JSON Database: No initialization needed');
  return true;
};

// Not used for JSON storage
export const exportDatabase = async () => {
  console.log('Export: Data automatically saved to database.json');
};

export const importDatabase = async () => {
  console.log('Import: Load database.json file');
};
