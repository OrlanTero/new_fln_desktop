USE fln_new_db;

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  proposal_id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  proposal_reference VARCHAR(20) NOT NULL,
  proposal_name VARCHAR(255) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  has_downpayment BOOLEAN DEFAULT FALSE,
  downpayment_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED') DEFAULT 'DRAFT',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE
);

-- Create proposal_services table (for services included in a proposal)
CREATE TABLE IF NOT EXISTS proposal_services (
  proposal_service_id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id INT,
  client_id INT NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  attn_to VARCHAR(255),
  start_date DATE,
  end_date DATE,
  description TEXT,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE
);

-- Create project_services table (for services included in a project)
CREATE TABLE IF NOT EXISTS project_services (
  project_service_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- Create a function to generate proposal reference numbers
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_proposal_reference() 
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
  DECLARE year_prefix VARCHAR(10);
  DECLARE next_id INT;
  
  SET year_prefix = CONCAT('PR-', YEAR(CURDATE()), '-');
  
  -- Get the next ID
  SELECT IFNULL(MAX(SUBSTRING_INDEX(proposal_reference, '-', -1) + 0), 0) + 1 
  INTO next_id
  FROM proposals 
  WHERE proposal_reference LIKE CONCAT(year_prefix, '%');
  
  -- Format with leading zeros (4 digits)
  RETURN CONCAT(year_prefix, LPAD(next_id, 4, '0'));
END //
DELIMITER ; 