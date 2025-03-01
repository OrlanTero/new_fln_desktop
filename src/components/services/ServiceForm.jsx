import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  InputAdornment,
  Divider,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ServiceRequirementList from './ServiceRequirementList';

const validationSchema = Yup.object({
  service_name: Yup.string().required('Service name is required'),
  service_category_id: Yup.number().required('Service category is required'),
  price: Yup.number().typeError('Must be a number').required('Price is required'),
  timeline: Yup.string().required('Timeline is required')
});

const ServiceForm = ({ service, categories, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [savedServiceId, setSavedServiceId] = useState(service?.service_id || null);

  const formik = useFormik({
    initialValues: {
      service_name: service?.service_name || '',
      service_category_id: service?.service_category_id || '',
      price: service?.price || '',
      remarks: service?.remarks || '',
      timeline: service?.timeline || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        console.log('Form submitted with values:', values);
        const result = await onSave(values);
        if (result && result.service_id) {
          setSavedServiceId(result.service_id);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  // Set savedServiceId when service prop changes
  useEffect(() => {
    if (service && service.service_id) {
      setSavedServiceId(service.service_id);
    }
  }, [service]);

  return (
    <>
      <DialogTitle>
        {service ? 'Edit Service' : 'Add New Service'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="service_name"
                label="Service Name"
                value={formik.values.service_name}
                onChange={formik.handleChange}
                error={formik.touched.service_name && Boolean(formik.errors.service_name)}
                helperText={formik.touched.service_name && formik.errors.service_name}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl 
                fullWidth
                error={formik.touched.service_category_id && Boolean(formik.errors.service_category_id)}
              >
                <InputLabel>Service Category</InputLabel>
                <Select
                  name="service_category_id"
                  value={formik.values.service_category_id}
                  onChange={formik.handleChange}
                  label="Service Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.service_category_id} value={category.service_category_id}>
                      {category.service_category_name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.service_category_id && formik.errors.service_category_id && (
                  <FormHelperText>{formik.errors.service_category_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="price"
                label="Price"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="timeline"
                label="Timeline"
                placeholder="e.g., 2-3 weeks"
                value={formik.values.timeline}
                onChange={formik.handleChange}
                error={formik.touched.timeline && Boolean(formik.errors.timeline)}
                helperText={formik.touched.timeline && formik.errors.timeline}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="remarks"
                label="Remarks"
                multiline
                rows={4}
                value={formik.values.remarks}
                onChange={formik.handleChange}
                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                helperText={formik.touched.remarks && formik.errors.remarks}
              />
            </Grid>
          </Grid>

          {/* Service Requirements Section */}
          {service && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              <ServiceRequirementList serviceId={savedServiceId} readOnly={false} />
            </Box>
          )}

          {/* Show requirements section only after saving a new service */}
          {!service && savedServiceId && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Service saved successfully! You can now add requirements.
              </Typography>
              <ServiceRequirementList serviceId={savedServiceId} readOnly={false} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {service ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default ServiceForm; 