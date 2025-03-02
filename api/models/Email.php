<?php
class Email {
    private $conn;
    private $table = 'emails';
    private $proposalTable = 'proposals';
    private $attachmentsTable = 'attachments';
    
    // Email properties matching database columns
    public $email_id;
    public $proposal_id;
    public $subject;
    public $sender;
    public $recipient;
    public $cc;
    public $message;
    public $sent_at;
    public $status;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all emails
    public function getAll() {
        try {
            $query = "SELECT e.*, p.proposal_name 
                      FROM {$this->table} e
                      LEFT JOIN {$this->proposalTable} p ON e.proposal_id = p.proposal_id
                      ORDER BY e.sent_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get emails by proposal ID
    public function getByProposalId($proposalId) {
        try {
            $query = "SELECT e.*, p.proposal_name 
                      FROM {$this->table} e
                      LEFT JOIN {$this->proposalTable} p ON e.proposal_id = p.proposal_id
                      WHERE e.proposal_id = :proposal_id
                      ORDER BY e.sent_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':proposal_id', $proposalId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByProposalId: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get emails by status
    public function getByStatus($status) {
        try {
            $query = "SELECT e.*, p.proposal_name 
                      FROM {$this->table} e
                      LEFT JOIN {$this->proposalTable} p ON e.proposal_id = p.proposal_id
                      WHERE e.status = :status
                      ORDER BY e.sent_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByStatus: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single email by ID
    public function getById($id) {
        try {
            $query = "SELECT e.*, p.proposal_name 
                      FROM {$this->table} e
                      LEFT JOIN {$this->proposalTable} p ON e.proposal_id = p.proposal_id
                      WHERE e.email_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create email
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (proposal_id, subject, sender, recipient, cc, message, status) 
                      VALUES 
                      (:proposal_id, :subject, :sender, :recipient, :cc, :message, :status)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $proposal_id = isset($data['proposal_id']) ? intval($data['proposal_id']) : null;
            $subject = htmlspecialchars(strip_tags($data['subject']));
            $sender = htmlspecialchars(strip_tags($data['sender']));
            $recipient = htmlspecialchars(strip_tags($data['recipient']));
            $cc = isset($data['cc']) ? htmlspecialchars(strip_tags($data['cc'])) : null;
            $message = $data['message']; // Don't strip tags from message to allow HTML
            $status = htmlspecialchars(strip_tags($data['status'] ?? 'DRAFT'));
            
            $stmt->bindParam(':proposal_id', $proposal_id);
            $stmt->bindParam(':subject', $subject);
            $stmt->bindParam(':sender', $sender);
            $stmt->bindParam(':recipient', $recipient);
            $stmt->bindParam(':cc', $cc);
            $stmt->bindParam(':message', $message);
            $stmt->bindParam(':status', $status);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update email
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
            
            if(isset($data['subject'])) {
                $query .= "subject = :subject, ";
                $params[':subject'] = htmlspecialchars(strip_tags($data['subject']));
            }
            
            if(isset($data['sender'])) {
                $query .= "sender = :sender, ";
                $params[':sender'] = htmlspecialchars(strip_tags($data['sender']));
            }
            
            if(isset($data['recipient'])) {
                $query .= "recipient = :recipient, ";
                $params[':recipient'] = htmlspecialchars(strip_tags($data['recipient']));
            }
            
            if(isset($data['cc'])) {
                $query .= "cc = :cc, ";
                $params[':cc'] = htmlspecialchars(strip_tags($data['cc']));
            }
            
            if(isset($data['message'])) {
                $query .= "message = :message, ";
                $params[':message'] = $data['message']; // Don't strip tags from message
            }
            
            if(isset($data['status'])) {
                $query .= "status = :status, ";
                $params[':status'] = htmlspecialchars(strip_tags($data['status']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE email_id = :id";
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
    
    // Delete email
    public function delete($id) {
        try {
            // First delete attachments related to this email
            $query = "DELETE FROM {$this->attachmentsTable} WHERE email_id = :email_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email_id', $id);
            $stmt->execute();
            
            // Then delete the email
            $query = "DELETE FROM {$this->table} WHERE email_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get attachments for an email
    public function getAttachments($emailId) {
        try {
            $query = "SELECT * FROM {$this->attachmentsTable} WHERE email_id = :email_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email_id', $emailId);
            $stmt->execute();
            
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAttachments: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Add attachment to email
    public function addAttachment($emailId, $attachmentData) {
        try {
            $query = "INSERT INTO {$this->attachmentsTable} 
                      (email_id, file_path, file_name, file_size, mime_type) 
                      VALUES 
                      (:email_id, :file_path, :file_name, :file_size, :mime_type)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $file_path = htmlspecialchars(strip_tags($attachmentData['file_path']));
            $file_name = htmlspecialchars(strip_tags($attachmentData['file_name']));
            $file_size = isset($attachmentData['file_size']) ? intval($attachmentData['file_size']) : null;
            $mime_type = isset($attachmentData['mime_type']) ? htmlspecialchars(strip_tags($attachmentData['mime_type'])) : null;
            
            $stmt->bindParam(':email_id', $emailId);
            $stmt->bindParam(':file_path', $file_path);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->bindParam(':file_size', $file_size);
            $stmt->bindParam(':mime_type', $mime_type);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in addAttachment: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update email status
    public function updateStatus($id, $status) {
        try {
            $query = "UPDATE {$this->table} SET status = :status WHERE email_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in updateStatus: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 