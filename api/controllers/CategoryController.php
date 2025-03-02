<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Service.php';

class CategoryController extends BaseController {
    private $serviceModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->serviceModel = new Service($db);
    }
    
    // Get all categories - This is the method called by the router for GET /categories
    public function index($data = [], $id = null) {
        $result = $this->serviceModel->getAllCategories();
        $categories = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = $row;
        }
        
        return $this->sendResponse($categories, 'Service categories retrieved successfully');
    }
    
    // Get single category
    public function get($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Category ID is required');
        }
        
        $result = $this->serviceModel->getCategoryById($id);
        
        if ($result->rowCount() === 0) {
            return $this->sendError('Category not found');
        }
        
        $category = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($category, 'Category retrieved successfully');
    }
    
    // Create category
    public function create($data = [], $id = null) {
        // Validate required fields
        if (!isset($data['name'])) {
            return $this->sendError('Name is required');
        }
        
        // Create category
        $categoryId = $this->serviceModel->createCategory($data);
        
        if (!$categoryId) {
            return $this->sendError('Failed to create category');
        }
        
        // Get the created category
        $result = $this->serviceModel->getCategoryById($categoryId);
        $category = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($category, 'Category created successfully');
    }
    
    // Update category
    public function update($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Category ID is required');
        }
        
        // Verify category exists
        $result = $this->serviceModel->getCategoryById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Category not found');
        }
        
        // Update category
        $success = $this->serviceModel->updateCategory($id, $data);
        
        if (!$success) {
            return $this->sendError('Failed to update category');
        }
        
        // Get the updated category
        $result = $this->serviceModel->getCategoryById($id);
        $category = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($category, 'Category updated successfully');
    }
    
    // Delete category
    public function delete($data = [], $id = null) {
        if (!$id) {
            return $this->sendError('Category ID is required');
        }
        
        // Verify category exists
        $result = $this->serviceModel->getCategoryById($id);
        if ($result->rowCount() === 0) {
            return $this->sendError('Category not found');
        }
        
        // Delete category
        $success = $this->serviceModel->deleteCategory($id);
        
        if (!$success) {
            return $this->sendError('Failed to delete category');
        }
        
        return $this->sendResponse(null, 'Category deleted successfully');
    }
}
?> 