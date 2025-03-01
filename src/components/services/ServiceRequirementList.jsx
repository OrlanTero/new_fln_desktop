import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const ServiceRequirementList = ({ serviceId, readOnly = false }) => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRequirement, setNewRequirement] = useState('');
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch requirements when serviceId changes
  useEffect(() => {
    if (serviceId) {
      fetchRequirements();
    } else {
      setRequirements([]);
      setLoading(false);
    }
  }, [serviceId]);

  const fetchRequirements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await window.api.getServiceRequirements(serviceId);
      if (response.success) {
        setRequirements(response.requirements || []);
      } else {
        throw new Error(response.error || 'Failed to fetch requirements');
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError(err.message || 'An error occurred while fetching requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequirement = async () => {
    if (!newRequirement.trim()) return;

    try {
      const response = await window.api.createServiceRequirement({
        service_id: serviceId,
        requirement: newRequirement.trim()
      });

      if (response.success) {
        setRequirements([...requirements, response.requirement]);
        setNewRequirement('');
      } else {
        throw new Error(response.error || 'Failed to add requirement');
      }
    } catch (err) {
      console.error('Error adding requirement:', err);
      setError(err.message || 'An error occurred while adding the requirement');
    }
  };

  const handleDeleteRequirement = async (requirementId) => {
    try {
      const response = await window.api.deleteServiceRequirement(requirementId);
      if (response.success) {
        setRequirements(requirements.filter(req => req.requirement_id !== requirementId));
      } else {
        throw new Error(response.error || 'Failed to delete requirement');
      }
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setError(err.message || 'An error occurred while deleting the requirement');
    }
  };

  const startEditing = (requirement) => {
    setEditingRequirement(requirement.requirement_id);
    setEditText(requirement.requirement);
  };

  const cancelEditing = () => {
    setEditingRequirement(null);
    setEditText('');
  };

  const saveEditing = async () => {
    if (!editText.trim()) return;

    try {
      const response = await window.api.updateServiceRequirement(editingRequirement, {
        requirement: editText.trim()
      });

      if (response.success) {
        setRequirements(requirements.map(req => 
          req.requirement_id === editingRequirement 
            ? { ...req, requirement: editText.trim() } 
            : req
        ));
        setEditingRequirement(null);
        setEditText('');
      } else {
        throw new Error(response.error || 'Failed to update requirement');
      }
    } catch (err) {
      console.error('Error updating requirement:', err);
      setError(err.message || 'An error occurred while updating the requirement');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Service Requirements
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!readOnly && (
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="New Requirement"
            variant="outlined"
            size="small"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRequirement}
            sx={{ ml: 1 }}
            disabled={!newRequirement.trim()}
          >
            Add
          </Button>
        </Box>
      )}

      {requirements.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
          No requirements added yet.
        </Typography>
      ) : (
        <List>
          {requirements.map((req, index) => (
            <React.Fragment key={req.requirement_id}>
              {index > 0 && <Divider component="li" />}
              <ListItem>
                {editingRequirement === req.requirement_id ? (
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <TextField
                      fullWidth
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      variant="outlined"
                      size="small"
                      autoFocus
                    />
                    <IconButton color="primary" onClick={saveEditing} disabled={!editText.trim()}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="default" onClick={cancelEditing}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <ListItemText primary={req.requirement} />
                    {!readOnly && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => startEditing(req)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteRequirement(req.requirement_id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ServiceRequirementList; 