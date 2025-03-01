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
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Engineering as EngineeringIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProposalWizard from '../../components/proposals/ProposalWizard';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Fetch proposals, clients, and services on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch proposals
      const proposalsResult = await window.api.getProposals();
      if (proposalsResult.success) {
        setProposals(proposalsResult.proposals);
      } else {
        throw new Error(proposalsResult.error || 'Failed to fetch proposals');
      }
      
      // Fetch clients for the form
      const clientsResult = await window.api.getClients();
      if (clientsResult.success) {
        setClients(clientsResult.clients);
      } else {
        throw new Error(clientsResult.error || 'Failed to fetch clients');
      }
      
      // Fetch services for the form
      const servicesResult = await window.api.getServices();
      if (servicesResult.success) {
        setServices(servicesResult.services);
      } else {
        throw new Error(servicesResult.error || 'Failed to fetch services');
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
  
  const handleOpenMenu = (event, proposalId) => {
    setAnchorEl(event.currentTarget);
    setSelectedProposalId(proposalId);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProposalId(null);
  };
  
  const handleAddProposal = () => {
    setCurrentProposal(null);
    setOpenForm(true);
  };
  
  const handleEditProposal = (proposal) => {
    setCurrentProposal(proposal);
    setOpenForm(true);
    handleCloseMenu();
  };
  
  const handleViewProposal = (proposalId) => {
    navigate(`/proposals/${proposalId}`);
    handleCloseMenu();
  };
  
  const handleDeleteClick = (proposal) => {
    setCurrentProposal(proposal);
    setOpenDelete(true);
    handleCloseMenu();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const result = await window.api.deleteProposal(currentProposal.proposal_id);
      if (result.success) {
        setProposals(proposals.filter(p => p.proposal_id !== currentProposal.proposal_id));
        setSnackbar({
          open: true,
          message: 'Proposal deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to delete proposal');
      }
    } catch (err) {
      console.error('Error deleting proposal:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setOpenDelete(false);
      setCurrentProposal(null);
    }
  };
  
  const handleSaveProposal = async (proposalData) => {
    try {
      let result;
      
      // Ensure the proposal status is set to 'Draft' if not specified
      const dataToSave = {
        ...proposalData,
        status: proposalData.status || 'Draft'
      };
      
      // Extract services from the proposal data if present
      const services = proposalData.services || [];
      
      if (currentProposal) {
        // Update existing proposal
        result = await window.api.updateProposal(
          currentProposal.proposal_id, 
          dataToSave
        );
        
        if (result.success) {
          // If there are services to save, save them
          if (services.length > 0) {
            // First remove all existing services
            await window.api.removeAllProposalServices(currentProposal.proposal_id);
            
            // Then add the new services
            for (const service of services) {
              await window.api.addProposalService(currentProposal.proposal_id, service);
            }
          }
          
          setProposals(proposals.map(p => 
            p.proposal_id === currentProposal.proposal_id ? result.proposal : p
          ));
          setSnackbar({
            open: true,
            message: 'Proposal updated successfully',
            severity: 'success'
          });
        } else {
          throw new Error(result.error || 'Failed to update proposal');
        }
      } else {
        // Create new proposal
        result = await window.api.createProposal(dataToSave);
        
        if (result.success) {
          // If there are services to save, save them
          if (services.length > 0) {
            for (const service of services) {
              await window.api.addProposalService(result.proposal.proposal_id, service);
            }
          }
          
          setProposals([...proposals, result.proposal]);
          setSnackbar({
            open: true,
            message: 'Proposal created successfully',
            severity: 'success'
          });
        } else {
          throw new Error(result.error || 'Failed to create proposal');
        }
      }
      
      return result;
    } catch (err) {
      console.error('Error saving proposal:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
      throw err;
    }
  };
  
  const handleSendProposal = async (emailData) => {
    try {
      const result = await window.api.sendProposalEmail(emailData);
      
      if (result.success) {
        // Update proposal status to 'Sent'
        await handleUpdateStatus(emailData.proposal.proposal_id, 'Sent');
        
        setSnackbar({
          open: true,
          message: 'Proposal sent successfully',
          severity: 'success'
        });
        
        return result;
      } else {
        throw new Error(result.error || 'Failed to send proposal email');
      }
    } catch (err) {
      console.error('Error sending proposal email:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
      throw err;
    }
  };
  
  const handleUpdateStatus = async (proposalId, newStatus) => {
    try {
      const result = await window.api.updateProposalStatus(proposalId, newStatus);
      
      if (result.success) {
        setProposals(proposals.map(p => 
          p.proposal_id === proposalId ? { ...p, status: newStatus } : p
        ));
        setSnackbar({
          open: true,
          message: `Proposal status updated to ${newStatus}`,
          severity: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to update proposal status');
      }
    } catch (err) {
      console.error('Error updating proposal status:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      handleCloseMenu();
    }
  };
  
  const handleCreateProject = async (proposalId) => {
    try {
      // Get the proposal details
      const proposalResult = await window.api.getProposalById(proposalId);
      
      if (!proposalResult.success) {
        throw new Error(proposalResult.error || 'Failed to fetch proposal details');
      }
      
      const proposal = proposalResult.proposal;
      
      // Create a new project from the proposal
      const projectData = {
        client_id: proposal.client_id,
        proposal_id: proposalId,
        project_name: `Project for ${proposal.proposal_name || proposal.proposal_title}`,
        description: proposal.description,
        start_date: new Date().toISOString().split('T')[0], // Today
        estimated_end_date: proposal.expected_completion_date,
        status: 'In Progress',
        created_by: user?.user_id || null
      };
      
      const result = await window.api.createProjectFromProposal(
        proposalId, 
        projectData,
        user?.user_id || null
      );
      
      if (result.success) {
        // Update the proposal status to 'Accepted'
        await handleUpdateStatus(proposalId, 'Accepted');
        
        setSnackbar({
          open: true,
          message: 'Project created successfully from proposal',
          severity: 'success'
        });
        
        // Navigate to the new project
        navigate(`/projects/${result.project.project_id}`);
      } else {
        throw new Error(result.error || 'Failed to create project from proposal');
      }
    } catch (err) {
      console.error('Error creating project from proposal:', err);
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
  
  const filteredProposals = proposals.filter(proposal => {
    const searchLower = searchTerm.toLowerCase();
    return (
      proposal.proposal_name?.toLowerCase().includes(searchLower) ||
      proposal.client_name?.toLowerCase().includes(searchLower) ||
      proposal.status?.toLowerCase().includes(searchLower)
    );
  });
  
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Sent':
        return 'info';
      case 'Accepted':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Expired':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Proposals
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProposal}
        >
          New Proposal
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search proposals..."
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
                <TableCell>Title</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No proposals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => (
                  <TableRow key={proposal.proposal_id}>
                    <TableCell>{proposal.proposal_name}</TableCell>
                    <TableCell>{proposal.client_name}</TableCell>
                    <TableCell>{formatDate(proposal.created_at)}</TableCell>
                    <TableCell>{formatDate(proposal.valid_until)}</TableCell>
                    <TableCell>{formatCurrency(proposal.total_amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={proposal.status} 
                        color={getStatusChipColor(proposal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="more"
                        onClick={(e) => handleOpenMenu(e, proposal.proposal_id)}
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
      
      {/* Proposal Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent>
          <ProposalWizard
            proposal={currentProposal}
            clients={clients}
            services={services}
            onSave={handleSaveProposal}
            onSend={handleSendProposal}
            onCancel={() => setOpenForm(false)}
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
            Are you sure you want to delete the proposal "{currentProposal?.proposal_name}"? This action cannot be undone.
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
          const proposal = proposals.find(p => p.proposal_id === selectedProposalId);
          handleViewProposal(selectedProposalId);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          const proposal = proposals.find(p => p.proposal_id === selectedProposalId);
          handleEditProposal(proposal);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {/* Status update options */}
        <MenuItem onClick={() => handleUpdateStatus(selectedProposalId, 'Sent')}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Sent</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus(selectedProposalId, 'Accepted')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Mark as Accepted</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus(selectedProposalId, 'Rejected')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Mark as Rejected</ListItemText>
        </MenuItem>
        
        {/* Create project option */}
        <MenuItem onClick={() => handleCreateProject(selectedProposalId)}>
          <ListItemIcon>
            <EngineeringIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Create Project</ListItemText>
        </MenuItem>
        
        {/* Add Send Proposal option to menu */}
        <MenuItem onClick={() => {
          const proposal = proposals.find(p => p.proposal_id === selectedProposalId);
          setCurrentProposal(proposal);
          setOpenForm(true);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EmailIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Send Proposal</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          const proposal = proposals.find(p => p.proposal_id === selectedProposalId);
          handleDeleteClick(proposal);
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

export default Proposals; 