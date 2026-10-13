-- GramVikas Seed Data for Rural Maharashtra Entrepreneurs
-- Demo Business: Shree Ganesh Krishi & Kirana Stores (Baramati, Pune)

INSERT INTO users (id, email, password_hash, business_name, owner_name, village, taluka, district, phone, preferred_language, role)
VALUES (
    'demo_user_suresh_patil',
    'suresh@gramvikas.in',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- SHA256 of admin123
    'Shree Ganesh Krishi & Kirana Stores',
    'Suresh Tukaram Patil',
    'Baramati Rural',
    'Baramati',
    'Pune',
    '+919822998877',
    'mr',
    'entrepreneur'
);

INSERT INTO products (id, user_id, sku, name, name_mr, category, unit, cost_price, selling_price, current_stock, min_stock_threshold)
VALUES 
('prod_101', 'demo_user_suresh_patil', 'WKR-25', 'Wada Kolam Rice 25kg Bag', 'वाडा कोलम तांदूळ २५ किलो पोते', 'Kirana', 'bag', 1200.00, 1450.00, 3, 5),
('prod_102', 'demo_user_suresh_patil', 'FSO-1L', 'Fortune Sunflower Oil 1L', 'फॉर्च्युन सूर्यफूल तेल १ लिटर', 'Kirana', 'packet', 115.00, 135.00, 28, 10),
('prod_103', 'demo_user_suresh_patil', 'TD-1KG', 'Tur Dal Premium 1kg', 'तूर डाळ उत्तम १ किलो', 'Kirana', 'kg', 138.00, 165.00, 6, 12),
('prod_104', 'demo_user_suresh_patil', 'MD-NPK50', 'Mahadhan NPK 24:24:0 50kg', 'महाधन २४:२४:० रासायनिक खत ५० किलो', 'Seeds & Fertilizer', 'bag', 1680.00, 1850.00, 14, 8),
('prod_105', 'demo_user_suresh_patil', 'KCF-50', 'Kapila Cattle Feed / Pend 50kg', 'कपिला सरकी पेंड (गोखाद्य) ५० किलो', 'Dairy & Animal Feed', 'bag', 1950.00, 2150.00, 2, 5);

INSERT INTO customers (id, user_id, name, phone, village, taluka, district, total_purchases, outstanding_balance, payment_due_date)
VALUES
('cust_201', 'demo_user_suresh_patil', 'Dnyaneshwar Vitthal Shinde', '+919822012345', 'Songaon', 'Baramati', 'Pune', 18450.00, 2450.00, '2026-10-09'),
('cust_202', 'demo_user_suresh_patil', 'Savita Tai Ramesh Jadhav', '+919423198765', 'Rui', 'Baramati', 'Pune', 8900.00, 850.00, '2026-10-12'),
('cust_203', 'demo_user_suresh_patil', 'Babanrao Sopan Gaikwad', '+919881145678', 'Malegaon Khurd', 'Baramati', 'Pune', 32600.00, 5200.00, '2026-10-15');
