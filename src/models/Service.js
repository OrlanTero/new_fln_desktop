const db = require('../database/connection');

class Service {
  static async getAll() {
    try {
      const query = `
        SELECT s.*, sc.service_category_name 
        FROM services s
        LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
        ORDER BY s.service_name
      `;
      
      const [results] = await db.query(query);
      return results;
    } catch (err) {
      console.error('Error fetching services:', err);
      throw err;
    }
  }

  static async getById(serviceId) {
    try {
      const query = `
        SELECT s.*, sc.service_category_name 
        FROM services s
        LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
        WHERE s.service_id = ?
      `;
      
      const [results] = await db.query(query, [serviceId]);
      return results[0];
    } catch (err) {
      console.error('Error fetching service by ID:', err);
      throw err;
    }
  }

  static async getByCategoryId(categoryId) {
    try {
      const query = `
        SELECT s.*, sc.service_category_name 
        FROM services s
        LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
        WHERE s.service_category_id = ?
        ORDER BY s.service_name
      `;
      
      const [results] = await db.query(query, [categoryId]);
      return results;
    } catch (err) {
      console.error('Error fetching services by category ID:', err);
      throw err;
    }
  }

  static async create(serviceData) {
    try {
      const query = `
        INSERT INTO services 
        (service_category_id, service_name, price, remarks, timeline) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        serviceData.service_category_id,
        serviceData.service_name,
        serviceData.price,
        serviceData.remarks,
        serviceData.timeline
      ];
      
      const [result] = await db.query(query, values);
      return { service_id: result.insertId, ...serviceData };
    } catch (err) {
      console.error('Error creating service:', err);
      throw err;
    }
  }

  static async update(serviceId, serviceData) {
    try {
      const query = `
        UPDATE services 
        SET 
          service_category_id = ?,
          service_name = ?,
          price = ?,
          remarks = ?,
          timeline = ?
        WHERE service_id = ?
      `;
      
      const values = [
        serviceData.service_category_id,
        serviceData.service_name,
        serviceData.price,
        serviceData.remarks,
        serviceData.timeline,
        serviceId
      ];
      
      await db.query(query, values);
      return { service_id: serviceId, ...serviceData };
    } catch (err) {
      console.error('Error updating service:', err);
      throw err;
    }
  }

  static async delete(serviceId) {
    try {
      const query = 'DELETE FROM services WHERE service_id = ?';
      
      const [result] = await db.query(query, [serviceId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting service:', err);
      throw err;
    }
  }
}

module.exports = Service; 