# Setting Up Klein Router for PHP API

This guide explains how to set up the Klein router for the PHP API backend.

## What is Klein?

Klein is a fast and flexible router for PHP that makes it easy to map URLs to code. It's designed to be simple to use but powerful enough for complex applications.

## Installation

### 1. Install Composer

If you don't have Composer installed, download and install it from [getcomposer.org](https://getcomposer.org/download/).

### 2. Install Klein via Composer

Run the following command in the `api` directory:

```bash
composer require klein/klein
```

Alternatively, you can use the provided installation scripts:

- Windows: Run `install_dependencies.bat`
- macOS/Linux: Run `./install_dependencies.sh`

## How Klein is Used in This Project

In this project, Klein is used to:

1. Define RESTful API routes
2. Automatically map routes to controller methods
3. Handle different HTTP methods (GET, POST, PUT, DELETE)
4. Format JSON responses
5. Provide error handling

## Key Files

- `index.php`: Main entry point that initializes Klein and defines routes
- `composer.json`: Defines project dependencies, including Klein

## Route Structure

Routes are defined in `index.php` using the following pattern:

```php
$router->respond('METHOD', '/path', function($request) {
    // Handle the request
});
```

For example:

```php
// GET all users
$router->respond('GET', '/users', function($request) use ($db) {
    // Load the controller
    require_once 'controllers/UserController.php';
    $controller = new UserController($db);
    
    // Call the appropriate method
    return $controller->getAll([]);
});
```

## Testing the Router

To test if Klein is working correctly:

1. Start the API server:
   ```
   php -S localhost:4005
   ```

2. Run the test script:
   - Windows PowerShell: `.\test_klein_api.ps1`
   - PHP: `php test_api.php`

## Troubleshooting

### Common Issues

1. **Composer Not Installed**
   - Install Composer from [getcomposer.org](https://getcomposer.org/download/)

2. **Klein Not Found**
   - Run `composer install` to install dependencies
   - Check if `vendor/autoload.php` exists

3. **Routes Not Working**
   - Ensure the server is started correctly
   - Check for syntax errors in `index.php`
   - Verify that controllers exist and methods are defined

## Additional Resources

- [Klein GitHub Repository](https://github.com/klein/klein.php)
- [Klein Documentation](https://github.com/klein/klein.php/wiki)
- [Composer Documentation](https://getcomposer.org/doc/) 