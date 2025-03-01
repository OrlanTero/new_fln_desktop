const Email = require('../models/Email');
const Attachment = require('../models/Attachment');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Get all emails
async function getAllEmails() {
  try {
    const emails = await Email.getAll();
    return { success: true, emails };
  } catch (error) {
    console.error('Error in getAllEmails:', error);
    return { success: false, error: error.message };
  }
}

// Get email by ID
async function getEmailById(emailId) {
  try {
    const email = await Email.getById(emailId);
    if (!email) {
      return { success: false, error: 'Email not found' };
    }
    return { success: true, email };
  } catch (error) {
    console.error('Error in getEmailById:', error);
    return { success: false, error: error.message };
  }
}

// Get emails by proposal ID
async function getEmailsByProposalId(proposalId) {
  try {
    const emails = await Email.getByProposalId(proposalId);
    return { success: true, emails };
  } catch (error) {
    console.error('Error in getEmailsByProposalId:', error);
    return { success: false, error: error.message };
  }
}

// Send proposal email
async function sendProposalEmail(emailData) {
  let emailRecord = null; // Declare emailRecord at the top of the function
  
  try {
    console.log('Starting sendProposalEmail with data:', JSON.stringify({
      proposal_id: emailData.proposal.proposal_id,
      subject: emailData.email.subject,
      to: emailData.email.to,
      cc: emailData.email.cc,
      attachments: emailData.email.attachments ? emailData.email.attachments.length : 0
    }));
    
    // Create email record in database
    emailRecord = await Email.create({
      proposal_id: emailData.proposal.proposal_id,
      subject: emailData.email.subject,
      sender: 'jhonorlantero@gmail.com', // Use a fixed sender email
      recipient: emailData.email.to,
      cc: emailData.email.cc,
      message: emailData.email.message,
      status: 'DRAFT' // Set as DRAFT initially
    });
    
    console.log('Email record created with ID:', emailRecord.email_id);
    
    // Process attachments if any
    const attachmentObjects = [];
    if (emailData.email.attachments && emailData.email.attachments.length > 0) {
      console.log(`Processing ${emailData.email.attachments.length} attachments`);
      
      for (const attachmentId of emailData.email.attachments) {
        // Get attachment details
        console.log(`Looking for attachment with ID: ${attachmentId}`);
        
        // If this is the document from the proposal, use it directly
        if (emailData.document && emailData.document.document_id === attachmentId) {
          console.log(`Using document from proposal: ${emailData.document.document_path}`);
          
          // Link attachment to this email
          const newAttachment = await Attachment.create({
            email_id: emailRecord.email_id,
            document_id: emailData.document.document_id,
            file_path: emailData.document.document_path,
            file_name: `${emailData.proposal.proposal_reference} - Proposal.pdf`,
            file_size: 0, // We don't have the size, but it's not critical
            mime_type: 'application/pdf'
          });
          
          console.log(`Linked document to email: ${newAttachment.attachment_id}`);
          
          // Add to attachments array for email
          attachmentObjects.push({
            filename: `${emailData.proposal.proposal_reference} - Proposal.pdf`,
            path: emailData.document.document_path
          });
          
          continue; // Skip to the next attachment
        }
        
        // Otherwise, try to get the attachment from the database
        const attachment = await Attachment.getById(attachmentId);
        
        if (attachment) {
          console.log(`Found attachment: ${attachment.file_name}`);
          
          // Link attachment to this email
          const newAttachment = await Attachment.create({
            email_id: emailRecord.email_id,
            document_id: attachment.document_id,
            file_path: attachment.file_path,
            file_name: attachment.file_name,
            file_size: attachment.file_size,
            mime_type: attachment.mime_type
          });
          
          console.log(`Linked attachment to email: ${newAttachment.attachment_id}`);
          
          // Add to attachments array for email
          attachmentObjects.push({
            filename: attachment.file_name,
            path: attachment.file_path
          });
        } else {
          console.log(`Attachment with ID ${attachmentId} not found in database`);
        }
      }
    }
    
    // Configure nodemailer with Gmail SMTP settings
    console.log('Configuring nodemailer with Gmail SMTP settings');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: 'jhonorlantero@gmail.com', // Fixed Gmail account
        pass: 'cggglvxjzrpgamzg' // App password without spaces
      },
      debug: true, // Enable debug output
      logger: true // Log information about the mail
    });
    
    // Verify SMTP connection configuration
    console.log('Verifying SMTP connection');
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    // Prepare email options
    const mailOptions = {
      from: '"FLN System" <jhonorlantero@gmail.com>', // Format the sender with a name
      to: emailData.email.to,
      cc: emailData.email.cc,
      subject: emailData.email.subject,
      html: emailData.email.message,
      attachments: attachmentObjects
    };
    
    console.log('Attempting to send email with the following configuration:');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Attachments:', mailOptions.attachments.length);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log('Full response:', JSON.stringify(info));
    
    // Update email status to SENT
    await Email.updateStatus(emailRecord.email_id, 'SENT');
    console.log('Email status updated to SENT');
    
    return { 
      success: true, 
      email_id: emailRecord.email_id,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error in sendProposalEmail:', error);
    console.error('Error details:', error.stack);
    
    // Update email status to FAILED if it was created
    if (emailRecord && emailRecord.email_id) {
      await Email.updateStatus(emailRecord.email_id, 'FAILED');
      console.log('Email status updated to FAILED');
    }
    
    return { success: false, error: error.message };
  }
}

// Delete email
async function deleteEmail(emailId) {
  try {
    // Delete the database record
    const result = await Email.delete(emailId);
    if (!result) {
      return { success: false, error: 'Failed to delete email record' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteEmail:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAllEmails,
  getEmailById,
  getEmailsByProposalId,
  sendProposalEmail,
  deleteEmail
}; 