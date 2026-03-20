-- Seed the 7 menu items
-- discountable = TRUE for ผัดไทยไฟส้ม, ผัดไทยไฟชมพู, ผัดไทยไฟเขียว (eligible for 5% pair discount)
INSERT INTO products (name, price, color, discountable) VALUES
  ('ผัดไทยไฟแดง',   50.00,  'red',    FALSE),
  ('ผัดไทยไฟเขียว',  40.00,  'green',  TRUE),
  ('ผัดไทยไฟน้ำเงิน', 30.00,  'blue',   FALSE),
  ('ผัดไทยไฟเหลือง', 50.00,  'yellow', FALSE),
  ('ผัดไทยไฟชมพู',   80.00,  'pink',   TRUE),
  ('ผัดไทยไฟม่วง',   90.00,  'purple', FALSE),
  ('ผัดไทยไฟส้ม',    120.00, 'orange', TRUE)
ON CONFLICT (name) DO NOTHING;
