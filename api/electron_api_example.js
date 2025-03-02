// Example code for Electron app to connect to the API
const { net } = require('electron');
// Alternatively, you can use the Node.js http module:
// const http = require('http');

// Base URL for the API
const API_BASE_URL = 'http://localhost:4005';

/**
 * Make a request to the API
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Data to send (for POST and PUT requests)
 * @returns {Promise} - Promise that resolves with the response data
 */
function makeApiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: method,
      url: `${API_BASE_URL}${endpoint}`
    });

    // Set headers
    request.setHeader('Content-Type', 'application/json');
    
    // Handle response
    request.on('response', (response) => {
      let responseData = '';
      
      response.on('data', (chunk) => {
        responseData += chunk.toString();
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: response.statusCode,
            data: jsonData
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    // Handle errors
    request.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    // Send data for POST and PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
      request.write(JSON.stringify(data));
    }
    
    // End the request
    request.end();
  });
}

// Example functions for your Electron app

/**
 * Get all client types
 * @returns {Promise} - Promise that resolves with the client types data
 */
async function getClientTypes() {
  try {
    const response = await makeApiRequest('/clients/types');
    return response.data;
  } catch (error) {
    console.error('Error fetching client types:', error);
    throw error;
  }
}

/**
 * Get all services
 * @returns {Promise} - Promise that resolves with the services data
 */
async function getAllServices() {
  try {
    const response = await makeApiRequest('/services');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

/**
 * Get service categories
 * @returns {Promise} - Promise that resolves with the service categories data
 */
async function getServiceCategories() {
  try {
    const response = await makeApiRequest('/services/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}

/**
 * Get a single service by ID
 * @param {number} id - Service ID
 * @returns {Promise} - Promise that resolves with the service data
 */
async function getServiceById(id) {
  try {
    const response = await makeApiRequest(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new service
 * @param {object} serviceData - Service data
 * @returns {Promise} - Promise that resolves with the created service data
 */
async function createService(serviceData) {
  try {
    const response = await makeApiRequest('/services', 'POST', serviceData);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

/**
 * Update a service
 * @param {number} id - Service ID
 * @param {object} serviceData - Service data
 * @returns {Promise} - Promise that resolves with the updated service data
 */
async function updateService(id, serviceData) {
  try {
    const response = await makeApiRequest(`/services/${id}`, 'PUT', serviceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a service
 * @param {number} id - Service ID
 * @returns {Promise} - Promise that resolves with the response data
 */
async function deleteService(id) {
  try {
    const response = await makeApiRequest(`/services/${id}`, 'DELETE');
    return response.data;
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw error;
  }
}

// Example usage in your Electron app
// You would typically call these functions from your renderer process

// Example: Get all services
// getAllServices()
//   .then(data => {
//     console.log('Services:', data);
//     // Update your UI with the services data
//   })
//   .catch(error => {
//     console.error('Failed to get services:', error);
//     // Show error message to the user
//   });

// Export the functions for use in your Electron app
module.exports = {
  getAllServices,
  getServiceCategories,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getClientTypes
}; 