const Attachment = require('../models/Attachment');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

// Get all attachments
async function getAllAttachments() {
  try {
    const attachments = await Attachment.getAll();
    return { success: true, attachments };
  } catch (error) {
    console.error('Error in getAllAttachments:', error);
    return { success: false, error: error.message };
  }
}

// Get attachment by ID
async function getAttachmentById(attachmentId) {
  try {
    const attachment = await Attachment.getById(attachmentId);
    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }
    return { success: true, attachment };
  } catch (error) {
    console.error('Error in getAttachmentById:', error);
    return { success: false, error: error.message };
  }
}

// Upload attachment
async function uploadAttachment(filePath) {
  try {
    // Create attachments directory if it doesn't exist
    const userDataPath = app.getPath('userData');
    const attachmentsDir = path.join(userDataPath, 'attachments');
    
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true });
    }
    
    // Get file information
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    
    // Generate a unique filename to avoid collisions
    const uniqueFileName = `${path.basename(fileName, fileExt)}_${uuidv4()}${fileExt}`;
    const destinationPath = path.join(attachmentsDir, uniqueFileName);
    
    // Copy the file to the attachments directory
    fs.copyFileSync(filePath, destinationPath);
    
    // Determine MIME type based on extension (simplified)
    let mimeType = 'application/octet-stream';
    switch (fileExt.toLowerCase()) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.doc':
        mimeType = 'application/msword';
        break;
      case '.docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        mimeType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }
    
    // Save attachment record in database
    const attachment = await Attachment.create({
      file_path: destinationPath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType
    });
    
    return { 
      success: true, 
      attachment_id: attachment.attachment_id,
      file_path: destinationPath
    };
  } catch (error) {
    console.error('Error in uploadAttachment:', error);
    return { success: false, error: error.message };
  }
}

// Delete attachment
async function deleteAttachment(attachmentId) {
  try {
    // Get attachment to find the file path
    const attachment = await Attachment.getById(attachmentId);
    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }
    
    // Delete the file if it exists
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }
    
    // Delete the database record
    const result = await Attachment.delete(attachmentId);
    if (!result) {
      return { success: false, error: 'Failed to delete attachment record' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteAttachment:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAllAttachments,
  getAttachmentById,
  uploadAttachment,
  deleteAttachment
}; 