import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { createLogger, format, transports } from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== JSON DATABASE (NO POSTGRESQL) ====================
let jsonDatabase = null;

// Load JSON database
function loadDatabase() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    if (fs.existsSync(dbPath)) {
      jsonDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      console.log('📦 JSON database loaded');
      return true;
    } else {
      console.error('❌ database.json not found!');
      return false;
    }
  } catch (err) {
    console.error('❌ Could not load JSON database:', err.message);
    return false;
  }
}

// Save JSON database
function saveDatabase() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(jsonDatabase, null, 2), 'utf8');
    console.log('✅ Database saved');
  } catch (error) {
    console.error('❌ Error saving database:', error.message);
  }
}

// Initialize database
loadDatabase();

// ==================== LOGGING CONFIGURATION ====================
const logger = createLogger({
  level: process.env.VITE_LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'luxury-travel-agency' },
  transports: [
    new transports.File({ 
      filename: process.env.VITE_LOG_FILE_PATH || './logs/error.log', 
      level: 'error' 
    }),
    new transports.File({ 
      filename: process.env.VITE_LOG_FILE_PATH || './logs/combined.log' 
    })
  ]
});

// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

// ==================== SECURITY MIDDLEWARE ====================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: process.env.VITE_CSP_ENABLED === 'true' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      imgSrc: ["'self'", "data:", "https://*.googleapis.com", "https://*.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: process.env.VITE_FRAME_OPTIONS_ENABLED === 'true' ? ["'none'"] : ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  } : false,
  hsts: process.env.VITE_HSTS_ENABLED === 'true' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.VITE_CORS_ENABLED === 'true' 
    ? process.env.VITE_CORS_ORIGIN || 'https://gowritours-main-5ed4e1e.kuberns.cloud'
    : false,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Rate limiting
if (process.env.VITE_RATE_LIMIT_ENABLED === 'true') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.VITE_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use('/api/', limiter);
}

// ==================== PERFORMANCE MIDDLEWARE ====================

// Compression with production optimizations
app.use(compression({ 
  level: parseInt(process.env.VITE_GZIP_LEVEL) || 9, 
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Serve static files with caching headers
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' 
    ? (parseInt(process.env.VITE_CACHE_MAX_AGE) || 3600) * 1000 // 1 hour in production
    : 0 // No caching in development
};

app.use(express.static(path.join(__dirname, 'dist'), staticOptions));
app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), staticOptions));

// Body parsing with limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Log large requests
    if (buf.length > 1024 * 1024) { // 1MB
      logger.info(`Large request: ${req.method} ${req.url}, size: ${buf.length} bytes`);
    }
  }
}));
app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true 
}));

// ==================== FILE UPLOAD CONFIGURATION ====================

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
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ==================== API ROUTES ====================

// Health check with detailed system info
app.get('/api/health', (req, res) => {
  try {
    const systemInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'json',
      node_env: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.version
    };
    res.json(systemInfo);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload image with enhanced error handling
app.post('/api/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      success: true,
      path: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    logger.info(`Files uploaded: ${uploadedFiles.length} files`);
    res.json({ files: uploadedFiles });
  } catch (error) {
    logger.error('Error uploading files:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CATEGORIES API ====================

// Get all categories with caching
app.get('/api/categories', (req, res) => {
  try {
    const categories = jsonDatabase?.categories || [];
    res.set('Cache-Control', `public, max-age=${process.env.NODE_ENV === 'production' ? 3600 : 1}`);
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', (req, res) => {
  try {
    const category = jsonDatabase?.categories?.find(c => c.slug === req.params.slug);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', (req, res) => {
  try {
    const newCategory = {
      ...req.body,
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonDatabase.categories.push(newCategory);
    saveDatabase();
    logger.info(`Category created: ${newCategory.name}`);
    res.status(201).json(newCategory);
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:slug', (req, res) => {
  try {
    const normalizedSlug = req.params.slug;
    const index = jsonDatabase.categories.findIndex(c => c.slug === normalizedSlug);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    jsonDatabase.categories[index] = {
      ...jsonDatabase.categories[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveDatabase();
    logger.info(`Category updated: ${jsonDatabase.categories[index].name}`);
    res.json(jsonDatabase.categories[index]);
  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:slug', (req, res) => {
  try {
    const normalizedSlug = req.params.slug;
    const index = jsonDatabase.categories.findIndex(c => c.slug === normalizedSlug);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const deletedCategory = jsonDatabase.categories.splice(index, 1)[0];
    saveDatabase();
    logger.info(`Category deleted: ${deletedCategory.name}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOURS API ====================

app.get('/api/tours', (req, res) => {
  try {
    const tours = jsonDatabase?.tours || [];
    res.set('Cache-Control', `public, max-age=${process.env.NODE_ENV === 'production' ? 3600 : 1}`);
    res.json(tours);
  } catch (error) {
    logger.error('Error fetching tours:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HERO BANNERS API ====================

app.get('/api/hero-banners', (req, res) => {
  try {
    const banners = jsonDatabase?.hero_banners || [];
    res.set('Cache-Control', `public, max-age=${process.env.NODE_ENV === 'production' ? 3600 : 1}`);
    res.json(banners);
  } catch (error) {
    logger.error('Error fetching hero banners:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGOS API ====================

app.get('/api/logos', (req, res) => {
  try {
    const logos = jsonDatabase?.logos || [];
    res.set('Cache-Control', `public, max-age=${process.env.NODE_ENV === 'production' ? 3600 : 1}`);
    res.json(logos);
  } catch (error) {
    logger.error('Error fetching logos:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADS API ====================

app.get('/api/ads', (req, res) => {
  try {
    const ads = jsonDatabase?.ads || [];
    res.set('Cache-Control', `public, max-age=${process.env.NODE_ENV === 'production' ? 3600 : 1}`);
    res.json(ads);
  } catch (error) {
    logger.error('Error fetching ads:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Don't send error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request.'
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

// ==================== SERVER STARTUP ====================

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Production Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🗄️  Database: JSON-only (PostgreSQL disabled)`);
  console.log(`📦 Categories: ${jsonDatabase?.categories?.length || 0}`);
  console.log(`📷 Images: Local folder (public/uploads)`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`⚡ Compression: Enabled with level ${process.env.VITE_GZIP_LEVEL || 9}`);
  console.log(`📊 Logging: Winston logger configured`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});