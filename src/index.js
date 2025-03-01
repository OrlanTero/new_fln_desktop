const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const userService = require('./services/userService');
const clientTypeService = require('./services/clientTypeService');
const clientService = require('./services/clientService');
const serviceService = require('./services/serviceService');
const proposalService = require('./services/proposalService');
const projectService = require('./services/projectService');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools for debugging
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Register IPC handlers before creating the window
  
  // Service Category handlers
  ipcMain.handle('getServiceCategories', async () => {
    console.log('getServiceCategories handler called');
    try {
      const categories = await serviceService.getAllServiceCategories();
      console.log('Retrieved service categories:', categories);
      return { success: true, categories };
    } catch (error) {
      console.error('Error in getServiceCategories handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getServiceCategoryById', async (event, categoryId) => {
    console.log(`getServiceCategoryById handler called with ID: ${categoryId}`);
    try {
      const category = await serviceService.getServiceCategoryById(categoryId);
      console.log('Retrieved service category:', category);
      return { success: true, category };
    } catch (error) {
      console.error(`Error in getServiceCategoryById handler for ID ${categoryId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('createServiceCategory', async (event, categoryData) => {
    console.log('createServiceCategory handler called with data:', categoryData);
    try {
      const newCategory = await serviceService.createServiceCategory(categoryData);
      console.log('Created service category:', newCategory);
      return { success: true, category: newCategory };
    } catch (error) {
      console.error('Error in createServiceCategory handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateServiceCategory', async (event, { categoryId, categoryData }) => {
    console.log(`updateServiceCategory handler called for ID ${categoryId} with data:`, categoryData);
    try {
      const updatedCategory = await serviceService.updateServiceCategory(categoryId, categoryData);
      console.log('Updated service category:', updatedCategory);
      return { success: true, category: updatedCategory };
    } catch (error) {
      console.error(`Error in updateServiceCategory handler for ID ${categoryId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('deleteServiceCategory', async (event, categoryId) => {
    console.log(`deleteServiceCategory handler called for ID: ${categoryId}`);
    try {
      const result = await serviceService.deleteServiceCategory(categoryId);
      console.log(`Service category deletion result for ID ${categoryId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in deleteServiceCategory handler for ID ${categoryId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Service handlers
  ipcMain.handle('getServices', async () => {
    console.log('getServices handler called');
    try {
      const services = await serviceService.getAllServices();
      console.log('Retrieved services:', services);
      return { success: true, services };
    } catch (error) {
      console.error('Error in getServices handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getServiceById', async (event, serviceId) => {
    console.log(`getServiceById handler called with ID: ${serviceId}`);
    try {
      const service = await serviceService.getServiceById(serviceId);
      console.log('Retrieved service:', service);
      return { success: true, service };
    } catch (error) {
      console.error(`Error in getServiceById handler for ID ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getServicesByCategoryId', async (event, categoryId) => {
    console.log(`getServicesByCategoryId handler called with category ID: ${categoryId}`);
    try {
      const services = await serviceService.getServicesByCategoryId(categoryId);
      console.log(`Retrieved services for category ID ${categoryId}:`, services);
      return { success: true, services };
    } catch (error) {
      console.error(`Error in getServicesByCategoryId handler for category ID ${categoryId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('createService', async (event, serviceData) => {
    console.log('createService handler called with data:', serviceData);
    try {
      const newService = await serviceService.createService(serviceData);
      console.log('Created service:', newService);
      return { success: true, service: newService };
    } catch (error) {
      console.error('Error in createService handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateService', async (event, { serviceId, serviceData }) => {
    console.log(`updateService handler called for ID ${serviceId} with data:`, serviceData);
    try {
      const updatedService = await serviceService.updateService(serviceId, serviceData);
      console.log('Updated service:', updatedService);
      return { success: true, service: updatedService };
    } catch (error) {
      console.error(`Error in updateService handler for ID ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('deleteService', async (event, serviceId) => {
    console.log(`deleteService handler called for ID: ${serviceId}`);
    try {
      const result = await serviceService.deleteService(serviceId);
      console.log(`Service deletion result for ID ${serviceId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in deleteService handler for ID ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Service Requirement handlers
  ipcMain.handle('getServiceRequirements', async (event, serviceId) => {
    console.log(`getServiceRequirements handler called for service ID: ${serviceId}`);
    try {
      const requirements = await serviceService.getServiceRequirements(serviceId);
      console.log(`Retrieved requirements for service ID ${serviceId}:`, requirements);
      return { success: true, requirements };
    } catch (error) {
      console.error(`Error in getServiceRequirements handler for service ID ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getServiceRequirementById', async (event, requirementId) => {
    console.log(`getServiceRequirementById handler called with ID: ${requirementId}`);
    try {
      const requirement = await serviceService.getServiceRequirementById(requirementId);
      console.log('Retrieved service requirement:', requirement);
      return { success: true, requirement };
    } catch (error) {
      console.error(`Error in getServiceRequirementById handler for ID ${requirementId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('createServiceRequirement', async (event, requirementData) => {
    console.log('createServiceRequirement handler called with data:', requirementData);
    try {
      const newRequirement = await serviceService.createServiceRequirement(requirementData);
      console.log('Created service requirement:', newRequirement);
      return { success: true, requirement: newRequirement };
    } catch (error) {
      console.error('Error in createServiceRequirement handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateServiceRequirement', async (event, requirementId, requirementData) => {
    console.log(`updateServiceRequirement handler called for ID ${requirementId} with data:`, requirementData);
    try {
      const updatedRequirement = await serviceService.updateServiceRequirement(requirementId, requirementData);
      console.log('Updated service requirement:', updatedRequirement);
      return { success: true, requirement: updatedRequirement };
    } catch (error) {
      console.error(`Error in updateServiceRequirement handler for ID ${requirementId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('deleteServiceRequirement', async (event, requirementId) => {
    console.log(`deleteServiceRequirement handler called for ID: ${requirementId}`);
    try {
      const result = await serviceService.deleteServiceRequirement(requirementId);
      console.log(`Service requirement deletion result for ID ${requirementId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in deleteServiceRequirement handler for ID ${requirementId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('deleteAllServiceRequirements', async (event, serviceId) => {
    console.log(`deleteAllServiceRequirements handler called for service ID: ${serviceId}`);
    try {
      const result = await serviceService.deleteAllServiceRequirements(serviceId);
      console.log(`All service requirements deletion result for service ID ${serviceId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in deleteAllServiceRequirements handler for service ID ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // After the service requirement handlers, add the proposal handlers
  // Proposal handlers
  ipcMain.handle('getProposals', async () => {
    console.log('getProposals handler called');
    try {
      const proposals = await proposalService.getAllProposals();
      console.log('Retrieved proposals:', proposals);
      return { success: true, proposals };
    } catch (error) {
      console.error('Error in getProposals handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getProposalById', async (event, proposalId) => {
    console.log(`getProposalById handler called with ID: ${proposalId}`);
    try {
      const proposal = await proposalService.getProposalById(proposalId);
      console.log('Retrieved proposal:', proposal);
      return { success: true, proposal };
    } catch (error) {
      console.error(`Error in getProposalById handler for ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getProposalsByClientId', async (event, clientId) => {
    console.log(`getProposalsByClientId handler called with client ID: ${clientId}`);
    try {
      const proposals = await proposalService.getProposalsByClientId(clientId);
      console.log(`Retrieved proposals for client ID ${clientId}:`, proposals);
      return { success: true, proposals };
    } catch (error) {
      console.error(`Error in getProposalsByClientId handler for client ID ${clientId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('createProposal', async (event, proposalData) => {
    console.log('createProposal handler called with data:', proposalData);
    try {
      const newProposal = await proposalService.createProposal(proposalData);
      console.log('Created proposal:', newProposal);
      return { success: true, proposal: newProposal };
    } catch (error) {
      console.error('Error in createProposal handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProposal', async (event, { proposalId, proposalData }) => {
    console.log(`updateProposal handler called for ID ${proposalId} with data:`, proposalData);
    try {
      const updatedProposal = await proposalService.updateProposal(proposalId, proposalData);
      console.log('Updated proposal:', updatedProposal);
      return { success: true, proposal: updatedProposal };
    } catch (error) {
      console.error(`Error in updateProposal handler for ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProposalStatus', async (event, { proposalId, status }) => {
    console.log(`updateProposalStatus handler called for ID ${proposalId} with status: ${status}`);
    try {
      const result = await proposalService.updateProposalStatus(proposalId, status);
      console.log(`Proposal status update result for ID ${proposalId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in updateProposalStatus handler for ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('deleteProposal', async (event, proposalId) => {
    console.log(`deleteProposal handler called for ID: ${proposalId}`);
    try {
      const result = await proposalService.deleteProposal(proposalId);
      console.log(`Proposal deletion result for ID ${proposalId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in deleteProposal handler for ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Proposal services handlers
  ipcMain.handle('getProposalServices', async (event, proposalId) => {
    console.log(`getProposalServices handler called for proposal ID: ${proposalId}`);
    try {
      const services = await proposalService.getProposalServices(proposalId);
      console.log(`Retrieved services for proposal ID ${proposalId}:`, services);
      return { success: true, services };
    } catch (error) {
      console.error(`Error in getProposalServices handler for proposal ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('addProposalService', async (event, { proposalId, serviceData }) => {
    console.log(`addProposalService handler called for proposal ID ${proposalId} with data:`, serviceData);
    try {
      const newService = await proposalService.addProposalService(proposalId, serviceData);
      console.log('Added service to proposal:', newService);
      return { success: true, service: newService };
    } catch (error) {
      console.error(`Error in addProposalService handler for proposal ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProposalService', async (event, { proposalServiceId, serviceData }) => {
    console.log(`updateProposalService handler called for ID ${proposalServiceId} with data:`, serviceData);
    try {
      const updatedService = await proposalService.updateProposalService(proposalServiceId, serviceData);
      console.log('Updated proposal service:', updatedService);
      return { success: true, service: updatedService };
    } catch (error) {
      console.error(`Error in updateProposalService handler for ID ${proposalServiceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('removeProposalService', async (event, proposalServiceId) => {
    console.log(`removeProposalService handler called for ID: ${proposalServiceId}`);
    try {
      const result = await proposalService.removeProposalService(proposalServiceId);
      console.log(`Proposal service removal result for ID ${proposalServiceId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in removeProposalService handler for ID ${proposalServiceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('removeAllProposalServices', async (event, proposalId) => {
    console.log(`removeAllProposalServices handler called for proposal ID: ${proposalId}`);
    try {
      const result = await proposalService.removeAllProposalServices(proposalId);
      console.log(`All services removal result for proposal ID ${proposalId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in removeAllProposalServices handler for proposal ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('calculateProposalTotal', async (event, proposalId) => {
    console.log(`calculateProposalTotal handler called for proposal ID: ${proposalId}`);
    try {
      const result = await proposalService.calculateProposalTotal(proposalId);
      console.log(`Proposal total for ID ${proposalId}:`, result);
      return { success: true, total: result.total };
    } catch (error) {
      console.error(`Error in calculateProposalTotal handler for proposal ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Project handlers
  ipcMain.handle('getProjects', async () => {
    console.log('getProjects handler called');
    try {
      const projects = await projectService.getAllProjects();
      console.log('Retrieved projects:', projects);
      return { success: true, projects };
    } catch (error) {
      console.error('Error in getProjects handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getProjectById', async (event, projectId) => {
    console.log(`getProjectById handler called with ID: ${projectId}`);
    try {
      const project = await projectService.getProjectById(projectId);
      console.log('Retrieved project:', project);
      return { success: true, project };
    } catch (error) {
      console.error(`Error in getProjectById handler for ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getProjectsByClientId', async (event, clientId) => {
    console.log(`getProjectsByClientId handler called with client ID: ${clientId}`);
    try {
      const projects = await projectService.getProjectsByClientId(clientId);
      console.log(`Retrieved projects for client ID ${clientId}:`, projects);
      return { success: true, projects };
    } catch (error) {
      console.error(`Error in getProjectsByClientId handler for client ID ${clientId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('getProjectByProposalId', async (event, proposalId) => {
    console.log(`getProjectByProposalId handler called with proposal ID: ${proposalId}`);
    try {
      const project = await projectService.getProjectByProposalId(proposalId);
      console.log(`Retrieved project for proposal ID ${proposalId}:`, project);
      return { success: true, project };
    } catch (error) {
      console.error(`Error in getProjectByProposalId handler for proposal ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('createProject', async (event, projectData) => {
    console.log('createProject handler called with data:', projectData);
    try {
      const newProject = await projectService.createProject(projectData);
      console.log('Created project:', newProject);
      return { success: true, project: newProject };
    } catch (error) {
      console.error('Error in createProject handler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('createProjectFromProposal', async (event, { proposalId, projectData, userId }) => {
    console.log(`createProjectFromProposal handler called for proposal ID ${proposalId} with data:`, projectData);
    try {
      const newProject = await proposalService.createProjectFromProposal(proposalId, projectData, userId);
      console.log('Created project from proposal:', newProject);
      return { success: true, project: newProject };
    } catch (error) {
      console.error(`Error in createProjectFromProposal handler for proposal ID ${proposalId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProject', async (event, { projectId, projectData }) => {
    console.log(`updateProject handler called for ID ${projectId} with data:`, projectData);
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);
      console.log('Updated project:', updatedProject);
      return { success: true, project: updatedProject };
    } catch (error) {
      console.error(`Error in updateProject handler for ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProjectStatus', async (event, { projectId, status }) => {
    console.log(`updateProjectStatus handler called for ID ${projectId} with status: ${status}`);
    try {
      const result = await projectService.updateProjectStatus(projectId, status);
      console.log(`Project status update result for ID ${projectId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in updateProjectStatus handler for ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('deleteProject', async (event, projectId) => {
    console.log(`deleteProject handler called for ID: ${projectId}`);
    try {
      const result = await projectService.deleteProject(projectId);
      console.log(`Project deletion result for ID ${projectId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in deleteProject handler for ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Project services handlers
  ipcMain.handle('getProjectServices', async (event, projectId) => {
    console.log(`getProjectServices handler called for project ID: ${projectId}`);
    try {
      const services = await projectService.getProjectServices(projectId);
      console.log(`Retrieved services for project ID ${projectId}:`, services);
      return { success: true, services };
    } catch (error) {
      console.error(`Error in getProjectServices handler for project ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('addProjectService', async (event, { projectId, serviceData }) => {
    console.log(`addProjectService handler called for project ID ${projectId} with data:`, serviceData);
    try {
      const newService = await projectService.addProjectService(projectId, serviceData);
      console.log('Added service to project:', newService);
      return { success: true, service: newService };
    } catch (error) {
      console.error(`Error in addProjectService handler for project ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProjectService', async (event, { projectServiceId, serviceData }) => {
    console.log(`updateProjectService handler called for ID ${projectServiceId} with data:`, serviceData);
    try {
      const updatedService = await projectService.updateProjectService(projectServiceId, serviceData);
      console.log('Updated project service:', updatedService);
      return { success: true, service: updatedService };
    } catch (error) {
      console.error(`Error in updateProjectService handler for ID ${projectServiceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('updateProjectServiceStatus', async (event, { projectServiceId, status }) => {
    console.log(`updateProjectServiceStatus handler called for ID ${projectServiceId} with status: ${status}`);
    try {
      const result = await projectService.updateProjectServiceStatus(projectServiceId, status);
      console.log(`Project service status update result for ID ${projectServiceId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in updateProjectServiceStatus handler for ID ${projectServiceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('removeProjectService', async (event, projectServiceId) => {
    console.log(`removeProjectService handler called for ID: ${projectServiceId}`);
    try {
      const result = await projectService.removeProjectService(projectServiceId);
      console.log(`Project service removal result for ID ${projectServiceId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in removeProjectService handler for ID ${projectServiceId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('removeAllProjectServices', async (event, projectId) => {
    console.log(`removeAllProjectServices handler called for project ID: ${projectId}`);
    try {
      const result = await projectService.removeAllProjectServices(projectId);
      console.log(`All services removal result for project ID ${projectId}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`Error in removeAllProjectServices handler for project ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('calculateProjectTotal', async (event, projectId) => {
    console.log(`calculateProjectTotal handler called for project ID: ${projectId}`);
    try {
      const result = await projectService.calculateProjectTotal(projectId);
      console.log(`Project total for ID ${projectId}:`, result);
      return { success: true, total: result.total };
    } catch (error) {
      console.error(`Error in calculateProjectTotal handler for project ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('calculateProjectProgress', async (event, projectId) => {
    console.log(`calculateProjectProgress handler called for project ID: ${projectId}`);
    try {
      const result = await projectService.calculateProjectProgress(projectId);
      console.log(`Project progress for ID ${projectId}:`, result);
      return { success: true, progress: result.progress };
    } catch (error) {
      console.error(`Error in calculateProjectProgress handler for project ID ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Now create the window
  createWindow();
  
  // Register other IPC handlers
  ipcMain.handle('getClientTypes', async () => {
    console.log('getClientTypes handler called');
    try {
      const clientTypes = await clientTypeService.getAllClientTypes();
      console.log('Retrieved client types:', clientTypes);
      return { success: true, clientTypes };
    } catch (error) {
      console.error('Error in getClientTypes handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Create client type
  ipcMain.handle('createClientType', async (event, data) => {
    console.log('createClientType handler called with data:', data);
    try {
      const clientType = await clientTypeService.createClientType(data);
      console.log('Created client type:', clientType);
      return { success: true, clientType };
    } catch (error) {
      console.error('Error in createClientType handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Update client type
  ipcMain.handle('updateClientType', async (event, id, data) => {
    console.log(`updateClientType handler called for id ${id} with data:`, data);
    try {
      const clientType = await clientTypeService.updateClientType(id, data);
      if (!clientType) {
        return { success: false, error: 'Client type not found' };
      }
      console.log('Updated client type:', clientType);
      return { success: true, clientType };
    } catch (error) {
      console.error('Error in updateClientType handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete client type
  ipcMain.handle('deleteClientType', async (event, id) => {
    console.log(`deleteClientType handler called for id ${id}`);
    try {
      const result = await clientTypeService.deleteClientType(id);
      if (!result) {
        return { success: false, error: 'Client type not found or could not be deleted' };
      }
      console.log('Deleted client type with id:', id);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteClientType handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Clients handlers
  ipcMain.handle('getClients', async (event, options = {}) => {
    console.log('getClients handler called with options:', options);
    try {
      const clients = await clientService.getAllClients(options);
      console.log(`Retrieved ${clients.length} clients`);
      return { success: true, clients };
    } catch (error) {
      console.error('Error in getClients handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Get client by ID
  ipcMain.handle('getClientById', async (event, id) => {
    console.log(`getClientById handler called for id ${id}`);
    try {
      const client = await clientService.getClientById(id);
      if (!client) {
        return { success: false, error: 'Client not found' };
      }
      return { success: true, client };
    } catch (error) {
      console.error('Error in getClientById handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Create client
  ipcMain.handle('createClient', async (event, data) => {
    console.log('createClient handler called with data:', data);
    try {
      const client = await clientService.createClient(data);
      console.log('Created client:', client);
      return { success: true, client };
    } catch (error) {
      console.error('Error in createClient handler:', error);
      return { success: false, error: error.message };
    }
  });

  // Update client
  ipcMain.handle('updateClient', async (event, id, data) => {
    console.log(`updateClient handler called for id ${id} with data:`, data);
    try {
      const client = await clientService.updateClient(id, data);
      if (!client) {
        return { success: false, error: 'Client not found' };
      }
      console.log('Updated client:', client);
      return { success: true, client };
    } catch (error) {
      console.error('Error in updateClient handler:', error);
      return { success: false, error: error.message };
    }
  });
});