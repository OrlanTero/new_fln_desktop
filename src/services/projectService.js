const Project = require('../models/Project');
const Service = require('../models/Service');

// Project operations
const getAllProjects = async () => {
  try {
    return await Project.getAll();
  } catch (error) {
    console.error('Error in projectService.getAllProjects:', error);
    throw error;
  }
};

const getProjectById = async (projectId) => {
  try {
    return await Project.getById(projectId);
  } catch (error) {
    console.error(`Error in projectService.getProjectById(${projectId}):`, error);
    throw error;
  }
};

const getProjectsByClientId = async (clientId) => {
  try {
    return await Project.getByClientId(clientId);
  } catch (error) {
    console.error(`Error in projectService.getProjectsByClientId(${clientId}):`, error);
    throw error;
  }
};

const getProjectByProposalId = async (proposalId) => {
  try {
    return await Project.getByProposalId(proposalId);
  } catch (error) {
    console.error(`Error in projectService.getProjectByProposalId(${proposalId}):`, error);
    throw error;
  }
};

const createProject = async (projectData) => {
  try {
    return await Project.create(projectData);
  } catch (error) {
    console.error('Error in projectService.createProject:', error);
    throw error;
  }
};

const updateProject = async (projectId, projectData) => {
  try {
    return await Project.update(projectId, projectData);
  } catch (error) {
    console.error(`Error in projectService.updateProject(${projectId}):`, error);
    throw error;
  }
};

const updateProjectStatus = async (projectId, status) => {
  try {
    return await Project.updateStatus(projectId, status);
  } catch (error) {
    console.error(`Error in projectService.updateProjectStatus(${projectId}):`, error);
    throw error;
  }
};

const deleteProject = async (projectId) => {
  try {
    return await Project.delete(projectId);
  } catch (error) {
    console.error(`Error in projectService.deleteProject(${projectId}):`, error);
    throw error;
  }
};

// Project services operations
const getProjectServices = async (projectId) => {
  try {
    return await Project.getProjectServices(projectId);
  } catch (error) {
    console.error(`Error in projectService.getProjectServices(${projectId}):`, error);
    throw error;
  }
};

const addProjectService = async (projectId, serviceData) => {
  try {
    // If price is not provided, get it from the service
    if (!serviceData.price) {
      const service = await Service.getById(serviceData.service_id);
      if (service) {
        // Use the appropriate price based on client type (if available)
        serviceData.price = service.corporation_partnership || 0;
      }
    }
    
    return await Project.addProjectService(projectId, serviceData);
  } catch (error) {
    console.error(`Error in projectService.addProjectService(${projectId}):`, error);
    throw error;
  }
};

const updateProjectService = async (projectServiceId, serviceData) => {
  try {
    return await Project.updateProjectService(projectServiceId, serviceData);
  } catch (error) {
    console.error(`Error in projectService.updateProjectService(${projectServiceId}):`, error);
    throw error;
  }
};

const updateProjectServiceStatus = async (projectServiceId, status) => {
  try {
    return await Project.updateProjectServiceStatus(projectServiceId, status);
  } catch (error) {
    console.error(`Error in projectService.updateProjectServiceStatus(${projectServiceId}):`, error);
    throw error;
  }
};

const removeProjectService = async (projectServiceId) => {
  try {
    return await Project.removeProjectService(projectServiceId);
  } catch (error) {
    console.error(`Error in projectService.removeProjectService(${projectServiceId}):`, error);
    throw error;
  }
};

const removeAllProjectServices = async (projectId) => {
  try {
    return await Project.removeAllProjectServices(projectId);
  } catch (error) {
    console.error(`Error in projectService.removeAllProjectServices(${projectId}):`, error);
    throw error;
  }
};

// Calculate project total
const calculateProjectTotal = async (projectId) => {
  try {
    const services = await Project.getProjectServices(projectId);
    let total = 0;
    
    for (const service of services) {
      total += service.price * service.quantity;
    }
    
    return { projectId, total };
  } catch (error) {
    console.error(`Error in projectService.calculateProjectTotal(${projectId}):`, error);
    throw error;
  }
};

// Calculate project progress
const calculateProjectProgress = async (projectId) => {
  try {
    const services = await Project.getProjectServices(projectId);
    
    if (services.length === 0) {
      return { projectId, progress: 0 };
    }
    
    let completedCount = 0;
    
    for (const service of services) {
      if (service.status === 'COMPLETED') {
        completedCount++;
      }
    }
    
    const progress = Math.round((completedCount / services.length) * 100);
    
    return { projectId, progress };
  } catch (error) {
    console.error(`Error in projectService.calculateProjectProgress(${projectId}):`, error);
    throw error;
  }
};

module.exports = {
  // Project operations
  getAllProjects,
  getProjectById,
  getProjectsByClientId,
  getProjectByProposalId,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  
  // Project services operations
  getProjectServices,
  addProjectService,
  updateProjectService,
  updateProjectServiceStatus,
  removeProjectService,
  removeAllProjectServices,
  
  // Utility functions
  calculateProjectTotal,
  calculateProjectProgress
}; 