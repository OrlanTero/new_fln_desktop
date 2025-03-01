const ClientType = require('../models/ClientType');

class ClientTypeService {
  // Get all client types
  async getAllClientTypes() {
    try {
      const types = await ClientType.findAll();
      return types.map(type => type.toJSON());
    } catch (error) {
      console.error('Error in getAllClientTypes:', error);
      throw error;
    }
  }

  // Get active client types
  async getActiveClientTypes() {
    try {
      const types = await ClientType.findActive();
      return types.map(type => type.toJSON());
    } catch (error) {
      console.error('Error in getActiveClientTypes:', error);
      throw error;
    }
  }

  // Get client type by ID
  async getClientTypeById(id) {
    try {
      const type = await ClientType.findById(id);
      return type ? type.toJSON() : null;
    } catch (error) {
      console.error('Error in getClientTypeById:', error);
      throw error;
    }
  }

  // Create new client type
  async createClientType(data) {
    try {
      const type = await ClientType.create(data);
      return type.toJSON();
    } catch (error) {
      console.error('Error in createClientType:', error);
      throw error;
    }
  }

  // Update client type
  async updateClientType(id, data) {
    try {
      const type = await ClientType.findById(id);
      if (!type) {
        return null;
      }
      await type.update(data);
      return type.toJSON();
    } catch (error) {
      console.error('Error in updateClientType:', error);
      throw error;
    }
  }

  // Delete client type
  async deleteClientType(id) {
    try {
      const type = await ClientType.findById(id);
      if (!type) {
        return false;
      }
      return await type.delete();
    } catch (error) {
      console.error('Error in deleteClientType:', error);
      throw error;
    }
  }
}

module.exports = new ClientTypeService(); 