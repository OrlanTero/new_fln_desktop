<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Proposal.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/Service.php';

class ProposalController extends BaseController {
    private $proposalModel;
    private $clientModel;
    private $serviceModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->proposalModel = new Proposal($db);
        $this->clientModel = new Client($db);
        $this->serviceModel = new Service($db);
    }
    
    // Get all proposals - This is the method called by the router for GET /proposals
    public function index($data = [], $id = null) {
        return $this->getAll($data, $id);
    }
    
    // Get all proposals
    public function getAll($data = [], $id = null) {
        $result = $this->proposalModel->getAll();
        $proposals = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $proposals[] = $row;
        }
        
        return $this->sendResponse($proposals, 'Proposals retrieved successfully');
    }
    
    // Get proposals by client
    public function getByClient($data = [], $clientId = null) {
        if (!$clientId) {
            return $this->sendError('Client ID is required');
        }
        
        // Verify client exists
        $clientResult = $this->clientModel->getById($clientId);
        if ($clientResult->rowCount() === 0) {
            return $this->sendError('Client not found');
        }
        
        $result = $this->proposalModel->getByClient($clientId);
        $proposals = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $proposals[] = $row;
        }
        
        return $this->sendResponse($proposals, 'Proposals retrieved successfully');
    }
    
    // Get proposals by status
    public function getByStatus($data = [], $status = null) {
        if (!$status) {
            return $this->sendError('Status is required');
        }
        
        $result = $this->proposalModel->getByStatus($status);
        $proposals = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $proposals[] = $row;
        }
        
        return $this->sendResponse($proposals, 'Proposals retrieved successfully');
    }
    
    // Get single proposal
    public function get($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Proposal ID is required');
        }
        
        $result = $this->proposalModel->getById($id);
        
        if ($result->rowCount() === 0) {
            return $this->sendError('Proposal not found');
        }
        
        $proposal = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this proposal
        $servicesResult = $this->proposalModel->getServices($id);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $proposal['services'] = $services;
        
        return $this->sendResponse($proposal, 'Proposal retrieved successfully');
    }
    
    // Create proposal
    public function create($data = [], $id = null) {
        // Validate required fields
        if (!isset($data['title']) || !isset($data['client_id'])) {
            return $this->sendError('Title and client_id are required');
        }
        
        // Verify client exists
        $clientResult = $this->clientModel->getById($data['client_id']);
        if ($clientResult->rowCount() === 0) {
            return $this->sendError('Client not found');
        }
        
        // Create proposal
        $proposalId = $this->proposalModel->create($data);
        
        if (!$proposalId) {
            return $this->sendError('Failed to create proposal');
        }
        
        // Add services if provided
        if (isset($data['services']) && is_array($data['services'])) {
            foreach ($data['services'] as $service) {
                // Verify service exists
                if (!isset($service['service_id'])) {
                    continue;
                }
                
                $serviceResult = $this->serviceModel->getById($service['service_id']);
                if ($serviceResult->rowCount() === 0) {
                    continue;
                }
                
                $serviceRow = $serviceResult->fetch(PDO::FETCH_ASSOC);
                
                // Set default values if not provided
                if (!isset($service['quantity'])) {
                    $service['quantity'] = 1;
                }
                
                if (!isset($service['price'])) {
                    $service['price'] = $serviceRow['price'];
                }
                
                if (!isset($service['discount'])) {
                    $service['discount'] = 0;
                }
                
                // Calculate total
                $service['total'] = ($service['price'] * $service['quantity']) * (1 - ($service['discount'] / 100));
                
                // Add service to proposal
                $this->proposalModel->addService($proposalId, $service);
            }
        }
        
        // Get the created proposal
        $result = $this->proposalModel->getById($proposalId);
        $proposal = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this proposal
        $servicesResult = $this->proposalModel->getServices($proposalId);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $proposal['services'] = $services;
        
        return $this->sendResponse($proposal, 'Proposal created successfully');
    }
    
    // Update proposal
    public function update($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Proposal ID is required');
        }
        
        // Verify proposal exists
        $result = $this->proposalModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Proposal not found');
        }
        
        // If client_id is provided, verify client exists
        if (isset($data['client_id'])) {
            $clientResult = $this->clientModel->getById($data['client_id']);
            if ($clientResult->rowCount() === 0) {
                return $this->sendError('Client not found');
            }
        }
        
        // Update proposal
        $success = $this->proposalModel->update($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update proposal');
        }
        
        // Get the updated proposal
        $result = $this->proposalModel->getById($id);
        $proposal = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this proposal
        $servicesResult = $this->proposalModel->getServices($id);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $proposal['services'] = $services;
        
        return $this->sendResponse($proposal, 'Proposal updated successfully');
    }
    
    // Delete proposal
    public function delete($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Proposal ID is required');
        }
        
        // Verify proposal exists
        $result = $this->proposalModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Proposal not found');
        }
        
        // Delete proposal
        $success = $this->proposalModel->delete($id);
        
        if (!$success) {
            return $this->sendError('Failed to delete proposal');
        }
        
        return $this->sendResponse(null, 'Proposal deleted successfully');
    }
    
    // Add service to proposal
    public function addService($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Proposal ID is required');
        }
        
        // Validate required fields
        if (!isset($data['service_id'])) {
            return $this->sendError('Service ID is required');
        }
        
        // Verify proposal exists
        $proposalResult = $this->proposalModel->getById($id);
        if ($proposalResult->rowCount() === 0) {
            return $this->sendError('Proposal not found');
        }
        
        // Verify service exists
        $serviceResult = $this->serviceModel->getById($data['service_id']);
        if ($serviceResult->rowCount() === 0) {
            return $this->sendError('Service not found');
        }
        
        $serviceRow = $serviceResult->fetch(PDO::FETCH_ASSOC);
        
        // Set default values if not provided
        if (!isset($data['quantity'])) {
            $data['quantity'] = 1;
        }
        
        if (!isset($data['price'])) {
            $data['price'] = $serviceRow['price'];
        }
        
        if (!isset($data['discount'])) {
            $data['discount'] = 0;
        }
        
        // Calculate total
        $data['total'] = ($data['price'] * $data['quantity']) * (1 - ($data['discount'] / 100));
        
        // Add service to proposal
        $serviceId = $this->proposalModel->addService($id, $data);
        
        if (!$serviceId) {
            return $this->sendError('Failed to add service to proposal');
        }
        
        // Get the added service
        $servicesResult = $this->proposalModel->getServices($id);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            if ($serviceRow['id'] == $serviceId) {
                $service = $serviceRow;
                break;
            }
        }
        
        return $this->sendResponse($service, 'Service added to proposal successfully');
    }
    
    // Update service in proposal
    public function updateService($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Service ID is required');
        }
        
        // If service_id is provided, verify service exists
        if (isset($data['service_id'])) {
            $serviceResult = $this->serviceModel->getById($data['service_id']);
            if ($serviceResult->rowCount() === 0) {
                return $this->sendError('Service not found');
            }
        }
        
        // Update service
        $success = $this->proposalModel->updateService($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update service');
        }
        
        return $this->sendResponse(null, 'Service updated successfully');
    }
    
    // Remove service from proposal
    public function removeService($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Service ID is required');
        }
        
        // Remove service
        $success = $this->proposalModel->removeService($id);
        
        if (!$success) {
            return $this->sendError('Failed to remove service from proposal');
        }
        
        return $this->sendResponse(null, 'Service removed from proposal successfully');
    }
    
    // Update proposal status
    public function updateStatus($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            return $this->sendError('Proposal ID is required');
        }
        
        // Check if proposal exists
        $result = $this->proposalModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Proposal not found');
        }
        
        // Get status from request body
        $requestBody = file_get_contents('php://input');
        $requestData = json_decode($requestBody, true) ?? [];
        
        if (!isset($requestData['status'])) {
            return $this->sendError('Status is required');
        }
        
        $status = $requestData['status'];
        
        // Update the proposal status
        $updateData = ['status' => $status];
        $success = $this->proposalModel->update($id, $updateData);
        
        if (!$success) {
            return $this->sendError('Failed to update proposal status');
        }
        
        // Get the updated proposal
        $result = $this->proposalModel->getById($id);
        $proposal = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($proposal, 'Proposal status updated successfully');
    }
}
?> 