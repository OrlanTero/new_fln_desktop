<?php
class Document {
    private $conn;
    private $table = 'documents';
    private $proposalTable = 'proposals';
    private $attachmentsTable = 'attachments';
    
    // Document properties matching database columns
    public $document_id;
    public $proposal_id;
    public $document_type;
    public $document_path;
    public $file_name;
    public $file_size;
    public $mime_type;
    public $file_content;
    public $created_by;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all documents
    public function getAll() {
        try {
            $query = "SELECT d.*, p.proposal_name 
                      FROM {$this->table} d
                      LEFT JOIN {$this->proposalTable} p ON d.proposal_id = p.proposal_id
                      ORDER BY d.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get documents by proposal ID
    public function getByProposalId($proposalId) {
        try {
            $query = "SELECT d.*, p.proposal_name 
                      FROM {$this->table} d
                      LEFT JOIN {$this->proposalTable} p ON d.proposal_id = p.proposal_id
                      WHERE d.proposal_id = :proposal_id
                      ORDER BY d.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':proposal_id', $proposalId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByProposalId: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get documents by type
    public function getByType($type) {
        try {
            $query = "SELECT d.*, p.proposal_name 
                      FROM {$this->table} d
                      LEFT JOIN {$this->proposalTable} p ON d.proposal_id = p.proposal_id
                      WHERE d.document_type = :document_type
                      ORDER BY d.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':document_type', $type);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByType: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single document by ID
    public function getById($id) {
        try {
            $query = "SELECT d.*, p.proposal_name 
                      FROM {$this->table} d
                      LEFT JOIN {$this->proposalTable} p ON d.proposal_id = p.proposal_id
                      WHERE d.document_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create document
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (proposal_id, document_type, document_path, file_name, file_size, mime_type, file_content, created_by) 
                      VALUES 
                      (:proposal_id, :document_type, :document_path, :file_name, :file_size, :mime_type, :file_content, :created_by)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $proposal_id = isset($data['proposal_id']) ? intval($data['proposal_id']) : null;
            $document_type = htmlspecialchars(strip_tags($data['document_type'] ?? 'PROPOSAL'));
            $document_path = htmlspecialchars(strip_tags($data['document_path']));
            $file_name = htmlspecialchars(strip_tags($data['file_name']));
            $file_size = isset($data['file_size']) ? intval($data['file_size']) : null;
            $mime_type = isset($data['mime_type']) ? htmlspecialchars(strip_tags($data['mime_type'])) : null;
            $file_content = isset($data['file_content']) ? $data['file_content'] : null;
            $created_by = isset($data['created_by']) ? intval($data['created_by']) : null;
            
            $stmt->bindParam(':proposal_id', $proposal_id);
            $stmt->bindParam(':document_type', $document_type);
            $stmt->bindParam(':document_path', $document_path);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->bindParam(':file_size', $file_size);
            $stmt->bindParam(':mime_type', $mime_type);
            $stmt->bindParam(':file_content', $file_content, PDO::PARAM_LOB);
            $stmt->bindParam(':created_by', $created_by);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update document
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data
            if(isset($data['proposal_id'])) {
                $query .= "proposal_id = :proposal_id, ";
                $params[':proposal_id'] = intval($data['proposal_id']);
            }
            
            if(isset($data['document_type'])) {
                $query .= "document_type = :document_type, ";
                $params[':document_type'] = htmlspecialchars(strip_tags($data['document_type']));
            }
            
            if(isset($data['document_path'])) {
                $query .= "document_path = :document_path, ";
                $params[':document_path'] = htmlspecialchars(strip_tags($data['document_path']));
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
            
            if(isset($data['file_content'])) {
                $query .= "file_content = :file_content, ";
                $params[':file_content'] = $data['file_content'];
            }
            
            if(isset($data['created_by'])) {
                $query .= "created_by = :created_by, ";
                $params[':created_by'] = intval($data['created_by']);
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE document_id = :id";
            $params[':id'] = $id;
            
            // Prepare and execute the statement
            $stmt = $this->conn->prepare($query);
            
            foreach($params as $param => $value) {
                if($param === ':file_content') {
                    $stmt->bindValue($param, $value, PDO::PARAM_LOB);
                } else {
                    $stmt->bindValue($param, $value);
                }
            }
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in update: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Delete document
    public function delete($id) {
        try {
            // First get document path
            $query = "SELECT document_path FROM {$this->table} WHERE document_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $documentPath = $row['document_path'];
                
                // Delete attachments related to this document
                $query = "DELETE FROM {$this->attachmentsTable} WHERE document_id = :document_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':document_id', $id);
                $stmt->execute();
                
                // Delete the document
                $query = "DELETE FROM {$this->table} WHERE document_id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $id);
                
                if($stmt->execute()) {
                    // Try to delete the physical file if it exists
                    if(file_exists($documentPath)) {
                        @unlink($documentPath);
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
    
    // Get document content
    public function getContent($id) {
        try {
            $query = "SELECT file_content, file_name, mime_type FROM {$this->table} WHERE document_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in getContent: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 