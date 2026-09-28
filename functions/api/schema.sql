-- Cloudflare D1 SQLite Database Schema for Anh Khải Shop

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'nam',
    price INTEGER NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    badge TEXT DEFAULT '',
    stock INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT,
    notes TEXT,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'delivered', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Default Admin User (Username: anhkhaishop, Password: admin12345 - SHA-256 hash)
INSERT OR IGNORE INTO users (id, username, email, password_hash, role)
VALUES (1, 'anhkhaishop', 'admin@anhkhaishop.com', '41e5653fc7aeb894026d6bb7b2db7f65902b454945fa8fd65a6327047b5277fb', 'admin');

-- Sample Initial Products
INSERT OR IGNORE INTO products (id, name, category, price, description, image_url, badge) VALUES
(1, 'Áo phông LV', 'nam', 300000, 'Hàng mới về cực chất cho anh em, chất liệu cotton cao cấp thoáng mát.', 'assets/images/anhaolv.jpg', 'Hot'),
(2, 'Áo khoác Gucci', 'nam', 500000, 'Phong cách cao cấp, kiểu dáng thời thượng không có gì để chê.', 'assets/images/khoacgc.jpg', 'Mới'),
(3, 'Giày JD', 'phukien', 700000, 'Thiết kế thời thượng, chất liệu cao cấp, phối đồ cực ngầu.', 'assets/images/giayjd.jpg', 'Hot'),
(4, 'Túi Xách LV', 'phukien', 300000, 'Thiết kế sang trọng, ngăn chứa rộng rãi, phù hợp mọi outfit.', 'assets/images/tuilv.jpg', 'Hot'),
(5, 'Dép Hermes', 'phukien', 350000, 'Chất liệu da êm ái, kiểu dáng quai chữ H sang trọng và lịch sự.', 'assets/images/dephm.jpg', 'Mới');
