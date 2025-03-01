const db = require('../database/connection');

class Document {
  constructor(data) {
    this.document_id = data.document_id;
    this.proposal_id = data.proposal_id;
    this.document_type = data.document_type;
    this.document_path = data.document_path;
    this.file_name = data.file_name;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
    this.file_content = data.file_content;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
  }

  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
      return rows.map(row => new Document(row));
    } catch (err) {
      console.error('Error getting all documents:', err);
      throw err;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM documents WHERE document_id = ?', [id]);
      return rows.length ? new Document(rows[0]) : null;
    } catch (err) {
      console.error('Error getting document by ID:', err);
      throw err;
    }
  }

  static async getByProposalId(proposalId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM documents WHERE proposal_id = ? ORDER BY created_at DESC',
        [proposalId]
      );
      return rows.map(row => new Document(row));
    } catch (err) {
      console.error('Error getting documents by proposal ID:', err);
      throw err;
    }
  }

  static async create(documentData) {
    try {
      const query = `
        INSERT INTO documents 
        (proposal_id, document_type, document_path, file_name, file_size, mime_type, file_content, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        documentData.proposal_id,
        documentData.document_type || 'PROPOSAL',
        documentData.document_path,
        documentData.file_name,
        documentData.file_size || 0,
        documentData.mime_type || 'application/pdf',
        documentData.file_content || null,
        documentData.created_by
      ];
      
      const [result] = await db.query(query, values);
      
      return { 
        document_id: result.insertId, 
        ...documentData,
        created_at: new Date()
      };
    } catch (err) {
      console.error('Error creating document:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM documents WHERE document_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  }

  static async getDocumentContent(id) {
    try {
      const [rows] = await db.query('SELECT file_content FROM documents WHERE document_id = ?', [id]);
      return rows.length ? rows[0].file_content : null;
    } catch (err) {
      console.error('Error getting document content:', err);
      throw err;
    }
  }
}

module.exports = Document; 