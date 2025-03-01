import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import ServiceForm from '../../components/services/ServiceForm';
import ServiceCategoryForm from '../../components/services/ServiceCategoryForm';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`services-tabpanel-${index}`}
      aria-labelledby={`services-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Services = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Dialog states
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Pagination states
  const [servicePage, setServicePage] = useState(0);
  const [serviceRowsPerPage, setServiceRowsPerPage] = useState(10);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryRowsPerPage, setCategoryRowsPerPage] = useState(10);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch services and categories
  const fetchData = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      // First try to get services
      const servicesResponse = await window.api.getServices();
      if (!servicesResponse.success) {
        throw new Error(servicesResponse.error || 'Failed to fetch services');
      }
      setServices(servicesResponse.services || []);
      setFilteredServices(servicesResponse.services || []);
      
      // Then try to get categories
      const categoriesResponse = await window.api.getServiceCategories();
      if (!categoriesResponse.success) {
        throw new Error(categoriesResponse.error || 'Failed to fetch service categories');
      }
      setCategories(categoriesResponse.categories || []);
      setFilteredCategories(categoriesResponse.categories || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      
      // If the error is about no handler registered and we haven't retried too many times, retry after a delay
      if (err.message && err.message.includes('No handler registered') && retryCount < 3) {
        console.log(`Retrying fetchData (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchData(retryCount + 1), 1000); // Retry after 1 second
        return;
      }
      
      setError(err.message || 'An error occurred while fetching data. Please restart the application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter services and categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
      setFilteredCategories(categories);
    } else {
      const term = searchTerm.toLowerCase();
      
      const filteredServices = services.filter(service => 
        service.service_name.toLowerCase().includes(term) ||
        (service.service_category_name && service.service_category_name.toLowerCase().includes(term)) ||
        (service.remarks && service.remarks.toLowerCase().includes(term))
      );
      
      const filteredCategories = categories.filter(category => 
        category.service_category_name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term))
      );
      
      setFilteredServices(filteredServices);
      setFilteredCategories(filteredCategories);
    }
  }, [searchTerm, services, categories]);

  // Service dialog handlers
  const handleOpenServiceDialog = (service = null) => {
    setSelectedService(service);
    setOpenServiceDialog(true);
  };

  const handleCloseServiceDialog = () => {
    setSelectedService(null);
    setOpenServiceDialog(false);
  };

  const handleSaveService = async (serviceData) => {
    try {
      let result;
      
      if (selectedService) {
        // Update existing service
        result = await window.api.updateService(selectedService.service_id, serviceData);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Service updated successfully',
            severity: 'success'
          });
        }
      } else {
        // Create new service
        result = await window.api.createService(serviceData);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Service created successfully',
            severity: 'success'
          });
        }
      }
      
      if (result.success) {
        handleCloseServiceDialog();
        fetchData();
        return result.service; // Return the service object
      } else {
        throw new Error(result.error || 'Failed to save service');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setSnackbar({
        open: true,
        message: err.message || 'An error occurred while saving the service',
        severity: 'error'
      });
      return null;
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const result = await window.api.deleteService(serviceId);
        
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Service deleted successfully',
            severity: 'success'
          });
          fetchData();
        } else {
          throw new Error(result.error || 'Failed to delete service');
        }
      } catch (err) {
        console.error('Error deleting service:', err);
        setSnackbar({
          open: true,
          message: err.message || 'An error occurred while deleting the service',
          severity: 'error'
        });
      }
    }
  };

  // Category dialog handlers
  const handleOpenCategoryDialog = (category = null) => {
    setSelectedCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setSelectedCategory(null);
    setOpenCategoryDialog(false);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      let result;
      
      if (selectedCategory) {
        // Update existing category
        result = await window.api.updateServiceCategory(selectedCategory.service_category_id, categoryData);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Service category updated successfully',
            severity: 'success'
          });
        }
      } else {
        // Create new category
        result = await window.api.createServiceCategory(categoryData);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Service category created successfully',
            severity: 'success'
          });
        }
      }
      
      if (result.success) {
        handleCloseCategoryDialog();
        fetchData();
      } else {
        throw new Error(result.error || 'Failed to save service category');
      }
    } catch (err) {
      console.error('Error saving service category:', err);
      setSnackbar({
        open: true,
        message: err.message || 'An error occurred while saving the service category',
        severity: 'error'
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this service category?')) {
      try {
        const result = await window.api.deleteServiceCategory(categoryId);
        
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Service category deleted successfully',
            severity: 'success'
          });
          fetchData();
        } else {
          throw new Error(result.error || 'Failed to delete service category');
        }
      } catch (err) {
        console.error('Error deleting service category:', err);
        setSnackbar({
          open: true,
          message: err.message || 'An error occurred while deleting the service category',
          severity: 'error'
        });
      }
    }
  };

  // Pagination handlers
  const handleServicePageChange = (event, newPage) => {
    setServicePage(newPage);
  };

  const handleServiceRowsPerPageChange = (event) => {
    setServiceRowsPerPage(parseInt(event.target.value, 10));
    setServicePage(0);
  };

  const handleCategoryPageChange = (event, newPage) => {
    setCategoryPage(newPage);
  };

  const handleCategoryRowsPerPageChange = (event) => {
    setCategoryRowsPerPage(parseInt(event.target.value, 10));
    setCategoryPage(0);
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Services Management
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ width: '300px' }}
        />
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="services tabs">
          <Tab label="Services" id="services-tab-0" aria-controls="services-tabpanel-0" />
          <Tab label="Service Categories" id="services-tab-1" aria-controls="services-tabpanel-1" />
        </Tabs>
        
        {/* Services Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenServiceDialog()}
            >
              Add Service
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => fetchData()}>
                  Retry
                </Button>
              }
            >
              {error}
              <Typography variant="body2" sx={{ mt: 1 }}>
                If the problem persists, please restart the application or contact support.
              </Typography>
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="services table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Service Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Timeline</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No services found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServices
                        .slice(servicePage * serviceRowsPerPage, servicePage * serviceRowsPerPage + serviceRowsPerPage)
                        .map((service) => (
                          <TableRow key={service.service_id}>
                            <TableCell>{service.service_name}</TableCell>
                            <TableCell>{service.service_category_name}</TableCell>
                            <TableCell>{formatCurrency(service.price)}</TableCell>
                            <TableCell>{service.timeline}</TableCell>
                            <TableCell>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenServiceDialog(service)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteService(service.service_id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredServices.length}
                rowsPerPage={serviceRowsPerPage}
                page={servicePage}
                onPageChange={handleServicePageChange}
                onRowsPerPageChange={handleServiceRowsPerPageChange}
              />
            </>
          )}
        </TabPanel>
        
        {/* Service Categories Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCategoryDialog()}
            >
              Add Category
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => fetchData()}>
                  Retry
                </Button>
              }
            >
              {error}
              <Typography variant="body2" sx={{ mt: 1 }}>
                If the problem persists, please restart the application or contact support.
              </Typography>
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="service categories table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category Name</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Added By</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories
                        .slice(categoryPage * categoryRowsPerPage, categoryPage * categoryRowsPerPage + categoryRowsPerPage)
                        .map((category) => (
                          <TableRow key={category.service_category_id}>
                            <TableCell>{category.service_category_name}</TableCell>
                            <TableCell>{category.priority_number}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>{category.added_by_name}</TableCell>
                            <TableCell>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenCategoryDialog(category)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteCategory(category.service_category_id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredCategories.length}
                rowsPerPage={categoryRowsPerPage}
                page={categoryPage}
                onPageChange={handleCategoryPageChange}
                onRowsPerPageChange={handleCategoryRowsPerPageChange}
              />
            </>
          )}
        </TabPanel>
      </Paper>
      
      {/* Service Dialog */}
      <Dialog
        open={openServiceDialog}
        onClose={handleCloseServiceDialog}
        maxWidth="md"
        fullWidth
      >
        <ServiceForm
          service={selectedService}
          categories={categories}
          onSave={handleSaveService}
          onCancel={handleCloseServiceDialog}
        />
      </Dialog>
      
      {/* Service Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <ServiceCategoryForm
          category={selectedCategory}
          currentUser={user}
          onSave={handleSaveCategory}
          onCancel={handleCloseCategoryDialog}
        />
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Services; 