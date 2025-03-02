<?php
class ClientType {
    private $conn;
    private $table = 'client_types';
    
    // Client Type properties matching database columns
    public $type_id;
    public $name;
    public $description;
    public $status;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all client types
    public function getAll() {
        try {
            $query = "SELECT type_id, name, description, status, created_at, updated_at 
                      FROM {$this->table} 
                      ORDER BY name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single client type by ID
    public function getById($id) {
        try {
            $query = "SELECT type_id, name, description, status, created_at, updated_at 
                      FROM {$this->table} 
                      WHERE type_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create client type
    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  (name, description, status) 
                  VALUES 
                  (:name, :description, :status)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $name = htmlspecialchars(strip_tags($data['name']));
        $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
        $status = $data['status'] ?? 'active';
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':status', $status);
        
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update client type
    public function update($id, $data) {
        // Start building the query
        $query = "UPDATE {$this->table} SET ";
        $params = [];
        
        // Add fields that are present in the data
        if(isset($data['name'])) {
            $query .= "name = :name, ";
            $params[':name'] = htmlspecialchars(strip_tags($data['name']));
        }
        
        if(isset($data['description'])) {
            $query .= "description = :description, ";
            $params[':description'] = htmlspecialchars(strip_tags($data['description']));
        }
        
        if(isset($data['status'])) {
            $query .= "status = :status, ";
            $params[':status'] = htmlspecialchars(strip_tags($data['status']));
        }
        
        // Add updated_at timestamp
        $query .= "updated_at = NOW(), ";
        
        // Remove trailing comma if there are updates
        if (!empty($params)) {
            $query = rtrim($query, ', ');
        } else {
            // No updates to make
            return true;
        }
        
        $query .= " WHERE type_id = :id";
        $params[':id'] = $id;
        
        // Prepare and execute the query
        $stmt = $this->conn->prepare($query);
        
        foreach($params as $param => $value) {
            $stmt->bindValue($param, $value);
        }
        
        return $stmt->execute();
    }
    
    // Delete client type
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE type_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?> 