<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Service.php';

class ServiceController extends BaseController {
    private $serviceModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->serviceModel = new Service($db);
    }
    
    // Get all services - This is the method called by the router for GET /services
    public function index($data = [], $id = null) {
        return $this->getAll($data, $id);
    }
    
    // Get all services
    public function getAll($data = [], $id = null) {
        $result = $this->serviceModel->getAll();
        $services = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $row;
        }
        
        return $this->sendResponse($services, 'Services retrieved successfully');
    }
    
    // Get a single service by ID
    public function get($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Service ID is required', 400);
            return;
        }
        
        $result = $this->serviceModel->getById($id);
        $service = $result->fetch();
        
        if (!$service) {
            Response::error('Service not found', 404);
            return;
        }
        
        Response::success($service, 'Service retrieved successfully');
    }
    
    // Get services by category
    public function getByCategory($data = [], $categoryId = null) {
        // Check if category ID is provided
        if (!$categoryId) {
            Response::error('Category ID is required', 400);
            return;
        }
        
        $result = $this->serviceModel->getByCategory($categoryId);
        $services = $result->fetchAll();
        
        Response::success($services, 'Services retrieved successfully');
    }
    
    // Create a new service
    public function create($data = [], $id = null) {
        // Normalize data to handle different field naming conventions
        $normalizedData = $this->normalizeServiceData($data);
        
        // Validate required fields
        $requiredFields = ['name', 'price', 'category_id'];
        $errors = $this->validateRequired($normalizedData, $requiredFields);
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
            return;
        }
        
        // Create the service
        $serviceId = $this->serviceModel->create($normalizedData);
        
        if (!$serviceId) {
            Response::error('Failed to create service', 500);
            return;
        }
        
        // Get the created service
        $result = $this->serviceModel->getById($serviceId);
        $service = $result->fetch();
        
        Response::success($service, 'Service created successfully', 201);
    }
    
    // Helper method to normalize service data field names
    private function normalizeServiceData($data) {
        $normalized = [];
        
        // Handle service_name/name
        if (isset($data['service_name'])) {
            $normalized['name'] = $data['service_name'];
        } elseif (isset($data['name'])) {
            $normalized['name'] = $data['name'];
        } else {
            $normalized['name'] = '';
        }
        
        // Handle service_category_id/category_id
        if (isset($data['service_category_id'])) {
            $normalized['category_id'] = $data['service_category_id'];
        } elseif (isset($data['category_id'])) {
            $normalized['category_id'] = $data['category_id'];
        } else {
            $normalized['category_id'] = null;
        }
        
        // Copy other fields
        $normalized['price'] = $data['price'] ?? 0;
        $normalized['remarks'] = $data['remarks'] ?? '';
        $normalized['timeline'] = $data['timeline'] ?? '';
        
        return $normalized;
    }
    
    // Update an existing service
    public function update($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Service ID is required', 400);
            return;
        }
        
        // Check if service exists
        $result = $this->serviceModel->getById($id);
        $service = $result->fetch();
        
        if (!$service) {
            Response::error('Service not found', 404);
            return;
        }
        
        // Normalize data to handle different field naming conventions
        $normalizedData = $this->normalizeServiceData($data);
        
        // Update the service
        $success = $this->serviceModel->update($id, $normalizedData);
        
        if (!$success) {
            Response::error('Failed to update service', 500);
            return;
        }
        
        // Get the updated service
        $result = $this->serviceModel->getById($id);
        $updatedService = $result->fetch();
        
        Response::success($updatedService, 'Service updated successfully');
    }
    
    // Delete a service
    public function delete($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Service ID is required', 400);
            return;
        }
        
        // Check if service exists
        $result = $this->serviceModel->getById($id);
        $service = $result->fetch();
        
        if (!$service) {
            Response::error('Service not found', 404);
            return;
        }
        
        // Delete the service
        $success = $this->serviceModel->delete($id);
        
        if (!$success) {
            Response::error('Failed to delete service', 500);
            return;
        }
        
        Response::success(null, 'Service deleted successfully');
    }
    
    // Get all service categories
    public function categories($data = [], $id = null) {
        $result = $this->serviceModel->getAllCategories();
        $categories = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = $row;
        }
        
        return $this->sendResponse($categories, 'Service categories retrieved successfully');
    }
    
    // Get a single service category by ID
    public function category($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Category ID is required', 400);
            return;
        }
        
        $result = $this->serviceModel->getCategoryById($id);
        $category = $result->fetch();
        
        if (!$category) {
            Response::error('Category not found', 404);
            return;
        }
        
        Response::success($category, 'Category retrieved successfully');
    }
    
    // Create a new service category
    public function createCategory($data = [], $id = null) {
        // Validate required fields
        $requiredFields = ['name'];
        $errors = $this->validateRequired($data, $requiredFields);
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
            return;
        }
        
        // Create the category
        $categoryId = $this->serviceModel->createCategory($data);
        
        if (!$categoryId) {
            Response::error('Failed to create category', 500);
            return;
        }
        
        // Get the created category
        $result = $this->serviceModel->getCategoryById($categoryId);
        $category = $result->fetch();
        
        Response::success($category, 'Category created successfully', 201);
    }
    
    // Update an existing service category
    public function updateCategory($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Category ID is required', 400);
            return;
        }
        
        // Check if category exists
        $result = $this->serviceModel->getCategoryById($id);
        $category = $result->fetch();
        
        if (!$category) {
            Response::error('Category not found', 404);
            return;
        }
        
        // Update the category
        $success = $this->serviceModel->updateCategory($id, $data);
        
        if (!$success) {
            Response::error('Failed to update category', 500);
            return;
        }
        
        // Get the updated category
        $result = $this->serviceModel->getCategoryById($id);
        $updatedCategory = $result->fetch();
        
        Response::success($updatedCategory, 'Category updated successfully');
    }
    
    // Delete a service category
    public function deleteCategory($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('Category ID is required', 400);
            return;
        }
        
        // Check if category exists
        $result = $this->serviceModel->getCategoryById($id);
        $category = $result->fetch();
        
        if (!$category) {
            Response::error('Category not found', 404);
            return;
        }
        
        // Delete the category
        $success = $this->serviceModel->deleteCategory($id);
        
        if (!$success) {
            Response::error('Failed to delete category', 500);
            return;
        }
        
        Response::success(null, 'Category deleted successfully');
    }
}
?> 