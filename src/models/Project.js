const db = require('../database/connection');

// Create the table if it doesn't exist
async function createTableIfNotExists() {
  try {
    // This is just a safety check - we've already created the table via SQL script
    const query = `
      CREATE TABLE IF NOT EXISTS projects (
        project_id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT,
        client_id INT NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        attn_to VARCHAR(255),
        start_date DATE,
        end_date DATE,
        description TEXT,
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE SET NULL,
        FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE
      )
    `;
    
    await db.query(query);
    console.log('Projects table created or already exists');
  } catch (err) {
    console.error('Error creating projects table:', err);
    throw err;
  }
}

// Call this function when the module is loaded
createTableIfNotExists();

class Project {
  static async getAll() {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.client_id
        ORDER BY p.created_at DESC
      `;
      
      const [results] = await db.query(query);
      return results;
    } catch (err) {
      console.error('Error fetching all projects:', err);
      throw err;
    }
  }

  static async getById(projectId) {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.project_id = ?
      `;
      
      const [results] = await db.query(query, [projectId]);
      return results[0];
    } catch (err) {
      console.error(`Error fetching project by ID ${projectId}:`, err);
      throw err;
    }
  }

  static async getByClientId(clientId) {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC
      `;
      
      const [results] = await db.query(query, [clientId]);
      return results;
    } catch (err) {
      console.error(`Error fetching projects for client ID ${clientId}:`, err);
      throw err;
    }
  }

  static async getByProposalId(proposalId) {
    try {
      const query = `
        SELECT p.*, c.client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.proposal_id = ?
      `;
      
      const [results] = await db.query(query, [proposalId]);
      return results[0];
    } catch (err) {
      console.error(`Error fetching project for proposal ID ${proposalId}:`, err);
      throw err;
    }
  }

  static async create(projectData) {
    try {
      const query = `
        INSERT INTO projects 
        (proposal_id, client_id, project_name, attn_to, start_date, end_date, 
         description, priority, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        projectData.proposal_id || null,
        projectData.client_id,
        projectData.project_name,
        projectData.attn_to || null,
        projectData.start_date || null,
        projectData.end_date || null,
        projectData.description || null,
        projectData.priority || 'MEDIUM',
        projectData.status || 'PENDING',
        projectData.created_by
      ];
      
      const [result] = await db.query(query, values);
      
      // Return the created project with its ID
      return { 
        project_id: result.insertId, 
        ...projectData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  }

  static async createFromProposal(proposalId, projectData, userId) {
    try {
      // First, get the proposal details
      const query = `
        SELECT p.*, c.client_name
        FROM proposals p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.proposal_id = ?
      `;
      
      const [proposals] = await db.query(query, [proposalId]);
      if (proposals.length === 0) {
        throw new Error(`Proposal with ID ${proposalId} not found`);
      }
      
      const proposal = proposals[0];
      
      // Create the project
      const newProject = await this.create({
        proposal_id: proposalId,
        client_id: proposal.client_id,
        project_name: projectData.project_name || proposal.project_name,
        attn_to: projectData.attn_to,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        description: projectData.description,
        priority: projectData.priority || 'MEDIUM',
        status: projectData.status || 'PENDING',
        created_by: userId
      });
      
      // Copy services from proposal to project
      const [proposalServices] = await db.query(
        'SELECT * FROM proposal_services WHERE proposal_id = ?',
        [proposalId]
      );
      
      for (const service of proposalServices) {
        await db.query(
          'INSERT INTO project_services (project_id, service_id, quantity, price) VALUES (?, ?, ?, ?)',
          [newProject.project_id, service.service_id, service.quantity, service.price]
        );
      }
      
      return newProject;
    } catch (err) {
      console.error(`Error creating project from proposal ${proposalId}:`, err);
      throw err;
    }
  }

  static async update(projectId, projectData) {
    try {
      const query = `
        UPDATE projects 
        SET client_id = ?, 
            project_name = ?, 
            attn_to = ?, 
            start_date = ?, 
            end_date = ?, 
            description = ?, 
            priority = ?, 
            status = ?
        WHERE project_id = ?
      `;
      
      const values = [
        projectData.client_id,
        projectData.project_name,
        projectData.attn_to,
        projectData.start_date,
        projectData.end_date,
        projectData.description,
        projectData.priority,
        projectData.status,
        projectId
      ];
      
      await db.query(query, values);
      
      // Return the updated project
      return { 
        project_id: projectId, 
        ...projectData,
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error updating project ${projectId}:`, err);
      throw err;
    }
  }

  static async updateStatus(projectId, status) {
    try {
      const query = 'UPDATE projects SET status = ? WHERE project_id = ?';
      
      await db.query(query, [status, projectId]);
      
      return { project_id: projectId, status };
    } catch (err) {
      console.error(`Error updating project status ${projectId}:`, err);
      throw err;
    }
  }

  static async delete(projectId) {
    try {
      const query = 'DELETE FROM projects WHERE project_id = ?';
      
      const [result] = await db.query(query, [projectId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error deleting project ${projectId}:`, err);
      throw err;
    }
  }

  // Methods for project services
  static async getProjectServices(projectId) {
    try {
      const query = `
        SELECT ps.*, s.service_name, s.service_category_id, sc.service_category_name
        FROM project_services ps
        JOIN services s ON ps.service_id = s.service_id
        LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
        WHERE ps.project_id = ?
        ORDER BY ps.project_service_id
      `;
      
      const [results] = await db.query(query, [projectId]);
      return results;
    } catch (err) {
      console.error(`Error fetching services for project ID ${projectId}:`, err);
      throw err;
    }
  }

  static async addProjectService(projectId, serviceData) {
    try {
      const query = `
        INSERT INTO project_services 
        (project_id, service_id, quantity, price, status) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        projectId,
        serviceData.service_id,
        serviceData.quantity || 1,
        serviceData.price,
        serviceData.status || 'PENDING'
      ];
      
      const [result] = await db.query(query, values);
      
      return { 
        project_service_id: result.insertId, 
        project_id: projectId,
        ...serviceData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error adding service to project ${projectId}:`, err);
      throw err;
    }
  }

  static async updateProjectService(projectServiceId, serviceData) {
    try {
      const query = `
        UPDATE project_services 
        SET quantity = ?, price = ?, status = ?
        WHERE project_service_id = ?
      `;
      
      const values = [
        serviceData.quantity,
        serviceData.price,
        serviceData.status,
        projectServiceId
      ];
      
      await db.query(query, values);
      
      return { 
        project_service_id: projectServiceId, 
        ...serviceData,
        updated_at: new Date()
      };
    } catch (err) {
      console.error(`Error updating project service ${projectServiceId}:`, err);
      throw err;
    }
  }

  static async updateProjectServiceStatus(projectServiceId, status) {
    try {
      const query = 'UPDATE project_services SET status = ? WHERE project_service_id = ?';
      
      await db.query(query, [status, projectServiceId]);
      
      return { project_service_id: projectServiceId, status };
    } catch (err) {
      console.error(`Error updating project service status ${projectServiceId}:`, err);
      throw err;
    }
  }

  static async removeProjectService(projectServiceId) {
    try {
      const query = 'DELETE FROM project_services WHERE project_service_id = ?';
      
      const [result] = await db.query(query, [projectServiceId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error removing service from project ${projectServiceId}:`, err);
      throw err;
    }
  }

  static async removeAllProjectServices(projectId) {
    try {
      const query = 'DELETE FROM project_services WHERE project_id = ?';
      
      const [result] = await db.query(query, [projectId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error removing all services from project ${projectId}:`, err);
      throw err;
    }
  }
}

module.exports = Project; 