-- Seed Data for Authentication and Members System
-- This file creates test accounts for the e-commerce shop

-- Owner Account (Business Role)
INSERT INTO users (email, name, password, roles, phone) 
VALUES ('owner@sweetlayers.com', 'Shop Owner', 'owner123', '["business", "user"]', '+66812345678')
ON CONFLICT(email) DO NOTHING;

-- Admin Account
INSERT INTO users (email, name, password, roles, phone) 
VALUES ('admin@sweetlayers.com', 'Admin User', 'admin123', '["admin", "business", "user"]', '+66812345679')
ON CONFLICT(email) DO NOTHING;

-- Test Customer Account
INSERT INTO users (email, name, password, roles, phone) 
VALUES ('customer@test.com', 'Test Customer', 'customer123', '["user"]', '+66812345680')
ON CONFLICT(email) DO NOTHING;

-- Sample Address for Test Customer
INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default)
SELECT 
  (SELECT id FROM users WHERE email = 'customer@test.com'),
  '123 Sukhumvit Road',
  'Apt 456',
  'Bangkok',
  'Bangkok',
  '10110',
  'Thailand',
  1
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'customer@test.com')
ON CONFLICT DO NOTHING;
