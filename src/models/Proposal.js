const db = require('../database/connection');

// Create the table if it doesn't exist
async function createTableIfNotExists() {
  try {
    // This is just a safety check - we've already created the table via SQL script
    const query = `
      CREATE TABLE IF NOT EXISTS proposals (
        proposal_id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        proposal_reference VARCHAR(20) NOT NULL,
        proposal_name VARCHAR(255) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        has_downpayment BOOLEAN DEFAULT FALSE,
        downpayment_amount DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED') DEFAULT 'DRAFT',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE
      )
    `;
    
    await db.query(query);
    console.log('Proposals table created or already exists');
  } catch (err) {
    console.error('Error creating proposals table:', err);
    throw err;
  }
}

// Call this function when the module is loaded
createTableIfNotExists();

class Proposal {
  static async getAll() {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM proposals p
        LEFT JOIN clients c ON p.client_id = c.client_id
        ORDER BY p.created_at DESC
      `;
      
      const [results] = await db.query(query);
      return results;
    } catch (err) {
      console.error('Error fetching all proposals:', err);
      throw err;
    }
  }

  static async getById(proposalId) {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM proposals p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.proposal_id = ?
      `;
      
      const [results] = await db.query(query, [proposalId]);
      return results[0];
    } catch (err) {
      console.error(`Error fetching proposal by ID ${proposalId}:`, err);
      throw err;
    }
  }

  static async getByClientId(clientId) {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM proposals p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC
      `;
      
      const [results] = await db.query(query, [clientId]);
      return results;
    } catch (err) {
      console.error(`Error fetching proposals for client ID ${clientId}:`, err);
      throw err;
    }
  }

  static async generateReference() {
    try {
      const [result] = await db.query('SELECT generate_proposal_reference() as reference');
      return result[0].reference;
    } catch (err) {
      console.error('Error generating proposal reference:', err);
      
      // Fallback if the function doesn't exist
      const year = new Date().getFullYear();
      const [result] = await db.query(
        'SELECT COUNT(*) + 1 as next_id FROM proposals WHERE proposal_reference LIKE ?',
        [`PR-${year}-%`]
      );
      const nextId = result[0].next_id;
      return `PR-${year}-${nextId.toString().padStart(4, '0')}`;
    }
  }

  static async create(proposalData) {
    try {
      // Generate reference if not provided
      if (!proposalData.proposal_reference) {
        proposalData.proposal_reference = await this.generateReference();
      }
      
      const query = `
        INSERT INTO proposals 
        (client_id, proposal_reference, proposal_name, project_name, 
         has_downpayment, downpayment_amount, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        proposalData.client_id,
        proposalData.proposal_reference,
        proposalData.proposal_name,
        proposalData.project_name,
        proposalData.has_downpayment || false,
        proposalData.downpayment_amount || 0,
        proposalData.status || 'DRAFT',
        proposalData.created_by
      ];
      
      const [result] = await db.query(query, values);
      
      // Return the created proposal with its ID
      return { 
        proposal_id: result.insertId, 
        ...proposalData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (err) {
      console.error('Error creating proposal:', err);
      throw err;
    }
  }

  static async update(proposalId, proposalData) {
    try {
      const query = `
        UPDATE proposals 
        SET client_id = ?, 
            proposal_name = ?, 
            project_name = ?, 
            has_downpayment = ?, 
            downpayment_amount = ?, 
            status = ?
        WHERE proposal_id = ?
      `;
      
      const values = [
        proposalData.client_id,
        proposalData.proposal_name,
        proposalData.project_name,
        proposalData.has_downpayment,
        proposalData.downpayment_amount,
        proposalData.status,
        proposalId
      ];
      
      await db.query(query, values);
      
      // Return the updated proposal
      return { 
        proposal_id: proposalId, 
        ...proposalData,
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error updating proposal ${proposalId}:`, err);
      throw err;
    }
  }

  static async updateStatus(proposalId, status) {
    try {
      const query = 'UPDATE proposals SET status = ? WHERE proposal_id = ?';
      
      await db.query(query, [status, proposalId]);
      
      return { proposal_id: proposalId, status };
    } catch (err) {
      console.error(`Error updating proposal status ${proposalId}:`, err);
      throw err;
    }
  }

  static async delete(proposalId) {
    try {
      const query = 'DELETE FROM proposals WHERE proposal_id = ?';
      
      const [result] = await db.query(query, [proposalId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error deleting proposal ${proposalId}:`, err);
      throw err;
    }
  }

  // Methods for proposal services
  static async getProposalServices(proposalId) {
    try {
      const query = `
        SELECT ps.*, s.service_name, s.service_category_id, sc.service_category_name
        FROM proposal_services ps
        JOIN services s ON ps.service_id = s.service_id
        LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
        WHERE ps.proposal_id = ?
        ORDER BY ps.proposal_service_id
      `;
      
      const [results] = await db.query(query, [proposalId]);
      return results;
    } catch (err) {
      console.error(`Error fetching services for proposal ID ${proposalId}:`, err);
      throw err;
    }
  }

  static async addProposalService(proposalId, serviceData) {
    try {
      const query = `
        INSERT INTO proposal_services 
        (proposal_id, service_id, quantity, price, discount_percentage) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        proposalId,
        serviceData.service_id,
        serviceData.quantity || 1,
        serviceData.unit_price || serviceData.price || 0,
        serviceData.discount_percentage || 0
      ];
      
      const [result] = await db.query(query, values);
      
      return { 
        proposal_service_id: result.insertId, 
        proposal_id: proposalId,
        ...serviceData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error adding service to proposal ${proposalId}:`, err);
      throw err;
    }
  }

  static async updateProposalService(proposalServiceId, serviceData) {
    try {
      const query = `
        UPDATE proposal_services 
        SET quantity = ?, price = ?, discount_percentage = ?
        WHERE proposal_service_id = ?
      `;
      
      const values = [
        serviceData.quantity,
        serviceData.unit_price || serviceData.price || 0,
        serviceData.discount_percentage || 0,
        proposalServiceId
      ];
      
      await db.query(query, values);
      
      return { 
        proposal_service_id: proposalServiceId, 
        ...serviceData,
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error updating proposal service ${proposalServiceId}:`, err);
      throw err;
    }
  }

  static async removeProposalService(proposalServiceId) {
    try {
      const query = 'DELETE FROM proposal_services WHERE proposal_service_id = ?';
      
      const [result] = await db.query(query, [proposalServiceId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error removing service from proposal ${proposalServiceId}:`, err);
      throw err;
    }
  }

  static async removeAllProposalServices(proposalId) {
    try {
      const query = 'DELETE FROM proposal_services WHERE proposal_id = ?';
      
      const [result] = await db.query(query, [proposalId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error removing all services from proposal ${proposalId}:`, err);
      throw err;
    }
  }
}

module.exports = Proposal; 