import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

// Validation schema for the proposal form
const validationSchema = Yup.object({
  proposal_title: Yup.string().required('Title is required'),
  client_id: Yup.number().required('Client is required'),
  description: Yup.string().required('Description is required'),
  valid_until: Yup.date().required('Valid until date is required'),
  expected_completion_date: Yup.date().required('Expected completion date is required'),
  terms_and_conditions: Yup.string().required('Terms and conditions are required'),
});

// Service form validation schema
const serviceValidationSchema = Yup.object({
  service_category_id: Yup.number().required('Service category is required'),
  service_id: Yup.number().required('Service is required'),
  quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
  unit_price: Yup.number().min(0, 'Price cannot be negative').required('Unit price is required'),
  discount_percentage: Yup.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').required('Discount percentage is required'),
});

const ProposalForm = ({ proposal, clients, services, onSave, onCancel }) => {
  const [proposalServices, setProposalServices] = useState([]);
  const [openServiceForm, setOpenServiceForm] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  
  const { user } = useContext(AuthContext);
  
  // Initialize form with proposal data or default values
  const formik = useFormik({
    initialValues: {
      proposal_title: proposal?.proposal_title || '',
      client_id: proposal?.client_id || '',
      description: proposal?.description || '',
      valid_until: proposal?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      expected_completion_date: proposal?.expected_completion_date || '',
      terms_and_conditions: proposal?.terms_and_conditions || 'Standard terms and conditions apply.',
      status: proposal?.status || 'Draft',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        console.log(user);
        
        // Prepare the proposal data
        const proposalData = {
          ...values,
          proposal_name: values.proposal_title,
          project_name: values.proposal_title,
          created_by: user?.user_id || null,
          // Include the services in the proposal data
          services: proposalServices
        };
        
        // Call the onSave function passed from parent
        await onSave(proposalData);
        
        // If this is a new proposal, we need to save the services separately
        // This will be handled in the parent component after the proposal is saved
        
        setLoading(false);
      } catch (err) {
        console.error('Error submitting proposal:', err);
        setError(err.message);
        setLoading(false);
      }
    },
  });
  
  // Service form
  const serviceFormik = useFormik({
    initialValues: {
      service_category_id: currentService?.service_category_id || '',
      service_id: currentService?.service_id || '',
      quantity: currentService?.quantity || 1,
      unit_price: currentService?.unit_price || 0,
      discount_percentage: currentService?.discount_percentage || 0,
      notes: currentService?.notes || '',
    },
    validationSchema: serviceValidationSchema,
    onSubmit: async (values) => {
      try {
        // Find the selected service to get its details
        const selectedService = services.find(s => s.service_id === values.service_id);
        
        if (!selectedService) {
          throw new Error('Selected service not found');
        }
        
        // Calculate the total for this service
        const quantity = parseFloat(values.quantity);
        const unitPrice = parseFloat(values.unit_price);
        const discountPercentage = parseFloat(values.discount_percentage);
        
        const subtotal = quantity * unitPrice;
        const discount = subtotal * (discountPercentage / 100);
        const total = subtotal - discount;
        
        // Create the service entry
        const serviceEntry = {
          ...values,
          service_name: selectedService.service_name,
          subtotal,
          discount,
          total,
          // If editing, keep the existing ID
          proposal_service_id: currentService?.proposal_service_id,
        };
        
        if (currentService) {
          // Update existing service
          setProposalServices(proposalServices.map(s => 
            s.proposal_service_id === currentService.proposal_service_id ? serviceEntry : s
          ));
        } else {
          // Add new service
          // Generate a temporary ID for new services
          serviceEntry.proposal_service_id = `temp_${Date.now()}`;
          setProposalServices([...proposalServices, serviceEntry]);
        }
        
        // Close the form and reset
        setOpenServiceForm(false);
        setCurrentService(null);
        serviceFormik.resetForm();
        
        // Recalculate total
        calculateTotal([...proposalServices, serviceEntry]);
      } catch (err) {
        console.error('Error adding service:', err);
        setError(err.message);
      }
    },
  });
  
  // Load proposal services if editing an existing proposal
  useEffect(() => {
    const fetchProposalServices = async () => {
      if (proposal?.proposal_id) {
        try {
          setLoading(true);
          const result = await window.api.getProposalServices(proposal.proposal_id);
          
          if (result.success) {
            setProposalServices(result.services);
            calculateTotal(result.services);
          } else {
            throw new Error(result.error || 'Failed to fetch proposal services');
          }
        } catch (err) {
          console.error('Error fetching proposal services:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // New proposal, start with empty services
        setProposalServices([]);
        setTotalAmount(0);
      }
    };
    
    fetchProposalServices();
  }, [proposal]);
  
  // Extract service categories from services
  useEffect(() => {
    if (services && services.length > 0) {
      const categories = [];
      const categoryMap = {};
      
      services.forEach(service => {
        if (service.service_category_id && !categoryMap[service.service_category_id]) {
          categoryMap[service.service_category_id] = true;
          categories.push({
            service_category_id: service.service_category_id,
            service_category_name: service.service_category_name
          });
        }
      });
      
      setServiceCategories(categories);
    }
  }, [services]);
  
  // Update service form when editing a service
  useEffect(() => {
    if (currentService) {
      serviceFormik.setValues({
        service_category_id: currentService.service_category_id || '',
        service_id: currentService.service_id,
        quantity: currentService.quantity,
        unit_price: currentService.unit_price,
        discount_percentage: currentService.discount_percentage,
        notes: currentService.notes || '',
      });
      
      // Filter services based on the selected category
      if (currentService.service_category_id) {
        const filtered = services.filter(s => s.service_category_id === currentService.service_category_id);
        setFilteredServices(filtered);
      }
    }
  }, [currentService]);
  
  // Calculate total amount from all services
  const calculateTotal = (services) => {
    const total = services.reduce((sum, service) => sum + service.total, 0);
    setTotalAmount(total);
  };
  
  // Handle adding a new service
  const handleAddService = () => {
    setCurrentService(null);
    serviceFormik.resetForm();
    setFilteredServices([]);
    setOpenServiceForm(true);
  };
  
  // Handle editing an existing service
  const handleEditService = (service) => {
    setCurrentService(service);
    setOpenServiceForm(true);
  };
  
  // Handle removing a service
  const handleRemoveService = (serviceId) => {
    const updatedServices = proposalServices.filter(s => s.proposal_service_id !== serviceId);
    setProposalServices(updatedServices);
    calculateTotal(updatedServices);
  };
  
  // Handle service category selection
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    serviceFormik.setFieldValue('service_category_id', categoryId);
    serviceFormik.setFieldValue('service_id', ''); // Reset service selection
    
    // Filter services based on the selected category
    if (categoryId) {
      const filtered = services.filter(s => s.service_category_id === categoryId);
      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  };
  
  // Handle service selection in the form
  const handleServiceChange = (event) => {
    const serviceId = event.target.value;
    const selectedService = services.find(s => s.service_id === serviceId);
    
    if (selectedService) {
      serviceFormik.setFieldValue('service_id', serviceId);
      serviceFormik.setFieldValue('unit_price', selectedService.price || 0);
    }
  };
  
  // Add a new handler for the Save as Draft button
  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current form values without validation
      const draftData = {
        ...formik.values,
        status: 'Draft'
      };
      
      // Add any existing proposal services if available
      if (proposalServices.length > 0) {
        draftData.services = proposalServices;
      }
      
      // Call the onSave function with the draft data
      await onSave(draftData);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {/* Proposal Details */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Proposal Details
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            id="proposal_title"
            name="proposal_title"
            label="Proposal Title"
            value={formik.values.proposal_title}
            onChange={formik.handleChange}
            error={formik.touched.proposal_title && Boolean(formik.errors.proposal_title)}
            helperText={formik.touched.proposal_title && formik.errors.proposal_title}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="client-label">Client</InputLabel>
            <Select
              labelId="client-label"
              id="client_id"
              name="client_id"
              value={formik.values.client_id}
              onChange={formik.handleChange}
              error={formik.touched.client_id && Boolean(formik.errors.client_id)}
              label="Client"
            >
              <MenuItem value="">
                <em>Select a client</em>
              </MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.client_id} value={client.client_id}>
                  {client.client_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="valid_until"
            name="valid_until"
            label="Valid Until"
            type="date"
            value={formik.values.valid_until}
            onChange={formik.handleChange}
            error={formik.touched.valid_until && Boolean(formik.errors.valid_until)}
            helperText={formik.touched.valid_until && formik.errors.valid_until}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="expected_completion_date"
            name="expected_completion_date"
            label="Expected Completion Date"
            type="date"
            value={formik.values.expected_completion_date}
            onChange={formik.handleChange}
            error={formik.touched.expected_completion_date && Boolean(formik.errors.expected_completion_date)}
            helperText={formik.touched.expected_completion_date && formik.errors.expected_completion_date}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="terms_and_conditions"
            name="terms_and_conditions"
            label="Terms and Conditions"
            multiline
            rows={4}
            value={formik.values.terms_and_conditions}
            onChange={formik.handleChange}
            error={formik.touched.terms_and_conditions && Boolean(formik.errors.terms_and_conditions)}
            helperText={formik.touched.terms_and_conditions && formik.errors.terms_and_conditions}
          />
        </Grid>
        
        {/* Services Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Services
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddService}
            >
              Add Service
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Discount %</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposalServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No services added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    proposalServices.map((service) => (
                      <TableRow key={service.proposal_service_id}>
                        <TableCell>{service.service_name}</TableCell>
                        <TableCell align="right">{service.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(service.unit_price)}</TableCell>
                        <TableCell align="right">{service.discount_percentage}%</TableCell>
                        <TableCell align="right">{formatCurrency(service.subtotal)}</TableCell>
                        <TableCell align="right">{formatCurrency(service.total)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEditService(service)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveService(service.proposal_service_id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total Amount:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
        
        {/* Form Actions */}
        <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSaveAsDraft}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save and Continue'}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Service Form Dialog */}
      <Dialog
        open={openServiceForm}
        onClose={() => setOpenServiceForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentService ? 'Edit Service' : 'Add Service'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={serviceFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Service Category Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth error={serviceFormik.touched.service_category_id && Boolean(serviceFormik.errors.service_category_id)}>
                  <InputLabel id="service-category-label">Service Category</InputLabel>
                  <Select
                    labelId="service-category-label"
                    id="service_category_id"
                    name="service_category_id"
                    value={serviceFormik.values.service_category_id}
                    onChange={handleCategoryChange}
                    label="Service Category"
                  >
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
                    {serviceCategories.map((category) => (
                      <MenuItem key={category.service_category_id} value={category.service_category_id}>
                        {category.service_category_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Service Selection (only shown after category is selected) */}
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  disabled={!serviceFormik.values.service_category_id}
                  error={serviceFormik.touched.service_id && Boolean(serviceFormik.errors.service_id)}
                >
                  <InputLabel id="service-label">Service</InputLabel>
                  <Select
                    labelId="service-label"
                    id="service_id"
                    name="service_id"
                    value={serviceFormik.values.service_id}
                    onChange={handleServiceChange}
                    label="Service"
                  >
                    <MenuItem value="">
                      <em>Select a service</em>
                    </MenuItem>
                    {filteredServices.map((service) => (
                      <MenuItem key={service.service_id} value={service.service_id}>
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={serviceFormik.values.quantity}
                  onChange={serviceFormik.handleChange}
                  error={serviceFormik.touched.quantity && Boolean(serviceFormik.errors.quantity)}
                  helperText={serviceFormik.touched.quantity && serviceFormik.errors.quantity}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="unit_price"
                  name="unit_price"
                  label="Unit Price"
                  type="number"
                  value={serviceFormik.values.unit_price}
                  onChange={serviceFormik.handleChange}
                  error={serviceFormik.touched.unit_price && Boolean(serviceFormik.errors.unit_price)}
                  helperText={serviceFormik.touched.unit_price && serviceFormik.errors.unit_price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="discount_percentage"
                  name="discount_percentage"
                  label="Discount Percentage"
                  type="number"
                  value={serviceFormik.values.discount_percentage}
                  onChange={serviceFormik.handleChange}
                  error={serviceFormik.touched.discount_percentage && Boolean(serviceFormik.errors.discount_percentage)}
                  helperText={serviceFormik.touched.discount_percentage && serviceFormik.errors.discount_percentage}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={2}
                  value={serviceFormik.values.notes}
                  onChange={serviceFormik.handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServiceForm(false)}>Cancel</Button>
          <Button onClick={serviceFormik.handleSubmit} color="primary">
            {currentService ? 'Update' : 'Add'} Service
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProposalForm; 