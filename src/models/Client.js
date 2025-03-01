const db = require('../config/db');
const ClientType = require('./ClientType');

class Client {
  constructor(data) {
    this.client_id = data.client_id;
    this.client_name = data.client_name;
    this.company = data.company;
    this.branch = data.branch;
    this.address = data.address;
    this.address2 = data.address2;
    this.tax_type = data.tax_type;
    this.account_for = data.account_for;
    this.rdo = data.rdo;
    this.email_address = data.email_address;
    this.description = data.description;
    this.date_created = data.date_created;
    this.client_type_id = data.client_type_id;
    this.status = data.status;
    this.client_type = data.client_type;
  }

  // Find client by ID with client type
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT c.*, ct.name as type_name, ct.description as type_description 
         FROM clients c 
         LEFT JOIN client_types ct ON c.client_type_id = ct.type_id 
         WHERE c.client_id = ?`,
        [id]
      );
      if (!rows[0]) return null;
      
      const client = new Client(rows[0]);
      if (rows[0].type_name) {
        client.client_type = {
          type_id: client.client_type_id,
          name: rows[0].type_name,
          description: rows[0].type_description
        };
      }
      return client;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Get all clients with pagination and filters
  static async findAll(options = {}) {
    try {
      let query = `
        SELECT c.*, ct.name as type_name, ct.description as type_description 
        FROM clients c 
        LEFT JOIN client_types ct ON c.client_type_id = ct.type_id 
        WHERE 1=1
      `;
      const params = [];

      if (options.status) {
        query += ' AND c.status = ?';
        params.push(options.status);
      }

      if (options.client_type_id) {
        query += ' AND c.client_type_id = ?';
        params.push(options.client_type_id);
      }

      if (options.search) {
        query += ` AND (
          c.client_name LIKE ? OR 
          c.company LIKE ? OR 
          c.email_address LIKE ?
        )`;
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      query += ' ORDER BY c.client_name LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.execute(query, params);
      
      return rows.map(row => {
        const client = new Client(row);
        if (row.type_name) {
          client.client_type = {
            type_id: client.client_type_id,
            name: row.type_name,
            description: row.type_description
          };
        }
        return client;
      });
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Create new client
  static async create(data) {
    try {
      const [result] = await db.execute(
        `INSERT INTO clients (
          client_name, company, branch, address, address2,
          tax_type, account_for, rdo, email_address,
          description, client_type_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.client_name,
          data.company,
          data.branch,
          data.address,
          data.address2,
          data.tax_type,
          data.account_for,
          data.rdo,
          data.email_address,
          data.description,
          data.client_type_id,
          data.status || 'active'
        ]
      );
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Update client
  async update(data) {
    try {
      const [result] = await db.execute(
        `UPDATE clients SET 
          client_name = ?, company = ?, branch = ?,
          address = ?, address2 = ?, tax_type = ?,
          account_for = ?, rdo = ?, email_address = ?,
          description = ?, client_type_id = ?, status = ?
         WHERE client_id = ?`,
        [
          data.client_name,
          data.company,
          data.branch,
          data.address,
          data.address2,
          data.tax_type,
          data.account_for,
          data.rdo,
          data.email_address,
          data.description,
          data.client_type_id,
          data.status,
          this.client_id
        ]
      );
      if (result.affectedRows) {
        Object.assign(this, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Delete client
  async delete() {
    try {
      const [result] = await db.execute(
        'DELETE FROM clients WHERE client_id = ?',
        [this.client_id]
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
        'UPDATE clients SET status = ? WHERE client_id = ?',
        [newStatus, this.client_id]
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

  // Get client count by type
  static async getCountByType() {
    try {
      const [rows] = await db.execute(`
        SELECT ct.name, COUNT(c.client_id) as count 
        FROM client_types ct 
        LEFT JOIN clients c ON ct.type_id = c.client_type_id 
        GROUP BY ct.type_id, ct.name
      `);
      return rows;
    } catch (error) {
      console.error('Error in getCountByType:', error);
      throw error;
    }
  }
}

module.exports = Client; 