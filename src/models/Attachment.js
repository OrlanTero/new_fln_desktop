const db = require('../database/connection');

class Attachment {
  constructor(data) {
    this.attachment_id = data.attachment_id;
    this.email_id = data.email_id;
    this.document_id = data.document_id;
    this.file_path = data.file_path;
    this.file_name = data.file_name;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
    this.created_at = data.created_at;
  }

  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM attachments ORDER BY created_at DESC');
      return rows.map(row => new Attachment(row));
    } catch (err) {
      console.error('Error getting all attachments:', err);
      throw err;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM attachments WHERE attachment_id = ?', [id]);
      return rows.length ? new Attachment(rows[0]) : null;
    } catch (err) {
      console.error('Error getting attachment by ID:', err);
      throw err;
    }
  }

  static async getByEmailId(emailId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM attachments WHERE email_id = ? ORDER BY created_at DESC',
        [emailId]
      );
      return rows.map(row => new Attachment(row));
    } catch (err) {
      console.error('Error getting attachments by email ID:', err);
      throw err;
    }
  }

  static async getByDocumentId(documentId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM attachments WHERE document_id = ? ORDER BY created_at DESC',
        [documentId]
      );
      return rows.map(row => new Attachment(row));
    } catch (err) {
      console.error('Error getting attachments by document ID:', err);
      throw err;
    }
  }

  static async create(attachmentData) {
    try {
      const query = `
        INSERT INTO attachments 
        (email_id, document_id, file_path, file_name, file_size, mime_type) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        attachmentData.email_id || null,
        attachmentData.document_id || null,
        attachmentData.file_path,
        attachmentData.file_name,
        attachmentData.file_size || 0,
        attachmentData.mime_type || 'application/octet-stream'
      ];
      
      const [result] = await db.query(query, values);
      
      return { 
        attachment_id: result.insertId, 
        ...attachmentData,
        created_at: new Date()
      };
    } catch (err) {
      console.error('Error creating attachment:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM attachments WHERE attachment_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  }
}

module.exports = Attachment; 