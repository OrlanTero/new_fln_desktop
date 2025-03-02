<?php
// Check database tables
require_once __DIR__ . '/config/database.php';

// Initialize database connection
$database = new Database();
$conn = $database->getConnection();

// Check if connection is successful
if (!$conn) {
    echo "Database connection failed\n";
    exit;
}

echo "Database connection successful\n";

// Get all tables
try {
    $stmt = $conn->query('SHOW TABLES');
    echo "Tables in database:\n";
    
    $tables = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
        echo "- " . $row[0] . "\n";
    }
    
    // Check specific tables
    $requiredTables = [
        'users',
        'services',
        'service_categories',
        'clients',
        'projects'
    ];
    
    echo "\nChecking required tables:\n";
    foreach ($requiredTables as $table) {
        if (in_array($table, $tables)) {
            echo "✓ {$table} exists\n";
            
            // Check table structure
            $stmt = $conn->query("DESCRIBE {$table}");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "  Columns: " . implode(', ', $columns) . "\n";
        } else {
            echo "✗ {$table} does not exist\n";
        }
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 