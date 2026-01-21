const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gowritour',
  password: 'postgres',
  port: 5432,
});

async function addContentImageColumn() {
  try {
    console.log('🔄 Adding content_image column to categories table...');
    
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND column_name = 'content_image'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ content_image column already exists');
    } else {
      // Add the column
      await pool.query(`
        ALTER TABLE categories 
        ADD COLUMN content_image TEXT DEFAULT ''
      `);
      console.log('✅ content_image column added successfully');
    }
    
    // Verify the change
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categories'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current categories table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addContentImageColumn();
