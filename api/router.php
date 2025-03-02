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

// Get the request path
$path = isset($_GET['path']) ? $_GET['path'] : '';
$path = trim($path, '/');
$segments = explode('/', $path);

// Database connection
require_once __DIR__ . '/config/database.php';
$database = new Database();
$db = $database->getConnection();

// Default response for invalid routes
$response = [
    'status' => 'error',
    'message' => 'Invalid API endpoint',
    'data' => null
];

// If root path or index.php is requested, serve the API info
if (empty($path) || $path === 'index.php') {
    // API information
    $response = [
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
                '/projects' => 'Project management'
            ],
            'status' => 'running',
            'server_time' => date('Y-m-d H:i:s')
        ]
    ];
} 
// Process the API request
else if (!empty($segments[0])) {
    $controller = ucfirst($segments[0]) . 'Controller';
    $controllerFile = __DIR__ . '/controllers/' . $controller . '.php';
    
    if (file_exists($controllerFile)) {
        require_once $controllerFile;
        
        $controllerInstance = new $controller($db);
        $method = isset($segments[1]) ? $segments[1] : 'getAll';
        $id = isset($segments[2]) ? $segments[2] : null;
        
        // Get request data
        $requestData = [];
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $requestBody = file_get_contents('php://input');
            $requestData = json_decode($requestBody, true) ?? [];
        } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $requestData = $_GET;
        }
        
        // Check if method exists in controller
        if (method_exists($controllerInstance, $method)) {
            $response = $controllerInstance->$method($requestData, $id);
        } else {
            $response = [
                'status' => 'error',
                'message' => 'Method not found',
                'data' => null
            ];
        }
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Controller not found',
            'data' => null
        ];
    }
}

// Send the response
echo json_encode($response);
?> 