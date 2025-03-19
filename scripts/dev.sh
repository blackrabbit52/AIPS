#!/bin/bash

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to clean up Docker resources
cleanup() {
    echo "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
}

# Function to start services
start_services() {
    echo "Starting services..."
    docker-compose up --build aips auth-service
}

# Main
echo "Starting development environment..."
check_docker
cleanup
start_services 