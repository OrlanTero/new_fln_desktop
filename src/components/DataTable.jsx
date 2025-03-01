import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { dbApi, isIpcAvailable } from '../utils/clientApi';

/**
 * A reusable data table component that handles CRUD operations
 * using direct IPC communication with the main process
 */
const DataTable = ({ 
  tableName, 
  columns, 
  searchFields = [], 
  formComponent: FormComponent,
  defaultSort = null
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipcAvailable, setIpcAvailable] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Check if IPC is available
  useEffect(() => {
    const available = isIpcAvailable();
    setIpcAvailable(available);
    if (!available) {
      setError('IPC is not available. The application may not be properly initialized.');
    }
  }, []);

  // Load data
  const loadData = async () => {
    if (!ipcAvailable) {
      console.error('Cannot load data: IPC is not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await dbApi.fetchTableData({
        table: tableName,
        page: pagination.page + 1,
        limit: pagination.limit,
        search: search ? {
          fields: searchFields,
          term: search
        } : null,
        orderBy: defaultSort
      });

      console.log(`Data loaded for ${tableName}:`, result);
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(`Error loading data for ${tableName}:`, error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ipcAvailable) {
      loadData();
    }
  }, [pagination.page, pagination.limit, search, ipcAvailable]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleOpenForm = (item = null) => {
    setSelectedItem(item);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setOpenForm(false);
  };

  const handleCreate = async (formData) => {
    if (!ipcAvailable) {
      setError('Cannot create: IPC is not available');
      return;
    }

    try {
      setLoading(true);
      await dbApi.create(tableName, formData);
      await loadData();
      handleCloseForm();
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      setError(`Failed to create: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!ipcAvailable || !selectedItem) {
      setError('Cannot update: IPC is not available or no item selected');
      return;
    }

    try {
      setLoading(true);
      
      // Get the primary key field (assuming it's the first column with isPrimary=true)
      const primaryKey = columns.find(col => col.isPrimary)?.field;
      if (!primaryKey) {
        throw new Error('No primary key defined for this table');
      }
      
      const conditions = { [primaryKey]: selectedItem[primaryKey] };
      
      await dbApi.update(tableName, formData, conditions);
      await loadData();
      handleCloseForm();
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      setError(`Failed to update: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!ipcAvailable) {
      setError('Cannot delete: IPC is not available');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Get the primary key field (assuming it's the first column with isPrimary=true)
      const primaryKey = columns.find(col => col.isPrimary)?.field;
      if (!primaryKey) {
        throw new Error('No primary key defined for this table');
      }
      
      const conditions = { [primaryKey]: item[primaryKey] };
      
      await dbApi.delete(tableName, conditions);
      await loadData();
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      setError(`Failed to delete: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    if (selectedItem) {
      await handleUpdate(formData);
    } else {
      await handleCreate(formData);
    }
  };

  if (!ipcAvailable) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        IPC is not available. The application may not be properly initialized.
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          disabled={loading || searchFields.length === 0}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ width: '300px' }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          disabled={loading}
        >
          Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.field}>
                  {column.headerName}
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[columns.find(col => col.isPrimary)?.field || columns[0].field]}>
                  {columns.map(column => (
                    <TableCell key={`${row.id}-${column.field}`}>
                      {column.valueGetter ? column.valueGetter(row) : row[column.field]}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(row)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={-1} // We don't know the total count
          page={pagination.page}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {FormComponent && (
        <Dialog
          open={openForm}
          onClose={handleCloseForm}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedItem ? 'Edit' : 'Add New'} {tableName}
          </DialogTitle>
          <DialogContent>
            <FormComponent
              data={selectedItem}
              onSave={handleSave}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default DataTable; 