const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data', 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

console.log('Loading database...');
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

let savedImages = 0;
let savedBytes = 0;

// Function to extract base64 and save as file
function extractBase64ToFile(base64String, prefix = 'img') {
  if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image')) {
    return base64String;
  }

  // Parse the base64 data
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return base64String;
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];
  
  // Create a hash-based filename to avoid duplicates
  const hash = crypto.createHash('md5').update(data).digest('hex').substring(0, 12);
  const filename = `${prefix}_${hash}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  
  // Check if file already exists
  if (!fs.existsSync(filepath)) {
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filepath, buffer);
    savedImages++;
    savedBytes += base64String.length;
    console.log(`  Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
  
  // Return the URL path
  return `/uploads/${filename}`;
}

// Process categories
console.log('\n=== Processing Categories ===');
db.categories.forEach((cat, i) => {
  if (cat.image && cat.image.startsWith('data:image')) {
    const slug = cat.slug || cat.name || `cat_${i}`;
    cat.image = extractBase64ToFile(cat.image, `category_${slug}`);
  }
});

// Process tours
console.log('\n=== Processing Tours ===');
db.tours.forEach((tour, i) => {
  const tourName = (tour.title || tour.name || `tour_${i}`).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  
  // Process main tour image
  if (tour.image && tour.image.startsWith('data:image')) {
    tour.image = extractBase64ToFile(tour.image, `tour_${tourName}`);
  }
  
  // Process details_json
  if (tour.details_json) {
    let details = typeof tour.details_json === 'string' ? JSON.parse(tour.details_json) : tour.details_json;
    
    // Process gallery images
    if (details.galleryImages && Array.isArray(details.galleryImages)) {
      details.galleryImages = details.galleryImages.map((img, imgIdx) => {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          return extractBase64ToFile(img, `gallery_${tourName}_${imgIdx}`);
        } else if (img && typeof img === 'object') {
          // Handle both 'url' and 'image' properties
          if (img.url && img.url.startsWith('data:image')) {
            return { ...img, url: extractBase64ToFile(img.url, `gallery_${tourName}_${imgIdx}`) };
          }
          if (img.image && img.image.startsWith('data:image')) {
            return { ...img, image: extractBase64ToFile(img.image, `gallery_${tourName}_${imgIdx}`) };
          }
        }
        return img;
      });
    }
    
    // Store back as string if it was a string
    tour.details_json = typeof tour.details_json === 'string' ? JSON.stringify(details) : details;
  }
});

// Process hero_banners
console.log('\n=== Processing Hero Banners ===');
db.hero_banners.forEach((banner, i) => {
  if (banner.image && banner.image.startsWith('data:image')) {
    banner.image = extractBase64ToFile(banner.image, `banner_${i}`);
  }
  if (banner.background_image && banner.background_image.startsWith('data:image')) {
    banner.background_image = extractBase64ToFile(banner.background_image, `banner_bg_${i}`);
  }
});

// Process logos
console.log('\n=== Processing Logos ===');
if (db.logos) {
  db.logos.forEach((logo, i) => {
    if (logo.image && logo.image.startsWith('data:image')) {
      logo.image = extractBase64ToFile(logo.image, `logo_${i}`);
    }
  });
}

// Process ads
console.log('\n=== Processing Ads ===');
if (db.ads) {
  db.ads.forEach((ad, i) => {
    if (ad.image && ad.image.startsWith('data:image')) {
      ad.image = extractBase64ToFile(ad.image, `ad_${i}`);
    }
  });
}

// Save the compressed database
console.log('\n=== Saving Compressed Database ===');
const originalSize = fs.statSync(DB_PATH).size;
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
const newSize = fs.statSync(DB_PATH).size;

console.log(`\n✅ Compression Complete!`);
console.log(`   Images extracted: ${savedImages}`);
console.log(`   Original DB size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   New DB size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Saved: ${((originalSize - newSize) / 1024 / 1024).toFixed(2)} MB (${((1 - newSize/originalSize) * 100).toFixed(1)}%)`);

// List image files created
const uploadFiles = fs.readdirSync(UPLOADS_DIR);
const totalImageSize = uploadFiles.reduce((sum, file) => {
  return sum + fs.statSync(path.join(UPLOADS_DIR, file)).size;
}, 0);
console.log(`\n📁 Uploads folder: ${uploadFiles.length} files, ${(totalImageSize / 1024 / 1024).toFixed(2)} MB`);
