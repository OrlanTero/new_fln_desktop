# PHP API Backend for Electron Application

This API provides HTTP endpoints for the Electron application to perform database operations. It uses the Klein router for handling requests and PDO for database connections.

## Server Requirements

- PHP 7.4+
- MySQL 5.7+
- Composer (PHP package manager)
- Web server (Apache/Nginx) or PHP built-in server

## Installation

1. Install PHP dependencies using Composer:
   ```
   composer install
   ```
   
   Or run the provided installation script:
   - Windows: `install_dependencies.bat`
   - macOS/Linux: `./install_dependencies.sh`

2. Configure the database connection in `config/database.php` or set environment variables:
   - `DB_HOST`: Database host (default: localhost)
   - `DB_NAME`: Database name
   - `DB_USER`: Database username
   - `DB_PASS`: Database password

3. Start the API server:
   - Windows PowerShell: `.\start_api_server.ps1`
   - Windows Command Prompt: `start_api_server.bat`
   - macOS/Linux: `./start_api_server.sh`
   
   The API will be available at `http://localhost:4005`

## API Routing with Klein

This API uses the Klein PHP router for handling requests. Klein provides a simple and flexible routing system that makes it easy to define API endpoints and handle different HTTP methods.

Key features of the Klein implementation:
- RESTful API design with proper HTTP methods
- Automatic controller and method resolution
- JSON response formatting
- Error handling and validation

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/{id}` - Update a user
- `DELETE /users/{id}` - Delete a user

### Services
- `GET /services` - Get all services
- `GET /services/{id}` - Get service by ID
- `GET /services/category/{categoryId}` - Get services by category
- `POST /services` - Create a new service
- `PUT /services/{id}` - Update a service
- `DELETE /services/{id}` - Delete a service

### Service Categories
- `GET /categories` - Get all categories
- `GET /categories/{id}` - Get category by ID
- `POST /categories` - Create a new category
- `PUT /categories/{id}` - Update a category
- `DELETE /categories/{id}` - Delete a category

### Service Requirements
- `GET /requirements` - Get all requirements
- `GET /requirements/{id}` - Get requirement by ID
- `GET /requirements/service/{serviceId}` - Get requirements by service
- `POST /requirements` - Create a new requirement
- `PUT /requirements/{id}` - Update a requirement
- `DELETE /requirements/{id}` - Delete a requirement
- `DELETE /requirements/service/{serviceId}` - Delete all requirements for a service

### Clients
- `GET /clients` - Get all clients
- `GET /clients/{id}` - Get client by ID
- `GET /clients/type/{typeId}` - Get clients by type
- `POST /clients` - Create a new client
- `PUT /clients/{id}` - Update a client
- `DELETE /clients/{id}` - Delete a client

### Client Types
- `GET /clientTypes` - Get all client types
- `GET /clientTypes/{id}` - Get client type by ID
- `POST /clientTypes` - Create a new client type
- `PUT /clientTypes/{id}` - Update a client type
- `DELETE /clientTypes/{id}` - Delete a client type

### Proposals
- `GET /proposals` - Get all proposals
- `GET /proposals/{id}` - Get proposal by ID
- `GET /proposals/client/{clientId}` - Get proposals by client
- `POST /proposals` - Create a new proposal
- `PUT /proposals/{id}` - Update a proposal
- `DELETE /proposals/{id}` - Delete a proposal

### Projects
- `GET /projects` - Get all projects
- `GET /projects/{id}` - Get project by ID
- `GET /projects/client/{clientId}` - Get projects by client
- `POST /projects` - Create a new project
- `PUT /projects/{id}` - Update a project
- `DELETE /projects/{id}` - Delete a project

## Response Format

All API responses are in JSON format with the following structure:

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message",
  "data": null
}
```

## Security Considerations

- All database queries use PDO with prepared statements to prevent SQL injection
- Input data is validated and sanitized
- CORS headers are properly configured
- Consider implementing authentication and authorization for production use

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify database credentials in `config/database.php`
   - Ensure MySQL server is running
   - Check if the database exists

2. **Server Configuration**
   - For Apache, ensure mod_rewrite is enabled
   - For Nginx, configure URL rewriting properly
   - For PHP built-in server, ensure the correct port is used

3. **Composer Dependencies**
   - Run `composer install` to install required packages
   - Ensure Klein router is installed correctly 