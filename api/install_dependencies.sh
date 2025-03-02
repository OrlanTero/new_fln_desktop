#!/bin/bash

echo "Installing PHP dependencies..."

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "Composer is not installed or not in your PATH."
    echo "Please install Composer from https://getcomposer.org/download/"
    exit 1
fi

# Install dependencies
composer install

echo "Dependencies installed successfully!"
echo "You can now start the API server using the start_api_server script." 