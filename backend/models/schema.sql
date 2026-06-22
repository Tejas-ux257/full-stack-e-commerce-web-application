DROP DATABASE IF EXISTS website_db;
CREATE DATABASE website_db;
USE website_db;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Seed Roles
INSERT IGNORE INTO roles (id, name) VALUES (1, 'admin'), (2, 'user');

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 2,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Seed admin user (password is 'admin123', bcrypt hashed)
INSERT IGNORE INTO users (id, username, email, password, role_id) 
VALUES (1, 'admin', 'admin@example.com', '$2a$10$Euy63rT6182QzQp03mE8K.cM4Jd.tF8M56wKk13b94Vz7q7H.G/hK', 1);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Seed default categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Electronics', 'Smartphones, Laptops, Accessories and more'),
(2, 'Clothing', 'Men, Women and Kids fashion garments'),
(3, 'Home & Living', 'Furniture, Kitchenware, and Home decor items'),
(4, 'Books', 'Fiction, Non-fiction, Academic and Kids books');

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    likes INT DEFAULT 0,
    category_id INT,
    stock INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Seed initial products
INSERT IGNORE INTO products (id, name, description, price, likes, category_id, stock) VALUES
(1, 'Wireless Noise-Cancelling Headphones', 'Premium sound experience with active noise cancellation and 30-hour battery life.', 12999.00, 15, 1, 15),
(2, 'Mechanical Gaming Keyboard', 'RGB Backlit mechanical keyboard with tactile blue switches and custom keys.', 3499.00, 24, 1, 25),
(3, 'Slim-Fit Denim Jacket', 'Classic denim jacket made with premium stretch cotton for ultimate comfort.', 2499.00, 8, 2, 30),
(4, 'Ergonomic Office Chair', 'Breathable mesh back with adjustable lumbar support and headrest.', 8999.00, 12, 3, 10),
(5, 'The Art of Software Engineering', 'An insightful guide on architecture, clean code, and engineering methodologies.', 799.00, 19, 4, 50);

-- 5. Product Images table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed default product images
INSERT IGNORE INTO product_images (id, product_id, image_url, is_primary) VALUES
(1, 1, 'https://picsum.photos/400/400?random=11', TRUE),
(2, 2, 'https://picsum.photos/400/400?random=12', TRUE),
(3, 3, 'https://picsum.photos/400/400?random=13', TRUE),
(4, 4, 'https://picsum.photos/400/400?random=14', TRUE),
(5, 5, 'https://picsum.photos/400/400?random=15', TRUE);

-- 6. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    reviewer_name VARCHAR(100) DEFAULT 'Guest',
    review TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed initial reviews
INSERT IGNORE INTO reviews (id, product_id, reviewer_name, review, rating) VALUES
(1, 1, 'Guest', 'Superb noise cancellation! Battery lasts forever.', 5),
(2, 1, 'Guest', 'Good audio quality, but is slightly heavy on my ears.', 4),
(3, 2, 'Guest', 'Very clicky and responsive. The RGB patterns are beautiful.', 5);

-- 7. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY user_product (user_id, product_id)
);

-- 9. Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY cart_product (cart_id, product_id)
);

-- 11. Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 13. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
