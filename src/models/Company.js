const db = require('../database/connection');

class Company {
  constructor(data) {
    this.company_id = data.company_id;
    this.company_name = data.company_name;
    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
    this.website = data.website;
    this.tax_id = data.tax_id;
    this.logo_url = data.logo_url;
    this.updated_at = data.updated_at;
  }

  static async getInfo() {
    try {
      // Always get the first record (ID 1)
      const [rows] = await db.query('SELECT * FROM company_info WHERE company_id = 1');
      return rows.length ? new Company(rows[0]) : null;
    } catch (err) {
      console.error('Error getting company info:', err);
      throw err;
    }
  }

  static async update(companyData) {
    try {
      const query = `
        UPDATE company_info SET
        company_name = ?,
        address = ?,
        phone = ?,
        email = ?,
        website = ?,
        tax_id = ?,
        logo_url = ?
        WHERE company_id = 1
      `;
      
      const values = [
        companyData.company_name,
        companyData.address,
        companyData.phone,
        companyData.email,
        companyData.website,
        companyData.tax_id,
        companyData.logo_url
      ];
      
      const [result] = await db.query(query, values);
      
      if (result.affectedRows === 0) {
        // If no rows were updated, insert a new record
        const insertQuery = `
          INSERT INTO company_info 
          (company_id, company_name, address, phone, email, website, tax_id, logo_url) 
          VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(insertQuery, values);
      }
      
      return { 
        company_id: 1, 
        ...companyData,
        updated_at: new Date()
      };
    } catch (err) {
      console.error('Error updating company info:', err);
      throw err;
    }
  }
}

module.exports = Company; 