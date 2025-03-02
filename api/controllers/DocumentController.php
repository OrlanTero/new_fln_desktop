<?php
require_once 'BaseController.php';
require_once __DIR__ . '/../models/Document.php';

class DocumentController extends BaseController {
    private $documentModel;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->documentModel = new Document($db);
    }
    
    // Get all documents - This is the method called by the router for GET /documents
    public function index($data = [], $id = null) {
        try {
            $result = $this->documentModel->getAll();
            $documents = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                // Don't include file_content in the list to reduce response size
                unset($row['file_content']);
                $documents[] = $row;
            }
            
            return $this->sendResponse($documents, 'Documents retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving documents: ' . $e->getMessage());
        }
    }
    
    // Get a single document by ID
    public function get($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Document ID is required');
            }
            
            $result = $this->documentModel->getById($id);
            $document = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$document) {
                return $this->sendError('Document not found', 404);
            }
            
            // Don't include file_content in the response to reduce size
            unset($document['file_content']);
            
            return $this->sendResponse($document, 'Document retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving document: ' . $e->getMessage());
        }
    }
    
    // Get documents by proposal ID
    public function getByProposal($data = [], $proposalId = null) {
        try {
            // Check if proposal ID is provided
            if (!$proposalId) {
                return $this->sendError('Proposal ID is required');
            }
            
            $result = $this->documentModel->getByProposalId($proposalId);
            $documents = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                // Don't include file_content in the list
                unset($row['file_content']);
                $documents[] = $row;
            }
            
            return $this->sendResponse($documents, 'Documents retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving documents: ' . $e->getMessage());
        }
    }
    
    // Get documents by type
    public function getByType($data = [], $type = null) {
        try {
            // Check if type is provided
            if (!$type) {
                return $this->sendError('Document type is required');
            }
            
            $result = $this->documentModel->getByType($type);
            $documents = [];
            
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                // Don't include file_content in the list
                unset($row['file_content']);
                $documents[] = $row;
            }
            
            return $this->sendResponse($documents, 'Documents retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving documents: ' . $e->getMessage());
        }
    }
    
    // Get document content
    public function getContent($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Document ID is required');
            }
            
            $content = $this->documentModel->getContent($id);
            
            if (!$content) {
                return $this->sendError('Document content not found', 404);
            }
            
            return $this->sendResponse($content, 'Document content retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError('Error retrieving document content: ' . $e->getMessage());
        }
    }
    
    // Create a new document
    public function create($data = [], $id = null) {
        try {
            // Validate required fields
            $requiredFields = ['document_path', 'file_name'];
            $errors = $this->validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                return $this->sendError('Validation failed', 400, $errors);
            }
            
            // Create the document
            $documentId = $this->documentModel->create($data);
            
            if (!$documentId) {
                return $this->sendError('Failed to create document');
            }
            
            // Get the created document
            $result = $this->documentModel->getById($documentId);
            $document = $result->fetch(PDO::FETCH_ASSOC);
            
            // Don't include file_content in the response
            unset($document['file_content']);
            
            return $this->sendResponse($document, 'Document created successfully', 201);
        } catch (Exception $e) {
            return $this->sendError('Error creating document: ' . $e->getMessage());
        }
    }
    
    // Update an existing document
    public function update($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Document ID is required');
            }
            
            // Check if document exists
            $result = $this->documentModel->getById($id);
            $document = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$document) {
                return $this->sendError('Document not found', 404);
            }
            
            // Update the document
            $success = $this->documentModel->update($id, $data);
            
            if (!$success) {
                return $this->sendError('Failed to update document');
            }
            
            // Get the updated document
            $result = $this->documentModel->getById($id);
            $updatedDocument = $result->fetch(PDO::FETCH_ASSOC);
            
            // Don't include file_content in the response
            unset($updatedDocument['file_content']);
            
            return $this->sendResponse($updatedDocument, 'Document updated successfully');
        } catch (Exception $e) {
            return $this->sendError('Error updating document: ' . $e->getMessage());
        }
    }
    
    // Delete a document
    public function delete($data = [], $id = null) {
        try {
            // Check if ID is provided
            if (!$id) {
                return $this->sendError('Document ID is required');
            }
            
            // Check if document exists
            $result = $this->documentModel->getById($id);
            $document = $result->fetch(PDO::FETCH_ASSOC);
            
            if (!$document) {
                return $this->sendError('Document not found', 404);
            }
            
            // Delete the document
            $success = $this->documentModel->delete($id);
            
            if (!$success) {
                return $this->sendError('Failed to delete document');
            }
            
            return $this->sendResponse(null, 'Document deleted successfully');
        } catch (Exception $e) {
            return $this->sendError('Error deleting document: ' . $e->getMessage());
        }
    }
}
?>