const db = require('../database/connection');

class Email {
  constructor(data) {
    this.email_id = data.email_id;
    this.proposal_id = data.proposal_id;
    this.subject = data.subject;
    this.sender = data.sender;
    this.recipient = data.recipient;
    this.cc = data.cc;
    this.message = data.message;
    this.sent_at = data.sent_at;
    this.status = data.status;
  }

  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM emails ORDER BY sent_at DESC');
      return rows.map(row => new Email(row));
    } catch (err) {
      console.error('Error getting all emails:', err);
      throw err;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM emails WHERE email_id = ?', [id]);
      return rows.length ? new Email(rows[0]) : null;
    } catch (err) {
      console.error('Error getting email by ID:', err);
      throw err;
    }
  }

  static async getByProposalId(proposalId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM emails WHERE proposal_id = ? ORDER BY sent_at DESC',
        [proposalId]
      );
      return rows.map(row => new Email(row));
    } catch (err) {
      console.error('Error getting emails by proposal ID:', err);
      throw err;
    }
  }

  static async create(emailData) {
    try {
      const query = `
        INSERT INTO emails 
        (proposal_id, subject, sender, recipient, cc, message, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Convert cc array to string if it's an array
      const ccValue = Array.isArray(emailData.cc) ? emailData.cc.join(',') : emailData.cc || '';
      
      const values = [
        emailData.proposal_id,
        emailData.subject,
        emailData.sender,
        emailData.recipient,
        ccValue,
        emailData.message,
        emailData.status || 'SENT'
      ];
      
      const [result] = await db.query(query, values);
      
      return { 
        email_id: result.insertId, 
        ...emailData,
        cc: ccValue,
        sent_at: new Date()
      };
    } catch (err) {
      console.error('Error creating email:', err);
      throw err;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.query(
        'UPDATE emails SET status = ? WHERE email_id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error updating email status:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM emails WHERE email_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting email:', err);
      throw err;
    }
  }
}

module.exports = Email; 