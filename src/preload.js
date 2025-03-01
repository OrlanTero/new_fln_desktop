// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Client Types API
    getClientTypes: () => ipcRenderer.invoke('getClientTypes'),
    createClientType: (data) => ipcRenderer.invoke('createClientType', data),
    updateClientType: (id, data) => ipcRenderer.invoke('updateClientType', id, data),
    deleteClientType: (id) => ipcRenderer.invoke('deleteClientType', id),
    
    // Clients API
    getClients: (options) => ipcRenderer.invoke('getClients', options),
    getClientById: (id) => ipcRenderer.invoke('getClientById', id),
    createClient: (data) => ipcRenderer.invoke('createClient', data),
    updateClient: (id, data) => ipcRenderer.invoke('updateClient', id, data),
    deleteClient: (id) => ipcRenderer.invoke('deleteClient', id),
    toggleClientStatus: (id) => ipcRenderer.invoke('toggleClientStatus', id),
    
    // User API
    login: (email, password) => ipcRenderer.invoke('user:login', { email, password }),
    logout: () => ipcRenderer.invoke('user:logout'),
    getProfile: (userId) => ipcRenderer.invoke('user:getProfile', userId),
    updateProfile: (userId, data) => ipcRenderer.invoke('user:updateProfile', userId, data),
    
    // User Management API
    getUsers: () => ipcRenderer.invoke('getUsers'),
    getUserById: (id) => ipcRenderer.invoke('getUserById', id),
    createUser: (data) => ipcRenderer.invoke('createUser', data),
    updateUser: (id, data) => ipcRenderer.invoke('updateUser', id, data),
    deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),
    getUsersByRole: (role) => ipcRenderer.invoke('getUsersByRole', role),
    
    // Service Category API
    getServiceCategories: () => ipcRenderer.invoke('getServiceCategories'),
    getServiceCategoryById: (id) => ipcRenderer.invoke('getServiceCategoryById', id),
    createServiceCategory: (data) => ipcRenderer.invoke('createServiceCategory', data),
    updateServiceCategory: (id, data) => ipcRenderer.invoke('updateServiceCategory', { categoryId: id, categoryData: data }),
    deleteServiceCategory: (id) => ipcRenderer.invoke('deleteServiceCategory', id),
    
    // Service API
    getServices: () => ipcRenderer.invoke('getServices'),
    getServiceById: (id) => ipcRenderer.invoke('getServiceById', id),
    getServicesByCategoryId: (categoryId) => ipcRenderer.invoke('getServicesByCategoryId', categoryId),
    createService: (data) => ipcRenderer.invoke('createService', data),
    updateService: (id, data) => ipcRenderer.invoke('updateService', { serviceId: id, serviceData: data }),
    deleteService: (id) => ipcRenderer.invoke('deleteService', id),
    
    // Service Requirement API
    getServiceRequirements: (serviceId) => ipcRenderer.invoke('getServiceRequirements', serviceId),
    getServiceRequirementById: (id) => ipcRenderer.invoke('getServiceRequirementById', id),
    createServiceRequirement: (data) => ipcRenderer.invoke('createServiceRequirement', data),
    updateServiceRequirement: (id, data) => ipcRenderer.invoke('updateServiceRequirement', id, data),
    deleteServiceRequirement: (id) => ipcRenderer.invoke('deleteServiceRequirement', id),
    deleteAllServiceRequirements: (serviceId) => ipcRenderer.invoke('deleteAllServiceRequirements', serviceId),
    
    // Proposal API
    getProposals: () => ipcRenderer.invoke('getProposals'),
    getProposalById: (id) => ipcRenderer.invoke('getProposalById', id),
    getProposalsByClientId: (clientId) => ipcRenderer.invoke('getProposalsByClientId', clientId),
    createProposal: (data) => ipcRenderer.invoke('createProposal', data),
    updateProposal: (id, data) => ipcRenderer.invoke('updateProposal', { proposalId: id, proposalData: data }),
    updateProposalStatus: (id, status) => ipcRenderer.invoke('updateProposalStatus', { proposalId: id, status }),
    deleteProposal: (id) => ipcRenderer.invoke('deleteProposal', id),
    
    // Proposal Services API
    getProposalServices: (proposalId) => ipcRenderer.invoke('getProposalServices', proposalId),
    addProposalService: (proposalId, serviceData) => ipcRenderer.invoke('addProposalService', { proposalId, serviceData }),
    updateProposalService: (id, serviceData) => ipcRenderer.invoke('updateProposalService', { proposalServiceId: id, serviceData }),
    removeProposalService: (id) => ipcRenderer.invoke('removeProposalService', id),
    removeAllProposalServices: (proposalId) => ipcRenderer.invoke('removeAllProposalServices', proposalId),
    calculateProposalTotal: (proposalId) => ipcRenderer.invoke('calculateProposalTotal', proposalId),
    
    // Project API
    getProjects: () => ipcRenderer.invoke('getProjects'),
    getProjectById: (id) => ipcRenderer.invoke('getProjectById', id),
    getProjectsByClientId: (clientId) => ipcRenderer.invoke('getProjectsByClientId', clientId),
    getProjectByProposalId: (proposalId) => ipcRenderer.invoke('getProjectByProposalId', proposalId),
    createProject: (data) => ipcRenderer.invoke('createProject', data),
    createProjectFromProposal: (proposalId, projectData, userId) => ipcRenderer.invoke('createProjectFromProposal', { proposalId, projectData, userId }),
    updateProject: (id, data) => ipcRenderer.invoke('updateProject', { projectId: id, projectData: data }),
    updateProjectStatus: (id, status) => ipcRenderer.invoke('updateProjectStatus', { projectId: id, status }),
    deleteProject: (id) => ipcRenderer.invoke('deleteProject', id),
    
    // Project Services API
    getProjectServices: (projectId) => ipcRenderer.invoke('getProjectServices', projectId),
    addProjectService: (projectId, serviceData) => ipcRenderer.invoke('addProjectService', { projectId, serviceData }),
    updateProjectService: (id, serviceData) => ipcRenderer.invoke('updateProjectService', { projectServiceId: id, serviceData }),
    updateProjectServiceStatus: (id, status) => ipcRenderer.invoke('updateProjectServiceStatus', { projectServiceId: id, status }),
    removeProjectService: (id) => ipcRenderer.invoke('removeProjectService', id),
    removeAllProjectServices: (projectId) => ipcRenderer.invoke('removeAllProjectServices', projectId),
    calculateProjectTotal: (projectId) => ipcRenderer.invoke('calculateProjectTotal', projectId),
    calculateProjectProgress: (projectId) => ipcRenderer.invoke('calculateProjectProgress', projectId),
    
    // Document API
    generateProposalDocument: (documentData) => ipcRenderer.invoke('generateProposalDocument', documentData),
    getDocumentById: (id) => ipcRenderer.invoke('getDocumentById', id),
    getDocumentsByProposalId: (proposalId) => ipcRenderer.invoke('getDocumentsByProposalId', proposalId),
    getDocumentContent: (id) => ipcRenderer.invoke('getDocumentContent', id),
    deleteDocument: (id) => ipcRenderer.invoke('deleteDocument', id),
    
    // Email API
    sendProposalEmail: (emailData) => ipcRenderer.invoke('sendProposalEmail', emailData),
    getEmailsByProposalId: (proposalId) => ipcRenderer.invoke('getEmailsByProposalId', proposalId),
    
    // Attachment API
    uploadAttachment: (filePath) => ipcRenderer.invoke('uploadAttachment', filePath),
    getAttachmentById: (id) => ipcRenderer.invoke('getAttachmentById', id),
    deleteAttachment: (id) => ipcRenderer.invoke('deleteAttachment', id),
    
    // Company API
    getCompanyInfo: () => ipcRenderer.invoke('getCompanyInfo'),
    updateCompanyInfo: (data) => ipcRenderer.invoke('updateCompanyInfo', data),
    
    // Database API
    getDatabaseStatus: () => ipcRenderer.invoke('db:status'),
});
