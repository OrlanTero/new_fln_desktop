<?php
// Test script to check if the API is working

// Function to make a request to the API
function makeRequest($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'response' => $response
    ];
}

// Test the root endpoint
echo "Testing root endpoint...\n";
$result = makeRequest('http://localhost:4005/');
echo "HTTP Code: " . $result['code'] . "\n";
echo "Response: " . $result['response'] . "\n\n";

// Test the index.php endpoint
echo "Testing index.php endpoint...\n";
$result = makeRequest('http://localhost:4005/index.php');
echo "HTTP Code: " . $result['code'] . "\n";
echo "Response: " . $result['response'] . "\n\n";

// Test an invalid endpoint
echo "Testing invalid endpoint...\n";
$result = makeRequest('http://localhost:4005/invalid');
echo "HTTP Code: " . $result['code'] . "\n";
echo "Response: " . $result['response'] . "\n";
?> 