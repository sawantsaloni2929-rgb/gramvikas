-- GramVikas Relational Database Schema
-- Compatible with MySQL 8+, PostgreSQL 14+, and SQLite 3+
-- Supports Offline-First Client Synchronization, Idempotency, and Audit Trails

-- 1. Users & Rural Entrepreneurs Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    business_name VARCHAR(191) NOT NULL,
    owner_name VARCHAR(191) NOT NULL,
    village VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'mr',
    role VARCHAR(20) DEFAULT 'entrepreneur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products & Inventory Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) DEFAULT 'packet',
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_threshold INT NOT NULL DEFAULT 5,
    barcode VARCHAR(100),
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Customers & Khata Ledger Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    village VARCHAR(100),
    taluka VARCHAR(100),
    district VARCHAR(100),
    total_purchases DECIMAL(14, 2) DEFAULT 0.00,
    outstanding_balance DECIMAL(14, 2) DEFAULT 0.00,
    payment_due_date DATE,
    last_payment_date TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Sales Orders / Invoices Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    invoice_number VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    transaction_date TIMESTAMP NOT NULL,
    notes TEXT,
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 5. Sale Line Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'unit',
    cost_price DECIMAL(12, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Operational Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    payment_mode VARCHAR(50) DEFAULT 'cash',
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Customer Due Collection Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'cash',
    receipt_note TEXT,
    sync_status VARCHAR(20) DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 8. Inventory Movement Audit Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    quantity_change INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 9. Smart SMS Notifications Log Table
CREATE TABLE IF NOT EXISTS sms_queue (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    category VARCHAR(50) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(255),
    message_text TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'draft',
    delivery_provider VARCHAR(50) DEFAULT 'MSG91',
    provider_message_id VARCHAR(100),
    sent_at TIMESTAMP,
    scheduled_date DATE,
    error_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Verified Government Schemes Table
CREATE TABLE IF NOT EXISTS verified_schemes (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_mr VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_mr TEXT NOT NULL,
    benefits TEXT NOT NULL,
    benefits_mr TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    eligibility_mr TEXT NOT NULL,
    deadline VARCHAR(100) NOT NULL,
    verified_date DATE NOT NULL,
    official_source VARCHAR(255) NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_customers_user ON customers(user_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_sms_status ON sms_queue(status);
