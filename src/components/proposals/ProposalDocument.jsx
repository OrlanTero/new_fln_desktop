import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const ProposalDocument = ({ proposal, onGenerate, onCancel, onSaveAndExit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proposalServices, setProposalServices] = useState([]);
  const [client, setClient] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const documentRef = useRef(null);

  useEffect(() => {
    if (proposal) {
      fetchProposalData();
    }
  }, [proposal]);

  const fetchProposalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch proposal services
      const servicesResult = await window.api.getProposalServices(proposal.proposal_id);
      if (servicesResult.success) {
        setProposalServices(servicesResult.services);
        
        // Calculate financial totals
        let subTotal = 0;
        let discountAmount = 0;
        
        servicesResult.services.forEach(service => {
          // Use unit_price if available, otherwise fall back to price
          const unitPrice = service.unit_price || service.price || 0;
          const lineTotal = service.quantity * unitPrice;
          subTotal += lineTotal;
          
          if (service.discount_percentage) {
            discountAmount += (lineTotal * service.discount_percentage / 100);
          }
        });
        
        setSubtotal(subTotal);
        setDiscount(discountAmount);
        setTotal(subTotal - discountAmount);
      } else {
        throw new Error(servicesResult.error || 'Failed to fetch proposal services');
      }

      // Fetch client information
      const clientResult = await window.api.getClientById(proposal.client_id);
      if (clientResult.success) {
        setClient(clientResult.client);
      } else {
        throw new Error(clientResult.error || 'Failed to fetch client information');
      }

      // Fetch company information
      const companyResult = await window.api.getCompanyInfo();
      if (companyResult.success) {
        setCompanyInfo(companyResult.company);
      } else {
        throw new Error(companyResult.error || 'Failed to fetch company information');
      }
    } catch (err) {
      console.error('Error fetching proposal data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      console.log('Generate Document button clicked');
      setLoading(true);
      setError(null);

      // Prepare document data
      const documentData = {
        proposal_id: proposal.proposal_id,
        proposal_reference: proposal.proposal_reference || `PROP-${Date.now()}`,
        proposal_name: proposal.proposal_name || proposal.proposal_title,
        client: client,
        company: companyInfo,
        services: proposalServices,
        subtotal: subtotal,
        discount: discount,
        total: total,
        created_at: new Date().toISOString(),
        created_by: proposal.created_by
      };

      console.log('Calling generateProposalDocument with data:', documentData);
      // Call the API to generate and save the document
      const result = await window.api.generateProposalDocument(documentData);
      console.log('Document generation result:', result);
      
      if (result.success) {
        // Call the onGenerate callback with the document data
        console.log('Calling onGenerate callback with data');
        onGenerate({
          ...documentData,
          document_path: result.document_path,
          document_id: result.document_id
        });
      } else {
        throw new Error(result.error || 'Failed to generate document');
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    console.log('Print Preview button clicked');
    const printContent = documentRef.current;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
  };

  // Add a new handler for the Save and Exit button
  const handleSaveAndExit = () => {
    console.log('Save and Exit button clicked');
    if (onSaveAndExit && proposal) {
      onSaveAndExit(proposal);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preview Document
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review the proposal document before generating the final version.
        </Typography>
      </Box>

      {/* Document Preview */}
      <Paper 
        ref={documentRef}
        sx={{ 
          p: 4, 
          mb: 3, 
          maxHeight: '60vh', 
          overflow: 'auto',
          border: '1px solid #ddd'
        }}
      >
        {/* Company Header */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            {companyInfo?.logo_url && (
              <Box sx={{ maxWidth: 200, mb: 2 }}>
                <img 
                  src={companyInfo.logo_url} 
                  alt="Company Logo" 
                  style={{ width: '100%' }} 
                />
              </Box>
            )}
            <Typography variant="h6">{companyInfo?.company_name || 'Company Name'}</Typography>
            <Typography variant="body2">{companyInfo?.address || 'Company Address'}</Typography>
            <Typography variant="body2">{companyInfo?.phone || 'Phone Number'}</Typography>
            <Typography variant="body2">{companyInfo?.email || 'Email Address'}</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 2 }}>PROPOSAL</Typography>
            <Typography variant="body1">
              <strong>Reference:</strong> {proposal?.proposal_reference || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Valid Until:</strong> {proposal?.valid_until ? new Date(proposal.valid_until).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Client Information */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Client Information</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1"><strong>Client:</strong> {client?.client_name || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Company:</strong> {client?.company || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Address:</strong> {client?.address || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1"><strong>Email:</strong> {client?.email_address || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Phone:</strong> {client?.phone || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Proposal Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Proposal Details</Typography>
          <Typography variant="h5" gutterBottom>{proposal?.proposal_name || 'Proposal Title'}</Typography>
          <Typography variant="body1" paragraph>
            {proposal?.description || 'No description provided.'}
          </Typography>
        </Box>

        {/* Services Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Services</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell align="right"><strong>Quantity</strong></TableCell>
                  <TableCell align="right"><strong>Unit Price</strong></TableCell>
                  <TableCell align="right"><strong>Discount</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposalServices.map((service) => {
                  // Use unit_price if available, otherwise fall back to price
                  const unitPrice = service.unit_price || service.price || 0;
                  const lineTotal = service.quantity * unitPrice;
                  const discountAmount = service.discount_percentage ? (lineTotal * service.discount_percentage / 100) : 0;
                  const finalTotal = lineTotal - discountAmount;
                  
                  return (
                    <TableRow key={service.proposal_service_id}>
                      <TableCell>{service.service_name}</TableCell>
                      <TableCell>{service.description || 'N/A'}</TableCell>
                      <TableCell align="right">{service.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(unitPrice)}</TableCell>
                      <TableCell align="right">
                        {service.discount_percentage ? `${service.discount_percentage}%` : '-'}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(finalTotal)}</TableCell>
                    </TableRow>
                  );
                })}
                
                {/* Summary Rows */}
                <TableRow>
                  <TableCell colSpan={4} />
                  <TableCell align="right"><strong>Subtotal:</strong></TableCell>
                  <TableCell align="right">{formatCurrency(subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} />
                  <TableCell align="right"><strong>Discount:</strong></TableCell>
                  <TableCell align="right">{formatCurrency(discount)}</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell colSpan={4} />
                  <TableCell align="right"><strong>Total:</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(total)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Terms and Conditions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Terms and Conditions</Typography>
          <Typography variant="body2" paragraph>
            {proposal?.terms_and_conditions || 'Standard terms and conditions apply.'}
          </Typography>
        </Box>

        {/* Signature Section */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={6}>
            <Divider />
            <Typography variant="body2" sx={{ mt: 1 }}>Client Signature</Typography>
          </Grid>
          <Grid item xs={6}>
            <Divider />
            <Typography variant="body2" sx={{ mt: 1 }}>Company Representative</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
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
            onClick={onCancel} 
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button onClick={handlePrint} sx={{ mr: 1 }}>
            Print Preview
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerateDocument}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Document'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProposalDocument; 