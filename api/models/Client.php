<?php
class Client {
    private $conn;
    private $table = 'clients';
    private $typeTable = 'client_types';
    
    // Client properties matching database columns
    public $client_id;
    public $client_name;
    public $company;
    public $branch;
    public $address;
    public $address2;
    public $tax_type;
    public $account_for;
    public $rdo;
    public $email_address;
    public $description;
    public $date_created;
    public $client_type_id;
    public $status;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all clients
    public function getAll() {
        try {
            $query = "SELECT c.client_id, c.client_name, c.company, c.branch, 
                      c.address, c.address2, c.tax_type, c.account_for, c.rdo, 
                      c.email_address, c.description, c.date_created, c.client_type_id,
                      c.status, t.name as type_name 
                      FROM {$this->table} c
                      LEFT JOIN {$this->typeTable} t ON c.client_type_id = t.type_id
                      ORDER BY c.client_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get clients by type
    public function getByType($typeId) {
        try {
            $query = "SELECT c.client_id, c.client_name, c.company, c.branch, 
                      c.address, c.address2, c.tax_type, c.account_for, c.rdo, 
                      c.email_address, c.description, c.date_created, c.client_type_id,
                      c.status, t.name as type_name 
                      FROM {$this->table} c
                      LEFT JOIN {$this->typeTable} t ON c.client_type_id = t.type_id
                      WHERE c.client_type_id = :type_id
                      ORDER BY c.client_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':type_id', $typeId);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getByType: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single client by ID
    public function getById($id) {
        try {
            $query = "SELECT c.client_id, c.client_name, c.company, c.branch, 
                      c.address, c.address2, c.tax_type, c.account_for, c.rdo, 
                      c.email_address, c.description, c.date_created, c.client_type_id,
                      c.status, t.name as type_name 
                      FROM {$this->table} c
                      LEFT JOIN {$this->typeTable} t ON c.client_type_id = t.type_id
                      WHERE c.client_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Search clients
    public function search($term) {
        try {
            $query = "SELECT c.client_id, c.client_name, c.company, c.branch, 
                      c.address, c.address2, c.tax_type, c.account_for, c.rdo, 
                      c.email_address, c.description, c.date_created, c.client_type_id,
                      c.status, t.name as type_name 
                      FROM {$this->table} c
                      LEFT JOIN {$this->typeTable} t ON c.client_type_id = t.type_id
                      WHERE c.client_name LIKE :term1 OR c.company LIKE :term2 OR c.email_address LIKE :term3
                      ORDER BY c.client_name ASC";
            $searchTerm = "%{$term}%";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':term1', $searchTerm);
            $stmt->bindParam(':term2', $searchTerm);
            $stmt->bindParam(':term3', $searchTerm);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in search: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create client
    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  (client_name, company, branch, address, address2, tax_type, account_for, 
                   rdo, email_address, description, client_type_id, status) 
                  VALUES 
                  (:client_name, :company, :branch, :address, :address2, :tax_type, :account_for, 
                   :rdo, :email_address, :description, :client_type_id, :status)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $client_name = htmlspecialchars(strip_tags($data['client_name']));
        $company = htmlspecialchars(strip_tags($data['company'] ?? ''));
        $branch = htmlspecialchars(strip_tags($data['branch'] ?? ''));
        $address = htmlspecialchars(strip_tags($data['address'] ?? ''));
        $address2 = htmlspecialchars(strip_tags($data['address2'] ?? ''));
        $tax_type = htmlspecialchars(strip_tags($data['tax_type'] ?? ''));
        $account_for = htmlspecialchars(strip_tags($data['account_for'] ?? ''));
        $rdo = htmlspecialchars(strip_tags($data['rdo'] ?? ''));
        $email_address = htmlspecialchars(strip_tags($data['email_address'] ?? ''));
        $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
        $client_type_id = intval($data['client_type_id'] ?? 0);
        $status = htmlspecialchars(strip_tags($data['status'] ?? 'active'));
        
        $stmt->bindParam(':client_name', $client_name);
        $stmt->bindParam(':company', $company);
        $stmt->bindParam(':branch', $branch);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':address2', $address2);
        $stmt->bindParam(':tax_type', $tax_type);
        $stmt->bindParam(':account_for', $account_for);
        $stmt->bindParam(':rdo', $rdo);
        $stmt->bindParam(':email_address', $email_address);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':client_type_id', $client_type_id);
        $stmt->bindParam(':status', $status);
        
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update client
    public function update($id, $data) {
        // Start building the query
        $query = "UPDATE {$this->table} SET ";
        $params = [];
        
        // Add fields that are present in the data
        if(isset($data['client_name'])) {
            $query .= "client_name = :client_name, ";
            $params[':client_name'] = htmlspecialchars(strip_tags($data['client_name']));
        }
        
        if(isset($data['company'])) {
            $query .= "company = :company, ";
            $params[':company'] = htmlspecialchars(strip_tags($data['company']));
        }
        
        if(isset($data['branch'])) {
            $query .= "branch = :branch, ";
            $params[':branch'] = htmlspecialchars(strip_tags($data['branch']));
        }
        
        if(isset($data['address'])) {
            $query .= "address = :address, ";
            $params[':address'] = htmlspecialchars(strip_tags($data['address']));
        }
        
        if(isset($data['address2'])) {
            $query .= "address2 = :address2, ";
            $params[':address2'] = htmlspecialchars(strip_tags($data['address2']));
        }
        
        if(isset($data['tax_type'])) {
            $query .= "tax_type = :tax_type, ";
            $params[':tax_type'] = htmlspecialchars(strip_tags($data['tax_type']));
        }
        
        if(isset($data['account_for'])) {
            $query .= "account_for = :account_for, ";
            $params[':account_for'] = htmlspecialchars(strip_tags($data['account_for']));
        }
        
        if(isset($data['rdo'])) {
            $query .= "rdo = :rdo, ";
            $params[':rdo'] = htmlspecialchars(strip_tags($data['rdo']));
        }
        
        if(isset($data['email_address'])) {
            $query .= "email_address = :email_address, ";
            $params[':email_address'] = htmlspecialchars(strip_tags($data['email_address']));
        }
        
        if(isset($data['description'])) {
            $query .= "description = :description, ";
            $params[':description'] = htmlspecialchars(strip_tags($data['description']));
        }
        
        if(isset($data['client_type_id'])) {
            $query .= "client_type_id = :client_type_id, ";
            $params[':client_type_id'] = intval($data['client_type_id']);
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
        
        $query .= " WHERE client_id = :id";
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
    
    // Delete client
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE client_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}
?> 