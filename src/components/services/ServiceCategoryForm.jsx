import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  service_category_name: Yup.string().required('Category name is required'),
  priority_number: Yup.number().typeError('Must be a number').required('Priority number is required')
});

const ServiceCategoryForm = ({ category, currentUser, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      service_category_name: category?.service_category_name || '',
      priority_number: category?.priority_number || 0,
      description: category?.description || '',
      added_by_id: category?.added_by_id || currentUser?.id
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        console.log('Form submitted with values:', values);
        await onSave(values);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <>
      <DialogTitle>
        {category ? 'Edit Service Category' : 'Add New Service Category'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="service_category_name"
                label="Category Name"
                value={formik.values.service_category_name}
                onChange={formik.handleChange}
                error={formik.touched.service_category_name && Boolean(formik.errors.service_category_name)}
                helperText={formik.touched.service_category_name && formik.errors.service_category_name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="priority_number"
                label="Priority Number"
                type="number"
                value={formik.values.priority_number}
                onChange={formik.handleChange}
                error={formik.touched.priority_number && Boolean(formik.errors.priority_number)}
                helperText={formik.touched.priority_number && formik.errors.priority_number}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {category ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default ServiceCategoryForm; 