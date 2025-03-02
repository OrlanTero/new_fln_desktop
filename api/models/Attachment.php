<?php
class Attachment {
    private $conn;
    private $table = 'attachments';
    private $emailTable = 'emails';
    private $documentTable = 'documents';
    
    // Attachment properties matching database columns
    public $attachment_id;
    public $email_id;
    public $document_id;
    public $file_path;
    public $file_name;
    public $file_size;
    public $mime_type;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all attachments
    public function getAll() {
        try {
            $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get attachments by email ID
    public function getByEmailId($emailId) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE email_id = :email_id ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email_id', $emailId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByEmailId: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get attachments by document ID
    public function getByDocumentId($documentId) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE document_id = :document_id ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':document_id', $documentId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByDocumentId: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single attachment by ID
    public function getById($id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE attachment_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create attachment
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (email_id, document_id, file_path, file_name, file_size, mime_type) 
                      VALUES 
                      (:email_id, :document_id, :file_path, :file_name, :file_size, :mime_type)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $email_id = isset($data['email_id']) ? intval($data['email_id']) : null;
            $document_id = isset($data['document_id']) ? intval($data['document_id']) : null;
            $file_path = htmlspecialchars(strip_tags($data['file_path']));
            $file_name = htmlspecialchars(strip_tags($data['file_name']));
            $file_size = isset($data['file_size']) ? intval($data['file_size']) : null;
            $mime_type = isset($data['mime_type']) ? htmlspecialchars(strip_tags($data['mime_type'])) : null;
            
            $stmt->bindParam(':email_id', $email_id);
            $stmt->bindParam(':document_id', $document_id);
            $stmt->bindParam(':file_path', $file_path);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->bindParam(':file_size', $file_size);
            $stmt->bindParam(':mime_type', $mime_type);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update attachment
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data
            if(isset($data['email_id'])) {
                $query .= "email_id = :email_id, ";
                $params[':email_id'] = intval($data['email_id']);
            }
            
            if(isset($data['document_id'])) {
                $query .= "document_id = :document_id, ";
                $params[':document_id'] = intval($data['document_id']);
            }
            
            if(isset($data['file_path'])) {
                $query .= "file_path = :file_path, ";
                $params[':file_path'] = htmlspecialchars(strip_tags($data['file_path']));
            }
            
            if(isset($data['file_name'])) {
                $query .= "file_name = :file_name, ";
                $params[':file_name'] = htmlspecialchars(strip_tags($data['file_name']));
            }
            
            if(isset($data['file_size'])) {
                $query .= "file_size = :file_size, ";
                $params[':file_size'] = intval($data['file_size']);
            }
            
            if(isset($data['mime_type'])) {
                $query .= "mime_type = :mime_type, ";
                $params[':mime_type'] = htmlspecialchars(strip_tags($data['mime_type']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE attachment_id = :id";
            $params[':id'] = $id;
            
            // Prepare and execute the statement
            $stmt = $this->conn->prepare($query);
            
            foreach($params as $param => $value) {
                $stmt->bindValue($param, $value);
            }
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in update: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Delete attachment
    public function delete($id) {
        try {
            // Get file path before deleting
            $query = "SELECT file_path FROM {$this->table} WHERE attachment_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $filePath = $row['file_path'];
                
                // Delete from database
                $query = "DELETE FROM {$this->table} WHERE attachment_id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $id);
                
                if($stmt->execute()) {
                    // Try to delete the physical file if it exists
                    if(file_exists($filePath)) {
                        @unlink($filePath);
                    }
                    return true;
                }
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 