<?php
class Company {
    private $conn;
    private $table = 'company_info';
    
    // Company properties matching database columns
    public $company_id;
    public $company_name;
    public $address;
    public $phone;
    public $email;
    public $website;
    public $tax_id;
    public $logo_url;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get company info (usually there's only one record)
    public function getInfo() {
        try {
            $query = "SELECT * FROM {$this->table} ORDER BY company_id ASC LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $this->company_id = $row['company_id'];
                $this->company_name = $row['company_name'];
                $this->address = $row['address'];
                $this->phone = $row['phone'];
                $this->email = $row['email'];
                $this->website = $row['website'];
                $this->tax_id = $row['tax_id'];
                $this->logo_url = $row['logo_url'];
                $this->updated_at = $row['updated_at'];
                
                return true;
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in getInfo: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get company by ID
    public function getById($id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE company_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create company info
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (company_name, address, phone, email, website, tax_id, logo_url) 
                      VALUES 
                      (:company_name, :address, :phone, :email, :website, :tax_id, :logo_url)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $company_name = htmlspecialchars(strip_tags($data['company_name']));
            $address = isset($data['address']) ? htmlspecialchars(strip_tags($data['address'])) : null;
            $phone = isset($data['phone']) ? htmlspecialchars(strip_tags($data['phone'])) : null;
            $email = isset($data['email']) ? htmlspecialchars(strip_tags($data['email'])) : null;
            $website = isset($data['website']) ? htmlspecialchars(strip_tags($data['website'])) : null;
            $tax_id = isset($data['tax_id']) ? htmlspecialchars(strip_tags($data['tax_id'])) : null;
            $logo_url = isset($data['logo_url']) ? htmlspecialchars(strip_tags($data['logo_url'])) : null;
            
            $stmt->bindParam(':company_name', $company_name);
            $stmt->bindParam(':address', $address);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':website', $website);
            $stmt->bindParam(':tax_id', $tax_id);
            $stmt->bindParam(':logo_url', $logo_url);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update company info
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data
            if(isset($data['company_name'])) {
                $query .= "company_name = :company_name, ";
                $params[':company_name'] = htmlspecialchars(strip_tags($data['company_name']));
            }
            
            if(isset($data['address'])) {
                $query .= "address = :address, ";
                $params[':address'] = htmlspecialchars(strip_tags($data['address']));
            }
            
            if(isset($data['phone'])) {
                $query .= "phone = :phone, ";
                $params[':phone'] = htmlspecialchars(strip_tags($data['phone']));
            }
            
            if(isset($data['email'])) {
                $query .= "email = :email, ";
                $params[':email'] = htmlspecialchars(strip_tags($data['email']));
            }
            
            if(isset($data['website'])) {
                $query .= "website = :website, ";
                $params[':website'] = htmlspecialchars(strip_tags($data['website']));
            }
            
            if(isset($data['tax_id'])) {
                $query .= "tax_id = :tax_id, ";
                $params[':tax_id'] = htmlspecialchars(strip_tags($data['tax_id']));
            }
            
            if(isset($data['logo_url'])) {
                $query .= "logo_url = :logo_url, ";
                $params[':logo_url'] = htmlspecialchars(strip_tags($data['logo_url']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE company_id = :id";
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
    
    // Update or create company info
    public function updateOrCreate($data) {
        try {
            // Check if company info exists
            $query = "SELECT company_id FROM {$this->table} LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $this->update($row['company_id'], $data);
            } else {
                return $this->create($data);
            }
        } catch (PDOException $e) {
            error_log("Error in updateOrCreate: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 