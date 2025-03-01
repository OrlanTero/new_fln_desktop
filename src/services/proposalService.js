const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const Service = require('../models/Service');

// Proposal operations
const getAllProposals = async () => {
  try {
    return await Proposal.getAll();
  } catch (error) {
    console.error('Error in proposalService.getAllProposals:', error);
    throw error;
  }
};

const getProposalById = async (proposalId) => {
  try {
    return await Proposal.getById(proposalId);
  } catch (error) {
    console.error(`Error in proposalService.getProposalById(${proposalId}):`, error);
    throw error;
  }
};

const getProposalsByClientId = async (clientId) => {
  try {
    return await Proposal.getByClientId(clientId);
  } catch (error) {
    console.error(`Error in proposalService.getProposalsByClientId(${clientId}):`, error);
    throw error;
  }
};

const createProposal = async (proposalData) => {
  try {
    return await Proposal.create(proposalData);
  } catch (error) {
    console.error('Error in proposalService.createProposal:', error);
    throw error;
  }
};

const updateProposal = async (proposalId, proposalData) => {
  try {
    return await Proposal.update(proposalId, proposalData);
  } catch (error) {
    console.error(`Error in proposalService.updateProposal(${proposalId}):`, error);
    throw error;
  }
};

const updateProposalStatus = async (proposalId, status) => {
  try {
    return await Proposal.updateStatus(proposalId, status);
  } catch (error) {
    console.error(`Error in proposalService.updateProposalStatus(${proposalId}):`, error);
    throw error;
  }
};

const deleteProposal = async (proposalId) => {
  try {
    return await Proposal.delete(proposalId);
  } catch (error) {
    console.error(`Error in proposalService.deleteProposal(${proposalId}):`, error);
    throw error;
  }
};

// Proposal services operations
const getProposalServices = async (proposalId) => {
  try {
    return await Proposal.getProposalServices(proposalId);
  } catch (error) {
    console.error(`Error in proposalService.getProposalServices(${proposalId}):`, error);
    throw error;
  }
};

const addProposalService = async (proposalId, serviceData) => {
  try {
    // If price is not provided, get it from the service
    if (!serviceData.price) {
      const service = await Service.getById(serviceData.service_id);
      if (service) {
        // Use the appropriate price based on client type (if available)
        serviceData.price = service.corporation_partnership || 0;
      }
    }
    
    return await Proposal.addProposalService(proposalId, serviceData);
  } catch (error) {
    console.error(`Error in proposalService.addProposalService(${proposalId}):`, error);
    throw error;
  }
};

const updateProposalService = async (proposalServiceId, serviceData) => {
  try {
    return await Proposal.updateProposalService(proposalServiceId, serviceData);
  } catch (error) {
    console.error(`Error in proposalService.updateProposalService(${proposalServiceId}):`, error);
    throw error;
  }
};

const removeProposalService = async (proposalServiceId) => {
  try {
    return await Proposal.removeProposalService(proposalServiceId);
  } catch (error) {
    console.error(`Error in proposalService.removeProposalService(${proposalServiceId}):`, error);
    throw error;
  }
};

const removeAllProposalServices = async (proposalId) => {
  try {
    return await Proposal.removeAllProposalServices(proposalId);
  } catch (error) {
    console.error(`Error in proposalService.removeAllProposalServices(${proposalId}):`, error);
    throw error;
  }
};

// Project creation from proposal
const createProjectFromProposal = async (proposalId, projectData, userId) => {
  try {
    return await Project.createFromProposal(proposalId, projectData, userId);
  } catch (error) {
    console.error(`Error in proposalService.createProjectFromProposal(${proposalId}):`, error);
    throw error;
  }
};

// Calculate proposal total
const calculateProposalTotal = async (proposalId) => {
  try {
    const services = await Proposal.getProposalServices(proposalId);
    let total = 0;
    
    for (const service of services) {
      total += service.price * service.quantity;
    }
    
    return { proposalId, total };
  } catch (error) {
    console.error(`Error in proposalService.calculateProposalTotal(${proposalId}):`, error);
    throw error;
  }
};

module.exports = {
  // Proposal operations
  getAllProposals,
  getProposalById,
  getProposalsByClientId,
  createProposal,
  updateProposal,
  updateProposalStatus,
  deleteProposal,
  
  // Proposal services operations
  getProposalServices,
  addProposalService,
  updateProposalService,
  removeProposalService,
  removeAllProposalServices,
  
  // Project creation from proposal
  createProjectFromProposal,
  
  // Utility functions
  calculateProposalTotal
}; 