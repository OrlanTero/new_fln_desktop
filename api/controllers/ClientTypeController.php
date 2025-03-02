<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/ClientType.php';

class ClientTypeController extends BaseController {
    private $clientTypeModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->clientTypeModel = new ClientType($db);
    }
    
    // Get all client types - This is the method called by the router for GET /clientTypes
    public function index($data = [], $id = null) {
        return $this->getAll($data, $id);
    }
    
    // Get all client types
    public function getAll($data = [], $id = null) {
        $result = $this->clientTypeModel->getAll();
        $clientTypes = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $clientTypes[] = $row;
        }
        
        return $this->sendResponse($clientTypes, 'Client types retrieved successfully');
    }
    
    // Get single client type
    public function get($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Client type ID is required');
        }
        
        $result = $this->clientTypeModel->getById($id);
        
        if ($result->rowCount() === 0) {
            return $this->sendError('Client type not found');
        }
        
        $clientType = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($clientType, 'Client type retrieved successfully');
    }
    
    // Create client type
    public function create($data = [], $id = null) {
        // Validate required fields
        if (!isset($data['name'])) {
            return $this->sendError('Name is required');
        }
        
        // Create client type
        $clientTypeId = $this->clientTypeModel->create($data);
        
        if (!$clientTypeId) {
            return $this->sendError('Failed to create client type');
        }
        
        // Get the created client type
        $result = $this->clientTypeModel->getById($clientTypeId);
        $clientType = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($clientType, 'Client type created successfully');
    }
    
    // Update client type
    public function update($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Client type ID is required');
        }
        
        // Verify client type exists
        $result = $this->clientTypeModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Client type not found');
        }
        
        // Update client type
        $success = $this->clientTypeModel->update($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update client type');
        }
        
        // Get the updated client type
        $result = $this->clientTypeModel->getById($id);
        $clientType = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($clientType, 'Client type updated successfully');
    }
    
    // Delete client type
    public function delete($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Client type ID is required');
        }
        
        // Verify client type exists
        $result = $this->clientTypeModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Client type not found');
        }
        
        // Delete client type
        $success = $this->clientTypeModel->delete($id);
        
        if (!$success) {
            return $this->sendError('Failed to delete client type');
        }
        
        return $this->sendResponse(null, 'Client type deleted successfully');
    }
}
?> 