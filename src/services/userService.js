const User = require('../models/User');

class UserService {
  // Get user by email
  async getUserByEmail(email) {
    try {
      return await User.findByEmail(email);
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const user = await User.authenticate(email, password);
      return user ? user.toProfile() : null;
    } catch (error) {
      console.error('Error in authenticateUser:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await User.findById(id);
      return user ? user.toProfile() : null;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return user ? user.toProfile() : null;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return null;
      }
      
      const updated = await user.update(userData);
      return updated ? user.toProfile() : null;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return false;
      }
      
      return await user.delete();
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  // Get all users with pagination
  async getAllUsers(page = 1, limit = 10) {
    try {
      const users = await User.findAll(page, limit);
      return users.map(user => user.toProfile());
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const users = await User.findByRole(role);
      return users.map(user => user.toProfile());
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 