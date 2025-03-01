import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import ProposalForm from './ProposalForm';
import ProposalDocument from './ProposalDocument';
import ProposalEmailForm from './ProposalEmailForm';
import ProposalPdfViewer from './ProposalPdfViewer';
import { AuthContext } from '../../context/AuthContext';

const steps = ['Proposal Details', 'Generate Document', 'Preview PDF', 'Send Email'];

const ProposalWizard = ({ 
  proposal, 
  clients, 
  services, 
  onSave, 
  onCancel,
  onSend
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [proposalData, setProposalData] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Initialize proposal data if editing an existing proposal
  useEffect(() => {
    if (proposal) {
      setProposalData(proposal);
    }
  }, [proposal]);

  const handleNext = () => {
    console.log('Moving to next step');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    console.log('Moving to previous step');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    console.log('Resetting wizard');
    setActiveStep(0);
    setProposalData(null);
    setDocumentData(null);
    setEmailData(null);
  };

  const handleProposalFormSubmit = async (formData) => {
    try {
      console.log('Proposal form submitted with data:', formData);
      setLoading(true);
      setError(null);

      // If this is a new proposal or we're editing an existing one
      const result = await onSave(formData);
      console.log('Proposal save result:', result);
      
      if (result && result.success) {
        setProposalData(result.proposal);
        handleNext();
      } else {
        throw new Error(result?.error || 'Failed to save proposal');
      }
    } catch (err) {
      console.error('Error saving proposal:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentGenerated = (docData) => {
    console.log('Document generated with data:', docData);
    setDocumentData(docData);
    handleNext();
  };

  const handleEmailSubmit = async (emailFormData) => {
    try {
      console.log('Email form submitted with data:', emailFormData);
      setLoading(true);
      setError(null);

      // Combine all data for sending
      const sendData = {
        proposal: proposalData,
        document: documentData,
        email: emailFormData
      };

      // Call the onSend function passed from parent
      const result = await onSend(sendData);
      console.log('Email send result:', result);
      
      if (result && result.success) {
        setEmailData(emailFormData);
        handleNext();
      } else {
        throw new Error(result?.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async (data) => {
    try {
      console.log('Save and Exit called with data:', data);
      setLoading(true);
      setError(null);

      // If we already have proposal data, use that as the base and update with any new data
      const proposalToSave = {
        ...(proposalData || {}),
        ...(data || {})
      };
      console.log('Saving proposal with data:', proposalToSave);

      // Call the onSave function passed from parent
      const result = await onSave(proposalToSave);
      console.log('Save and Exit result:', result);
      
      if (result && result.success) {
        // Close the wizard by calling onCancel
        onCancel();
      } else {
        throw new Error(result?.error || 'Failed to save proposal');
      }
    } catch (err) {
      console.error('Error saving proposal:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ProposalForm
            proposal={proposalData}
            clients={clients}
            services={services}
            onSave={handleProposalFormSubmit}
            onCancel={onCancel}
          />
        );
      case 1:
        return (
          <ProposalDocument
            proposal={proposalData}
            onGenerate={handleDocumentGenerated}
            onCancel={handleBack}
            onSaveAndExit={handleSaveAndExit}
          />
        );
      case 2:
        return (
          <Box>
            <ProposalPdfViewer documentId={documentData?.document_id} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined"
                color="secondary"
                onClick={() => handleSaveAndExit(proposalData)}
                disabled={loading}
              >
                Save and Exit
              </Button>
              <Box>
                <Button 
                  onClick={handleBack} 
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleNext}
                  disabled={loading}
                >
                  Continue to Email
                </Button>
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <ProposalEmailForm
            proposal={proposalData}
            document={documentData}
            onSubmit={handleEmailSubmit}
            onCancel={() => handleBack()}
            onSaveAndExit={handleSaveAndExit}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === steps.length ? (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Proposal process completed!
          </Typography>
          <Typography variant="subtitle1">
            Your proposal has been created and sent successfully.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={onCancel} sx={{ mr: 1 }}>
              Close
            </Button>
            <Button onClick={handleReset} variant="contained">
              Create Another Proposal
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            getStepContent(activeStep)
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ProposalWizard; 