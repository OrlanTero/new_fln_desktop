<?php
// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if Composer autoloader exists
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    // If Klein is not installed via Composer, show installation instructions
    echo json_encode([
        'status' => 'error',
        'message' => 'Klein router not installed. Please run "composer install" in the api directory.',
        'data' => null
    ]);
    exit();
}

// Database connection
require_once __DIR__ . '/config/database.php';
$database = new Database();
$db = $database->getConnection();

// Initialize Klein router
$router = new \Klein\Klein();

// Custom error handler for PDO exceptions
$router->onError(function ($router, $err_msg, $err_type, $exception) {
    // Check if it's a PDO exception
    if ($exception instanceof PDOException) {
        // Log the error for debugging
        error_log("Database error: " . $exception->getMessage());
        
        // Send a proper JSON response
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error occurred',
            'error_code' => $exception->getCode(),
            'data' => null
        ]);
        exit();
    }
});

// Helper function to send JSON response
function sendResponse($response) {
    echo json_encode($response);
    exit();
}

// API information
$apiInfo = [
    'status' => 'success',
    'message' => 'API information',
    'data' => [
        'name' => 'Electron App API',
        'version' => '1.0.0',
        'description' => 'Backend API for the Electron application',
        'endpoints' => [
            '/users' => 'User management',
            '/services' => 'Service management',
            '/categories' => 'Service category management',
            '/requirements' => 'Service requirement management',
            '/clients' => 'Client management',
            '/clientTypes' => 'Client type management',
            '/proposals' => 'Proposal management',
            '/projects' => 'Project management',
            '/attachments' => 'Attachment management',
            '/company' => 'Company information management',
            '/documents' => 'Document management',
            '/emails' => 'Email management',
            '/serviceCategories' => 'Service category management'
        ],
        'status' => 'running',
        'server_time' => date('Y-m-d H:i:s')
    ]
];

// Root route - API information
$router->respond('GET', '/?', function() use ($apiInfo) {
    sendResponse($apiInfo);
});

// Define routes for each controller
$controllers = [
    'users' => 'UserController',
    'services' => 'ServiceController',
    'categories' => 'CategoryController',
    'requirements' => 'RequirementController',
    'clients' => 'ClientController',
    'clientTypes' => 'ClientTypeController',
    'proposals' => 'ProposalController',
    'projects' => 'ProjectController',
    'attachments' => 'AttachmentController',
    'company' => 'CompanyController',
    'documents' => 'DocumentController',
    'emails' => 'EmailController',
    'serviceCategories' => 'ServiceCategoryController'
];

foreach ($controllers as $route => $controller) {
    // GET all items
    $router->respond('GET', "/[$route:controller]/?", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            sendResponse($controllerInstance->index([]));
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
    
    // GET single item by ID
    $router->respond('GET', "/[$route:controller]/[:id]", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            sendResponse($controllerInstance->get([], $request->id));
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
    
    // POST create new item
    $router->respond('POST', "/[$route:controller]/?", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            $requestBody = file_get_contents('php://input');
            $requestData = json_decode($requestBody, true) ?? [];
            sendResponse($controllerInstance->create($requestData));
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
    
    // PUT update item
    $router->respond('PUT', "/[$route:controller]/[:id]", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            $requestBody = file_get_contents('php://input');
            $requestData = json_decode($requestBody, true) ?? [];
            sendResponse($controllerInstance->update($requestData, $request->id));
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
    
    // DELETE item
    $router->respond('DELETE', "/[$route:controller]/[:id]", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            sendResponse($controllerInstance->delete([], $request->id));
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
    
    // Custom methods (for specific controllers)
    $router->respond('GET', "/[$route:controller]/[:method]/[:param]?", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            $method = $request->method;
            
            if (method_exists($controllerInstance, $method)) {
                $param = isset($request->param) ? $request->param : null;
                sendResponse($controllerInstance->$method([], $param));
            } else {
                sendResponse([
                    'status' => 'error',
                    'message' => 'Method not found',
                    'data' => null
                ]);
            }
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
    
    // Custom methods with PUT (for updateStatus and similar methods)
    $router->respond('PUT', "/[$route:controller]/[:method]/[:param]?", function($request) use ($db, $controllers) {
        $controllerName = $controllers[$request->controller];
        $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
        
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controllerInstance = new $controllerName($db);
            $method = $request->method;
            
            if (method_exists($controllerInstance, $method)) {
                $param = isset($request->param) ? $request->param : null;
                sendResponse($controllerInstance->$method([], $param));
            } else {
                sendResponse([
                    'status' => 'error',
                    'message' => 'Method not found',
                    'data' => null
                ]);
            }
        } else {
            sendResponse([
                'status' => 'error',
                'message' => 'Controller not found',
                'data' => null
            ]);
        }
    });
}

// Special route for updating proposal status
$router->respond('PUT', "/proposals/[:id]/status", function($request) use ($db) {
    require_once __DIR__ . '/controllers/ProposalController.php';
    $controllerInstance = new ProposalController($db);
    sendResponse($controllerInstance->updateStatus([], $request->id));
});

// 404 Not Found for any other routes
$router->respond('*', '*', function() {
    sendResponse([
        'status' => 'error',
        'message' => 'Invalid API endpoint',
        'data' => null
    ]);
});

// Dispatch the router
$router->dispatch();
?> 