<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/ServiceCategory.php';

class ServiceCategoryController extends BaseController {
    private $categoryModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->categoryModel = new ServiceCategory($db);
    }
    
    // Get all service categories - This is the method called by the router for GET /serviceCategories
    public function index($data = [], $id = null) {
        try {
            $result = $this->categoryModel->getAll();
            $categories = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $categories[] = $row;
            }
            
            return $this->sendResponse($categories, 'Service categories retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving service categories: ' . $e->getMessage());
        }
    }
    
    // Get a single service category by ID
    public function get($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Service category ID is required');
            }
            
            $result = $this->categoryModel->getById($id);
            $category = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$category) {
                return $this->sendError('Service category not found', 404);
            }
            
            return $this->sendResponse($category, 'Service category retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving service category: ' . $e->getMessage());
        }
    }
    
    // Create a new service category
    public function create($data = [], $id = null) {
        try {
            // Validate required fields
            $requiredFields = ['service_category_name'];
            $errors = $this->validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                return $this->sendError('Validation failed', 400, $errors);
            }
            
            // Create the service category
            $categoryId = $this->categoryModel->create($data);
            
            if (!$categoryId) {
                return $this->sendError('Failed to create service category');
            }
            
            // Get the created service category
            $result = $this->categoryModel->getById($categoryId);
            $category = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($category, 'Service category created successfully', 201);
        } catch (Exception $e) {
            return $this->sendError('Error creating service category: ' . $e->getMessage());
        }
    }
    
    // Update an existing service category
    public function update($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Service category ID is required');
            }
            
            // Check if service category exists
            $result = $this->categoryModel->getById($id);
            $category = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$category) {
                return $this->sendError('Service category not found', 404);
            }
            
            // Update the service category
            $success = $this->categoryModel->update($id, $data);
            
            if (!$success) {
                return $this->sendError('Failed to update service category');
            }
            
            // Get the updated service category
            $result = $this->categoryModel->getById($id);
            $updatedCategory = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($updatedCategory, 'Service category updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating service category: ' . $e->getMessage());
        }
    }
    
    // Delete a service category
    public function delete($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Service category ID is required');
            }
            
            // Check if service category exists
            $result = $this->categoryModel->getById($id);
            $category = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$category) {
                return $this->sendError('Service category not found', 404);
            }
            
            // Delete the service category
            $success = $this->categoryModel->delete($id);
            
            if (!$success) {
                return $this->sendError('Failed to delete service category');
            }
            
            return $this->sendResponse(null, 'Service category deleted successfully');
        } catch (Exception $e) {
            return $this->sendError('Error deleting service category: ' . $e->getMessage());
        }
    }
    
    // Update priorities for multiple service categories
    public function updatePriorities($data = [], $id = null) {
        try {
            // Check if priorities data is provided
            if (!isset($data['priorities']) || !is_array($data['priorities'])) {
                return $this->sendError('Priorities data is required');
            }
            
            // Update the priorities
            $success = $this->categoryModel->updatePriorities($data['priorities']);
            
            if (!$success) {
                return $this->sendError('Failed to update service category priorities');
            }
            
            // Get all service categories with updated priorities
            $result = $this->categoryModel->getAll();
            $categories = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $categories[] = $row;
            }
            
            return $this->sendResponse($categories, 'Service category priorities updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating service category priorities: ' . $e->getMessage());
        }
    }
}
?> 