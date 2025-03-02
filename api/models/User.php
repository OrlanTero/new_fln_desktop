<?php
class User {
    private $conn;
    private $table = 'users';
    
    // User properties matching database columns
    public $user_id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $photo_url;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all users
    public function getAll() {
        try {
            $query = "SELECT id as user_id, name, email, role, photo_url, created_at, updated_at 
                      FROM {$this->table} 
                      ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Get single user by ID
    public function getById($id) {
        try {
            $query = "SELECT id as user_id, name, email, role, photo_url, created_at, updated_at 
                      FROM {$this->table} 
                      WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getById: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Create user
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} 
                      (name, email, password, role, photo_url) 
                      VALUES 
                      (:name, :email, :password, :role, :photo_url)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $name = htmlspecialchars(strip_tags($data['name']));
            $email = htmlspecialchars(strip_tags($data['email']));
            $password = password_hash($data['password'], PASSWORD_DEFAULT); // Hash the password
            $role = htmlspecialchars(strip_tags($data['role'] ?? 'User'));
            $photo_url = htmlspecialchars(strip_tags($data['photo_url'] ?? ''));
            
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':photo_url', $photo_url);
            
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update user
    public function update($id, $data) {
        try {
            // Start building the query
            $query = "UPDATE {$this->table} SET ";
            $params = [];
            
            // Add fields that are present in the data
            if(isset($data['name'])) {
                $query .= "name = :name, ";
                $params[':name'] = htmlspecialchars(strip_tags($data['name']));
            }
            
            if(isset($data['email'])) {
                $query .= "email = :email, ";
                $params[':email'] = htmlspecialchars(strip_tags($data['email']));
            }
            
            if(isset($data['password'])) {
                $query .= "password = :password, ";
                $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            if(isset($data['role'])) {
                $query .= "role = :role, ";
                $params[':role'] = htmlspecialchars(strip_tags($data['role']));
            }
            
            if(isset($data['photo_url'])) {
                $query .= "photo_url = :photo_url, ";
                $params[':photo_url'] = htmlspecialchars(strip_tags($data['photo_url']));
            }
            
            // Remove trailing comma if there are updates
            if (!empty($params)) {
                $query = rtrim($query, ', ');
            } else {
                // No updates to make
                return true;
            }
            
            $query .= " WHERE id = :id";
            $params[':id'] = $id;
            
            // Prepare and execute the query
            $stmt = $this->conn->prepare($query);
            
            foreach($params as $param => $value) {
                $stmt->bindValue($param, $value);
            }
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in update: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Delete user
    public function delete($id) {
        try {
            $query = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Login user
    public function login($email, $password) {
        try {
            $query = "SELECT id as user_id, name, email, password, role, photo_url, created_at, updated_at 
                      FROM {$this->table} 
                      WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                return false;
            }
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($password, $user['password'])) {
                // Remove password from the returned data
                unset($user['password']);
                return $user;
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error in login: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 