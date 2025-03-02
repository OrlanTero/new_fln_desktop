<?php
class Service {
    private $conn;
    private $table = 'services';
    private $categoryTable = 'service_categories';
    private $requirementsTable = 'service_requirements';
    
    // Service properties matching database columns
    public $service_id;
    public $service_category_id;
    public $service_name;
    public $price;
    public $remarks;
    public $timeline;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all services
    public function getAll() {
        try {
            $query = "SELECT s.*, sc.service_category_name 
                      FROM {$this->table} s
                      LEFT JOIN {$this->categoryTable} sc ON s.service_category_id = sc.service_category_id
                      ORDER BY s.service_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get services by category
    public function getByCategory($categoryId) {
        try {
            $query = "SELECT s.*, sc.service_category_name 
                      FROM {$this->table} s
                      LEFT JOIN {$this->categoryTable} sc ON s.service_category_id = sc.service_category_id
                      WHERE s.service_category_id = :category_id
                      ORDER BY s.service_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':category_id', $categoryId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByCategory: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single service by ID
    public function getById($id) {
        try {
            $query = "SELECT s.*, sc.service_category_name 
                      FROM {$this->table} s
                      LEFT JOIN {$this->categoryTable} sc ON s.service_category_id = sc.service_category_id
                      WHERE s.service_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create service
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (service_name, service_category_id, price, remarks, timeline) 
                      VALUES 
                      (:service_name, :service_category_id, :price, :remarks, :timeline)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data - handle both naming conventions
            // Check for service_name or name
            $service_name = '';
            if (isset($data['service_name'])) {
                $service_name = htmlspecialchars(strip_tags($data['service_name']));
            } elseif (isset($data['name'])) {
                $service_name = htmlspecialchars(strip_tags($data['name']));
            }
            
            // Check for service_category_id or category_id
            $service_category_id = null;
            if (isset($data['service_category_id'])) {
                $service_category_id = intval($data['service_category_id']);
            } elseif (isset($data['category_id'])) {
                $service_category_id = intval($data['category_id']);
            }
            
            $price = floatval($data['price'] ?? 0);
            $remarks = isset($data['remarks']) ? htmlspecialchars(strip_tags($data['remarks'])) : null;
            $timeline = isset($data['timeline']) ? htmlspecialchars(strip_tags($data['timeline'])) : null;
            
            $stmt->bindParam(':service_name', $service_name);
            $stmt->bindParam(':service_category_id', $service_category_id);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':remarks', $remarks);
            $stmt->bindParam(':timeline', $timeline);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update service
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data - handle both naming conventions
            if(isset($data['service_name'])) {
                $query .= "service_name = :service_name, ";
                $params[':service_name'] = htmlspecialchars(strip_tags($data['service_name']));
            } elseif(isset($data['name'])) {
                $query .= "service_name = :service_name, ";
                $params[':service_name'] = htmlspecialchars(strip_tags($data['name']));
            }
            
            if(isset($data['service_category_id'])) {
                $query .= "service_category_id = :service_category_id, ";
                $params[':service_category_id'] = intval($data['service_category_id']);
            } elseif(isset($data['category_id'])) {
                $query .= "service_category_id = :service_category_id, ";
                $params[':service_category_id'] = intval($data['category_id']);
            }
            
            if(isset($data['price'])) {
                $query .= "price = :price, ";
                $params[':price'] = floatval($data['price']);
            }
            
            if(isset($data['remarks'])) {
                $query .= "remarks = :remarks, ";
                $params[':remarks'] = htmlspecialchars(strip_tags($data['remarks']));
            }
            
            if(isset($data['timeline'])) {
                $query .= "timeline = :timeline, ";
                $params[':timeline'] = htmlspecialchars(strip_tags($data['timeline']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE service_id = :id";
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
    
    // Delete service
    public function delete($id) {
        try {
            // First delete requirements
            $query = "DELETE FROM {$this->requirementsTable} WHERE service_id = :service_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':service_id', $id);
            $stmt->execute();
            
            // Then delete the service
            $query = "DELETE FROM {$this->table} WHERE service_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get requirements for a service
    public function getRequirements($serviceId) {
        try {
            $query = "SELECT * FROM {$this->requirementsTable} WHERE service_id = :service_id ORDER BY requirement_id ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':service_id', $serviceId);
            $stmt->execute();
            
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getRequirements: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Add requirement to service
    public function addRequirement($serviceId, $requirementData) {
        try {
            $query = "INSERT INTO {$this->requirementsTable} 
                      (service_id, requirement) 
                      VALUES 
                      (:service_id, :requirement)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $requirement = htmlspecialchars(strip_tags($requirementData['requirement']));
            
            $stmt->bindParam(':service_id', $serviceId);
            $stmt->bindParam(':requirement', $requirement);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in addRequirement: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update requirement
    public function updateRequirement($requirementId, $requirementData) {
        try {
            $query = "UPDATE {$this->requirementsTable} SET requirement = :requirement WHERE requirement_id = :id";
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $requirement = htmlspecialchars(strip_tags($requirementData['requirement']));
            
            $stmt->bindParam(':requirement', $requirement);
            $stmt->bindParam(':id', $requirementId);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in updateRequirement: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Delete requirement
    public function deleteRequirement($requirementId) {
        try {
            $query = "DELETE FROM {$this->requirementsTable} WHERE requirement_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $requirementId);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in deleteRequirement: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get all service categories
    public function getAllCategories() {
        $query = "SELECT 
                    service_category_id, 
                    service_category_name, 
                    description, 
                    priority_number,
                    added_by_id,
                    created_at,
                    updated_at
                  FROM {$this->categoryTable} 
                  ORDER BY priority_number ASC, service_category_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get service category by ID
    public function getCategoryById($id) {
        $query = "SELECT 
                    service_category_id, 
                    service_category_name, 
                    description, 
                    priority_number,
                    added_by_id,
                    created_at,
                    updated_at
                  FROM {$this->categoryTable} 
                  WHERE service_category_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Create service category
    public function createCategory($data) {
        $query = "INSERT INTO {$this->categoryTable} 
                  (service_category_name, description, priority_number, added_by_id) 
                  VALUES 
                  (:service_category_name, :description, :priority_number, :added_by_id)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $service_category_name = htmlspecialchars(strip_tags($data['service_category_name']));
        $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
        $priority_number = intval($data['priority_number'] ?? 0);
        $added_by_id = intval($data['added_by_id'] ?? 1); // Default to admin user
        
        $stmt->bindParam(':service_category_name', $service_category_name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':priority_number', $priority_number);
        $stmt->bindParam(':added_by_id', $added_by_id);
        
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update service category
    public function updateCategory($id, $data) {
        // Start building the query
        $query = "UPDATE {$this->categoryTable} SET ";
        $params = [];
        
        // Add fields that are present in the data
        if(isset($data['service_category_name'])) {
            $query .= "service_category_name = :service_category_name, ";
            $params[':service_category_name'] = htmlspecialchars(strip_tags($data['service_category_name']));
        }
        
        if(isset($data['description'])) {
            $query .= "description = :description, ";
            $params[':description'] = htmlspecialchars(strip_tags($data['description']));
        }
        
        if(isset($data['priority_number'])) {
            $query .= "priority_number = :priority_number, ";
            $params[':priority_number'] = intval($data['priority_number']);
        }
        
        if(isset($data['added_by_id'])) {
            $query .= "added_by_id = :added_by_id, ";
            $params[':added_by_id'] = intval($data['added_by_id']);
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
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete service category
    public function deleteCategory($id) {
        $query = "DELETE FROM {$this->categoryTable} WHERE service_category_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}
?> 