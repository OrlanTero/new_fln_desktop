import React from 'react';
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
  client_name: Yup.string().required('Client name is required'),
  company: Yup.string().required('Company name is required'),
  address: Yup.string().required('Address is required'),
  email_address: Yup.string().email('Invalid email address'),
  client_type_id: Yup.number().required('Client type is required'),
  tax_type: Yup.string(),
  account_for: Yup.string(),
  rdo: Yup.string(),
  description: Yup.string(),
  status: Yup.string().oneOf(['active', 'inactive']).required('Status is required')
});

const ClientForm = ({ client, clientTypes, onSave, onCancel }) => {
  console.log('ClientForm props:', { client, clientTypes });
  
  const formik = useFormik({
    initialValues: {
      client_name: client?.name || '',
      company: client?.company || '',
      branch: client?.branch || '',
      address: client?.address || '',
      address2: client?.address2 || '',
      tax_type: client?.taxType || '',
      account_for: client?.accountFor || '',
      rdo: client?.rdo || '',
      email_address: client?.email || '',
      description: client?.description || '',
      client_type_id: client?.clientType?.id || '',
      status: client?.status || 'active'
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
      onSave(values);
    }
  });

  return (
    <>
      <DialogTitle>
        {client ? 'Edit Client' : 'Add New Client'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="client_name"
                label="Client Name"
                value={formik.values.client_name}
                onChange={formik.handleChange}
                error={formik.touched.client_name && Boolean(formik.errors.client_name)}
                helperText={formik.touched.client_name && formik.errors.client_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="company"
                label="Company"
                value={formik.values.company}
                onChange={formik.handleChange}
                error={formik.touched.company && Boolean(formik.errors.company)}
                helperText={formik.touched.company && formik.errors.company}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="branch"
                label="Branch"
                value={formik.values.branch}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.client_type_id && Boolean(formik.errors.client_type_id)}>
                <InputLabel>Client Type</InputLabel>
                <Select
                  name="client_type_id"
                  value={formik.values.client_type_id}
                  onChange={formik.handleChange}
                  label="Client Type"
                >
                  {clientTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.client_type_id && formik.errors.client_type_id && (
                  <FormHelperText>{formik.errors.client_type_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address2"
                label="Address Line 2"
                value={formik.values.address2}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="tax_type"
                label="Tax Type"
                value={formik.values.tax_type}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="account_for"
                label="Account For"
                value={formik.values.account_for}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="rdo"
                label="RDO"
                value={formik.values.rdo}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email_address"
                label="Email Address"
                value={formik.values.email_address}
                onChange={formik.handleChange}
                error={formik.touched.email_address && Boolean(formik.errors.email_address)}
                helperText={formik.touched.email_address && formik.errors.email_address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
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
            disabled={formik.isSubmitting}
          >
            {client ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default ClientForm; 