USE fln_new_db;

-- Add unit_price column if it doesn't exist
ALTER TABLE proposal_services 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT NULL;

-- Add discount_percentage column if it doesn't exist
ALTER TABLE proposal_services 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Update unit_price to match price for existing records
UPDATE proposal_services 
SET unit_price = price 
WHERE unit_price IS NULL;

-- Show the updated table structure
DESCRIBE proposal_services; 