const mysql = require('mysql2/promise');
const config = require('../config/database.config');

class DatabaseService {
    constructor() {
        this.pool = mysql.createPool(config);
    }

    async executeQuery(query, params = []) {
        try {
            const [results] = await this.pool.execute(query, params);
            return { success: true, data: results };
        } catch (error) {
            console.error('Database error:', error);
            return { success: false, error: error.message };
        }
    }

    // Generic CRUD operations
    async create(table, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        return await this.executeQuery(query, values);
    }

    async read(table, conditions = null, orderBy = null, limit = null, offset = null) {
        let query = `SELECT * FROM ${table}`;
        const params = [];

        if (conditions) {
            const whereClause = Object.entries(conditions)
                .map(([key, value]) => {
                    if (value === null) {
                        return `${key} IS NULL`;
                    }
                    params.push(value);
                    return `${key} = ?`;
                })
                .join(' AND ');
            query += ` WHERE ${whereClause}`;
        }

        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
            
            if (offset) {
                query += ' OFFSET ?';
                params.push(parseInt(offset));
            }
        }

        return await this.executeQuery(query, params);
    }

    async update(table, data, conditions) {
        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        
        const whereClause = Object.keys(conditions)
            .map(key => `${key} = ?`)
            .join(' AND ');

        const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const params = [...Object.values(data), ...Object.values(conditions)];
        
        return await this.executeQuery(query, params);
    }

    async delete(table, conditions) {
        const whereClause = Object.keys(conditions)
            .map(key => `${key} = ?`)
            .join(' AND ');
        
        const query = `DELETE FROM ${table} WHERE ${whereClause}`;
        const params = Object.values(conditions);
        
        return await this.executeQuery(query, params);
    }

    // Advanced search and filter operations
    async search(table, searchFields, searchTerm, filters = null, orderBy = null, limit = null, offset = null) {
        const params = [];
        let query = `SELECT * FROM ${table} WHERE `;

        // Handle search term
        const searchConditions = searchFields
            .map(field => {
                params.push(`%${searchTerm}%`);
                return `${field} LIKE ?`;
            })
            .join(' OR ');
        
        query += `(${searchConditions})`;

        // Handle filters
        if (filters) {
            const filterConditions = Object.entries(filters)
                .map(([key, value]) => {
                    params.push(value);
                    return `AND ${key} = ?`;
                })
                .join(' ');
            
            query += ` ${filterConditions}`;
        }

        // Handle ordering
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }

        // Handle pagination
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
            
            if (offset) {
                query += ' OFFSET ?';
                params.push(parseInt(offset));
            }
        }

        return await this.executeQuery(query, params);
    }
}

module.exports = new DatabaseService(); 