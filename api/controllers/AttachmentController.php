<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Attachment.php';

class AttachmentController extends BaseController {
    private $attachmentModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->attachmentModel = new Attachment($db);
    }
    
    // Get all attachments - This is the method called by the router for GET /attachments
    public function index($data = [], $id = null) {
        try {
            $result = $this->attachmentModel->getAll();
            $attachments = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            return $this->sendResponse($attachments, 'Attachments retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving attachments: ' . $e->getMessage());
        }
    }
    
    // Get a single attachment by ID
    public function get($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Attachment ID is required');
            }
            
            $result = $this->attachmentModel->getById($id);
            $attachment = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$attachment) {
                return $this->sendError('Attachment not found', 404);
            }
            
            return $this->sendResponse($attachment, 'Attachment retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving attachment: ' . $e->getMessage());
        }
    }
    
    // Get attachments by email ID
    public function getByEmail($data = [], $emailId = null) {
        try {
            // Check if email ID is provided
            if (!$emailId) {
                return $this->sendError('Email ID is required');
            }
            
            $result = $this->attachmentModel->getByEmailId($emailId);
            $attachments = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            return $this->sendResponse($attachments, 'Attachments retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving attachments: ' . $e->getMessage());
        }
    }
    
    // Get attachments by document ID
    public function getByDocument($data = [], $documentId = null) {
        try {
            // Check if document ID is provided
            if (!$documentId) {
                return $this->sendError('Document ID is required');
            }
            
            $result = $this->attachmentModel->getByDocumentId($documentId);
            $attachments = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            return $this->sendResponse($attachments, 'Attachments retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving attachments: ' . $e->getMessage());
        }
    }
    
    // Create a new attachment
    public function create($data = [], $id = null) {
        try {
            // Validate required fields
            $requiredFields = ['file_path', 'file_name'];
            $errors = $this->validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                return $this->sendError('Validation failed', 400, $errors);
            }
            
            // Create the attachment
            $attachmentId = $this->attachmentModel->create($data);
            
            if (!$attachmentId) {
                return $this->sendError('Failed to create attachment');
            }
            
            // Get the created attachment
            $result = $this->attachmentModel->getById($attachmentId);
            $attachment = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($attachment, 'Attachment created successfully', 201);
        } catch (Exception $e) {
            return $this->sendError('Error creating attachment: ' . $e->getMessage());
        }
    }
    
    // Update an existing attachment
    public function update($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Attachment ID is required');
            }
            
            // Check if attachment exists
            $result = $this->attachmentModel->getById($id);
            $attachment = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$attachment) {
                return $this->sendError('Attachment not found', 404);
            }
            
            // Update the attachment
            $success = $this->attachmentModel->update($id, $data);
            
            if (!$success) {
                return $this->sendError('Failed to update attachment');
            }
            
            // Get the updated attachment
            $result = $this->attachmentModel->getById($id);
            $updatedAttachment = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($updatedAttachment, 'Attachment updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating attachment: ' . $e->getMessage());
        }
    }
    
    // Delete an attachment
    public function delete($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Attachment ID is required');
            }
            
            // Check if attachment exists
            $result = $this->attachmentModel->getById($id);
            $attachment = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$attachment) {
                return $this->sendError('Attachment not found', 404);
            }
            
            // Delete the attachment
            $success = $this->attachmentModel->delete($id);
            
            if (!$success) {
                return $this->sendError('Failed to delete attachment');
            }
            
            return $this->sendResponse(null, 'Attachment deleted successfully');
        } catch (Exception $e) {
            return $this->sendError('Error deleting attachment: ' . $e->getMessage());
        }
    }
}
?> 