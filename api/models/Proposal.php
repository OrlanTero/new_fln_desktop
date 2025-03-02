<?php
class Proposal {
    private $conn;
    private $table = 'proposals';
    private $clientTable = 'clients';
    private $serviceTable = 'services';
    private $proposalServicesTable = 'proposal_services';
    
    // Proposal properties matching database columns
    public $proposal_id;
    public $proposal_name;
    public $client_id;
    public $proposal_reference;
    public $project_name;
    public $has_downpayment;
    public $downpayment_amount;
    public $total_amount;
    public $valid_until;
    public $notes;
    public $status;
    public $created_by;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all proposals
    public function getAll() {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  ORDER BY p.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get proposals by client
    public function getByClient($clientId) {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  WHERE p.client_id = :client_id
                  ORDER BY p.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':client_id', $clientId);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get proposals by status
    public function getByStatus($status) {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  WHERE p.status = :status
                  ORDER BY p.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single proposal by ID
    public function getById($id) {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  WHERE p.proposal_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Create proposal
    public function create($data) {
        // Generate proposal reference if not provided
        if(!isset($data['proposal_reference']) || empty($data['proposal_reference'])) {
            $data['proposal_reference'] = $this->generateReference();
        }
        
        $query = "INSERT INTO {$this->table} 
                  (proposal_name, client_id, proposal_reference, project_name, has_downpayment, 
                   downpayment_amount, valid_until, notes, status, created_by) 
                  VALUES 
                  (:proposal_name, :client_id, :proposal_reference, :project_name, :has_downpayment, 
                   :downpayment_amount, :valid_until, :notes, :status, :created_by)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $proposal_name = htmlspecialchars(strip_tags($data['proposal_name']));
        $client_id = intval($data['client_id'] ?? 0);
        $proposal_reference = htmlspecialchars(strip_tags($data['proposal_reference']));
        $project_name = htmlspecialchars(strip_tags($data['project_name'] ?? ''));
        $has_downpayment = isset($data['has_downpayment']) ? (int)$data['has_downpayment'] : 0;
        $downpayment_amount = floatval($data['downpayment_amount'] ?? 0);
        $valid_until = $data['valid_until'] ?? null;
        $notes = htmlspecialchars(strip_tags($data['notes'] ?? ''));
        $status = htmlspecialchars(strip_tags($data['status'] ?? 'draft'));
        $created_by = intval($data['created_by'] ?? 1); // Default to admin user
        
        $stmt->bindParam(':proposal_name', $proposal_name);
        $stmt->bindParam(':client_id', $client_id);
        $stmt->bindParam(':proposal_reference', $proposal_reference);
        $stmt->bindParam(':project_name', $project_name);
        $stmt->bindParam(':has_downpayment', $has_downpayment);
        $stmt->bindParam(':downpayment_amount', $downpayment_amount);
        $stmt->bindParam(':valid_until', $valid_until);
        $stmt->bindParam(':notes', $notes);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':created_by', $created_by);
        
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update proposal
    public function update($id, $data) {
        // Start building the query
        $query = "UPDATE {$this->table} SET ";
        $params = [];
        
        // Add fields that are present in the data
        if(isset($data['proposal_name'])) {
            $query .= "proposal_name = :proposal_name, ";
            $params[':proposal_name'] = htmlspecialchars(strip_tags($data['proposal_name']));
        }
        
        if(isset($data['client_id'])) {
            $query .= "client_id = :client_id, ";
            $params[':client_id'] = intval($data['client_id']);
        }
        
        if(isset($data['proposal_reference'])) {
            $query .= "proposal_reference = :proposal_reference, ";
            $params[':proposal_reference'] = htmlspecialchars(strip_tags($data['proposal_reference']));
        }
        
        if(isset($data['project_name'])) {
            $query .= "project_name = :project_name, ";
            $params[':project_name'] = htmlspecialchars(strip_tags($data['project_name']));
        }
        
        if(isset($data['has_downpayment'])) {
            $query .= "has_downpayment = :has_downpayment, ";
            $params[':has_downpayment'] = (int)$data['has_downpayment'];
        }
        
        if(isset($data['downpayment_amount'])) {
            $query .= "downpayment_amount = :downpayment_amount, ";
            $params[':downpayment_amount'] = floatval($data['downpayment_amount']);
        }
        
        if(isset($data['valid_until'])) {
            $query .= "valid_until = :valid_until, ";
            $params[':valid_until'] = $data['valid_until'];
        }
        
        if(isset($data['notes'])) {
            $query .= "notes = :notes, ";
            $params[':notes'] = htmlspecialchars(strip_tags($data['notes']));
        }
        
        if(isset($data['status'])) {
            $query .= "status = :status, ";
            $params[':status'] = htmlspecialchars(strip_tags($data['status']));
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
        
        $query .= " WHERE proposal_id = :id";
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
    
    // Delete proposal
    public function delete($id) {
        // First delete all proposal services
        $query = "DELETE FROM {$this->proposalServicesTable} WHERE proposal_id = :proposal_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $id);
        $stmt->execute();
        
        // Then delete the proposal
        $query = "DELETE FROM {$this->table} WHERE proposal_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Get services for a proposal
    public function getServices($proposalId) {
        $query = "SELECT ps.*, s.service_name 
                  FROM {$this->proposalServicesTable} ps
                  LEFT JOIN {$this->serviceTable} s ON ps.service_id = s.service_id
                  WHERE ps.proposal_id = :proposal_id
                  ORDER BY ps.created_at ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Add service to proposal
    public function addService($proposalId, $serviceData) {
        $query = "INSERT INTO {$this->proposalServicesTable} 
                  (proposal_id, service_id, quantity, price, unit_price, discount_percentage, total, notes) 
                  VALUES 
                  (:proposal_id, :service_id, :quantity, :price, :unit_price, :discount_percentage, :total, :notes)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $service_id = intval($serviceData['service_id']);
        $quantity = intval($serviceData['quantity'] ?? 1);
        $unit_price = floatval($serviceData['unit_price'] ?? 0);
        $discount_percentage = floatval($serviceData['discount_percentage'] ?? 0);
        $price = $unit_price * (1 - ($discount_percentage / 100));
        $total = $quantity * $price;
        $notes = htmlspecialchars(strip_tags($serviceData['notes'] ?? ''));
        
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->bindParam(':service_id', $service_id);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':unit_price', $unit_price);
        $stmt->bindParam(':discount_percentage', $discount_percentage);
        $stmt->bindParam(':total', $total);
        $stmt->bindParam(':notes', $notes);
        
        if($stmt->execute()) {
            // Update proposal total amount
            $this->updateTotalAmount($proposalId);
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update proposal service
    public function updateService($proposalServiceId, $serviceData) {
        // Get proposal ID first for total amount update
        $query = "SELECT proposal_id FROM {$this->proposalServicesTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $proposalServiceId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $proposalId = $row['proposal_id'] ?? null;
        
        if(!$proposalId) {
            return false;
        }
        
        // Start building the query
        $query = "UPDATE {$this->proposalServicesTable} SET ";
        $params = [];
        
        // Add fields that are present in the data
        if(isset($serviceData['service_id'])) {
            $query .= "service_id = :service_id, ";
            $params[':service_id'] = intval($serviceData['service_id']);
        }
        
        if(isset($serviceData['quantity'])) {
            $query .= "quantity = :quantity, ";
            $params[':quantity'] = intval($serviceData['quantity']);
        }
        
        if(isset($serviceData['unit_price'])) {
            $query .= "unit_price = :unit_price, ";
            $params[':unit_price'] = floatval($serviceData['unit_price']);
        }
        
        if(isset($serviceData['discount_percentage'])) {
            $query .= "discount_percentage = :discount_percentage, ";
            $params[':discount_percentage'] = floatval($serviceData['discount_percentage']);
        }
        
        // Calculate price if unit_price and discount_percentage are provided
        if(isset($serviceData['unit_price']) && isset($serviceData['discount_percentage'])) {
            $price = floatval($serviceData['unit_price']) * (1 - (floatval($serviceData['discount_percentage']) / 100));
            $query .= "price = :price, ";
            $params[':price'] = $price;
        }
        // Calculate price if only unit_price is provided
        else if(isset($serviceData['unit_price'])) {
            $query .= "price = unit_price * (1 - (discount_percentage / 100)), ";
        }
        // Calculate price if only discount_percentage is provided
        else if(isset($serviceData['discount_percentage'])) {
            $query .= "price = unit_price * (1 - (:discount_percentage / 100)), ";
        }
        
        // Calculate total if quantity, unit_price, and discount_percentage are provided
        if(isset($serviceData['quantity']) && isset($serviceData['unit_price']) && isset($serviceData['discount_percentage'])) {
            $price = floatval($serviceData['unit_price']) * (1 - (floatval($serviceData['discount_percentage']) / 100));
            $total = intval($serviceData['quantity']) * $price;
            $query .= "total = :total, ";
            $params[':total'] = $total;
        }
        // Calculate total if only quantity is provided
        else if(isset($serviceData['quantity'])) {
            $query .= "total = :quantity * price, ";
        }
        // Calculate total if only price is provided
        else if(isset($serviceData['price'])) {
            $query .= "total = quantity * :price, ";
        }
        
        if(isset($serviceData['notes'])) {
            $query .= "notes = :notes, ";
            $params[':notes'] = htmlspecialchars(strip_tags($serviceData['notes']));
        }
        
        // Remove trailing comma if there are updates
        if (!empty($params)) {
            $query = rtrim($query, ', ');
        } else {
            // No updates to make
            return true;
        }
        
        $query .= " WHERE id = :id";
        $params[':id'] = $proposalServiceId;
        
        // Prepare and execute the statement
        $stmt = $this->conn->prepare($query);
        
        foreach($params as $param => $value) {
            $stmt->bindValue($param, $value);
        }
        
        if($stmt->execute()) {
                // Update proposal total amount
            $this->updateTotalAmount($proposalId);
            return true;
        }
        
        return false;
    }
    
    // Remove service from proposal
    public function removeService($proposalServiceId) {
        // Get proposal ID first for total amount update
        $query = "SELECT proposal_id FROM {$this->proposalServicesTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $proposalServiceId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $proposalId = $row['proposal_id'] ?? null;
        
        if(!$proposalId) {
            return false;
        }
        
        // Delete the proposal service
        $query = "DELETE FROM {$this->proposalServicesTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $proposalServiceId);
        
        if($stmt->execute()) {
            // Update proposal total amount
            $this->updateTotalAmount($proposalId);
            return true;
        }
        
        return false;
    }
    
    // Update proposal total amount based on services
    private function updateTotalAmount($proposalId) {
        $query = "UPDATE {$this->table} SET total_amount = (
                    SELECT COALESCE(SUM(total), 0) 
                    FROM {$this->proposalServicesTable} 
                    WHERE proposal_id = :proposal_id
                  ) WHERE proposal_id = :proposal_id2";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->bindParam(':proposal_id2', $proposalId);
        return $stmt->execute();
    }
    
    // Generate a unique proposal reference
    private function generateReference() {
        $prefix = 'PROP-';
        $year = date('Y');
        $month = date('m');
        
        // Get the last proposal reference
        $query = "SELECT proposal_reference FROM {$this->table} 
                  WHERE proposal_reference LIKE :reference_pattern 
                  ORDER BY proposal_id DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $pattern = $prefix . $year . $month . '-%';
        $stmt->bindParam(':reference_pattern', $pattern);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $lastRef = $row['proposal_reference'];
            $lastNumber = intval(substr($lastRef, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        // Format the new reference
        $reference = $prefix . $year . $month . '-' . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        
        return $reference;
    }
}
?> 