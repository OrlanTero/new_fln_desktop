USE fln_new_db;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id INT,
  document_type ENUM('PROPOSAL', 'INVOICE', 'CONTRACT', 'RECEIPT', 'OTHER') DEFAULT 'PROPOSAL',
  document_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  file_content MEDIUMBLOB,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE CASCADE
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  email_id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id INT,
  subject VARCHAR(255) NOT NULL,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  cc TEXT,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('SENT', 'FAILED', 'DRAFT') DEFAULT 'DRAFT',
  FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE CASCADE
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT,
  document_id INT,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(email_id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE SET NULL
);

-- Create company_info table
CREATE TABLE IF NOT EXISTS company_info (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  tax_id VARCHAR(50),
  logo_url VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default company info if not exists
INSERT INTO company_info (company_id, company_name, address, phone, email, website)
SELECT 1, 'Your Company Name', 'Company Address', '+1234567890', 'info@yourcompany.com', 'www.yourcompany.com'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM company_info WHERE company_id = 1); 