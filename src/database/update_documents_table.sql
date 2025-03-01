USE fln_new_db;

-- Add file_content column to documents table if it doesn't exist
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS file_content MEDIUMBLOB AFTER mime_type; 