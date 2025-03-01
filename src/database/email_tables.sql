USE fln_new_db;

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