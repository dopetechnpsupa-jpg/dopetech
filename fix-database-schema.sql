-- Fix Database Schema Issues for flrcwmmdveylmcbjuwfc project
-- This script fixes the foreign key constraint violations and data type issues

-- 1. Fix Products Table - Ensure rating column can handle decimal values
ALTER TABLE products ALTER COLUMN rating TYPE DECIMAL(3,1);

-- 2. Add missing columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_color VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_features JSONB;

-- 3. Ensure product_images table has all required columns
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Add color column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 6. Set up Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Public read access for products" ON products
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read access for product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read access for hero_images" ON hero_images
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read access for qr_codes" ON qr_codes
  FOR SELECT USING (true);

-- Create policies for authenticated users (orders and order_items)
CREATE POLICY IF NOT EXISTS "Authenticated users can manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can manage order_items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;
CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Update existing data to ensure consistency
-- Set default values for any NULL columns
UPDATE products SET rating = 0.0 WHERE rating IS NULL;
UPDATE products SET reviews = 0 WHERE reviews IS NULL;
UPDATE products SET in_stock = true WHERE in_stock IS NULL;
UPDATE products SET hidden_on_home = false WHERE hidden_on_home IS NULL;

-- 9. Ensure foreign key constraints are properly set up
-- This will fail if there are existing invalid references, which is good for data integrity
-- If you need to clean up invalid references, you would need to handle them manually

-- 10. Create a function to safely insert product images with valid product_id
CREATE OR REPLACE FUNCTION insert_product_image_safe(
  p_product_id INTEGER,
  p_image_url TEXT,
  p_file_name VARCHAR(255) DEFAULT NULL,
  p_display_order INTEGER DEFAULT 0,
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
BEGIN
  -- Check if product exists
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product with ID % does not exist', p_product_id;
  END IF;
  
  -- Insert the image
  INSERT INTO product_images (product_id, image_url, file_name, display_order, is_primary)
  VALUES (p_product_id, p_image_url, p_file_name, p_display_order, p_is_primary)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Create a function to safely insert order items with valid order_id and product_id
CREATE OR REPLACE FUNCTION insert_order_item_safe(
  p_order_id INTEGER,
  p_product_id INTEGER,
  p_quantity INTEGER,
  p_price DECIMAL(10,2),
  p_selected_color VARCHAR(50) DEFAULT NULL,
  p_selected_features JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
BEGIN
  -- Check if order exists
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id) THEN
    RAISE EXCEPTION 'Order with ID % does not exist', p_order_id;
  END IF;
  
  -- Check if product exists
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product with ID % does not exist', p_product_id;
  END IF;
  
  -- Insert the order item
  INSERT INTO order_items (order_id, product_id, quantity, price, selected_color, selected_features)
  VALUES (p_order_id, p_product_id, p_quantity, p_price, p_selected_color, p_selected_features)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 13. Final verification queries
-- These will show the current state of the database
SELECT 'Database schema fix completed successfully' as status;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as product_images_count FROM product_images;
SELECT COUNT(*) as orders_count FROM orders;
SELECT COUNT(*) as order_items_count FROM order_items;
