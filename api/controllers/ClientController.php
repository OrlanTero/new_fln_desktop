<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/ClientType.php';

class ClientController extends BaseController {
    private $clientModel;
    private $clientTypeModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->clientModel = new Client($db);
        $this->clientTypeModel = new ClientType($db);
    }
    
    // Get all clients - This is the method called by the router for GET /clients
    public function index($data = [], $id = null) {
        return $this->getAll($data, $id);
    }
    
    // Get all clients
    public function getAll($data = [], $id = null) {
        $result = $this->clientModel->getAll();
        $clients = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $clients[] = $row;
        }
        
        return $this->sendResponse($clients, 'Clients retrieved successfully');
    }
    
    // Get all client types
    public function types($data = [], $id = null) {
        try {
            $result = $this->clientTypeModel->getAll();
            $types = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $types[] = $row;
            }
            
            return $this->sendResponse($types, 'Client types retrieved successfully');
        } catch (Exception $e) {
            error_log("Error in types: " . $e->getMessage());
            return $this->sendError('Error retrieving client types: ' . $e->getMessage());
        }
    }
    
    // Get clients by type
    public function getByType($data = [], $typeId = null) {
        if (!$typeId) {
            return $this->sendError('Client type ID is required');
        }
        
        // Verify client type exists
        $typeResult = $this->clientTypeModel->getById($typeId);
        if ($typeResult->rowCount() === 0) {
            return $this->sendError('Client type not found');
        }
        
        $result = $this->clientModel->getByType($typeId);
        $clients = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $clients[] = $row;
        }
        
        return $this->sendResponse($clients, 'Clients retrieved successfully');
    }
    
    // Search clients
    public function search($data = [], $id = null) {
        if (!isset($data['search_term'])) {
            return $this->sendError('Search term is required');
        }
        
        $result = $this->clientModel->search($data['search_term']);
        $clients = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $clients[] = $row;
        }
        
        return $this->sendResponse($clients, 'Clients retrieved successfully');
    }
    
    // Get single client
    public function get($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Client ID is required');
        }
        
        $result = $this->clientModel->getById($id);
        
        if ($result->rowCount() === 0) {
            return $this->sendError('Client not found');
        }
        
        $client = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($client, 'Client retrieved successfully');
    }
    
    // Create client
    public function create($data = [], $id = null) {
        // Validate required fields
        if (!isset($data['name'])) {
            return $this->sendError('Name is required');
        }
        
        // If type_id is provided, verify client type exists
        if (isset($data['type_id'])) {
            $typeResult = $this->clientTypeModel->getById($data['type_id']);
            if ($typeResult->rowCount() === 0) {
                return $this->sendError('Client type not found');
            }
        }
        
        // Create client
        $clientId = $this->clientModel->create($data);
        
        if (!$clientId) {
            return $this->sendError('Failed to create client');
        }
        
        // Get the created client
        $result = $this->clientModel->getById($clientId);
        $client = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($client, 'Client created successfully');
    }
    
    // Update client
    public function update($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Client ID is required');
        }
        
        // Verify client exists
        $result = $this->clientModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Client not found');
        }
        
        // If type_id is provided, verify client type exists
        if (isset($data['type_id'])) {
            $typeResult = $this->clientTypeModel->getById($data['type_id']);
            if ($typeResult->rowCount() === 0) {
                return $this->sendError('Client type not found');
            }
        }
        
        // Update client
        $success = $this->clientModel->update($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update client');
        }
        
        // Get the updated client
        $result = $this->clientModel->getById($id);
        $client = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($client, 'Client updated successfully');
    }
    
    // Delete client
    public function delete($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Client ID is required');
        }
        
        // Verify client exists
        $result = $this->clientModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Client not found');
        }
        
        // Delete client
        $success = $this->clientModel->delete($id);
        
        if (!$success) {
            return $this->sendError('Failed to delete client');
        }
        
        return $this->sendResponse(null, 'Client deleted successfully');
    }
}
?> 