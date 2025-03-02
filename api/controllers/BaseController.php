<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class BaseController {
    protected $db;
    protected $conn;
    
    public function __construct($db) {
        $this->db = $db;
        $this->conn = $db;
    }
    
    // Default methods that can be overridden by child controllers
    public function index($data = [], $id = null) {
        Response::error('Method not implemented', 501);
    }
    
    public function get($data = [], $id = null) {
        Response::error('Method not implemented', 501);
    }
    
    public function create($data = [], $id = null) {
        Response::error('Method not implemented', 501);
    }
    
    public function update($data = [], $id = null) {
        Response::error('Method not implemented', 501);
    }
    
    public function delete($data = [], $id = null) {
        Response::error('Method not implemented', 501);
    }
    
    // Helper method to send a success response
    protected function sendResponse($data, $message = 'Success', $code = 200) {
        return [
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ];
    }
    
    // Helper method to send an error response
    protected function sendError($message = 'Error', $code = 400, $errors = []) {
        return [
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
            'data' => null
        ];
    }
    
    // Helper method to validate required fields
    protected function validateRequired($data, $requiredFields) {
        $errors = [];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $errors[] = "$field is required";
            }
        }
        
        return $errors;
    }
}
?> 