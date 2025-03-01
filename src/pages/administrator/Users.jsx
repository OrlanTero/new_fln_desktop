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
  Person as PersonIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import UserForm from '../../components/users/UserForm';

const Users = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term or role filter changes
  useEffect(() => {
    console.log('Filtering users:', users);
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await window.api.getUsers();
      console.log('Fetched users response:', response);
      if (response.success) {
        setUsers(response.users);
        setFilteredUsers(response.users); // Initialize filtered users
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }
    
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    console.log('Filtered users:', filtered);
    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setOpenForm(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setOpenForm(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmDelete(user);
  };

  const handleSaveUser = async (formData) => {
    try {
      console.log('Saving user with data:', formData);
      let response;
      
      if (currentUser) {
        // Update existing user
        console.log('Updating existing user with ID:', currentUser.id);
        response = await window.api.updateUser(currentUser.id, formData);
        console.log('Update response:', response);
        if (response.success) {
          setUsers(prevUsers => 
            prevUsers.map(user => user.id === currentUser.id ? response.user : user)
          );
          showNotification('User updated successfully', 'success');
        }
      } else {
        // Create new user
        console.log('Creating new user');
        response = await window.api.createUser(formData);
        console.log('Create response:', response);
        if (response.success) {
          console.log('Adding new user to state:', response.user);
          // Fetch all users again to ensure we have the latest data
          fetchUsers();
          showNotification('User created successfully', 'success');
        }
      }
      
      if (!response.success) {
        console.error('Operation failed:', response.error);
        showNotification(response.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Failed to save user', 'error');
    } finally {
      setOpenForm(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    
    try {
      const response = await window.api.deleteUser(confirmDelete.id);
      if (response.success) {
        setUsers(prevUsers => 
          prevUsers.filter(user => user.id !== confirmDelete.id)
        );
        showNotification('User deleted successfully', 'success');
      } else {
        showNotification(response.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
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

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'error';
      case 'Employee':
        return 'primary';
      case 'Liaison':
        return 'success';
      default:
        return 'default';
    }
  };

  // Calculate pagination
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add New User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search users..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="Liaison">Liaison</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>

      {/* Results count */}
      <Typography variant="body2" className="mb-2 text-gray-600">
        Showing {paginatedUsers.length} of {filteredUsers.length} results
      </Typography>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <EmailIcon fontSize="small" className="mr-1" />
                      {user.email}
                    </p>
                  </div>
                  <Chip 
                    label={user.role} 
                    size="small"
                    color={getRoleColor(user.role)}
                  />
                </div>
                
                {user.photo_url && (
                  <div className="mt-3 flex justify-center">
                    <img 
                      src={user.photo_url} 
                      alt={user.name} 
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  </div>
                )}
                
                <p className="text-gray-600 flex items-center mt-2">
                  <BadgeIcon fontSize="small" className="mr-1" />
                  ID: {user.id}
                </p>
                
                <p className="text-gray-600 mt-2">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="bg-gray-50 px-4 py-2 flex justify-end">
                <Tooltip title="Edit">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteUser(user)}
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
              No users found matching your criteria
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
        <UserForm 
          user={currentUser}
          onSave={handleSaveUser}
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
            Are you sure you want to delete the user "{confirmDelete?.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={confirmDeleteUser}
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

export default Users; 