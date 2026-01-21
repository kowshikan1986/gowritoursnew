import express from 'express';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// JSON-only database mode
console.log('✅ Using JSON-only database mode');

// Middleware
app.use(compression({ level: 9, threshold: 0 })); // Max compression for all responses
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve public directory (robots.txt, .well-known, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images from public/uploads with no-cache to ensure fresh images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==================== JSON DATABASE ====================
// Load JSON database
let jsonDatabase = null;

try {
  const dbPath = path.join(__dirname, 'data', 'database.json');
  if (fs.existsSync(dbPath)) {
    jsonDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('📦 JSON database loaded');
  } else {
    console.error('❌ database.json not found!');
    jsonDatabase = { categories: [], tours: [], hero_banners: [], logos: [], ads: [] };
  }
} catch (err) {
  console.error('❌ Could not load JSON database:', err.message);
  jsonDatabase = { categories: [], tours: [], hero_banners: [], logos: [], ads: [] };
}

// Helper function to save JSON database
function saveJsonDatabase() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(jsonDatabase, null, 2), 'utf8');
    console.log('✅ Database saved to JSON');
  } catch (error) {
    console.error('❌ Error saving database:', error.message);
  }
}

// ==================== API ROUTES ====================

// Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the path that can be used in the frontend
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      path: imagePath,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'json'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = jsonDatabase?.categories || [];
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const categories = jsonDatabase?.categories || [];
    const category = categories.find(cat => cat.slug === req.params.slug);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, slug, description, image, content_image, parent_id, visible, sort_order } = req.body;
    const generatedId = id || `cat-${Date.now()}`;
    
    // Auto-generate slug from name if not provided
    const finalSlug = slug || name.toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Create new category object
    const newCategory = {
      id: generatedId,
      name,
      slug: finalSlug,
      description: description || '',
      image: image || '',
      content_image: content_image || '',
      parent_id: parent_id || null,
      visible: visible !== false,
      sort_order: sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to JSON database
    if (!jsonDatabase.categories) {
      jsonDatabase.categories = [];
    }
    jsonDatabase.categories.push(newCategory);
    saveJsonDatabase();
    
    console.log('✅ Category created:', newCategory.name);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:slug', async (req, res) => {
  try {
    const { name, description, image, content_image, parent_id, visible, sort_order, highlights } = req.body;
    
    // Find current category in JSON database
    const categories = jsonDatabase?.categories || [];
    const categoryIndex = categories.findIndex(cat => cat.slug === req.params.slug);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const current = categories[categoryIndex];
    
    // Generate new slug from name if name is provided
    const newSlug = name ? name.toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') : req.params.slug;
    
    // Use new image if provided (not undefined and not empty string), otherwise keep existing
    const imageToUse = (image !== undefined && image !== null && image !== '') ? image : (current.image || '');
    
    // Use new content_image if provided, otherwise keep existing
    const contentImageToUse = (content_image !== undefined && content_image !== null && content_image !== '') ? content_image : (current.content_image || '');
    
    // Use new highlights if provided, otherwise keep existing
    const highlightsToUse = highlights !== undefined ? highlights : (current.highlights || '');
    
    console.log('📝 Updating category:', req.params.slug, '| New image:', image !== undefined ? (image ? 'YES' : 'EMPTY') : 'KEEP', '| New content_image:', content_image !== undefined ? (content_image ? 'YES' : 'EMPTY') : 'KEEP');
    
    // Update the category
    const updatedCategory = {
      ...current,
      name: name || current.name,
      slug: newSlug,
      description: description !== undefined ? description : current.description,
      image: imageToUse,
      content_image: contentImageToUse,
      parent_id: parent_id !== undefined ? parent_id : current.parent_id,
      visible: visible !== undefined ? visible : current.visible,
      sort_order: sort_order !== undefined ? sort_order : current.sort_order,
      highlights: highlightsToUse,
      updated_at: new Date().toISOString()
    };
    
    jsonDatabase.categories[categoryIndex] = updatedCategory;
    saveJsonDatabase();
    
    console.log('✅ Category updated:', updatedCategory.name);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:slug', async (req, res) => {
  try {
    console.log('🗑️ Delete request for:', req.params.slug);
    
    const categories = jsonDatabase?.categories || [];
    
    // Try to find by slug first, then by ID
    let categoryIndex = categories.findIndex(cat => cat.slug === req.params.slug);
    
    // If not found by slug, try by ID
    if (categoryIndex === -1) {
      console.log('  ❌ Not found by slug, trying by ID...');
      categoryIndex = categories.findIndex(cat => cat.id === req.params.slug);
    }
    
    if (categoryIndex === -1) {
      console.log('  ❌ Not found by ID either');
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const deleted = categories[categoryIndex];
    console.log('  ✅ Deleting:', deleted.name);
    
    // Remove from array
    jsonDatabase.categories.splice(categoryIndex, 1);
    saveJsonDatabase();
    
    res.json({ message: 'Category deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category by name
app.delete('/api/categories/by-name/:name', async (req, res) => {
  try {
    const categories = jsonDatabase?.categories || [];
    const categoryIndex = categories.findIndex(cat => cat.name === req.params.name);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    jsonDatabase.categories.splice(categoryIndex, 1);
    saveJsonDatabase();
    
    res.json({ message: 'Category deleted successfully', deleted: 1 });
  } catch (error) {
    console.error('Error deleting category by name:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS ====================

// Get all tours
app.get('/api/tours', async (req, res) => {
  try {
    // Use JSON database
    const tours = jsonDatabase?.tours || [];
    // Cache for 1 second
    res.set('Cache-Control', 'public, max-age=1');
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tour by slug
app.get('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tours = jsonDatabase?.tours || [];
    const tour = tours.find(t => t.slug === slug);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new tour
app.post('/api/tours', async (req, res) => {
  try {
    const { title, slug, description, price, duration, location, category_id, featured_image, is_active, tour_code, details } = req.body;
    
    console.log('POST /api/tours received:', {
      title,
      category_id,
      featured_image: featured_image ? `base64 string (${featured_image.length} chars)` : 'empty or null',
      details: details ? 'present' : 'empty',
      tour_code
    });
    
    const tourSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const newTour = {
      id,
      title,
      slug: tourSlug,
      description: description || '',
      price: price || '',
      duration: duration || '',
      location: location || '',
      category_id,
      featured_image: featured_image || '',
      is_active: is_active !== false,
      tour_code: tour_code || '',
      details_json: details || '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!jsonDatabase.tours) {
      jsonDatabase.tours = [];
    }
    jsonDatabase.tours.push(newTour);
    saveJsonDatabase();
    
    console.log('Tour created in DB with featured_image length:', newTour.featured_image?.length || 0);
    res.json(newTour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tour
app.put('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, price, duration, location, category_id, featured_image, is_active, tour_code, details } = req.body;
    
    const tours = jsonDatabase?.tours || [];
    const tourIndex = tours.findIndex(t => t.slug === slug);
    
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    const current = tours[tourIndex];
    const updatedTour = {
      ...current,
      title: title !== undefined ? title : current.title,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? price : current.price,
      duration: duration !== undefined ? duration : current.duration,
      location: location !== undefined ? location : current.location,
      category_id: category_id !== undefined ? category_id : current.category_id,
      featured_image: (featured_image !== undefined && featured_image !== null) ? featured_image : current.featured_image,
      is_active: is_active !== undefined ? is_active : current.is_active,
      tour_code: tour_code !== undefined ? tour_code : current.tour_code,
      details_json: details !== undefined ? details : current.details_json,
      updated_at: new Date().toISOString()
    };
    
    jsonDatabase.tours[tourIndex] = updatedTour;
    saveJsonDatabase();
    
    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete tour
app.delete('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tours = jsonDatabase?.tours || [];
    const tourIndex = tours.findIndex(t => t.slug === slug);
    
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    jsonDatabase.tours.splice(tourIndex, 1);
    saveJsonDatabase();
    
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS ====================

app.get('/api/hero-banners', async (req, res) => {
  try {
    const banners = jsonDatabase?.hero_banners || [];
    // Cache for 1 second
    res.set('Cache-Control', 'public, max-age=1');
    res.json(banners);
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hero-banners', async (req, res) => {
  try {
    const { id, title, subtitle, cta_text, cta_link, background_image, image, is_active } = req.body;
    const generatedId = id || `hero-${Date.now()}`;
    const bannerImage = background_image || image || '';
    
    if (!jsonDatabase.hero_banners) {
      jsonDatabase.hero_banners = [];
    }
    
    const newBanner = {
      id: generatedId,
      title,
      subtitle: subtitle || '',
      cta_text: cta_text || '',
      cta_link: cta_link || '',
      image: bannerImage,
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    jsonDatabase.hero_banners.push(newBanner);
    saveJsonDatabase();
    
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update hero banner
app.put('/api/hero-banners/:id', async (req, res) => {
  try {
    const { title, subtitle, cta_text, cta_link, background_image, image, is_active } = req.body;
    const bannerImage = background_image || image;
    
    const banners = jsonDatabase?.hero_banners || [];
    const bannerIndex = banners.findIndex(b => b.id === req.params.id);
    
    if (bannerIndex === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    const current = banners[bannerIndex];
    const updatedBanner = {
      ...current,
      title: title !== undefined ? title : current.title,
      subtitle: subtitle !== undefined ? subtitle : current.subtitle,
      cta_text: cta_text !== undefined ? cta_text : current.cta_text,
      cta_link: cta_link !== undefined ? cta_link : current.cta_link,
      image: (bannerImage !== undefined && bannerImage !== null && bannerImage !== '') ? bannerImage : current.image,
      is_active: is_active !== undefined ? is_active : current.is_active,
      updated_at: new Date().toISOString()
    };
    
    banners[bannerIndex] = updatedBanner;
    saveJsonDatabase();
    
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete hero banner
app.delete('/api/hero-banners/:id', async (req, res) => {
  try {
    const banners = jsonDatabase?.hero_banners || [];
    const bannerIndex = banners.findIndex(b => b.id === req.params.id);
    
    if (bannerIndex === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    const deletedBanner = banners.splice(bannerIndex, 1)[0];
    saveJsonDatabase();
    
    res.json({ message: 'Hero banner deleted successfully', deleted: deletedBanner });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

app.get('/api/logos', async (req, res) => {
  try {
    const logos = jsonDatabase?.logos || [];
    // Cache for 1 second
    res.set('Cache-Control', 'public, max-age=1');
    res.json(logos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create logo
app.post('/api/logos', async (req, res) => {
  try {
    const { id, title, name, image_url, image, link, is_active } = req.body;
    const generatedId = id || `logo-${Date.now()}`;
    const logoName = title || name || 'Logo';
    const logoImage = image_url || image || '';
    
    const newLogo = {
      id: generatedId,
      name: logoName,
      image: logoImage,
      link: link || '',
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!jsonDatabase.logos) {
      jsonDatabase.logos = [];
    }
    jsonDatabase.logos.push(newLogo);
    saveJsonDatabase();
    
    res.status(201).json(newLogo);
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update logo
app.put('/api/logos/:id', async (req, res) => {
  try {
    const { title, name, image_url, image, link, is_active } = req.body;
    const logoName = title || name;
    const logoImage = image_url || image;
    
    const logos = jsonDatabase?.logos || [];
    const logoIndex = logos.findIndex(l => l.id === req.params.id);
    
    if (logoIndex === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    const current = logos[logoIndex];
    const updatedLogo = {
      ...current,
      name: logoName !== undefined ? logoName : current.name,
      image: (logoImage !== undefined && logoImage !== null && logoImage !== '') ? logoImage : current.image,
      link: link !== undefined ? link : current.link,
      is_active: is_active !== undefined ? is_active : current.is_active,
      updated_at: new Date().toISOString()
    };
    
    jsonDatabase.logos[logoIndex] = updatedLogo;
    saveJsonDatabase();
    
    res.json(updatedLogo);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete logo
app.delete('/api/logos/:id', async (req, res) => {
  try {
    const logos = jsonDatabase?.logos || [];
    const logoIndex = logos.findIndex(l => l.id === req.params.id);
    
    if (logoIndex === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    jsonDatabase.logos.splice(logoIndex, 1);
    saveJsonDatabase();
    
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADS ====================

app.get('/api/ads', async (req, res) => {
  try {
    const ads = jsonDatabase?.ads || [];
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create ad
app.post('/api/ads', async (req, res) => {
  try {
    const { id, title, description, image_url, link_url, is_active, priority } = req.body;
    const generatedId = id || `ad-${Date.now()}`;
    
    const newAd = {
      id: generatedId,
      title: title || '',
      description: description || '',
      image_url: image_url || '',
      link_url: link_url || '',
      is_active: is_active !== false,
      priority: priority || 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!jsonDatabase.ads) {
      jsonDatabase.ads = [];
    }
    jsonDatabase.ads.push(newAd);
    saveJsonDatabase();
    
    res.status(201).json(newAd);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ad
app.put('/api/ads/:id', async (req, res) => {
  try {
    const { title, description, image_url, link_url, is_active, priority } = req.body;
    
    const ads = jsonDatabase?.ads || [];
    const adIndex = ads.findIndex(a => a.id === req.params.id);
    
    if (adIndex === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    const current = ads[adIndex];
    const updatedAd = {
      ...current,
      title: title !== undefined ? title : current.title,
      description: description !== undefined ? description : current.description,
      image_url: (image_url !== undefined && image_url !== null && image_url !== '') ? image_url : current.image_url,
      link_url: link_url !== undefined ? link_url : current.link_url,
      is_active: is_active !== undefined ? is_active : current.is_active,
      priority: priority !== undefined ? priority : current.priority,
      updated_at: new Date().toISOString()
    };
    
    jsonDatabase.ads[adIndex] = updatedAd;
    saveJsonDatabase();
    
    res.json(updatedAd);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ad
app.delete('/api/ads/:id', async (req, res) => {
  try {
    const ads = jsonDatabase?.ads || [];
    const adIndex = ads.findIndex(a => a.id === req.params.id);
    
    if (adIndex === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    jsonDatabase.ads.splice(adIndex, 1);
    saveJsonDatabase();
    
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle client-side routing - return index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🗄️  Database: JSON (data/database.json)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
