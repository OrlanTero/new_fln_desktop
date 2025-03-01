-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Insert admin user
-- Note: The password '12345' is hashed using bcrypt
INSERT INTO users (name, email, password, role) 
VALUES (
  'Administrator',
  'jhonorlantero@gmail.com',
  '$2a$10$6jXRP/YWZM3qyf4FTkpQR.oJ5.4L2YyZcqYHUGPQYWzXvWPL9Bvie', -- hashed password for '12345'
  'Admin'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role);

-- Create client_types table
CREATE TABLE IF NOT EXISTS client_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    client_id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    branch VARCHAR(255),
    address TEXT NOT NULL,
    address2 TEXT,
    tax_type VARCHAR(50),
    account_for VARCHAR(255),
    rdo VARCHAR(100),
    email_address VARCHAR(255),
    description TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_type_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (client_type_id) REFERENCES client_types(type_id),
    INDEX idx_client_name (client_name),
    INDEX idx_company (company),
    INDEX idx_email (email_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
    service_category_id INT PRIMARY KEY AUTO_INCREMENT,
    service_category_name VARCHAR(255) NOT NULL,
    priority_number INT,
    added_by_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by_id) REFERENCES users(id),
    INDEX idx_category_name (service_category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_category_id INT,
    service_name VARCHAR(255) NOT NULL,
    corporation_partnership DECIMAL(10,2),
    sole_proprietorship DECIMAL(10,2),
    remarks TEXT,
    timeline VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_category_id) REFERENCES service_categories(service_category_id),
    INDEX idx_service_name (service_name),
    INDEX idx_service_category (service_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 