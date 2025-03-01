const Company = require('../models/Company');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

// Get company information
async function getCompanyInfo() {
  try {
    const company = await Company.getInfo();
    return { success: true, company };
  } catch (error) {
    console.error('Error in getCompanyInfo:', error);
    return { success: false, error: error.message };
  }
}

// Update company information
async function updateCompanyInfo(companyData) {
  try {
    // Handle logo upload if provided as a file path
    if (companyData.logo_file_path) {
      const logoPath = await uploadLogo(companyData.logo_file_path);
      companyData.logo_url = logoPath;
      delete companyData.logo_file_path;
    }
    
    const company = await Company.update(companyData);
    return { success: true, company };
  } catch (error) {
    console.error('Error in updateCompanyInfo:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to upload company logo
async function uploadLogo(filePath) {
  try {
    // Create logos directory if it doesn't exist
    const userDataPath = app.getPath('userData');
    const logosDir = path.join(userDataPath, 'logos');
    
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }
    
    // Get file information
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    
    // Generate a unique filename to avoid collisions
    const uniqueFileName = `company_logo_${uuidv4()}${fileExt}`;
    const destinationPath = path.join(logosDir, uniqueFileName);
    
    // Copy the file to the logos directory
    fs.copyFileSync(filePath, destinationPath);
    
    return destinationPath;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}

module.exports = {
  getCompanyInfo,
  updateCompanyInfo
}; 