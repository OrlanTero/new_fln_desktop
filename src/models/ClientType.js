const db = require('../config/db');

class ClientType {
  constructor(data) {
    this.type_id = data.type_id;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  toJSON() {
    return {
      id: this.type_id,
      name: this.name,
      description: this.description,
      status: this.status
    };
  }

  // Find client type by ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM client_types WHERE type_id = ?',
        [id]
      );
      return rows[0] ? new ClientType(rows[0]) : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Get all client types
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM client_types ORDER BY name'
      );
      return rows.map(row => new ClientType(row));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Get active client types
  static async findActive() {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM client_types WHERE status = 'active' ORDER BY name"
      );
      return rows.map(row => new ClientType(row));
    } catch (error) {
      console.error('Error in findActive:', error);
      throw error;
    }
  }

  // Create new client type
  static async create(data) {
    try {
      const [result] = await db.execute(
        'INSERT INTO client_types (name, description, status) VALUES (?, ?, ?)',
        [data.name, data.description, data.status || 'active']
      );
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Update client type
  async update(data) {
    try {
      await db.execute(
        'UPDATE client_types SET name = ?, description = ?, status = ? WHERE type_id = ?',
        [data.name, data.description, data.status, this.type_id]
      );
      Object.assign(this, data);
      return this;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Delete client type
  async delete() {
    try {
      const [result] = await db.execute(
        'DELETE FROM client_types WHERE type_id = ?',
        [this.type_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  // Toggle status
  async toggleStatus() {
    try {
      const newStatus = this.status === 'active' ? 'inactive' : 'active';
      const [result] = await db.execute(
        'UPDATE client_types SET status = ? WHERE type_id = ?',
        [newStatus, this.type_id]
      );
      if (result.affectedRows) {
        this.status = newStatus;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in toggleStatus:', error);
      throw error;
    }
  }
}

module.exports = ClientType; 