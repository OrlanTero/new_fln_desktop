<?php
// Comprehensive test script to check all API endpoints

// Function to make a request to the API
function makeRequest($endpoint, $method = 'GET', $data = null) {
    $url = "http://localhost:4005" . $endpoint;
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    } else if ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    } else if ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'response' => $response,
        'error' => $error
    ];
}

// Function to print test results
function printResult($result, $endpoint, $method) {
    echo "Testing $method $endpoint...\n";
    echo "HTTP Code: " . $result['code'] . "\n";
    
    if ($result['error']) {
        echo "Error: " . $result['error'] . "\n";
    } else {
        // Try to pretty print JSON
        $jsonData = json_decode($result['response'], true);
        if ($jsonData !== null) {
            echo "Response (formatted):\n";
            echo json_encode($jsonData, JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "Response (raw):\n";
            echo $result['response'] . "\n";
        }
    }
    
    echo "\n" . str_repeat('-', 80) . "\n\n";
}

// Test endpoints
echo "TESTING API ENDPOINTS\n";
echo str_repeat('=', 80) . "\n\n";

// Test root endpoint
$result = makeRequest('/');
printResult($result, '/', 'GET');

// Test services endpoints
echo "SERVICES ENDPOINTS\n";
echo str_repeat('-', 80) . "\n\n";

// Get all services
$result = makeRequest('/services');
printResult($result, '/services', 'GET');

// Get service categories
$result = makeRequest('/services/categories');
printResult($result, '/services/categories', 'GET');

// Test clients endpoints
echo "CLIENTS ENDPOINTS\n";
echo str_repeat('-', 80) . "\n\n";

// Get all clients
$result = makeRequest('/clients');
printResult($result, '/clients', 'GET');

// Test projects endpoints
echo "PROJECTS ENDPOINTS\n";
echo str_repeat('-', 80) . "\n\n";

// Get all projects
$result = makeRequest('/projects');
printResult($result, '/projects', 'GET');

echo "API TESTING COMPLETE\n";
?> 