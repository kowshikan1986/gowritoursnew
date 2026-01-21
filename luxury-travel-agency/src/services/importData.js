// Import seed data - Categories and Subcategories from the backend seed structure
import { initDatabase, createCategory, getCategoryBySlug } from './jsonDatabase';

// Helper to convert image URL to base64 (optional - for now we'll store URLs)
const urlToBase64 = async (url) => {
  if (!url) return '';
  try {
    // For now, we'll store URLs directly. If you want base64, uncomment below:
    // const response = await fetch(url);
    // const blob = await response.blob();
    // return new Promise((resolve) => {
    //   const reader = new FileReader();
    //   reader.onload = () => resolve(reader.result);
    //   reader.readAsDataURL(blob);
    // });
    return url; // Store as URL for now
  } catch (err) {
    console.error('Error converting image URL:', err);
    return url; // Fallback to URL
  }
};

// Seed data structure matching the backend seed.js
const seedCategories = [
  // Main categories (no parent)
  { name: 'Tours', parentSlug: null, sort_order: 1, description: 'Main tours category', image: '' },
  { name: 'Cruises', parentSlug: null, sort_order: 2, description: 'Cruise packages', image: '' },
  { name: 'Airport Transfers', parentSlug: null, sort_order: 3, description: 'Airport transfer services', image: '' },
  { name: 'Vehicle Hire', parentSlug: null, sort_order: 4, description: 'Vehicle hire services', image: '' },
  { name: 'Sri Lanka Tours', parentSlug: null, sort_order: 5, description: 'Sri Lanka and India tours', image: '' },
  { name: 'Other Services', parentSlug: null, sort_order: 6, description: 'Other services', image: '' },

  // Level 1: Under "Tours"
  { name: 'UK Tours', parentSlug: 'tours', sort_order: 1, description: '', image: 'https://images.unsplash.com/photo-1527258654576-0fb8fdfaf6b9?q=80&w=1470&auto=format&fit=crop' },
  { name: 'European Tours', parentSlug: 'tours', sort_order: 2, description: '', image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1470&auto=format&fit=crop' },
  { name: 'World Tours', parentSlug: 'tours', sort_order: 3, description: '', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Group Tours', parentSlug: 'tours', sort_order: 4, description: '', image: 'https://images.unsplash.com/photo-1520975916090-31059506c643?q=80&w=1470&auto=format&fit=crop' },
  { name: 'India & Sri Lankan Tours', parentSlug: 'tours', sort_order: 5, description: '', image: 'https://images.unsplash.com/photo-1599059056432-5f1535f327f3?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Private Tours', parentSlug: 'tours', sort_order: 6, description: '', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1470&auto=format&fit=crop' },

  // Level 2: UK Tours subcategories (High-quality images)
  { name: 'London', parentSlug: 'uk-tours', sort_order: 1, description: 'Explore the vibrant capital city and its beautiful surrounding areas including Windsor, Oxford, and Cambridge.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { name: 'Lake District', parentSlug: 'uk-tours', sort_order: 2, description: 'Discover the stunning landscapes, lakes, and mountains of the Lake District National Park.', image: 'https://images.unsplash.com/photo-1588756848359-035c6edc11a7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { name: 'Scotland Highlights', parentSlug: 'uk-tours', sort_order: 3, description: 'Experience the majestic Highlands, historic castles, and breathtaking scenery of Scotland.', image: 'https://images.unsplash.com/photo-1551506448-074afa034c05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { name: 'Wales & Snowdonia', parentSlug: 'uk-tours', sort_order: 4, description: 'Journey through the dramatic landscapes of Wales and climb the peaks of Snowdonia National Park.', image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { name: 'Cornwall & South West', parentSlug: 'uk-tours', sort_order: 5, description: 'Visit the beautiful coastlines, charming fishing villages, and stunning beaches of Cornwall and the South West.', image: 'https://images.unsplash.com/photo-1580990172037-0dd51af0e0a9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { name: 'Peak District', parentSlug: 'uk-tours', sort_order: 6, description: 'Explore the rolling hills, historic market towns, and stately homes of the Peak District National Park.', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { name: 'Isle of Wight', parentSlug: 'uk-tours', sort_order: 7, description: 'Enjoy the beautiful island with its stunning coastline, historic attractions, and charming seaside towns.', image: 'https://images.unsplash.com/photo-1599262549668-e9a6c8a5f56f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3' },

  // European Tours subcategories
  { name: 'France (Paris, Riviera)', parentSlug: 'european-tours', sort_order: 1, description: 'Paris highlights and the French Riviera.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Italy (Rome, Amalfi, Tuscany)', parentSlug: 'european-tours', sort_order: 2, description: 'Rome, Amalfi Coast, and Tuscany countryside.', image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Switzerland (Alps, Lakes)', parentSlug: 'european-tours', sort_order: 3, description: 'Swiss Alps and lake regions.', image: 'https://images.unsplash.com/photo-1508264165352-258859e62245?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Spain & Portugal Highlights', parentSlug: 'european-tours', sort_order: 4, description: 'Barcelona, Madrid, Lisbon, Porto.', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1470&auto=format&fit=crop' },

  // World Tours subcategories
  { name: 'Middle East (Dubai, Abu Dhabi)', parentSlug: 'world-tours', sort_order: 1, description: 'UAE highlights and desert experiences.', image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Indian Ocean (Maldives, Mauritius, Seychelles)', parentSlug: 'world-tours', sort_order: 2, description: 'Luxury islands across the Indian Ocean.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Africa (Safari, Cape Town)', parentSlug: 'world-tours', sort_order: 3, description: 'Safari circuits and Cape Town.', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Americas (USA, Canada, Caribbean)', parentSlug: 'world-tours', sort_order: 4, description: 'Key USA, Canada, and Caribbean escapes.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Asia (Japan, Bali, Thailand)', parentSlug: 'world-tours', sort_order: 5, description: 'Signature Asia itineraries.', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1470&auto=format&fit=crop' },

  // India & Sri Lankan Tours subcategories
  { name: 'Sri Lanka Classic (Tea Country, Cultural Triangle, Beaches)', parentSlug: 'india-and-sri-lankan-tours', sort_order: 1, description: 'Tea country, Sigiriya, Kandy, and beaches.', image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?q=80&w=1470&auto=format&fit=crop' },
  { name: 'India Golden Triangle (Delhi–Agra–Jaipur)', parentSlug: 'india-and-sri-lankan-tours', sort_order: 2, description: 'Delhi, Agra, and Jaipur highlights.', image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Kerala Backwaters', parentSlug: 'india-and-sri-lankan-tours', sort_order: 3, description: 'Houseboats and lush backwaters.', image: 'https://images.unsplash.com/photo-1505764702709-0cfa90f3f539?q=80&w=1470&auto=format&fit=crop' },
  { name: 'South India Heritage', parentSlug: 'india-and-sri-lankan-tours', sort_order: 4, description: 'Tamil Nadu temples and heritage circuits.', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1470&auto=format&fit=crop' },

  // Group Tours subcategories
  { name: 'Fixed Departures', parentSlug: 'group-tours', sort_order: 1, description: 'Scheduled group departures.', image: 'https://images.unsplash.com/photo-1520975916090-31059506c643?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Corporate & Incentives', parentSlug: 'group-tours', sort_order: 2, description: 'Corporate group and incentive travel.', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Student & Educational', parentSlug: 'group-tours', sort_order: 3, description: 'Educational group travel.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1470&auto=format&fit=crop' },

  // Private Tours subcategories
  { name: 'Bespoke Itineraries', parentSlug: 'private-tours', sort_order: 1, description: 'Fully tailored trips.', image: 'https://images.unsplash.com/photo-1500534314215-7d6b3a5b0a31?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Family & Multi-Gen', parentSlug: 'private-tours', sort_order: 2, description: 'Family-focused private tours.', image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Honeymoon & Celebrations', parentSlug: 'private-tours', sort_order: 3, description: 'Romantic and celebration travel.', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1470&auto=format&fit=crop' },
  { name: 'VIP Concierge', parentSlug: 'private-tours', sort_order: 4, description: 'High-touch private concierge.', image: 'https://images.unsplash.com/photo-1504607772943-923c8e3784e0?q=80&w=1470&auto=format&fit=crop' },

  // Cruises subcategories
  { name: 'Ocean Cruises (Luxury Lines)', parentSlug: 'cruises', sort_order: 1, description: 'Luxury ocean cruises on premium cruise lines with world-class amenities and service.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1470&auto=format&fit=crop' },
  { name: 'River Cruises (Danube, Rhine, Mekong)', parentSlug: 'cruises', sort_order: 2, description: 'Scenic river cruises through Europe and Asia on luxurious river vessels.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Expedition Cruises (Polar, Galapagos)', parentSlug: 'cruises', sort_order: 3, description: 'Adventure expedition cruises to polar regions, Galapagos, and remote destinations.', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Yacht & Small-Ship', parentSlug: 'cruises', sort_order: 4, description: 'Intimate yacht and small-ship cruises for personalized luxury experiences.', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1470&auto=format&fit=crop' },

  // Airport Transfers subcategories
  { name: 'Meet & Greet Service', parentSlug: 'airport-transfers', sort_order: 1, description: 'Premium meet and greet service with personal assistance at the airport terminal.', image: 'https://images.unsplash.com/photo-1534451541221-10e62968e56c?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Fleet & Classes', parentSlug: 'airport-transfers', sort_order: 4, description: 'Choose from our range of vehicle classes to suit your needs and budget.', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Corporate Accounts', parentSlug: 'airport-transfers', sort_order: 5, description: 'Dedicated corporate account services with billing solutions and priority booking.', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1470&auto=format&fit=crop' },
  // Fleet & Classes subcategories
  { name: 'Luxury Sedan', parentSlug: 'fleet-and-classes', sort_order: 1, description: 'Premium luxury sedan vehicles for comfort and style.', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Executive MPV', parentSlug: 'fleet-and-classes', sort_order: 2, description: 'Spacious executive MPV vehicles perfect for families and groups.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Minibus/Coach', parentSlug: 'fleet-and-classes', sort_order: 3, description: 'Minibus and coach options for larger groups and corporate transfers.', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1470&auto=format&fit=crop' },

  // Vehicle Hire subcategories
  { name: 'Self-Drive (Economy, Premium, SUV)', parentSlug: 'vehicle-hire', sort_order: 1, description: 'Self-drive vehicle hire options from economy to premium SUVs for your convenience.', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Chauffeur-Driven (Hourly/Daily)', parentSlug: 'vehicle-hire', sort_order: 2, description: 'Professional chauffeur-driven vehicles available for hourly or daily hire.', image: 'https://images.unsplash.com/photo-1599912027806-cfec9d5944b6?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Luxury & Exotic Cars', parentSlug: 'vehicle-hire', sort_order: 3, description: 'Premium luxury and exotic car hire for special occasions and business travel.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Minibus/Coach Hire', parentSlug: 'vehicle-hire', sort_order: 4, description: 'Minibus and coach hire for group travel, events, and corporate needs.', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Insurance & Extras', parentSlug: 'vehicle-hire', sort_order: 5, description: 'Comprehensive insurance options and additional extras for your vehicle hire.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1470&auto=format&fit=crop' },

  // Sri Lanka Tours subcategories
  { name: 'Signature Routes (10–14 days)', parentSlug: 'sri-lanka-tours', sort_order: 1, description: 'Comprehensive 10-14 day signature routes covering the best of Sri Lanka.', image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Culture & Heritage', parentSlug: 'sri-lanka-tours', sort_order: 2, description: 'Immerse yourself in Sri Lanka\'s rich cultural heritage and ancient sites.', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Wildlife & Nature', parentSlug: 'sri-lanka-tours', sort_order: 3, description: 'Discover Sri Lanka\'s diverse wildlife, national parks, and natural wonders.', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Beach & Wellness', parentSlug: 'sri-lanka-tours', sort_order: 4, description: 'Relax on pristine beaches and enjoy wellness retreats in beautiful coastal settings.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Tea Country Retreats', parentSlug: 'sri-lanka-tours', sort_order: 5, description: 'Experience the scenic tea plantations and hill country retreats of Sri Lanka.', image: 'https://images.unsplash.com/photo-1599571234902-ec53c4d77dde?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Short Breaks (3–5 days)', parentSlug: 'sri-lanka-tours', sort_order: 6, description: 'Perfect short break itineraries for those with limited time to explore Sri Lanka.', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1470&auto=format&fit=crop' },
];

// Generate slug from name (matching backend logic)
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Import all categories and subcategories
export const importAllCategories = async () => {
  await initDatabase();
  
  const categoryMap = new Map(); // Store created categories by slug for parent lookups
  const results = [];
  const errors = [];

  console.log('Starting category import...');

  for (const catData of seedCategories) {
    try {
      // Find parent ID if parentSlug is provided
      let parent_id = null;
      if (catData.parentSlug) {
        // Normalize the parent slug for lookup
        const normalizedParentSlug = generateSlug(catData.parentSlug);
        
        // First check our categoryMap (categories we just created)
        const parentFromMap = categoryMap.get(normalizedParentSlug);
        if (parentFromMap) {
          parent_id = parentFromMap.id;
          console.log(`✓ Found parent "${catData.parentSlug}" (normalized: ${normalizedParentSlug}, ID: ${parent_id}) for "${catData.name}"`);
        } else {
          // If not found in map, check existing database
          const existingParent = getCategoryBySlug(normalizedParentSlug);
          if (existingParent) {
            parent_id = existingParent.id;
            // Add to map for future lookups
            categoryMap.set(normalizedParentSlug, existingParent);
            console.log(`✓ Found existing parent "${catData.parentSlug}" (normalized: ${normalizedParentSlug}, ID: ${parent_id}) for "${catData.name}"`);
          } else {
            console.warn(`⚠ Parent category "${catData.parentSlug}" (normalized: ${normalizedParentSlug}) not found for "${catData.name}", creating without parent`);
          }
        }
      }

      // Convert image URL (we'll store as URL for now, can convert to base64 later if needed)
      const image = catData.image || '';

      // Check if category already exists
      const slug = generateSlug(catData.name);
      const existing = getCategoryBySlug(slug);
      if (existing) {
        console.log(`⚠ Category "${catData.name}" already exists, skipping`);
        categoryMap.set(slug, existing);
        continue;
      }

      // Create category
      const result = await createCategory({
        name: catData.name,
        description: catData.description || '',
        parent_id: parent_id,
        image: image, // Store image URL directly
        visible: true,
        sort_order: catData.sort_order || 0,
      });

      // Store in map for parent lookups (by generated slug from name)
      // IMPORTANT: Use the normalized slug as the key (same as what we use for database lookup)
      categoryMap.set(slug, result);
      results.push(result);

      console.log(`✓ Imported: ${catData.name}${parent_id ? ` (parent: ${catData.parentSlug}, parent_id: ${parent_id})` : ' (root)'} [slug: ${slug}]`);
    } catch (err) {
      console.error(`✗ Failed to import "${catData.name}":`, err);
      errors.push({ name: catData.name, error: err.message });
    }
  }

  console.log(`Import complete! Successfully imported ${results.length} categories.`);
  if (errors.length > 0) {
    console.warn(`Failed to import ${errors.length} categories:`, errors);
  }

  return { success: results.length, errors: errors.length, results, errors };
};

