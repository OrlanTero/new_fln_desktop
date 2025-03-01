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
  FormHelperText,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Fixed validation schema to properly handle conditional validation
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().oneOf(['Admin', 'Employee', 'Liaison']).required('Role is required'),
  password: Yup.string().when('_isNewUser', {
    is: true,
    then: () => Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    otherwise: () => Yup.string().min(6, 'Password must be at least 6 characters').notRequired()
  }),
  photo_url: Yup.string().url('Must be a valid URL').notRequired()
});

const UserForm = ({ user, onSave, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'Employee',
      photo_url: user?.photo_url || '',
      _isNewUser: !user
    },
    validationSchema,
    onSubmit: (values) => {
      // Remove the _isNewUser field before submitting
      const { _isNewUser, ...submitData } = values;
      
      // If editing and password is empty, remove it from the submission
      if (!_isNewUser && !submitData.password) {
        delete submitData.password;
      }
      
      console.log('Form submitted with values:', submitData);
      onSave(submitData);
    }
  });

  return (
    <>
      <DialogTitle>
        {user ? 'Edit User' : 'Add New User'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="password"
                label={user ? "New Password (leave blank to keep current)" : "Password"}
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.role && Boolean(formik.errors.role)}
              >
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  label="Role"
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Liaison">Liaison</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <FormHelperText>{formik.errors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="photo_url"
                label="Profile Photo URL"
                value={formik.values.photo_url}
                onChange={formik.handleChange}
                placeholder="https://example.com/photo.jpg"
                error={formik.touched.photo_url && Boolean(formik.errors.photo_url)}
                helperText={formik.touched.photo_url && formik.errors.photo_url}
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
            {user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default UserForm; 