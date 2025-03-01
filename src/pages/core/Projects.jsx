import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProjectForm from '../../components/projects/ProjectForm';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [clients, setClients] = useState([]);
  
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  // Fetch projects and clients on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const projectsResult = await window.api.getProjects();
      if (projectsResult.success) {
        setProjects(projectsResult.projects);
      } else {
        throw new Error(projectsResult.error || 'Failed to fetch projects');
      }
      
      // Fetch clients for the form
      const clientsResult = await window.api.getClients();
      if (clientsResult.success) {
        setClients(clientsResult.clients);
      } else {
        throw new Error(clientsResult.error || 'Failed to fetch clients');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenMenu = (event, projectId) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProjectId(null);
  };
  
  const handleAddProject = () => {
    setCurrentProject(null);
    setOpenForm(true);
  };
  
  const handleEditProject = (project) => {
    setCurrentProject(project);
    setOpenForm(true);
    handleCloseMenu();
  };
  
  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
    handleCloseMenu();
  };
  
  const handleDeleteClick = (project) => {
    setCurrentProject(project);
    setOpenDelete(true);
    handleCloseMenu();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const result = await window.api.deleteProject(currentProject.project_id);
      if (result.success) {
        setProjects(projects.filter(p => p.project_id !== currentProject.project_id));
        setSnackbar({
          open: true,
          message: 'Project deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setOpenDelete(false);
      setCurrentProject(null);
    }
  };
  
  const handleSaveProject = async (projectData) => {
    try {
      let result;
      
      if (currentProject) {
        // Update existing project
        result = await window.api.updateProject(
          currentProject.project_id, 
          projectData
        );
        
        if (result.success) {
          setProjects(projects.map(p => 
            p.project_id === currentProject.project_id ? result.project : p
          ));
          setSnackbar({
            open: true,
            message: 'Project updated successfully',
            severity: 'success'
          });
        } else {
          throw new Error(result.error || 'Failed to update project');
        }
      } else {
        // Create new project
        result = await window.api.createProject(projectData);
        
        if (result.success) {
          setProjects([...projects, result.project]);
          setSnackbar({
            open: true,
            message: 'Project created successfully',
            severity: 'success'
          });
        } else {
          throw new Error(result.error || 'Failed to create project');
        }
      }
      
      setOpenForm(false);
      setCurrentProject(null);
    } catch (err) {
      console.error('Error saving project:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const result = await window.api.updateProjectStatus(projectId, newStatus);
      
      if (result.success) {
        setProjects(projects.map(p => 
          p.project_id === projectId ? { ...p, status: newStatus } : p
        ));
        setSnackbar({
          open: true,
          message: `Project status updated to ${newStatus}`,
          severity: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to update project status');
      }
    } catch (err) {
      console.error('Error updating project status:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      handleCloseMenu();
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.project_name.toLowerCase().includes(searchLower) ||
      project.client_name?.toLowerCase().includes(searchLower) ||
      project.status.toLowerCase().includes(searchLower)
    );
  });
  
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'On Hold':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProject}
        >
          New Project
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.project_id}>
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.estimated_end_date)}</TableCell>
                    <TableCell>
                      <Tooltip title={`${project.progress || 0}% complete`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={project.progress || 0} 
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {`${project.progress || 0}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={project.status} 
                        color={getStatusChipColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="more"
                        onClick={(e) => handleOpenMenu(e, project.project_id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Project Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {currentProject ? 'Edit Project' : 'New Project'}
        </DialogTitle>
        <DialogContent>
          <ProjectForm
            project={currentProject}
            clients={clients}
            onSave={handleSaveProject}
            onCancel={() => setOpenForm(false)}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{currentProject?.project_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          handleViewProject(selectedProjectId);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          const project = projects.find(p => p.project_id === selectedProjectId);
          handleEditProject(project);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {/* Status update options */}
        <MenuItem onClick={() => handleUpdateStatus(selectedProjectId, 'In Progress')}>
          <ListItemIcon>
            <PlayArrowIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Mark as In Progress</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus(selectedProjectId, 'On Hold')}>
          <ListItemIcon>
            <PauseIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Mark as On Hold</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus(selectedProjectId, 'Completed')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Mark as Completed</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus(selectedProjectId, 'Cancelled')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Mark as Cancelled</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          const project = projects.find(p => p.project_id === selectedProjectId);
          handleDeleteClick(project);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Projects; 