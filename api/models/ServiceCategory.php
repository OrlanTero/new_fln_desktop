<?php
class ServiceCategory {
    private $conn;
    private $table = 'service_categories';
    private $userTable = 'users';
    
    // ServiceCategory properties matching database columns
    public $service_category_id;
    public $service_category_name;
    public $priority_number;
    public $added_by_id;
    public $description;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all service categories
    public function getAll() {
        try {
            $query = "SELECT sc.*, u.name as added_by_name 
                      FROM {$this->table} sc
                      LEFT JOIN {$this->userTable} u ON sc.added_by_id = u.id
                      ORDER BY sc.priority_number ASC, sc.service_category_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single service category by ID
    public function getById($id) {
        try {
            $query = "SELECT sc.*, u.name as added_by_name 
                      FROM {$this->table} sc
                      LEFT JOIN {$this->userTable} u ON sc.added_by_id = u.id
                      WHERE sc.service_category_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create service category
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (service_category_name, priority_number, added_by_id, description) 
                      VALUES 
                      (:service_category_name, :priority_number, :added_by_id, :description)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $service_category_name = htmlspecialchars(strip_tags($data['service_category_name']));
            $priority_number = isset($data['priority_number']) ? intval($data['priority_number']) : null;
            $added_by_id = isset($data['added_by_id']) ? intval($data['added_by_id']) : null;
            $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
            
            $stmt->bindParam(':service_category_name', $service_category_name);
            $stmt->bindParam(':priority_number', $priority_number);
            $stmt->bindParam(':added_by_id', $added_by_id);
            $stmt->bindParam(':description', $description);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update service category
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data
            if(isset($data['service_category_name'])) {
                $query .= "service_category_name = :service_category_name, ";
                $params[':service_category_name'] = htmlspecialchars(strip_tags($data['service_category_name']));
            }
            
            if(isset($data['priority_number'])) {
                $query .= "priority_number = :priority_number, ";
                $params[':priority_number'] = intval($data['priority_number']);
            }
            
            if(isset($data['added_by_id'])) {
                $query .= "added_by_id = :added_by_id, ";
                $params[':added_by_id'] = intval($data['added_by_id']);
            }
            
            if(isset($data['description'])) {
                $query .= "description = :description, ";
                $params[':description'] = htmlspecialchars(strip_tags($data['description']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE service_category_id = :id";
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
    
    // Delete service category
    public function delete($id) {
        try {
            $query = "DELETE FROM {$this->table} WHERE service_category_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update priority numbers
    public function updatePriorities($priorities) {
        try {
            $this->conn->beginTransaction();
            
            $query = "UPDATE {$this->table} SET priority_number = :priority_number WHERE service_category_id = :id";
            $stmt = $this->conn->prepare($query);
            
            foreach($priorities as $id => $priority) {
                $stmt->bindValue(':priority_number', intval($priority));
                $stmt->bindValue(':id', intval($id));
                $stmt->execute();
            }
            
            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Error in updatePriorities: " . $e->getMessage());
            throw $e;
        }
    }
}
?>