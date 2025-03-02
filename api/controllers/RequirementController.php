<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/ServiceRequirement.php';

class RequirementController extends BaseController {
    private $requirementModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->requirementModel = new ServiceRequirement($db);
    }
    
    // Get all requirements - This is the method called by the router for GET /requirements
    public function index($data = [], $id = null) {
        return $this->getAll($data, $id);
    }
    
    // Get all requirements
    public function getAll($data = [], $id = null) {
        $result = $this->requirementModel->getAll();
        $requirements = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $requirements[] = $row;
        }
        
        return $this->sendResponse($requirements, 'Requirements retrieved successfully');
    }
    
    // Get all requirements for a service
    public function getByService($data = [], $serviceId = null) {
        // Check if service ID is provided
        if (!$serviceId) {
            Response::error('Service ID is required', 400);
            return;
        }
        
        $result = $this->requirementModel->getAllByServiceId($serviceId);
        $requirements = $result->fetchAll();
        
        Response::success($requirements, 'Requirements retrieved successfully');
    }
    
    // Get a single requirement by ID
    public function get($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Requirement ID is required', 400);
            return;
        }
        
        $result = $this->requirementModel->getById($id);
        $requirement = $result->fetch();
        
        if (!$requirement) {
            Response::error('Requirement not found', 404);
            return;
        }
        
        Response::success($requirement, 'Requirement retrieved successfully');
    }
    
    // Create a new requirement
    public function create($data = [], $id = null) {
        // Validate required fields
        $requiredFields = ['service_id', 'name'];
        $errors = $this->validateRequired($data, $requiredFields);
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
            return;
        }
        
        // Create the requirement
        $requirementId = $this->requirementModel->create($data);
        
        if (!$requirementId) {
            Response::error('Failed to create requirement', 500);
            return;
        }
        
        // Get the created requirement
        $result = $this->requirementModel->getById($requirementId);
        $requirement = $result->fetch();
        
        Response::success($requirement, 'Requirement created successfully', 201);
    }
    
    // Update an existing requirement
    public function update($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Requirement ID is required', 400);
            return;
        }
        
        // Check if requirement exists
        $result = $this->requirementModel->getById($id);
        $requirement = $result->fetch();
        
        if (!$requirement) {
            Response::error('Requirement not found', 404);
            return;
        }
        
        // Update the requirement
        $success = $this->requirementModel->update($id, $data);
        
        if (!$success) {
            Response::error('Failed to update requirement', 500);
            return;
        }
        
        // Get the updated requirement
        $result = $this->requirementModel->getById($id);
        $updatedRequirement = $result->fetch();
        
        Response::success($updatedRequirement, 'Requirement updated successfully');
    }
    
    // Delete a requirement
    public function delete($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Requirement ID is required', 400);
            return;
        }
        
        // Check if requirement exists
        $result = $this->requirementModel->getById($id);
        $requirement = $result->fetch();
        
        if (!$requirement) {
            Response::error('Requirement not found', 404);
            return;
        }
        
        // Delete the requirement
        $success = $this->requirementModel->delete($id);
        
        if (!$success) {
            Response::error('Failed to delete requirement', 500);
            return;
        }
        
        Response::success(null, 'Requirement deleted successfully');
    }
    
    // Delete all requirements for a service
    public function deleteAllByService($data = [], $serviceId = null) {
        // Check if service ID is provided
        if (!$serviceId) {
            Response::error('Service ID is required', 400);
            return;
        }
        
        // Delete all requirements for the service
        $success = $this->requirementModel->deleteAllByServiceId($serviceId);
        
        if (!$success) {
            Response::error('Failed to delete requirements', 500);
            return;
        }
        
        Response::success(null, 'All requirements for the service deleted successfully');
    }
}
?> 