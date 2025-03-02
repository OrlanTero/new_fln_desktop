<?php
class ServiceRequirement {
    private $conn;
    private $table = 'service_requirements';
    private $serviceTable = 'services';
    
    // ServiceRequirement properties matching database columns
    public $requirement_id;
    public $service_id;
    public $requirement;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all service requirements
    public function getAll() {
        try {
            $query = "SELECT sr.*, s.service_name 
                      FROM {$this->table} sr
                      LEFT JOIN {$this->serviceTable} s ON sr.service_id = s.service_id
                      ORDER BY sr.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get requirements by service ID
    public function getByServiceId($serviceId) {
        try {
            $query = "SELECT sr.*, s.service_name 
                      FROM {$this->table} sr
                      LEFT JOIN {$this->serviceTable} s ON sr.service_id = s.service_id
                      WHERE sr.service_id = :service_id
                      ORDER BY sr.requirement_id ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':service_id', $serviceId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByServiceId: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single requirement by ID
    public function getById($id) {
        try {
            $query = "SELECT sr.*, s.service_name 
                      FROM {$this->table} sr
                      LEFT JOIN {$this->serviceTable} s ON sr.service_id = s.service_id
                      WHERE sr.requirement_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create requirement
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (service_id, requirement) 
                      VALUES 
                      (:service_id, :requirement)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $service_id = intval($data['service_id']);
            $requirement = htmlspecialchars(strip_tags($data['requirement']));
            
            $stmt->bindParam(':service_id', $service_id);
            $stmt->bindParam(':requirement', $requirement);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update requirement
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data
            if(isset($data['service_id'])) {
                $query .= "service_id = :service_id, ";
                $params[':service_id'] = intval($data['service_id']);
            }
            
            if(isset($data['requirement'])) {
                $query .= "requirement = :requirement, ";
                $params[':requirement'] = htmlspecialchars(strip_tags($data['requirement']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE requirement_id = :id";
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
    
    // Delete requirement
    public function delete($id) {
        try {
            $query = "DELETE FROM {$this->table} WHERE requirement_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Delete all requirements for a service
    public function deleteByServiceId($serviceId) {
        try {
            $query = "DELETE FROM {$this->table} WHERE service_id = :service_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':service_id', $serviceId);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in deleteByServiceId: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Batch create requirements for a service
    public function batchCreate($serviceId, $requirements) {
        try {
            $this->conn->beginTransaction();
            
            // First delete existing requirements
            $this->deleteByServiceId($serviceId);
            
            // Then add new requirements
            $query = "INSERT INTO {$this->table} (service_id, requirement) VALUES (:service_id, :requirement)";
            $stmt = $this->conn->prepare($query);
            
            foreach($requirements as $requirement) {
                $req = htmlspecialchars(strip_tags($requirement));
                $stmt->bindParam(':service_id', $serviceId);
                $stmt->bindParam(':requirement', $req);
                $stmt->execute();
            }
            
            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Error in batchCreate: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 