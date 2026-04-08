-- Additional Seed Data for CockroachDB
-- Add the remaining products to complete the catalog (currently 5, need 8)

-- Category IDs from your database:
-- Mooncakes: c4b5865b-9255-43d6-86b7-f754b853af19
-- Pastries: bea749a7-9a18-4382-9aad-9c9e9fdf0979
-- Special: af4249c5-2fc6-450f-87c3-a4348a8265cc

INSERT INTO products (id, category_id, name, slug, description, price, compare_price, image_url, in_stock) VALUES 
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c4b5865b-9255-43d6-86b7-f754b853af19', 'Red Bean Mooncake', 'red-bean-mooncake', 'Sweet red bean filling in traditional crust', 160.00, 180.00, 'images/red-bean.jpg', true),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'bea749a7-9a18-4382-9aad-9c9e9fdf0979', 'Taro Coconut Pastry', 'taro-coconut-pastry', 'Creamy taro and coconut filling', 50.00, 60.00, 'images/taro-coconut.jpg', true),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 'c4b5865b-9255-43d6-86b7-f754b853af19', 'White Lotus Mooncake', 'white-lotus-mooncake', 'Premium white lotus seed mooncake', 190.00, 220.00, 'images/mooncake-white-lotus.png', true);
