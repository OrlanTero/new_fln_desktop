const Client = require('../models/Client');

class ClientService {
  // Get all clients with pagination and filters
  async getAllClients(options = {}) {
    try {
      const clients = await Client.findAll(options);
      return clients;
    } catch (error) {
      console.error('Error in getAllClients:', error);
      throw error;
    }
  }

  // Get client by ID
  async getClientById(id) {
    try {
      const client = await Client.findById(id);
      return client;
    } catch (error) {
      console.error('Error in getClientById:', error);
      throw error;
    }
  }

  // Create new client
  async createClient(data) {
    try {
      const client = await Client.create(data);
      return client;
    } catch (error) {
      console.error('Error in createClient:', error);
      throw error;
    }
  }

  // Update client
  async updateClient(id, data) {
    try {
      const client = await Client.findById(id);
      if (!client) {
        return null;
      }
      await client.update(data);
      
      // Fetch the updated client to get the updated client_type data
      const updatedClient = await Client.findById(id);
      return updatedClient;
    } catch (error) {
      console.error('Error in updateClient:', error);
      throw error;
    }
  }

  // Delete client
  async deleteClient(id) {
    try {
      const client = await Client.findById(id);
      if (!client) {
        return false;
      }
      return await client.delete();
    } catch (error) {
      console.error('Error in deleteClient:', error);
      throw error;
    }
  }

  // Toggle client status
  async toggleClientStatus(id) {
    try {
      const client = await Client.findById(id);
      if (!client) {
        return null;
      }
      await client.toggleStatus();
      return client;
    } catch (error) {
      console.error('Error in toggleClientStatus:', error);
      throw error;
    }
  }

  // Get client count by type
  async getClientCountByType() {
    try {
      return await Client.getCountByType();
    } catch (error) {
      console.error('Error in getClientCountByType:', error);
      throw error;
    }
  }
}

module.exports = new ClientService(); 