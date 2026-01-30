import express from 'express';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== EMAIL CONFIGURATION ====================
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'gowritour@gmail.com',
    pass: process.env.EMAIL_PASS || 'uwkgbqbcrinnsiqw'
  }
};

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Middleware
app.use(compression({ level: 9, threshold: 0 }));

// CORS configuration - allow specific origins
const allowedOrigins = [
  'http://172.86.91.5',
  'https://172.86.91.5',
  'http://172.86.91.5:3000',
  'http://172.86.91.5:4000',
  'http://localhost:3000',
  'http://localhost:4000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('172.86.91.5')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for flexibility, remove this line for strict mode
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add cache control middleware for static files
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.woff2') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.gif')) {
    // Cache assets for long time (they have hashes in names)
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path === '/index.html' || req.path === '/') {
    // Never cache HTML - always fetch fresh
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, public, max-age=0');
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

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
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ==================== JSON FILE DATABASE ====================
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Debug: Log database file path
console.log('📂 Database file path:', DB_FILE);
console.log('📂 Database file exists:', fs.existsSync(DB_FILE));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory');
}

// Check if database file exists and has content
if (fs.existsSync(DB_FILE)) {
  const stats = fs.statSync(DB_FILE);
  console.log('📊 Database file size:', stats.size, 'bytes');
  if (stats.size < 100) {
    console.log('⚠️ Database file seems empty, will check content');
  }
}

// Initialize database if doesn't exist OR if it's essentially empty
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    categories: [],
    tours: [],
    hero_banners: [],
    logos: [],
    ads: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  console.log('📝 Created new database.json file');
} else {
  // Verify the database has valid content
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(content);
    console.log('✅ Database loaded successfully');
    console.log('📊 Categories:', (data.categories || []).length);
    console.log('📊 Tours:', (data.tours || []).length);
    console.log('📊 Hero Banners:', (data.hero_banners || []).length);
  } catch (e) {
    console.error('❌ Error parsing database:', e.message);
  }
}

// ==================== IN-MEMORY CACHE FOR SPEED ====================
let dbCache = null;
let cacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds cache

// Read database with caching
const readDB = () => {
  const now = Date.now();
  if (dbCache && (now - cacheTime) < CACHE_TTL) {
    return dbCache;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    dbCache = JSON.parse(data);
    cacheTime = now;
    return dbCache;
  } catch (error) {
    console.error('Error reading database:', error);
    return { categories: [], tours: [], hero_banners: [], logos: [], ads: [] };
  }
};

// Write database and update cache
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    dbCache = data; // Update cache immediately
    cacheTime = Date.now();
    console.log('✅ Database saved to', DB_FILE);
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

// Pre-load database into cache on startup
try {
  dbCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  cacheTime = Date.now();
  console.log('🚀 Database pre-loaded into memory cache');
} catch (e) {
  console.error('Failed to pre-load database:', e.message);
}

// Helper to normalize slugs
const normalize = (str = '') =>
  str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ==================== API ROUTES ====================

// Cache middleware for GET API requests (cache for 5 seconds)
const apiCache = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=5');
  next();
};

// Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
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

// Health check endpoints (for Kubernetes/container orchestration)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'JSON File'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/healthz', (req, res) => {
  res.send('ok');
});

app.get('/readyz', (req, res) => {
  res.send('ok');
});

// ==================== CATEGORIES ====================

app.get('/api/categories', apiCache, (req, res) => {
  const db = readDB();
  res.json(db.categories || []);
});

app.get('/api/categories/:slug', apiCache, (req, res) => {
  const db = readDB();
  const category = db.categories.find(c => c.slug === req.params.slug);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

app.post('/api/categories', (req, res) => {
  try {
    const db = readDB();
    const { id, name, slug, description, image, parent_id, visible, sort_order, highlights } = req.body;
    
    const generatedId = id || `cat-${Date.now()}`;
    const finalSlug = slug || normalize(name);
    
    const newCategory = {
      id: generatedId,
      name,
      slug: finalSlug,
      description: description || '',
      image: image || '',
      parent_id: parent_id || null,
      visible: visible !== false,
      sort_order: sort_order || 0,
      highlights: highlights || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.categories.push(newCategory);
    writeDB(db);
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.categories.findIndex(c => c.slug === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { name, description, image, content_image, delete_content_image, parent_id, visible, sort_order, highlights } = req.body;
    const current = db.categories[index];
    
    // Generate new slug from name if name is provided
    const newSlug = name ? normalize(name) : current.slug;
    
    // Use new image if provided, otherwise keep existing
    const imageToUse = (image !== undefined && image !== null && image !== '') ? image : current.image;
    const highlightsToUse = highlights !== undefined ? highlights : current.highlights;
    
    // Handle content_image - can be deleted, updated, or kept
    let contentImageToUse = current.content_image || '';
    if (delete_content_image === true) {
      contentImageToUse = ''; // Delete the content image
    } else if (content_image !== undefined && content_image !== null) {
      contentImageToUse = content_image; // Update with new image
    }
    
    db.categories[index] = {
      ...current,
      name: name !== undefined ? name : current.name,
      description: description !== undefined ? description : current.description,
      image: imageToUse,
      content_image: contentImageToUse,
      parent_id: parent_id !== undefined ? parent_id : current.parent_id,
      visible: visible !== undefined ? visible : current.visible,
      sort_order: sort_order !== undefined ? sort_order : current.sort_order,
      slug: newSlug,
      highlights: highlightsToUse,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.categories[index]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.categories.findIndex(c => c.slug === req.params.slug || c.id === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const deleted = db.categories.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Category deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/by-name/:name', (req, res) => {
  try {
    const db = readDB();
    const initialLength = db.categories.length;
    db.categories = db.categories.filter(c => c.name !== req.params.name);
    const deleted = initialLength - db.categories.length;
    
    writeDB(db);
    res.json({ message: 'Category deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting category by name:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS ====================

app.get('/api/tours', apiCache, (req, res) => {
  const db = readDB();
  res.json(db.tours || []);
});

app.get('/api/tours/:slug', apiCache, (req, res) => {
  const db = readDB();
  const tour = db.tours.find(t => t.slug === req.params.slug);
  if (!tour) {
    return res.status(404).json({ error: 'Tour not found' });
  }
  res.json(tour);
});

app.post('/api/tours', (req, res) => {
  try {
    const db = readDB();
    const { title, slug, description, price, duration, location, category_id, featured_image, is_active, is_featured, tour_code, details } = req.body;
    
    const tourSlug = slug || normalize(title);
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const newTour = {
      id,
      title,
      slug: tourSlug,
      description,
      price,
      duration,
      location,
      category_id,
      featured_image: featured_image || '',
      is_active: is_active !== false,
      is_featured: is_featured || false,
      tour_code: tour_code || '',
      details_json: details || '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.tours.push(newTour);
    writeDB(db);
    
    res.status(201).json(newTour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tours/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.tours.findIndex(t => t.slug === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    const current = db.tours[index];
    const { title, description, price, duration, location, category_id, featured_image, is_active, is_featured, tour_code, details } = req.body;
    
    db.tours[index] = {
      ...current,
      title: title !== undefined ? title : current.title,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? price : current.price,
      duration: duration !== undefined ? duration : current.duration,
      location: location !== undefined ? location : current.location,
      category_id: category_id !== undefined ? category_id : current.category_id,
      featured_image: featured_image !== undefined ? featured_image : current.featured_image,
      is_active: is_active !== undefined ? is_active : current.is_active,
      is_featured: is_featured !== undefined ? is_featured : current.is_featured,
      tour_code: tour_code !== undefined ? tour_code : current.tour_code,
      details_json: details !== undefined ? details : current.details_json,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.tours[index]);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tours/:slug', (req, res) => {
  try {
    const db = readDB();
    const index = db.tours.findIndex(t => t.slug === req.params.slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    const deleted = db.tours.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Tour deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS ====================

app.get('/api/hero-banners', apiCache, (req, res) => {
  const db = readDB();
  res.json(db.hero_banners || []);
});

app.get('/api/hero-banners/:id', apiCache, (req, res) => {
  const db = readDB();
  const banner = db.hero_banners.find(b => b.id === req.params.id);
  if (!banner) {
    return res.status(404).json({ error: 'Hero banner not found' });
  }
  res.json(banner);
});

app.post('/api/hero-banners', (req, res) => {
  try {
    const db = readDB();
    const { title, subtitle, cta_text, cta_link, background_image, image, is_active } = req.body;
    
    const newBanner = {
      id: Date.now().toString(),
      title,
      subtitle,
      cta_text,
      cta_link,
      background_image: background_image || image || '',
      image: image || background_image || '',
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.hero_banners.push(newBanner);
    writeDB(db);
    
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/hero-banners/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.hero_banners.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    db.hero_banners[index] = {
      ...db.hero_banners[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.hero_banners[index]);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/hero-banners/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.hero_banners.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }
    
    const deleted = db.hero_banners.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Hero banner deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS ====================

app.get('/api/logos', apiCache, (req, res) => {
  const db = readDB();
  res.json(db.logos || []);
});

app.get('/api/logos/:id', apiCache, (req, res) => {
  const db = readDB();
  const logo = db.logos.find(l => l.id === req.params.id);
  if (!logo) {
    return res.status(404).json({ error: 'Logo not found' });
  }
  res.json(logo);
});

app.post('/api/logos', (req, res) => {
  try {
    const db = readDB();
    const { title, name, image, image_url, is_active, logo_type } = req.body;
    
    const newLogo = {
      id: Date.now().toString(),
      title,
      name: name || title,
      image: image || image_url || '',
      image_url: image_url || image || '',
      is_active: is_active !== false,
      logo_type: logo_type || 'main_logo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.logos.push(newLogo);
    writeDB(db);
    
    res.status(201).json(newLogo);
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/logos/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.logos.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    db.logos[index] = {
      ...db.logos[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.logos[index]);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/logos/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.logos.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    const deleted = db.logos.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Logo deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADS ====================

app.get('/api/ads', apiCache, (req, res) => {
  const db = readDB();
  res.json(db.ads || []);
});

app.post('/api/ads', (req, res) => {
  try {
    const db = readDB();
    const newAd = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.ads.push(newAd);
    writeDB(db);
    
    res.status(201).json(newAd);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/ads/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.ads.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    db.ads[index] = {
      ...db.ads[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.ads[index]);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/ads/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.ads.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    const deleted = db.ads.splice(index, 1)[0];
    writeDB(db);
    
    res.json({ message: 'Ad deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DATABASE EXPORT ====================

// Export database as JSON file download
// ==================== CONTACT FORM API ====================

app.post('/api/contact', async (req, res) => {
  console.log('📨 Received contact form submission');
  console.log('📨 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { name, email, phone, travelers, budget, travelDates, selectedPackage, interests, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      console.log('❌ Validation failed: missing required fields');
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: invalid email');
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    
    // Sanitize inputs
    const sanitize = (str) => String(str || '').replace(/[<>]/g, '');
    
    // Create inquiry object
    const inquiry = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      name: sanitize(name),
      email: sanitize(email),
      phone: sanitize(phone) || '',
      travelers: sanitize(travelers) || '',
      budget: sanitize(budget) || 'Not specified',
      travelDates: sanitize(travelDates) || 'Flexible',
      selectedPackage: sanitize(selectedPackage) || 'Not specified',
      interests: sanitize(interests) || 'Not specified',
      message: sanitize(message),
      created_at: new Date().toISOString(),
      status: 'new'
    };
    
    // Store in database as backup
    const db = readDB();
    if (!db.inquiries) {
      db.inquiries = [];
    }
    db.inquiries.unshift(inquiry);
    writeDB(db);
    
    // Check if this is an airport transfer, vehicle hire, or other services booking
    const isAirportTransfer = inquiry.selectedPackage && inquiry.selectedPackage.includes('Airport Transfer');
    const isVehicleHire = inquiry.selectedPackage && inquiry.selectedPackage.includes('Vehicle Hire');
    const isOtherServices = inquiry.selectedPackage && inquiry.selectedPackage.includes('Other Services');
    const isBooking = isAirportTransfer || isVehicleHire || isOtherServices;
    
    // Prepare email content based on type
    let emailHtml;
    let emailSubject;
    
    if (isOtherServices) {
      // Specific email format for other services enquiries
      emailSubject = `Other Services Enquiry from ${inquiry.name}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6A1B82; border-bottom: 2px solid #6A1B82; padding-bottom: 10px;">
            Other Services Enquiry
          </h2>
          
          <h3 style="color: #333; margin-top: 20px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${inquiry.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${inquiry.phone || 'Not provided'}</td></tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Enquiry Details</h3>
          <div style="padding: 15px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${inquiry.message}</div>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            Received: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
          </p>
        </div>
      `;
    } else if (isAirportTransfer || isVehicleHire) {
      // Specific email format for airport transfer and vehicle hire bookings
      const bookingType = isAirportTransfer ? 'Airport Transfer Booking' : 'Vehicle Hire Booking';
      emailSubject = `${bookingType} Request from ${inquiry.name}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6A1B82; border-bottom: 2px solid #6A1B82; padding-bottom: 10px;">
            ${bookingType} Request
          </h2>
          
          <h3 style="color: #333; margin-top: 20px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${inquiry.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${inquiry.phone || 'Not provided'}</td></tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Booking Details</h3>
          <div style="padding: 15px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${inquiry.message}</div>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            Received: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
          </p>
        </div>
      `;
    } else {
      // Standard travel inquiry format
      emailSubject = `New Travel Inquiry from ${inquiry.name}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6A1B82; border-bottom: 2px solid #6A1B82; padding-bottom: 10px;">
            New Travel Inquiry
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${inquiry.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${inquiry.phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Travelers:</td><td>${inquiry.travelers || 'Not specified'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td>${inquiry.budget}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Travel Dates:</td><td>${inquiry.travelDates}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Package:</td><td>${inquiry.selectedPackage}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Interests:</td><td>${inquiry.interests}</td></tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <strong>Message:</strong>
            <p style="white-space: pre-wrap;">${inquiry.message}</p>
          </div>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            Received: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
          </p>
        </div>
      `;
    }
    
    console.log('📧 Attempting to send email...');
    console.log('📧 To:', 'gowritour@gmail.com');
    console.log('📧 CC:', inquiry.email);
    console.log('📧 Subject:', emailSubject);
    console.log('📧 Type:', inquiry.selectedPackage);
    
    // Prepare customer confirmation email
    let customerConfirmHtml;
    if (isOtherServices) {
      customerConfirmHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6A1B82; border-bottom: 2px solid #6A1B82; padding-bottom: 10px;">
            Thank You for Your Enquiry
          </h2>
          
          <p>Dear ${inquiry.name},</p>
          
          <p>Thank you for contacting Gowri Tours. We have received your enquiry and will respond within 24 hours.</p>
          
          <h3 style="color: #333; margin-top: 20px;">Your Enquiry Details</h3>
          <div style="padding: 15px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${inquiry.message}</div>
          
          <p style="margin-top: 20px;">If you have any urgent queries, please call us at <strong>+44 7488 850 718</strong>.</p>
          
          <p style="margin-top: 20px;">Best regards,<br><strong>Gowri Tours Team</strong></p>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      `;
    } else if (isAirportTransfer || isVehicleHire) {
      const bookingType = isAirportTransfer ? 'Airport Transfer' : 'Vehicle Hire';
      customerConfirmHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6A1B82; border-bottom: 2px solid #6A1B82; padding-bottom: 10px;">
            Thank You for Your ${bookingType} Booking Request
          </h2>
          
          <p>Dear ${inquiry.name},</p>
          
          <p>Thank you for contacting Gowri Tours. We have received your ${bookingType.toLowerCase()} booking request and will respond within 24 hours.</p>
          
          <h3 style="color: #333; margin-top: 20px;">Your Booking Details</h3>
          <div style="padding: 15px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${inquiry.message}</div>
          
          <p style="margin-top: 20px;">If you have any urgent queries, please call us at <strong>+44 7488 850 718</strong>.</p>
          
          <p style="margin-top: 20px;">Best regards,<br><strong>Gowri Tours Team</strong></p>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      `;
    } else {
      customerConfirmHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6A1B82; border-bottom: 2px solid #6A1B82; padding-bottom: 10px;">
            Thank You for Your Travel Inquiry
          </h2>
          
          <p>Dear ${inquiry.name},</p>
          
          <p>Thank you for contacting Gowri Tours. We have received your travel inquiry and will respond within 24 hours.</p>
          
          <h3 style="color: #333; margin-top: 20px;">Your Inquiry Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${inquiry.selectedPackage ? `<tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Package:</td><td>${inquiry.selectedPackage}</td></tr>` : ''}
            ${inquiry.travelers ? `<tr><td style="padding: 8px 0; font-weight: bold;">Travelers:</td><td>${inquiry.travelers}</td></tr>` : ''}
            ${inquiry.travelDates ? `<tr><td style="padding: 8px 0; font-weight: bold;">Travel Dates:</td><td>${inquiry.travelDates}</td></tr>` : ''}
          </table>
          
          ${inquiry.message ? `<div style="margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <strong>Your Message:</strong>
            <p style="white-space: pre-wrap;">${inquiry.message}</p>
          </div>` : ''}
          
          <p style="margin-top: 20px;">If you have any urgent queries, please call us at <strong>+44 7488 850 718</strong>.</p>
          
          <p style="margin-top: 20px;">Best regards,<br><strong>Gowri Tours Team</strong></p>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      `;
    }
    
    // Send email to admin
    try {
      const info = await transporter.sendMail({
        from: `"Gowri Tours Website" <${EMAIL_CONFIG.auth.user}>`,
        to: 'gowritour@gmail.com',
        replyTo: inquiry.email,
        subject: emailSubject,
        html: emailHtml
      });
      
      console.log('✅ Admin email sent successfully! Message ID:', info.messageId);
      
      // Send confirmation email to customer
      try {
        let customerSubject;
        if (isAirportTransfer) {
          customerSubject = 'Airport Transfer Request Received';
        } else if (isVehicleHire) {
          customerSubject = 'Vehicle Hire Request Received';
        } else if (isOtherServices) {
          customerSubject = 'Other Services Enquiry Received - Gowri Tours';
        } else {
          customerSubject = 'Travel Enquiry Request Received - Gowri Tours';
        }
          
        const customerInfo = await transporter.sendMail({
          from: `"Gowri Tours" <${EMAIL_CONFIG.auth.user}>`,
          to: inquiry.email,
          subject: customerSubject,
          html: customerConfirmHtml
        });
        
        console.log('✅ Customer confirmation email sent! Message ID:', customerInfo.messageId);
      } catch (customerEmailError) {
        console.error('⚠️ Customer confirmation email failed:', customerEmailError.message);
        // Continue even if customer email fails
      }
      
      res.json({ success: true, message: 'Thank you! Your inquiry has been sent.' });
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
      console.error('⚠️ Full error:', JSON.stringify(emailError, null, 2));
      // Still return success since data was saved to database
      res.json({ 
        success: true, 
        message: 'Thank you! Your request has been received. We will contact you soon.',
        emailSent: false
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing inquiry:', error.message);
    res.status(500).json({ success: false, error: 'Failed to submit inquiry. Please try again.' });
  }
});

// Get all inquiries (for admin)
app.get('/api/inquiries', (req, res) => {
  const db = readDB();
  res.json(db.inquiries || []);
});

app.get('/api/export-database', (req, res) => {
  try {
    const db = readDB();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_backup_${timestamp}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(db);
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FRONTEND ====================

// Serve React app for all other routes
app.get('*', (req, res) => {
  // Never cache HTML
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, public, max-age=0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ==================== START SERVER ====================

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('🚀 Server running on port', PORT);
  console.log('📁 Serving static files from:', path.join(__dirname, 'dist'));
  console.log('💾 Database: JSON File (data/database.json)');
  console.log('✅ No PostgreSQL required!');
  console.log(`  ➜  Local:   http://localhost:${PORT}/`);
});
