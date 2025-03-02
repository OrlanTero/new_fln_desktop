// Test script for Electron app to test API endpoints
const http = require('http');

// Function to make a request to the API
function makeRequest(endpoint, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4005,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Test endpoints
const endpoints = [
    { path: '/', description: 'Root endpoint' },
    { path: '/users', description: 'Users endpoint' },
    { path: '/services', description: 'Services endpoint' },
    { path: '/clients', description: 'Clients endpoint' },
    { path: '/projects', description: 'Projects endpoint' }
];

// Run tests
async function runTests() {
    console.log('Testing API endpoints from Electron app...\n');

    for (const endpoint of endpoints) {
        console.log(`Testing ${endpoint.description} (${endpoint.path})...`);
        
        try {
            const result = await makeRequest(endpoint.path);
            console.log(`Status Code: ${result.statusCode}`);
            console.log('Response:');
            console.log(JSON.stringify(result.data, null, 2));
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
        
        console.log('\n' + '-'.repeat(80) + '\n');
    }
}

runTests(); 