const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Try to load database configuration
let config;
try {
  const configPath = path.join(__dirname, '../config/database.config.js');
  if (fs.existsSync(configPath)) {
    config = require('../config/database.config');
  } else {
    // Default configuration if config file doesn't exist
    config = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fln_new_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  }
} catch (error) {
  console.error('Error loading database configuration:', error);
  // Default configuration if there's an error loading the config file
  config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fln_new_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

// Create a connection pool
const pool = mysql.createPool(config);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

// Run the test
testConnection();

module.exports = pool; 