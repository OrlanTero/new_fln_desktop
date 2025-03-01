import React, { useState } from 'react';
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
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema for the project form
const validationSchema = Yup.object({
  project_name: Yup.string().required('Project name is required'),
  client_id: Yup.number().required('Client is required'),
  description: Yup.string().required('Description is required'),
  start_date: Yup.date().required('Start date is required'),
  estimated_end_date: Yup.date().required('Estimated end date is required')
    .min(
      Yup.ref('start_date'),
      'End date cannot be before start date'
    ),
  status: Yup.string().required('Status is required'),
});

const ProjectForm = ({ project, clients, onSave, onCancel, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form with project data or default values
  const formik = useFormik({
    initialValues: {
      project_name: project?.project_name || '',
      client_id: project?.client_id || '',
      description: project?.description || '',
      start_date: project?.start_date || new Date().toISOString().split('T')[0],
      estimated_end_date: project?.estimated_end_date || '',
      actual_end_date: project?.actual_end_date || '',
      status: project?.status || 'Not Started',
      budget: project?.budget || '',
      notes: project?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Prepare the project data
        const projectData = {
          ...values,
          created_by: currentUser.user_id,
          // If editing, keep the proposal_id reference
          proposal_id: project?.proposal_id || null,
        };
        
        // Call the onSave function passed from parent
        await onSave(projectData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error submitting project:', err);
        setError(err.message);
        setLoading(false);
      }
    },
  });
  
  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Project Details
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            id="project_name"
            name="project_name"
            label="Project Name"
            value={formik.values.project_name}
            onChange={formik.handleChange}
            error={formik.touched.project_name && Boolean(formik.errors.project_name)}
            helperText={formik.touched.project_name && formik.errors.project_name}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl 
            fullWidth
            error={formik.touched.client_id && Boolean(formik.errors.client_id)}
          >
            <InputLabel id="client-label">Client</InputLabel>
            <Select
              labelId="client-label"
              id="client_id"
              name="client_id"
              value={formik.values.client_id}
              onChange={formik.handleChange}
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
            {formik.touched.client_id && formik.errors.client_id && (
              <FormHelperText>{formik.errors.client_id}</FormHelperText>
            )}
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
            id="start_date"
            name="start_date"
            label="Start Date"
            type="date"
            value={formik.values.start_date}
            onChange={formik.handleChange}
            error={formik.touched.start_date && Boolean(formik.errors.start_date)}
            helperText={formik.touched.start_date && formik.errors.start_date}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="estimated_end_date"
            name="estimated_end_date"
            label="Estimated End Date"
            type="date"
            value={formik.values.estimated_end_date}
            onChange={formik.handleChange}
            error={formik.touched.estimated_end_date && Boolean(formik.errors.estimated_end_date)}
            helperText={formik.touched.estimated_end_date && formik.errors.estimated_end_date}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="actual_end_date"
            name="actual_end_date"
            label="Actual End Date"
            type="date"
            value={formik.values.actual_end_date}
            onChange={formik.handleChange}
            error={formik.touched.actual_end_date && Boolean(formik.errors.actual_end_date)}
            helperText={formik.touched.actual_end_date && formik.errors.actual_end_date}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth
            error={formik.touched.status && Boolean(formik.errors.status)}
          >
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              label="Status"
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="budget"
            name="budget"
            label="Budget"
            type="number"
            value={formik.values.budget}
            onChange={formik.handleChange}
            error={formik.touched.budget && Boolean(formik.errors.budget)}
            helperText={formik.touched.budget && formik.errors.budget}
            InputProps={{
              startAdornment: <span>$</span>,
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
            rows={4}
            value={formik.values.notes}
            onChange={formik.handleChange}
            error={formik.touched.notes && Boolean(formik.errors.notes)}
            helperText={formik.touched.notes && formik.errors.notes}
          />
        </Grid>
        
        {/* Form Actions */}
        <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
            {loading ? <CircularProgress size={24} /> : project ? 'Update Project' : 'Create Project'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectForm; 