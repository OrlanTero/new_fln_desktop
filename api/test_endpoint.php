<?php
// Simple test script to check API endpoints

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

// Test endpoints
$endpoints = [
    '/' => 'Root endpoint',
    '/users' => 'Users endpoint',
    '/services' => 'Services endpoint',
    '/clients' => 'Clients endpoint',
    '/projects' => 'Projects endpoint'
];

foreach ($endpoints as $endpoint => $description) {
    echo "Testing $description ($endpoint)...\n";
    $result = makeRequest($endpoint);
    
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
?> 