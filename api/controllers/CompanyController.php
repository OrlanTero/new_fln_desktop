<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Company.php';

class CompanyController extends BaseController {
    private $companyModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->companyModel = new Company($db);
    }
    
    // Get company info - This is the method called by the router for GET /company
    public function index($data = [], $id = null) {
        try {
            $this->companyModel->getInfo();
            
            // If company info exists, return it
            if ($this->companyModel->company_id) {
                $companyInfo = [
                    'company_id' => $this->companyModel->company_id,
                    'company_name' => $this->companyModel->company_name,
                    'address' => $this->companyModel->address,
                    'phone' => $this->companyModel->phone,
                    'email' => $this->companyModel->email,
                    'website' => $this->companyModel->website,
                    'tax_id' => $this->companyModel->tax_id,
                    'logo_url' => $this->companyModel->logo_url,
                    'updated_at' => $this->companyModel->updated_at
                ];
                
                return $this->sendResponse($companyInfo, 'Company information retrieved successfully');
            } else {
                return $this->sendResponse(null, 'No company information found');
            }
        } catch (Exception $e) {
            return $this->sendError('Error retrieving company information: ' . $e->getMessage());
        }
    }
    
    // Get company by ID
    public function get($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Company ID is required');
            }
            
            $result = $this->companyModel->getById($id);
            $company = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$company) {
                return $this->sendError('Company not found', 404);
            }
            
            return $this->sendResponse($company, 'Company retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving company: ' . $e->getMessage());
        }
    }
    
    // Create company info
    public function create($data = [], $id = null) {
        try {
            // Validate required fields
            $requiredFields = ['company_name'];
            $errors = $this->validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                return $this->sendError('Validation failed', 400, $errors);
            }
            
            // Create the company
            $companyId = $this->companyModel->create($data);
            
            if (!$companyId) {
                return $this->sendError('Failed to create company information');
            }
            
            // Get the created company
            $result = $this->companyModel->getById($companyId);
            $company = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($company, 'Company information created successfully', 201);
        } catch (Exception $e) {
            return $this->sendError('Error creating company information: ' . $e->getMessage());
        }
    }
    
    // Update company info
    public function update($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Company ID is required');
            }
            
            // Check if company exists
            $result = $this->companyModel->getById($id);
            $company = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$company) {
                return $this->sendError('Company not found', 404);
            }
            
            // Update the company
            $success = $this->companyModel->update($id, $data);
            
            if (!$success) {
                return $this->sendError('Failed to update company information');
            }
            
            // Get the updated company
            $result = $this->companyModel->getById($id);
            $updatedCompany = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($updatedCompany, 'Company information updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating company information: ' . $e->getMessage());
        }
    }
    
    // Update or create company info
    public function updateOrCreate($data = [], $id = null) {
        try {
            // Validate required fields
            $requiredFields = ['company_name'];
            $errors = $this->validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                return $this->sendError('Validation failed', 400, $errors);
            }
            
            // Update or create the company
            $companyId = $this->companyModel->updateOrCreate($data);
            
            if (!$companyId) {
                return $this->sendError('Failed to update or create company information');
            }
            
            // Get the company info
            $this->companyModel->getInfo();
            
            $companyInfo = [
                'company_id' => $this->companyModel->company_id,
                'company_name' => $this->companyModel->company_name,
                'address' => $this->companyModel->address,
                'phone' => $this->companyModel->phone,
                'email' => $this->companyModel->email,
                'website' => $this->companyModel->website,
                'tax_id' => $this->companyModel->tax_id,
                'logo_url' => $this->companyModel->logo_url,
                'updated_at' => $this->companyModel->updated_at
            ];
            
            return $this->sendResponse($companyInfo, 'Company information updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating company information: ' . $e->getMessage());
        }
    }
}
?> 