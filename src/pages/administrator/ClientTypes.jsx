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
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import ClientTypeForm from '../../components/clients/ClientTypeForm';

const ClientTypes = () => {
  // State variables
  const [clientTypes, setClientTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch client types
  useEffect(() => {
    fetchClientTypes();
  }, []);

  // Filter client types when search term or status filter changes
  useEffect(() => {
    filterClientTypes();
  }, [clientTypes, searchTerm, statusFilter]);

  const fetchClientTypes = async () => {
    try {
      setLoading(true);
      const response = await window.api.getClientTypes();
      if (response.success) {
        setClientTypes(response.clientTypes);
      } else {
        setError(response.error || 'Failed to fetch client types');
      }
    } catch (error) {
      console.error('Error fetching client types:', error);
      setError('Failed to fetch client types');
    } finally {
      setLoading(false);
    }
  };

  const filterClientTypes = () => {
    let filtered = [...clientTypes];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(type => type.status === statusFilter);
    }
    
    setFilteredTypes(filtered);
  };

  const handleAddType = () => {
    setCurrentType(null);
    setOpenForm(true);
  };

  const handleEditType = (type) => {
    setCurrentType(type);
    setOpenForm(true);
  };

  const handleDeleteType = (type) => {
    setConfirmDelete(type);
  };

  const handleSaveType = async (formData) => {
    try {
      let response;
      
      if (currentType) {
        // Update existing type
        response = await window.api.updateClientType(currentType.id, formData);
        if (response.success) {
          setClientTypes(prevTypes => 
            prevTypes.map(type => type.id === currentType.id ? response.clientType : type)
          );
          showNotification('Client type updated successfully', 'success');
        }
      } else {
        // Create new type
        response = await window.api.createClientType(formData);
        if (response.success) {
          setClientTypes(prevTypes => [...prevTypes, response.clientType]);
          showNotification('Client type created successfully', 'success');
        }
      }
      
      if (!response.success) {
        showNotification(response.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving client type:', error);
      showNotification('Failed to save client type', 'error');
    } finally {
      setOpenForm(false);
    }
  };

  const confirmDeleteType = async () => {
    if (!confirmDelete) return;
    
    try {
      const response = await window.api.deleteClientType(confirmDelete.id);
      if (response.success) {
        setClientTypes(prevTypes => 
          prevTypes.filter(type => type.id !== confirmDelete.id)
        );
        showNotification('Client type deleted successfully', 'success');
      } else {
        showNotification(response.error || 'Failed to delete client type', 'error');
      }
    } catch (error) {
      console.error('Error deleting client type:', error);
      showNotification('Failed to delete client type', 'error');
    } finally {
      setConfirmDelete(null);
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
  const paginatedTypes = filteredTypes.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const pageCount = Math.ceil(filteredTypes.length / rowsPerPage);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Client Types</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddType}
        >
          Add New Type
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <TextField
          placeholder="Search client types..."
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
          className="flex-grow"
        />
        
        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Results count */}
      <Typography variant="body2" className="mb-2 text-gray-600">
        Showing {paginatedTypes.length} of {filteredTypes.length} results
      </Typography>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTypes.length > 0 ? (
              paginatedTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{type.id}</td>
                  <td className="px-6 py-4">{type.name}</td>
                  <td className="px-6 py-4">{type.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      type.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {type.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditType(type)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteType(type)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No client types found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
        maxWidth="sm"
        fullWidth
      >
        <ClientTypeForm 
          clientType={currentType}
          onSave={handleSaveType}
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
            Are you sure you want to delete the client type "{confirmDelete?.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={confirmDeleteType}
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

export default ClientTypes; 