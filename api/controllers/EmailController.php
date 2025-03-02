<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Email.php';

class EmailController extends BaseController {
    private $emailModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->emailModel = new Email($db);
    }
    
    // Get all emails - This is the method called by the router for GET /emails
    public function index($data = [], $id = null) {
        try {
            $result = $this->emailModel->getAll();
            $emails = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $emails[] = $row;
            }
            
            return $this->sendResponse($emails, 'Emails retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving emails: ' . $e->getMessage());
        }
    }
    
    // Get a single email by ID
    public function get($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Email ID is required');
            }
            
            $result = $this->emailModel->getById($id);
            $email = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$email) {
                return $this->sendError('Email not found', 404);
            }
            
            // Get attachments for this email
            $attachmentsResult = $this->emailModel->getAttachments($id);
            $attachments = [];
            
            while ($row = $attachmentsResult->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            $email['attachments'] = $attachments;
            
            return $this->sendResponse($email, 'Email retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving email: ' . $e->getMessage());
        }
    }
    
    // Get emails by proposal ID
    public function getByProposal($data = [], $proposalId = null) {
        try {
            // Check if proposal ID is provided
            if (!$proposalId) {
                return $this->sendError('Proposal ID is required');
            }
            
            $result = $this->emailModel->getByProposalId($proposalId);
            $emails = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $emails[] = $row;
            }
            
            return $this->sendResponse($emails, 'Emails retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving emails: ' . $e->getMessage());
        }
    }
    
    // Get emails by status
    public function getByStatus($data = [], $status = null) {
        try {
            // Check if status is provided
            if (!$status) {
                return $this->sendError('Email status is required');
            }
            
            $result = $this->emailModel->getByStatus($status);
            $emails = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $emails[] = $row;
            }
            
            return $this->sendResponse($emails, 'Emails retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving emails: ' . $e->getMessage());
        }
    }
    
    // Create a new email
    public function create($data = [], $id = null) {
        try {
            // Validate required fields
            $requiredFields = ['subject', 'sender', 'recipient', 'message'];
            $errors = $this->validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                return $this->sendError('Validation failed', 400, $errors);
            }
            
            // Create the email
            $emailId = $this->emailModel->create($data);
            
            if (!$emailId) {
                return $this->sendError('Failed to create email');
            }
            
            // Process attachments if provided
            if (isset($data['attachments']) && is_array($data['attachments'])) {
                foreach ($data['attachments'] as $attachment) {
                    $this->emailModel->addAttachment($emailId, $attachment);
                }
            }
            
            // Get the created email
            $result = $this->emailModel->getById($emailId);
            $email = $result->fetch(PDO::FETCH_ASSOC);
            
            // Get attachments for this email
            $attachmentsResult = $this->emailModel->getAttachments($emailId);
            $attachments = [];
            
            while ($row = $attachmentsResult->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            $email['attachments'] = $attachments;
            
            return $this->sendResponse($email, 'Email created successfully', 201);
        } catch (Exception $e) {
            return $this->sendError('Error creating email: ' . $e->getMessage());
        }
    }
    
    // Update an existing email
    public function update($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Email ID is required');
            }
            
            // Check if email exists
            $result = $this->emailModel->getById($id);
            $email = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$email) {
                return $this->sendError('Email not found', 404);
            }
            
            // Update the email
            $success = $this->emailModel->update($id, $data);
            
            if (!$success) {
                return $this->sendError('Failed to update email');
            }
            
            // Get the updated email
            $result = $this->emailModel->getById($id);
            $updatedEmail = $result->fetch(PDO::FETCH_ASSOC);
            
            // Get attachments for this email
            $attachmentsResult = $this->emailModel->getAttachments($id);
            $attachments = [];
            
            while ($row = $attachmentsResult->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            $updatedEmail['attachments'] = $attachments;
            
            return $this->sendResponse($updatedEmail, 'Email updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating email: ' . $e->getMessage());
        }
    }
    
    // Delete an email
    public function delete($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Email ID is required');
            }
            
            // Check if email exists
            $result = $this->emailModel->getById($id);
            $email = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$email) {
                return $this->sendError('Email not found', 404);
            }
            
            // Delete the email
            $success = $this->emailModel->delete($id);
            
            if (!$success) {
                return $this->sendError('Failed to delete email');
            }
            
            return $this->sendResponse(null, 'Email deleted successfully');
        } catch (Exception $e) {
            return $this->sendError('Error deleting email: ' . $e->getMessage());
        }
    }
    
    // Update email status
    public function updateStatus($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Email ID is required');
            }
            
            // Check if status is provided
            if (!isset($data['status'])) {
                return $this->sendError('Email status is required');
            }
            
            // Check if email exists
            $result = $this->emailModel->getById($id);
            $email = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$email) {
                return $this->sendError('Email not found', 404);
            }
            
            // Update the email status
            $success = $this->emailModel->updateStatus($id, $data['status']);
            
            if (!$success) {
                return $this->sendError('Failed to update email status');
            }
            
            // Get the updated email
            $result = $this->emailModel->getById($id);
            $updatedEmail = $result->fetch(PDO::FETCH_ASSOC);
            
            return $this->sendResponse($updatedEmail, 'Email status updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating email status: ' . $e->getMessage());
        }
    }
    
    // Add attachment to email
    public function addAttachment($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Email ID is required');
            }
            
            // Check if attachment data is provided
            if (!isset($data['file_path']) || !isset($data['file_name'])) {
                return $this->sendError('Attachment data is incomplete');
            }
            
            // Check if email exists
            $result = $this->emailModel->getById($id);
            $email = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$email) {
                return $this->sendError('Email not found', 404);
            }
            
            // Add the attachment
            $attachmentId = $this->emailModel->addAttachment($id, $data);
            
            if (!$attachmentId) {
                return $this->sendError('Failed to add attachment');
            }
            
            // Get all attachments for this email
            $attachmentsResult = $this->emailModel->getAttachments($id);
            $attachments = [];
            
            while ($row = $attachmentsResult->fetch(PDO::FETCH_ASSOC)) {
                $attachments[] = $row;
            }
            
            return $this->sendResponse($attachments, 'Attachment added successfully');
        } catch (Exception $e) {
            return $this->sendError('Error adding attachment: ' . $e->getMessage());
        }
    }
}
?> 