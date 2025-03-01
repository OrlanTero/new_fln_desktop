const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.photo_url = data.photo_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );
      return rows[0] ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      console.log('Searching for user with email:', email);
      const [rows] = await db.execute(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );
      console.log('Found user:', rows[0] || 'No user found');
      return rows[0] ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await db.execute(
        `INSERT INTO users (name, email, password, role, photo_url)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userData.name,
          userData.email,
          hashedPassword,
          userData.role || 'user',
          userData.photo_url || null
        ]
      );
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Update user
  async update(updateData) {
    try {
      const updates = [];
      const values = [];

      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'password') {
          updates.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (updateData.password) {
        updates.push('password = ?');
        values.push(await bcrypt.hash(updateData.password, 10));
      }

      values.push(this.id);

      const [result] = await db.execute(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        values
      );

      if (result.affectedRows) {
        Object.assign(this, updateData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Delete user
  async delete() {
    try {
      const [result] = await db.execute(
        'DELETE FROM users WHERE id = ?',
        [this.id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      console.log('Verifying password for user:', this.email);
      console.log('Stored hash:', this.password);
      const isValid = await bcrypt.compare(password, this.password);
      console.log('Password valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      throw error;
    }
  }

  // Get user profile (excluding sensitive data)
  toProfile() {
    const { password, ...profile } = this;
    return profile;
  }

  // Static method to authenticate user
  static async authenticate(email, password) {
    try {
      console.log('Attempting authentication for email:', email);
      const user = await this.findByEmail(email);
      
      if (!user) {
        console.log('No user found with email:', email);
        return null;
      }

      const isValid = await user.verifyPassword(password);
      console.log('Password verification result:', isValid);
      
      return isValid ? user : null;
    } catch (error) {
      console.error('Error in authenticate:', error);
      throw error;
    }
  }

  // Get all users (with pagination)
  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const [rows] = await db.execute(
        `SELECT * FROM users
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows.map(row => new User(row));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Get users by role
  static async findByRole(role) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM users WHERE role = ?`,
        [role]
      );
      return rows.map(row => new User(row));
    } catch (error) {
      console.error('Error in findByRole:', error);
      throw error;
    }
  }
}

module.exports = User; 