<?php
class Project {
    private $conn;
    private $table = 'projects';
    private $clientTable = 'clients';
    private $proposalTable = 'proposals';
    private $projectServicesTable = 'project_services';
    private $serviceTable = 'services';
    
    // Project properties matching database columns
    public $project_id;
    public $project_name;
    public $client_id;
    public $proposal_id;
    public $attn_to;
    public $start_date;
    public $end_date;
    public $description;
    public $priority;
    public $status;
    public $total_amount;
    public $paid_amount;
    public $notes;
    public $created_by;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all projects
    public function getAll() {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  ORDER BY p.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get projects by client
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
    
    // Get projects by status
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
    
    // Get single project by ID
    public function getById($id) {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  WHERE p.project_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get project by proposal ID
    public function getByProposalId($proposalId) {
        $query = "SELECT p.*, c.client_name as client_name 
                  FROM {$this->table} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  WHERE p.proposal_id = :proposal_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Create project
    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  (project_name, client_id, proposal_id, attn_to, start_date, end_date, 
                   description, priority, status, total_amount, paid_amount, notes, created_by) 
                  VALUES 
                  (:project_name, :client_id, :proposal_id, :attn_to, :start_date, :end_date, 
                   :description, :priority, :status, :total_amount, :paid_amount, :notes, :created_by)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $project_name = htmlspecialchars(strip_tags($data['project_name']));
        $client_id = intval($data['client_id'] ?? 0);
        $proposal_id = isset($data['proposal_id']) ? intval($data['proposal_id']) : null;
        $attn_to = htmlspecialchars(strip_tags($data['attn_to'] ?? ''));
        $start_date = $data['start_date'] ?? null;
        $end_date = $data['end_date'] ?? null;
        $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
        $priority = htmlspecialchars(strip_tags($data['priority'] ?? 'MEDIUM'));
        $status = htmlspecialchars(strip_tags($data['status'] ?? 'PENDING'));
        $total_amount = floatval($data['total_amount'] ?? 0);
        $paid_amount = floatval($data['paid_amount'] ?? 0);
        $notes = htmlspecialchars(strip_tags($data['notes'] ?? ''));
        $created_by = intval($data['created_by'] ?? 1); // Default to admin user
        
        $stmt->bindParam(':project_name', $project_name);
        $stmt->bindParam(':client_id', $client_id);
        $stmt->bindParam(':proposal_id', $proposal_id);
        $stmt->bindParam(':attn_to', $attn_to);
        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':end_date', $end_date);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':priority', $priority);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':total_amount', $total_amount);
        $stmt->bindParam(':paid_amount', $paid_amount);
        $stmt->bindParam(':notes', $notes);
        $stmt->bindParam(':created_by', $created_by);
        
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update project
    public function update($id, $data) {
        // Start building the query
        $query = "UPDATE {$this->table} SET ";
        $params = [];
        
        // Add fields that are present in the data
        if(isset($data['project_name'])) {
            $query .= "project_name = :project_name, ";
            $params[':project_name'] = htmlspecialchars(strip_tags($data['project_name']));
        }
        
        if(isset($data['client_id'])) {
            $query .= "client_id = :client_id, ";
            $params[':client_id'] = intval($data['client_id']);
        }
        
        if(isset($data['proposal_id'])) {
            $query .= "proposal_id = :proposal_id, ";
            $params[':proposal_id'] = intval($data['proposal_id']);
        }
        
        if(isset($data['attn_to'])) {
            $query .= "attn_to = :attn_to, ";
            $params[':attn_to'] = htmlspecialchars(strip_tags($data['attn_to']));
        }
        
        if(isset($data['start_date'])) {
            $query .= "start_date = :start_date, ";
            $params[':start_date'] = $data['start_date'];
        }
        
        if(isset($data['end_date'])) {
            $query .= "end_date = :end_date, ";
            $params[':end_date'] = $data['end_date'];
        }
        
        if(isset($data['description'])) {
            $query .= "description = :description, ";
            $params[':description'] = htmlspecialchars(strip_tags($data['description']));
        }
        
        if(isset($data['priority'])) {
            $query .= "priority = :priority, ";
            $params[':priority'] = htmlspecialchars(strip_tags($data['priority']));
        }
        
        if(isset($data['status'])) {
            $query .= "status = :status, ";
            $params[':status'] = htmlspecialchars(strip_tags($data['status']));
        }
        
        if(isset($data['total_amount'])) {
            $query .= "total_amount = :total_amount, ";
            $params[':total_amount'] = floatval($data['total_amount']);
        }
        
        if(isset($data['paid_amount'])) {
            $query .= "paid_amount = :paid_amount, ";
            $params[':paid_amount'] = floatval($data['paid_amount']);
        }
        
        if(isset($data['notes'])) {
            $query .= "notes = :notes, ";
            $params[':notes'] = htmlspecialchars(strip_tags($data['notes']));
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
        
        $query .= " WHERE project_id = :id";
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
    
    // Delete project
    public function delete($id) {
        // First delete all project services
        $query = "DELETE FROM {$this->projectServicesTable} WHERE project_id = :project_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':project_id', $id);
        $stmt->execute();
        
        // Then delete the project
        $query = "DELETE FROM {$this->table} WHERE project_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Get services for a project
    public function getServices($projectId) {
        $query = "SELECT ps.*, s.service_name 
                  FROM {$this->projectServicesTable} ps
                  LEFT JOIN {$this->serviceTable} s ON ps.service_id = s.service_id
                  WHERE ps.project_id = :project_id
                  ORDER BY ps.created_at ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':project_id', $projectId);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Add service to project
    public function addService($projectId, $serviceData) {
        $query = "INSERT INTO {$this->projectServicesTable} 
                  (project_id, service_id, quantity, price, status) 
                  VALUES 
                  (:project_id, :service_id, :quantity, :price, :status)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $service_id = intval($serviceData['service_id']);
        $quantity = intval($serviceData['quantity'] ?? 1);
        $price = floatval($serviceData['price'] ?? 0);
        $status = htmlspecialchars(strip_tags($serviceData['status'] ?? 'PENDING'));
        
        $stmt->bindParam(':project_id', $projectId);
        $stmt->bindParam(':service_id', $service_id);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':status', $status);
        
        if($stmt->execute()) {
            // Update project total amount
            $this->updateTotalAmount($projectId);
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update project service
    public function updateService($projectServiceId, $serviceData) {
        // Get project ID first for total amount update
        $query = "SELECT project_id FROM {$this->projectServicesTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $projectServiceId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $projectId = $row['project_id'] ?? null;
        
        if(!$projectId) {
            return false;
        }
        
        // Start building the query
        $query = "UPDATE {$this->projectServicesTable} SET ";
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
        
        if(isset($serviceData['price'])) {
            $query .= "price = :price, ";
            $params[':price'] = floatval($serviceData['price']);
        }
        
        if(isset($serviceData['status'])) {
            $query .= "status = :status, ";
            $params[':status'] = htmlspecialchars(strip_tags($serviceData['status']));
        }
        
        // Calculate total if both quantity and price are provided
        if(isset($serviceData['quantity']) && isset($serviceData['price'])) {
            $total = intval($serviceData['quantity']) * floatval($serviceData['price']);
            $query .= "total = :total, ";
            $params[':total'] = $total;
        }
        // Calculate total if only quantity is provided
        else if(isset($serviceData['quantity'])) {
            $query .= "total = quantity * price, ";
        }
        // Calculate total if only price is provided
        else if(isset($serviceData['price'])) {
            $query .= "total = quantity * :price, ";
        }
        
        // Remove trailing comma if there are updates
        if (!empty($params)) {
            $query = rtrim($query, ', ');
        } else {
            // No updates to make
            return true;
        }
        
        $query .= " WHERE id = :id";
        $params[':id'] = $projectServiceId;
        
        // Prepare and execute the statement
        $stmt = $this->conn->prepare($query);
        
        foreach($params as $param => $value) {
            $stmt->bindValue($param, $value);
        }
        
        if($stmt->execute()) {
                // Update project total amount
            $this->updateTotalAmount($projectId);
            return true;
        }
        
        return false;
    }
    
    // Remove service from project
    public function removeService($projectServiceId) {
        // Get project ID first for total amount update
        $query = "SELECT project_id FROM {$this->projectServicesTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $projectServiceId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $projectId = $row['project_id'] ?? null;
        
        if(!$projectId) {
            return false;
        }
        
        // Delete the project service
        $query = "DELETE FROM {$this->projectServicesTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $projectServiceId);
        
        if($stmt->execute()) {
            // Update project total amount
            $this->updateTotalAmount($projectId);
            return true;
        }
        
        return false;
    }
    
    // Update project total amount based on services
    private function updateTotalAmount($projectId) {
        $query = "UPDATE {$this->table} SET total_amount = (
                    SELECT COALESCE(SUM(quantity * price), 0) 
                    FROM {$this->projectServicesTable} 
                    WHERE project_id = :project_id
                  ) WHERE project_id = :project_id2";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':project_id', $projectId);
        $stmt->bindParam(':project_id2', $projectId);
        return $stmt->execute();
    }
    
    // Create project from proposal
    public function createFromProposal($proposalId, $data = []) {
        // Get proposal details
        $query = "SELECT p.*, c.client_name 
                  FROM {$this->proposalTable} p
                  LEFT JOIN {$this->clientTable} c ON p.client_id = c.client_id
                  WHERE p.proposal_id = :proposal_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();
        
        if($stmt->rowCount() === 0) {
            return false;
        }
        
        $proposal = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if project already exists for this proposal
        $query = "SELECT project_id FROM {$this->table} WHERE proposal_id = :proposal_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            return false; // Project already exists
        }
        
        // Prepare project data
        $projectData = [
            'project_name' => $data['project_name'] ?? $proposal['project_name'] ?? $proposal['proposal_name'],
            'client_id' => $proposal['client_id'],
            'proposal_id' => $proposalId,
            'attn_to' => $data['attn_to'] ?? '',
            'start_date' => $data['start_date'] ?? date('Y-m-d'),
            'end_date' => $data['end_date'] ?? null,
            'description' => $data['description'] ?? '',
            'priority' => $data['priority'] ?? 'MEDIUM',
            'status' => $data['status'] ?? 'PENDING',
            'total_amount' => $proposal['total_amount'] ?? 0,
            'paid_amount' => 0,
            'notes' => $data['notes'] ?? $proposal['notes'] ?? '',
            'created_by' => $data['created_by'] ?? $proposal['created_by'] ?? 1
        ];
        
        // Create the project
        $projectId = $this->create($projectData);
        
        if(!$projectId) {
            return false;
        }
        
        // Get proposal services
        $query = "SELECT * FROM proposal_services WHERE proposal_id = :proposal_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();
        
        // Add services to project
        while($service = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $serviceData = [
                'service_id' => $service['service_id'],
                'quantity' => $service['quantity'],
                'price' => $service['price'],
                'status' => 'PENDING'
            ];
            
            $this->addService($projectId, $serviceData);
        }
        
        // Update proposal status to 'converted'
        $query = "UPDATE {$this->proposalTable} SET status = 'ACCEPTED' WHERE proposal_id = :proposal_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();
        
        return $projectId;
    }
    
    // Update project payment
    public function updatePayment($id, $amount) {
        $query = "UPDATE {$this->table} SET paid_amount = paid_amount + :amount WHERE project_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            // Check if fully paid and update status if needed
            $query = "UPDATE {$this->table} SET status = 'COMPLETED' 
                      WHERE project_id = :id AND paid_amount >= total_amount AND status != 'COMPLETED'";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            return true;
        }
        
        return false;
    }
}
?> 