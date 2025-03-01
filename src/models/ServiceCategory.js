const db = require('../database/connection');

class ServiceCategory {
  static async getAll() {
    try {
      const query = `
        SELECT sc.*, u.name as added_by_name 
        FROM service_categories sc
        LEFT JOIN users u ON sc.added_by_id = u.id
        ORDER BY sc.priority_number, sc.service_category_name
      `;
      
      const [results] = await db.query(query);
      return results;
    } catch (err) {
      console.error('Error fetching service categories:', err);
      throw err;
    }
  }

  static async getById(categoryId) {
    try {
      const query = `
        SELECT sc.*, u.name as added_by_name 
        FROM service_categories sc
        LEFT JOIN users u ON sc.added_by_id = u.id
        WHERE sc.service_category_id = ?
      `;
      
      const [results] = await db.query(query, [categoryId]);
      return results[0];
    } catch (err) {
      console.error('Error fetching service category by ID:', err);
      throw err;
    }
  }

  static async create(categoryData) {
    try {
      const query = `
        INSERT INTO service_categories 
        (service_category_name, priority_number, added_by_id, description) 
        VALUES (?, ?, ?, ?)
      `;
      
      const values = [
        categoryData.service_category_name,
        categoryData.priority_number,
        categoryData.added_by_id,
        categoryData.description
      ];
      
      const [result] = await db.query(query, values);
      return { service_category_id: result.insertId, ...categoryData };
    } catch (err) {
      console.error('Error creating service category:', err);
      throw err;
    }
  }

  static async update(categoryId, categoryData) {
    try {
      const query = `
        UPDATE service_categories 
        SET 
          service_category_name = ?,
          priority_number = ?,
          description = ?
        WHERE service_category_id = ?
      `;
      
      const values = [
        categoryData.service_category_name,
        categoryData.priority_number,
        categoryData.description,
        categoryId
      ];
      
      await db.query(query, values);
      return { service_category_id: categoryId, ...categoryData };
    } catch (err) {
      console.error('Error updating service category:', err);
      throw err;
    }
  }

  static async delete(categoryId) {
    try {
      // First check if there are any services using this category
      const checkQuery = 'SELECT COUNT(*) as count FROM services WHERE service_category_id = ?';
      
      const [checkResults] = await db.query(checkQuery, [categoryId]);
      
      if (checkResults[0].count > 0) {
        throw new Error('Cannot delete category that is in use by services');
      }
      
      // If no services are using this category, proceed with deletion
      const deleteQuery = 'DELETE FROM service_categories WHERE service_category_id = ?';
      
      const [result] = await db.query(deleteQuery, [categoryId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting service category:', err);
      throw err;
    }
  }
}

module.exports = ServiceCategory;