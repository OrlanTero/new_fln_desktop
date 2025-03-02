<?php
// Test script for new API endpoints

// API base URL
$baseUrl = 'http://localhost:8000';

// Function to make API requests
function makeRequest($url, $method = 'GET', $data = null) {
    $curl = curl_init();
    
    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method
    ];
    
    if ($data && ($method === 'POST' || $method === 'PUT')) {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
        $options[CURLOPT_HTTPHEADER] = ['Content-Type: application/json'];
    }
    
    curl_setopt_array($curl, $options);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    return [
        'code' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

// Function to print test results
function printResult($testName, $result) {
    echo "=== $testName ===\n";
    echo "Status Code: " . $result['code'] . "\n";
    
    if (isset($result['response']['status'])) {
        echo "Status: " . $result['response']['status'] . "\n";
    }
    
    if (isset($result['response']['message'])) {
        echo "Message: " . $result['response']['message'] . "\n";
    }
    
    if (isset($result['response']['data'])) {
        echo "Data: " . (is_array($result['response']['data']) ? count($result['response']['data']) . " items" : "Object") . "\n";
    }
    
    echo "\n";
}

// Test API info
$result = makeRequest($baseUrl);
printResult('API Info', $result);

// Test Company endpoints
echo "TESTING COMPANY ENDPOINTS\n";
echo "------------------------\n";

// Get company info
$result = makeRequest("$baseUrl/company");
printResult('Get Company Info', $result);

// Create company info
$companyData = [
    'company_name' => 'Test Company',
    'address' => '123 Test Street',
    'phone' => '123-456-7890',
    'email' => 'info@testcompany.com',
    'website' => 'https://testcompany.com',
    'tax_id' => '123456789'
];
$result = makeRequest("$baseUrl/company", 'POST', $companyData);
printResult('Create Company Info', $result);

// Test ServiceCategory endpoints
echo "TESTING SERVICE CATEGORY ENDPOINTS\n";
echo "--------------------------------\n";

// Get all service categories
$result = makeRequest("$baseUrl/serviceCategories");
printResult('Get All Service Categories', $result);

// Create service category
$categoryData = [
    'service_category_name' => 'Test Category',
    'description' => 'Test category description',
    'priority_number' => 1
];
$result = makeRequest("$baseUrl/serviceCategories", 'POST', $categoryData);
printResult('Create Service Category', $result);

// Get created category ID for further tests
$categoryId = isset($result['response']['data']['service_category_id']) ? $result['response']['data']['service_category_id'] : null;

if ($categoryId) {
    // Get service category by ID
    $result = makeRequest("$baseUrl/serviceCategories/$categoryId");
    printResult("Get Service Category by ID ($categoryId)", $result);
    
    // Update service category
    $updateData = [
        'description' => 'Updated test category description',
        'priority_number' => 2
    ];
    $result = makeRequest("$baseUrl/serviceCategories/$categoryId", 'PUT', $updateData);
    printResult("Update Service Category ($categoryId)", $result);
    
    // Delete service category
    $result = makeRequest("$baseUrl/serviceCategories/$categoryId", 'DELETE');
    printResult("Delete Service Category ($categoryId)", $result);
}

// Test Document endpoints
echo "TESTING DOCUMENT ENDPOINTS\n";
echo "------------------------\n";

// Get all documents
$result = makeRequest("$baseUrl/documents");
printResult('Get All Documents', $result);

// Test Email endpoints
echo "TESTING EMAIL ENDPOINTS\n";
echo "---------------------\n";

// Get all emails
$result = makeRequest("$baseUrl/emails");
printResult('Get All Emails', $result);

// Test Attachment endpoints
echo "TESTING ATTACHMENT ENDPOINTS\n";
echo "--------------------------\n";

// Get all attachments
$result = makeRequest("$baseUrl/attachments");
printResult('Get All Attachments', $result);

echo "All tests completed.\n";
?> 