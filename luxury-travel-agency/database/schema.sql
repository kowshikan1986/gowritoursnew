-- PostgreSQL Database Schema for Gowri Tours
-- Run this script on your PostgreSQL database: gowritour

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS hero_banners CASCADE;
DROP TABLE IF EXISTS logos CASCADE;
DROP TABLE IF EXISTS ads CASCADE;

-- Categories table (supports parent-child relationships)
CREATE TABLE categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  content_image TEXT DEFAULT '',
  parent_id VARCHAR(255),
  visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create index on parent_id for faster queries
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Tours table
CREATE TABLE tours (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10, 2) DEFAULT 0,
  duration VARCHAR(100) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  featured_image TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  category_id VARCHAR(255) NOT NULL,
  tour_code VARCHAR(100) DEFAULT '',
  details_json TEXT DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_tours_category_id ON tours(category_id);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_is_active ON tours(is_active);

-- Hero Banners table
CREATE TABLE hero_banners (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500) DEFAULT '',
  cta_text VARCHAR(100) DEFAULT '',
  cta_link VARCHAR(500) DEFAULT '',
  background_image TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hero_banners_priority ON hero_banners(priority);

-- Logos table
CREATE TABLE logos (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads table
CREATE TABLE ads (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image TEXT DEFAULT '',
  priority INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ads_priority ON ads(priority);

-- Insert sample hero banner
INSERT INTO hero_banners (id, title, subtitle, background_image, cta_text, cta_link, is_active, priority)
VALUES (
  'hero-1',
  'Extraordinary Journeys',
  'Discover the world''s most exclusive destinations with personalized luxury travel experiences crafted to perfection for the discerning traveler.',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop',
  'Explore Destinations',
  '#destinations',
  TRUE,
  1
);

-- Create function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_banners_updated_at BEFORE UPDATE ON hero_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logos_updated_at BEFORE UPDATE ON logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully!' as message;
