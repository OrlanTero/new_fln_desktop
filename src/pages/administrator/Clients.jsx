import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  TextField, 
  IconButton, 
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Box,
  Typography,
  Tooltip,
  Alert,
  Snackbar,
  Chip,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import ClientForm from '../../components/clients/ClientForm';

const Clients = () => {
  // State variables
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch clients and client types
  useEffect(() => {
    fetchClients();
    fetchClientTypes();
  }, []);

  // Filter clients when search term, status filter, or type filter changes
  useEffect(() => {
    console.log('Filtering clients:', clients);
    filterClients();
  }, [clients, searchTerm, statusFilter, typeFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await window.api.getClients();
      console.log('Fetched clients response:', response);
      if (response.success) {
        setClients(response.clients);
        setFilteredClients(response.clients); // Initialize filtered clients
      } else {
        setError(response.error || 'Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientTypes = async () => {
    try {
      const response = await window.api.getClientTypes();
      if (response.success) {
        setClientTypes(response.clientTypes);
      }
    } catch (error) {
      console.error('Error fetching client types:', error);
    }
  };

  const filterClients = () => {
    if (!clients || clients.length === 0) {
      setFilteredClients([]);
      return;
    }
    
    let filtered = [...clients];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.description && client.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    // Apply client type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(client => client.clientType && client.clientType.id === parseInt(typeFilter));
    }
    
    console.log('Filtered clients:', filtered);
    setFilteredClients(filtered);
  };

  const handleAddClient = () => {
    setCurrentClient(null);
    setOpenForm(true);
  };

  const handleEditClient = (client) => {
    setCurrentClient(client);
    setOpenForm(true);
  };

  const handleDeleteClient = (client) => {
    setConfirmDelete(client);
  };

  const handleSaveClient = async (formData) => {
    try {
      console.log('Saving client with data:', formData);
      let response;
      
      if (currentClient) {
        // Update existing client
        console.log('Updating existing client with ID:', currentClient.id);
        response = await window.api.updateClient(currentClient.id, formData);
        console.log('Update response:', response);
        if (response.success) {
          setClients(prevClients => 
            prevClients.map(client => client.id === currentClient.id ? response.client : client)
          );
          showNotification('Client updated successfully', 'success');
        }
      } else {
        // Create new client
        console.log('Creating new client');
        response = await window.api.createClient(formData);
        console.log('Create response:', response);
        if (response.success) {
          console.log('Adding new client to state:', response.client);
          // Fetch all clients again to ensure we have the latest data
          fetchClients();
          showNotification('Client created successfully', 'success');
        }
      }
      
      if (!response.success) {
        console.error('Operation failed:', response.error);
        showNotification(response.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving client:', error);
      showNotification('Failed to save client', 'error');
    } finally {
      setOpenForm(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!confirmDelete) return;
    
    try {
      const response = await window.api.deleteClient(confirmDelete.id);
      if (response.success) {
        setClients(prevClients => 
          prevClients.filter(client => client.id !== confirmDelete.id)
        );
        showNotification('Client deleted successfully', 'success');
      } else {
        showNotification(response.error || 'Failed to delete client', 'error');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      showNotification('Failed to delete client', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleToggleStatus = async (client) => {
    try {
      const response = await window.api.toggleClientStatus(client.id);
      if (response.success) {
        setClients(prevClients => 
          prevClients.map(c => c.id === client.id ? response.client : c)
        );
        showNotification(`Client status changed to ${response.client.status}`, 'success');
      } else {
        showNotification(response.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error toggling client status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Calculate pagination
  const paginatedClients = filteredClients.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const pageCount = Math.ceil(filteredClients.length / rowsPerPage);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Add New Client
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Client Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Client Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {clientTypes.map(type => (
                  <MenuItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>

      {/* Results count */}
      <Typography variant="body2" className="mb-2 text-gray-600">
        Showing {paginatedClients.length} of {filteredClients.length} results
      </Typography>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {paginatedClients.length > 0 ? (
          paginatedClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{client.name}</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <BusinessIcon fontSize="small" className="mr-1" />
                      {client.company}
                      {client.branch && ` - ${client.branch}`}
                    </p>
                  </div>
                  <Chip 
                    label={client.status} 
                    size="small"
                    color={client.status === 'active' ? 'success' : 'default'}
                  />
                </div>
                
                {client.clientType && (
                  <Chip 
                    label={client.clientType.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    className="mt-2"
                  />
                )}
                
                {client.address && (
                  <p className="text-gray-600 flex items-center mt-2">
                    <LocationIcon fontSize="small" className="mr-1" />
                    {client.address}
                  </p>
                )}
                
                {client.email && (
                  <p className="text-gray-600 flex items-center mt-2">
                    <EmailIcon fontSize="small" className="mr-1" />
                    {client.email}
                  </p>
                )}
                
                {client.description && (
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {client.description}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-2 flex justify-end">
                <Tooltip title="Edit">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditClient(client)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteClient(client)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-8 bg-white rounded-lg shadow">
            <Typography variant="body1" color="textSecondary">
              No clients found matching your criteria
            </Typography>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={pageCount} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <ClientForm 
          client={currentClient}
          clientTypes={clientTypes}
          onSave={handleSaveClient}
          onCancel={() => setOpenForm(false)}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={Boolean(confirmDelete)} 
        onClose={() => setConfirmDelete(null)}
      >
        <div className="p-6">
          <h3 className="text-xl font-medium mb-4">Confirm Delete</h3>
          <p className="mb-6">
            Are you sure you want to delete the client "{confirmDelete?.name}" from {confirmDelete?.company}? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={confirmDeleteClient}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Clients; 