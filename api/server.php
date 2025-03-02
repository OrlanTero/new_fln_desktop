<?php
// Set the port for the API server
$port = 4005;
$host = 'localhost';

// Display startup message
echo "Starting API server at http://{$host}:{$port}" . PHP_EOL;
echo "Press Ctrl+C to stop the server" . PHP_EOL;

// Command to start the PHP built-in server
$command = sprintf(
    'php -S %s:%d -t %s',
    $host,
    $port,
    __DIR__
);

// Execute the command
system($command);
?> 