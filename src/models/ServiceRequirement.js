const db = require('../database/connection');

// Create the table if it doesn't exist
async function createTableIfNotExists() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS service_requirements (
        requirement_id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        requirement VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
      )
    `;
    
    await db.query(query);
    console.log('Service requirements table created or already exists');
  } catch (err) {
    console.error('Error creating service requirements table:', err);
    throw err;
  }
}

// Call this function when the module is loaded
createTableIfNotExists();

class ServiceRequirement {
  static async getAllByServiceId(serviceId) {
    try {
      const query = `
        SELECT * FROM service_requirements
        WHERE service_id = ?
        ORDER BY requirement_id
      `;
      
      const [results] = await db.query(query, [serviceId]);
      return results;
    } catch (err) {
      console.error(`Error fetching requirements for service ID ${serviceId}:`, err);
      throw err;
    }
  }

  static async getById(requirementId) {
    try {
      const query = `
        SELECT * FROM service_requirements
        WHERE requirement_id = ?
      `;
      
      const [results] = await db.query(query, [requirementId]);
      return results[0];
    } catch (err) {
      console.error(`Error fetching requirement by ID ${requirementId}:`, err);
      throw err;
    }
  }

  static async create(requirementData) {
    try {
      const query = `
        INSERT INTO service_requirements 
        (service_id, requirement) 
        VALUES (?, ?)
      `;
      
      const values = [
        requirementData.service_id,
        requirementData.requirement
      ];
      
      const [result] = await db.query(query, values);
      return { 
        requirement_id: result.insertId, 
        ...requirementData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (err) {
      console.error('Error creating service requirement:', err);
      throw err;
    }
  }

  static async update(requirementId, requirementData) {
    try {
      const query = `
        UPDATE service_requirements 
        SET requirement = ?
        WHERE requirement_id = ?
      `;
      
      const values = [
        requirementData.requirement,
        requirementId
      ];
      
      await db.query(query, values);
      return { 
        requirement_id: requirementId, 
        ...requirementData,
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error updating service requirement ${requirementId}:`, err);
      throw err;
    }
  }

  static async delete(requirementId) {
    try {
      const query = 'DELETE FROM service_requirements WHERE requirement_id = ?';
      
      const [result] = await db.query(query, [requirementId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error deleting service requirement ${requirementId}:`, err);
      throw err;
    }
  }

  static async deleteAllByServiceId(serviceId) {
    try {
      const query = 'DELETE FROM service_requirements WHERE service_id = ?';
      
      const [result] = await db.query(query, [serviceId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error deleting all requirements for service ID ${serviceId}:`, err);
      throw err;
    }
  }
}

module.exports = ServiceRequirement; 