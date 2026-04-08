-- D1 Database Seed Data for Sweet Layers Bakery
-- This file populates the database with initial data

-- Insert Categories
INSERT OR IGNORE INTO categories (name, description, display_order) VALUES 
('mooncakes', 'Traditional and modern mooncakes for special occasions', 1),
('pastries', 'Flaky and delicate pastries for everyday enjoyment', 2),
('special', 'Limited edition and seasonal items', 3);

-- Insert Products (from frontend SalesPage.js)
INSERT OR IGNORE INTO products (name, category, price, description, image_url, stock) VALUES 
('Heritage Mooncake', 'mooncakes', 180.00, 'Traditional lotus seed mooncake with golden crust', 'images/mooncake-traditional.jpg', 50),
('Pandan Custard Pastry', 'pastries', 45.00, 'Green pandan custard with flaky layers', 'images/pandan-custard.jpg', 100),
('Black Sesame Roll', 'pastries', 55.00, 'Traditional black sesame paste roll', 'images/black-sesame.jpg', 80),
('Salted Egg Pastry', 'pastries', 60.00, 'Golden pastry with salted egg yolk center', 'images/salted-egg.jpg', 75),
('Red Bean Mooncake', 'mooncakes', 160.00, 'Sweet red bean filling in traditional crust', 'images/red-bean.jpg', 60),
('Taro Coconut Pastry', 'pastries', 50.00, 'Creamy taro and coconut filling', 'images/taro-coconut.jpg', 90),
('White Lotus Mooncake', 'mooncakes', 190.00, 'Premium white lotus seed mooncake', 'images/mooncake-white-lotus.png', 40),
('Mung Bean Pastry', 'pastries', 40.00, 'Traditional mung bean paste pastry', 'images/mung-bean.jpg', 110);

-- Insert Inventory (sync with product stock)
INSERT OR IGNORE INTO inventory (product_id, quantity, reorder_level) 
SELECT id, stock, 10 FROM products;

-- Insert Sample Customer
INSERT OR IGNORE INTO customers (email, name, phone, address) VALUES 
('customer@sweetlayers.com', 'Test Customer', '+66812345678', '123 Bakery Street, Bangkok, Thailand');

-- Insert Sample Order
INSERT OR IGNORE INTO orders (customer_id, total, status, payment_status) 
SELECT id, 405.00, 'completed', 'paid' FROM customers WHERE email = 'customer@sweetlayers.com' LIMIT 1;

-- Insert Sample Order Items
INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price, subtotal)
SELECT 
  (SELECT id FROM orders LIMIT 1),
  1,
  2,
  180.00,
  360.00
WHERE EXISTS (SELECT 1 FROM orders);

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price, subtotal)
SELECT 
  (SELECT id FROM orders LIMIT 1),
  2,
  1,
  45.00,
  45.00
WHERE EXISTS (SELECT 1 FROM orders);

-- Insert Settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
('shop_name', 'Sweet Layers Bakery', 'Name of the bakery'),
('shop_currency', 'THB', 'Currency code'),
('shop_tax_rate', '0.07', 'Tax rate (7%)'),
('shop_email', 'info@sweetlayers.com', 'Contact email'),
('shop_phone', '+66812345678', 'Contact phone'),
('enable_notifications', 'true', 'Enable email notifications'),
('maintenance_mode', 'false', 'Maintenance mode status');

-- Insert Analytics Events (sample data)
INSERT OR IGNORE INTO analytics_events (event_type, event_data, customer_id) 
SELECT 'page_view', '{"page":"home"}', id FROM customers WHERE email = 'customer@sweetlayers.com' LIMIT 1;

INSERT OR IGNORE INTO analytics_events (event_type, event_data, customer_id) 
SELECT 'product_view', '{"product_id":1}', id FROM customers WHERE email = 'customer@sweetlayers.com' LIMIT 1;

INSERT OR IGNORE INTO analytics_events (event_type, event_data, customer_id) 
SELECT 'add_to_cart', '{"product_id":1,"quantity":2}', id FROM customers WHERE email = 'customer@sweetlayers.com' LIMIT 1;
