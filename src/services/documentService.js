const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');

// Get all documents
async function getAllDocuments() {
  try {
    const documents = await Document.getAll();
    return { success: true, documents };
  } catch (error) {
    console.error('Error in getAllDocuments:', error);
    return { success: false, error: error.message };
  }
}

// Get document by ID
async function getDocumentById(documentId) {
  try {
    const document = await Document.getById(documentId);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }
    return { success: true, document };
  } catch (error) {
    console.error('Error in getDocumentById:', error);
    return { success: false, error: error.message };
  }
}

// Get documents by proposal ID
async function getDocumentsByProposalId(proposalId) {
  try {
    const documents = await Document.getByProposalId(proposalId);
    return { success: true, documents };
  } catch (error) {
    console.error('Error in getDocumentsByProposalId:', error);
    return { success: false, error: error.message };
  }
}

// Generate and save proposal document
async function generateProposalDocument(documentData) {
  try {
    console.log('Starting generateProposalDocument with data:', JSON.stringify({
      proposal_id: documentData.proposal_id,
      proposal_reference: documentData.proposal_reference,
      services_count: documentData.services ? documentData.services.length : 0
    }));
    
    // Create documents directory if it doesn't exist
    const userDataPath = app.getPath('userData');
    const documentsDir = path.join(userDataPath, 'documents');
    
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
      console.log(`Created documents directory: ${documentsDir}`);
    }
    
    // Generate a unique filename
    const fileName = `proposal_${documentData.proposal_reference.replace(/\s+/g, '_')}_${uuidv4()}.pdf`;
    const filePath = path.join(documentsDir, fileName);
    console.log(`Generated file path: ${filePath}`);
    
    // Create a PDF document using PDFKit
    console.log('Creating PDFDocument instance');
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    
    // Pipe the PDF to the file
    doc.pipe(writeStream);
    console.log('Piped PDFDocument to writeStream');
    
    // Add company information
    if (documentData.company) {
      console.log('Adding company information');
      doc.fontSize(18).font('Helvetica-Bold').text(documentData.company.company_name, { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(documentData.company.address || '', { align: 'center' });
      doc.text(`Phone: ${documentData.company.phone || ''}`, { align: 'center' });
      doc.text(`Email: ${documentData.company.email || ''}`, { align: 'center' });
      doc.text(`Website: ${documentData.company.website || ''}`, { align: 'center' });
      doc.moveDown(2);
    }
    
    // Add proposal header
    console.log('Adding proposal header');
    doc.fontSize(16).font('Helvetica-Bold').text('PROPOSAL', { align: 'center' });
    doc.moveDown();
    
    // Add proposal reference and date
    doc.fontSize(12).font('Helvetica-Bold').text(`Reference: ${documentData.proposal_reference}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    // Add client information
    if (documentData.client) {
      console.log('Adding client information');
      doc.fontSize(14).font('Helvetica-Bold').text('Client Information');
      doc.fontSize(12).font('Helvetica').text(`Client: ${documentData.client.client_name}`);
      doc.text(`Company: ${documentData.client.company || ''}`);
      doc.text(`Address: ${documentData.client.address || ''}`);
      doc.text(`Email: ${documentData.client.email_address || ''}`);
      doc.moveDown();
    }
    
    // Add proposal details
    console.log('Adding proposal details');
    doc.fontSize(14).font('Helvetica-Bold').text('Proposal Details');
    doc.fontSize(12).font('Helvetica').text(`Project Name: ${documentData.proposal_name || ''}`);
    doc.moveDown();
    
    // Add services table
    if (documentData.services && documentData.services.length > 0) {
      console.log(`Adding services table with ${documentData.services.length} services`);
      doc.fontSize(14).font('Helvetica-Bold').text('Services');
      doc.moveDown(0.5);
      
      // Table headers
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [250, 80, 80, 80];
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Description', tableLeft, tableTop);
      doc.text('Quantity', tableLeft + colWidths[0], tableTop, { width: colWidths[1], align: 'right' });
      doc.text('Unit Price', tableLeft + colWidths[0] + colWidths[1], tableTop, { width: colWidths[2], align: 'right' });
      doc.text('Total', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, { width: colWidths[3], align: 'right' });
      
      doc.moveTo(tableLeft, tableTop + 20)
         .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop + 20)
         .stroke();
      
      // Table rows
      let y = tableTop + 30;
      doc.fontSize(12).font('Helvetica');
      
      documentData.services.forEach((service, index) => {
        console.log(`Processing service ${index + 1}: ${service.description}`);
        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
          console.log('Added new page for services');
        }
        
        const quantity = service.quantity || 0;
        const unitPrice = service.unit_price || 0;
        const total = quantity * unitPrice;
        
        doc.text(service.description || '', tableLeft, y, { width: colWidths[0] });
        doc.text(quantity.toString(), tableLeft + colWidths[0], y, { width: colWidths[1], align: 'right' });
        doc.text(`$${unitPrice.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'right' });
        doc.text(`$${total.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'right' });
        
        // Calculate height used by this row and move down
        const textHeight = Math.max(
          doc.heightOfString(service.description || '', { width: colWidths[0] }),
          doc.heightOfString(quantity.toString(), { width: colWidths[1] }),
          doc.heightOfString(`$${unitPrice.toFixed(2)}`, { width: colWidths[2] }),
          doc.heightOfString(`$${total.toFixed(2)}`, { width: colWidths[3] })
        );
        
        y += textHeight + 10;
      });
      
      // Add totals
      console.log('Adding totals to document');
      doc.moveTo(tableLeft, y)
         .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y)
         .stroke();
      
      y += 10;
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Subtotal:', tableLeft + colWidths[0], y, { width: colWidths[1] + colWidths[2], align: 'right' });
      doc.text(`$${documentData.subtotal ? documentData.subtotal.toFixed(2) : '0.00'}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'right' });
      
      y += 20;
      
      if (documentData.discount) {
        doc.text('Discount:', tableLeft + colWidths[0], y, { width: colWidths[1] + colWidths[2], align: 'right' });
        doc.text(`$${documentData.discount.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'right' });
        y += 20;
      }
      
      doc.text('Total:', tableLeft + colWidths[0], y, { width: colWidths[1] + colWidths[2], align: 'right' });
      doc.text(`$${documentData.total ? documentData.total.toFixed(2) : '0.00'}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'right' });
      
      doc.moveDown(2);
    } else {
      console.log('No services to add to document');
    }
    
    // Finalize the PDF
    console.log('Finalizing PDF document');
    doc.end();
    
    // Wait for the writeStream to finish
    console.log('Waiting for writeStream to finish');
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('WriteStream finished successfully');
        resolve();
      });
      writeStream.on('error', (err) => {
        console.error('WriteStream error:', err);
        reject(err);
      });
    });
    
    // Read the file content to store in the database
    console.log('Reading file content from disk');
    const fileContent = fs.readFileSync(filePath);
    console.log(`File size: ${fileContent.length} bytes`);
    
    // Save document record in database with file content
    console.log('Saving document record to database');
    const document = await Document.create({
      proposal_id: documentData.proposal_id,
      document_type: 'PROPOSAL',
      document_path: filePath,
      file_name: fileName,
      file_size: fileContent.length,
      mime_type: 'application/pdf',
      file_content: fileContent, // Store the file content in the database
      created_by: documentData.created_by
    });
    
    console.log(`Document created with ID: ${document.document_id}`);
    return { 
      success: true, 
      document_id: document.document_id,
      document_path: filePath
    };
  } catch (error) {
    console.error('Error in generateProposalDocument:', error);
    return { success: false, error: error.message };
  }
}

// Get document content
async function getDocumentContent(documentId) {
  try {
    // First try to get content from the database
    const content = await Document.getDocumentContent(documentId);
    
    if (content) {
      return { success: true, content };
    }
    
    // If not in database, try to get from file
    const document = await Document.getById(documentId);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }
    
    if (fs.existsSync(document.document_path)) {
      const fileContent = fs.readFileSync(document.document_path);
      return { success: true, content: fileContent };
    }
    
    return { success: false, error: 'Document content not found' };
  } catch (error) {
    console.error('Error in getDocumentContent:', error);
    return { success: false, error: error.message };
  }
}

// Delete document
async function deleteDocument(documentId) {
  try {
    // Get document to find the file path
    const document = await Document.getById(documentId);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }
    
    // Delete the file if it exists
    if (fs.existsSync(document.document_path)) {
      fs.unlinkSync(document.document_path);
    }
    
    // Delete the database record
    const result = await Document.delete(documentId);
    if (!result) {
      return { success: false, error: 'Failed to delete document record' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  getDocumentsByProposalId,
  generateProposalDocument,
  getDocumentContent,
  deleteDocument
}; 