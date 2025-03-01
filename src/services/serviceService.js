const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequirement = require('../models/ServiceRequirement');

// Service operations
const getAllServices = async () => {
  try {
    return await Service.getAll();
  } catch (error) {
    console.error('Error in serviceService.getAllServices:', error);
    throw error;
  }
};

const getServiceById = async (serviceId) => {
  try {
    return await Service.getById(serviceId);
  } catch (error) {
    console.error(`Error in serviceService.getServiceById(${serviceId}):`, error);
    throw error;
  }
};

const getServicesByCategoryId = async (categoryId) => {
  try {
    return await Service.getByCategoryId(categoryId);
  } catch (error) {
    console.error(`Error in serviceService.getServicesByCategoryId(${categoryId}):`, error);
    throw error;
  }
};

const createService = async (serviceData) => {
  try {
    return await Service.create(serviceData);
  } catch (error) {
    console.error('Error in serviceService.createService:', error);
    throw error;
  }
};

const updateService = async (serviceId, serviceData) => {
  try {
    return await Service.update(serviceId, serviceData);
  } catch (error) {
    console.error(`Error in serviceService.updateService(${serviceId}):`, error);
    throw error;
  }
};

const deleteService = async (serviceId) => {
  try {
    return await Service.delete(serviceId);
  } catch (error) {
    console.error(`Error in serviceService.deleteService(${serviceId}):`, error);
    throw error;
  }
};

// Service Category operations
const getAllServiceCategories = async () => {
  try {
    return await ServiceCategory.getAll();
  } catch (error) {
    console.error('Error in serviceService.getAllServiceCategories:', error);
    throw error;
  }
};

const getServiceCategoryById = async (categoryId) => {
  try {
    return await ServiceCategory.getById(categoryId);
  } catch (error) {
    console.error(`Error in serviceService.getServiceCategoryById(${categoryId}):`, error);
    throw error;
  }
};

const createServiceCategory = async (categoryData) => {
  try {
    return await ServiceCategory.create(categoryData);
  } catch (error) {
    console.error('Error in serviceService.createServiceCategory:', error);
    throw error;
  }
};

const updateServiceCategory = async (categoryId, categoryData) => {
  try {
    return await ServiceCategory.update(categoryId, categoryData);
  } catch (error) {
    console.error(`Error in serviceService.updateServiceCategory(${categoryId}):`, error);
    throw error;
  }
};

const deleteServiceCategory = async (categoryId) => {
  try {
    return await ServiceCategory.delete(categoryId);
  } catch (error) {
    console.error(`Error in serviceService.deleteServiceCategory(${categoryId}):`, error);
    throw error;
  }
};

// Service Requirement operations
const getServiceRequirements = async (serviceId) => {
  try {
    return await ServiceRequirement.getAllByServiceId(serviceId);
  } catch (error) {
    console.error(`Error in serviceService.getServiceRequirements(${serviceId}):`, error);
    throw error;
  }
};

const getServiceRequirementById = async (requirementId) => {
  try {
    return await ServiceRequirement.getById(requirementId);
  } catch (error) {
    console.error(`Error in serviceService.getServiceRequirementById(${requirementId}):`, error);
    throw error;
  }
};

const createServiceRequirement = async (requirementData) => {
  try {
    return await ServiceRequirement.create(requirementData);
  } catch (error) {
    console.error('Error in serviceService.createServiceRequirement:', error);
    throw error;
  }
};

const updateServiceRequirement = async (requirementId, requirementData) => {
  try {
    return await ServiceRequirement.update(requirementId, requirementData);
  } catch (error) {
    console.error(`Error in serviceService.updateServiceRequirement(${requirementId}):`, error);
    throw error;
  }
};

const deleteServiceRequirement = async (requirementId) => {
  try {
    return await ServiceRequirement.delete(requirementId);
  } catch (error) {
    console.error(`Error in serviceService.deleteServiceRequirement(${requirementId}):`, error);
    throw error;
  }
};

const deleteAllServiceRequirements = async (serviceId) => {
  try {
    return await ServiceRequirement.deleteAllByServiceId(serviceId);
  } catch (error) {
    console.error(`Error in serviceService.deleteAllServiceRequirements(${serviceId}):`, error);
    throw error;
  }
};

module.exports = {
  // Service operations
  getAllServices,
  getServiceById,
  getServicesByCategoryId,
  createService,
  updateService,
  deleteService,
  
  // Service Category operations
  getAllServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  
  // Service Requirement operations
  getServiceRequirements,
  getServiceRequirementById,
  createServiceRequirement,
  updateServiceRequirement,
  deleteServiceRequirement,
  deleteAllServiceRequirements
}; 