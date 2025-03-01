import {
  import React, { useState, useEffect } from 'react';
  Button,
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Container
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon
} from '@mui/icons-material';
import 'react-quill/dist/quill.snow.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import QuillWrapper from '../common/QuillWrapper';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  to: Yup.string().email('Invalid email address').required('Recipient email is required'),
  cc: Yup.array().of(Yup.string().email('Invalid email address')),
  message: Yup.string().required('Message is required')
});

const ProposalEmailForm = ({ proposal, document, onSubmit, onCancel, onSaveAndExit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [newCcEmail, setNewCcEmail] = useState('');

  useEffect(() => {
    if (proposal) {
      fetchClientData();
      
      // Add the generated document as an attachment if available
      if (document && document.document_path) {
        setAttachments([
          {
            id: document.document_id,
            name: `${proposal.proposal_reference} - Proposal.pdf`,
            path: document.document_path,
            size: '0 KB', // This would be populated with actual size
            type: 'application/pdf'
          }
        ]);
      }
    }
  }, [proposal, document]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client information
      const clientResult = await window.api.getClientById(proposal.client_id);
      if (clientResult.success) {
        setClient(clientResult.client);
        
        // Initialize form with client email
        if (clientResult.client.email_address) {
          formik.setFieldValue('to', clientResult.client.email_address);
        }
      } else {
        throw new Error(clientResult.error || 'Failed to fetch client information');
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCcEmail = () => {
    if (newCcEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCcEmail)) {
      if (!ccEmails.includes(newCcEmail)) {
        const updatedCcEmails = [...ccEmails, newCcEmail];
        setCcEmails(updatedCcEmails);
        formik.setFieldValue('cc', updatedCcEmails);
        setNewCcEmail('');
      }
    }
  };

  const handleRemoveCcEmail = (email) => {
    const updatedCcEmails = ccEmails.filter(e => e !== email);
    setCcEmails(updatedCcEmails);
    formik.setFieldValue('cc', updatedCcEmails);
  };

  const handleFileUpload = async (event) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setLoading(true);
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Call API to upload file
        const result = await window.api.uploadAttachment(file.path);
        
        if (result.success) {
          setAttachments(prev => [
            ...prev,
            {
              id: result.attachment_id,
              name: file.name,
              path: result.file_path,
              size: `${Math.round(file.size / 1024)} KB`,
              type: file.type
            }
          ]);
        } else {
          throw new Error(result.error || `Failed to upload ${file.name}`);
        }
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      setLoading(true);
      
      // Only call API if it's not the proposal document
      if (attachmentId !== document?.document_id) {
        const result = await window.api.deleteAttachment(attachmentId);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete attachment');
        }
      }
      
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Error removing attachment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      subject: `Proposal: ${proposal?.proposal_name || ''}`,
      to: '',
      cc: [],
      message: `<p>Dear ${client?.client_name || 'Client'},</p>
<p>We are pleased to submit our proposal for your review. Please find the attached document with details of our services and pricing.</p>
<p>If you have any questions or would like to discuss any aspect of this proposal, please don't hesitate to contact us.</p>
<p>We look forward to the opportunity to work with you.</p>
<p>Best regards,</p>
<p>[Your Name]<br>[Your Position]</p>`
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        // Prepare email data
        const emailData = {
          ...values,
          proposal_id: proposal.proposal_id,
          attachments: attachments.map(a => a.id)
        };

        // Call the onSubmit callback with the email data
        await onSubmit(emailData);
      } catch (err) {
        console.error('Error sending email:', err);
        setError(err.message);
        setLoading(false);
      }
    }
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  // Add a new handler for the Save and Exit button
  const handleSaveAndExit = () => {
    if (onSaveAndExit && proposal) {
      onSaveAndExit(proposal);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Send Proposal Email
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Compose an email to send the proposal to your client.
              </Typography>
            </Grid>
            
            {/* Email Form */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="subject"
                name="subject"
                label="Subject"
                value={formik.values.subject}
                onChange={formik.handleChange}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                id="to"
                name="to"
                label="To"
                value={formik.values.to}
                onChange={formik.handleChange}
                error={formik.touched.to && Boolean(formik.errors.to)}
                helperText={formik.touched.to && formik.errors.to}
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={10}>
                  <TextField
                    fullWidth
                    id="newCcEmail"
                    label="CC"
                    value={newCcEmail}
                    onChange={(e) => setNewCcEmail(e.target.value)}
                    placeholder="Add CC email address"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleAddCcEmail}
                    startIcon={<AddIcon />}
                    sx={{ height: '100%' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
              
              {ccEmails.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ccEmails.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => handleRemoveCcEmail(email)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        {/* Message Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Message
          </Typography>
          
          <Box sx={{ 
            '.ql-container': { 
              minHeight: '200px',
              maxHeight: '300px',
              overflow: 'auto'
            },
            '.ql-editor': {
              minHeight: '200px'
            },
            '.quill-wrapper': {
              border: '1px solid #e0e0e0',
              borderRadius: '4px'
            },
            mb: 4
          }}>
            <QuillWrapper
              key="email-editor"
              value={formik.values.message}
              onChange={(content) => formik.setFieldValue('message', content)}
              modules={modules}
            />
          </Box>
          
          {formik.touched.message && formik.errors.message && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {formik.errors.message}
            </Typography>
          )}
        </Paper>
        
        {/* Attachments Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Attachments
          </Typography>
          
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{ mr: 2 }}
              >
                Add Attachment
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                Max file size: 10MB
              </Typography>
            </Box>
            
            {attachments.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {attachments.map((file, index) => (
                  <React.Fragment key={file.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={file.name}
                        secondary={`${file.size} • ${file.type}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleRemoveAttachment(file.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No attachments added
              </Typography>
            )}
          </Box>
        </Paper>
        
        {/* Form Actions */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSaveAndExit}
            disabled={loading}
          >
            Save and Exit
          </Button>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Email'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ProposalEmailForm; 