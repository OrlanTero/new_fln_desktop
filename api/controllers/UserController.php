<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/User.php';

class UserController extends BaseController {
    private $userModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->userModel = new User($db);
    }
    
    // Get all users
    public function index($data = [], $id = null) {
        $result = $this->userModel->getAll();
        $users = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $users[] = $row;
        }
        
        return $this->sendResponse($users, 'Users retrieved successfully');
    }
    
    // Get a single user by ID
    public function get($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            return $this->sendError('User ID is required');
        }
        
        $result = $this->userModel->getById($id);
        
        if ($result->rowCount() === 0) {
            return $this->sendError('User not found');
        }
        
        $user = $result->fetch(PDO::FETCH_ASSOC);
        
        return $this->sendResponse($user, 'User retrieved successfully');
    }
    
    // Create a new user
    public function create($data = [], $id = null) {
        // Validate required fields
        $requiredFields = ['name', 'email', 'password'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->sendError($field . ' is required');
            }
        }
        
        // Create user
        try {
            $userId = $this->userModel->create($data);
            
            if (!$userId) {
                return $this->sendError('Failed to create user');
            }
            
            // Get the created user
            $result = $this->userModel->getById($userId);
            $user = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($user, 'User created successfully');
        } catch (Exception $e) {
            return $this->sendError('Error creating user: ' . $e->getMessage());
        }
    }
    
    // Update an existing user
    public function update($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('User ID is required', 400);
            return;
        }
        
        // Check if user exists
        $result = $this->userModel->getById($id);
        $user = $result->fetch();
        
        if (!$user) {
            Response::error('User not found', 404);
            return;
        }
        
        // Update the user
        $success = $this->userModel->update($id, $data);
        
        if (!$success) {
            Response::error('Failed to update user', 500);
            return;
        }
        
        // Get the updated user
        $result = $this->userModel->getById($id);
        $updatedUser = $result->fetch();
        
        Response::success($updatedUser, 'User updated successfully');
    }
    
    // Delete a user
    public function delete($data = [], $id = null) {
        // Check if ID is provided
        if (!$id) {
            Response::error('User ID is required', 400);
            return;
        }
        
        // Check if user exists
        $result = $this->userModel->getById($id);
        $user = $result->fetch();
        
        if (!$user) {
            Response::error('User not found', 404);
            return;
        }
        
        // Delete the user
        $success = $this->userModel->delete($id);
        
        if (!$success) {
            Response::error('Failed to delete user', 500);
            return;
        }
        
        Response::success(null, 'User deleted successfully');
    }
    
    // Login user
    public function login($data = [], $id = null) {
        // Validate required fields
        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->sendError('Email and password are required');
        }
        
        // Attempt login
        try {
            $user = $this->userModel->login($data['email'], $data['password']);
            
            if (!$user) {
                return $this->sendError('Invalid email or password');
            }
            
            return $this->sendResponse($user, 'Login successful');
        } catch (Exception $e) {
            return $this->sendError('Error during login: ' . $e->getMessage());
        }
    }
}
?> 