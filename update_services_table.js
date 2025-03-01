const db = require('./src/database/connection');

async function alterServicesTable() {
  try {
    console.log('Altering services table...');
    
    // Check if price column already exists
    const [columns] = await db.query('SHOW COLUMNS FROM services');
    const priceExists = columns.some(col => col.Field === 'price');
    
    if (!priceExists) {
      // Add price column if it doesn't exist
      console.log('Adding price column...');
      await db.query('ALTER TABLE services ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00 AFTER service_name');
      
      // Update price values from corporation_partnership
      console.log('Updating price values from corporation_partnership...');
      await db.query('UPDATE services SET price = corporation_partnership');
      
      // Drop old columns
      console.log('Dropping old columns...');
      await db.query('ALTER TABLE services DROP COLUMN corporation_partnership, DROP COLUMN sole_proprietorship');
      
      console.log('Services table structure updated successfully.');
    } else {
      console.log('Price column already exists. No changes needed.');
    }
    
    // Show current table structure
    const [updatedColumns] = await db.query('SHOW COLUMNS FROM services');
    console.log('Current services table columns:');
    updatedColumns.forEach(col => console.log(`- ${col.Field}`));
    
  } catch (err) {
    console.error('Error altering services table:', err);
  } finally {
    process.exit();
  }
}

alterServicesTable(); 