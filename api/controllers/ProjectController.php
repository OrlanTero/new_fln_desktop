<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Project.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../models/Proposal.php';

class ProjectController extends BaseController {
    private $projectModel;
    private $clientModel;
    private $serviceModel;
    private $proposalModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->projectModel = new Project($db);
        $this->clientModel = new Client($db);
        $this->serviceModel = new Service($db);
        $this->proposalModel = new Proposal($db);
    }
    
    // Get all projects - This is the method called by the router for GET /projects
    public function index($data = [], $id = null) {
        return $this->getAll($data, $id);
    }
    
    // Get all projects
    public function getAll($data = [], $id = null) {
        $result = $this->projectModel->getAll();
        $projects = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $projects[] = $row;
        }
        
        return $this->sendResponse($projects, 'Projects retrieved successfully');
    }
    
    // Get projects by client
    public function getByClient($data = [], $clientId = null) {
        if (!$clientId) {
            return $this->sendError('Client ID is required');
        }
        
        // Verify client exists
        $clientResult = $this->clientModel->getById($clientId);
        if ($clientResult->rowCount() === 0) {
            return $this->sendError('Client not found');
        }
        
        $result = $this->projectModel->getByClient($clientId);
        $projects = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $projects[] = $row;
        }
        
        return $this->sendResponse($projects, 'Projects retrieved successfully');
    }
    
    // Get projects by status
    public function getByStatus($data = [], $status = null) {
        if (!$status) {
            return $this->sendError('Status is required');
        }
        
        $result = $this->projectModel->getByStatus($status);
        $projects = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $projects[] = $row;
        }
        
        return $this->sendResponse($projects, 'Projects retrieved successfully');
    }
    
    // Get single project
    public function get($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Project ID is required');
        }
        
        $result = $this->projectModel->getById($id);
        
        if ($result->rowCount() === 0) {
            return $this->sendError('Project not found');
        }
        
        $project = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this project
        $servicesResult = $this->projectModel->getServices($id);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $project['services'] = $services;
        
        return $this->sendResponse($project, 'Project retrieved successfully');
    }
    
    // Create project
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
        
        // If proposal_id is provided, verify proposal exists
        if (isset($data['proposal_id'])) {
            $proposalResult = $this->proposalModel->getById($data['proposal_id']);
            if ($proposalResult->rowCount() === 0) {
                return $this->sendError('Proposal not found');
            }
        }
        
        // Create project
        $projectId = $this->projectModel->create($data);
        
        if (!$projectId) {
            return $this->sendError('Failed to create project');
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
                
                // Add service to project
                $this->projectModel->addService($projectId, $service);
            }
        }
        
        // Get the created project
        $result = $this->projectModel->getById($projectId);
        $project = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this project
        $servicesResult = $this->projectModel->getServices($projectId);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $project['services'] = $services;
        
        return $this->sendResponse($project, 'Project created successfully');
    }
    
    // Create project from proposal
    public function createFromProposal($data = [], $proposalId = null) {
        if (!$proposalId) {
            return $this->sendError('Proposal ID is required');
        }
        
        // Verify proposal exists
        $proposalResult = $this->proposalModel->getById($proposalId);
        if ($proposalResult->rowCount() === 0) {
            return $this->sendError('Proposal not found');
        }
        
        // Create project from proposal
        $projectId = $this->projectModel->createFromProposal($proposalId, $data);
        
        if (!$projectId) {
            return $this->sendError('Failed to create project from proposal');
        }
        
        // Get the created project
        $result = $this->projectModel->getById($projectId);
        $project = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this project
        $servicesResult = $this->projectModel->getServices($projectId);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $project['services'] = $services;
        
        return $this->sendResponse($project, 'Project created from proposal successfully');
    }
    
    // Update project
    public function update($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Project ID is required');
        }
        
        // Verify project exists
        $result = $this->projectModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Project not found');
        }
        
        // If client_id is provided, verify client exists
        if (isset($data['client_id'])) {
            $clientResult = $this->clientModel->getById($data['client_id']);
            if ($clientResult->rowCount() === 0) {
                return $this->sendError('Client not found');
            }
        }
        
        // If proposal_id is provided, verify proposal exists
        if (isset($data['proposal_id'])) {
            $proposalResult = $this->proposalModel->getById($data['proposal_id']);
            if ($proposalResult->rowCount() === 0) {
                return $this->sendError('Proposal not found');
            }
        }
        
        // Update project
        $success = $this->projectModel->update($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update project');
        }
        
        // Get the updated project
        $result = $this->projectModel->getById($id);
        $project = $result->fetch(PDO::FETCH_ASSOC);
        
        // Get services for this project
        $servicesResult = $this->projectModel->getServices($id);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $serviceRow;
        }
        
        $project['services'] = $services;
        
        return $this->sendResponse($project, 'Project updated successfully');
    }
    
    // Update project payment
    public function updatePayment($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Project ID is required');
        }
        
        if (!isset($data['amount'])) {
            return $this->sendError('Payment amount is required');
        }
        
        // Verify project exists
        $result = $this->projectModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Project not found');
        }
        
        // Update payment
        $success = $this->projectModel->updatePayment($id, floatval($data['amount']));
        
        if (!$success) {
            return $this->sendError('Failed to update payment');
        }
        
        // Get the updated project
        $result = $this->projectModel->getById($id);
        $project = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($project, 'Payment updated successfully');
    }
    
    // Delete project
    public function delete($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Project ID is required');
        }
        
        // Verify project exists
        $result = $this->projectModel->getById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Project not found');
        }
        
        // Delete project
        $success = $this->projectModel->delete($id);
        
        if (!$success) {
            return $this->sendError('Failed to delete project');
        }
        
        return $this->sendResponse(null, 'Project deleted successfully');
    }
    
    // Add service to project
    public function addService($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Project ID is required');
        }
        
        // Validate required fields
        if (!isset($data['service_id'])) {
            return $this->sendError('Service ID is required');
        }
        
        // Verify project exists
        $projectResult = $this->projectModel->getById($id);
        if ($projectResult->rowCount() === 0) {
            return $this->sendError('Project not found');
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
        
        // Add service to project
        $serviceId = $this->projectModel->addService($id, $data);
        
        if (!$serviceId) {
            return $this->sendError('Failed to add service to project');
        }
        
        // Get the added service
        $servicesResult = $this->projectModel->getServices($id);
        $services = [];
        
        while ($serviceRow = $servicesResult->fetch(PDO::FETCH_ASSOC)) {
            if ($serviceRow['id'] == $serviceId) {
                $service = $serviceRow;
                break;
            }
        }
        
        return $this->sendResponse($service, 'Service added to project successfully');
    }
    
    // Update service in project
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
        $success = $this->projectModel->updateService($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update service');
        }
        
        return $this->sendResponse(null, 'Service updated successfully');
    }
    
    // Remove service from project
    public function removeService($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Service ID is required');
        }
        
        // Remove service
        $success = $this->projectModel->removeService($id);
        
        if (!$success) {
            return $this->sendError('Failed to remove service from project');
        }
        
        return $this->sendResponse(null, 'Service removed from project successfully');
    }
}
?> 