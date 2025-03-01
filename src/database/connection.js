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

// Function to run SQL script
async function runSqlScript(scriptPath) {
  try {
    // Read the SQL script file
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    // Split the script into individual statements
    const statements = script.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        // Skip the USE statement as we're already connected to the database
        if (!statement.trim().toUpperCase().startsWith('USE')) {
          await pool.query(statement);
        }
      }
    }
    
    console.log(`SQL script ${path.basename(scriptPath)} executed successfully`);
  } catch (err) {
    console.error(`Error executing SQL script ${path.basename(scriptPath)}:`, err);
  }
}

// Run the test
testConnection();

// Run the document tables script
const documentsTablesScript = path.join(__dirname, 'documents_tables.sql');
if (fs.existsSync(documentsTablesScript)) {
  runSqlScript(documentsTablesScript);
}

// Run the email tables script
const emailTablesScript = path.join(__dirname, 'email_tables.sql');
if (fs.existsSync(emailTablesScript)) {
  runSqlScript(emailTablesScript);
}

// Run the update documents table script
const updateDocumentsTablesScript = path.join(__dirname, 'update_documents_table.sql');
if (fs.existsSync(updateDocumentsTablesScript)) {
  console.log('Executing update_documents_table.sql script...');
  runSqlScript(updateDocumentsTablesScript);
}

module.exports = pool; 