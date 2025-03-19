#!/bin/bash

# Function to detect OS
get_os() {
    case "$(uname -s)" in
        Darwin*)
            echo "mac"
            ;;
        Linux*)
            echo "linux"
            ;;
        MINGW*|CYGWIN*|MSYS*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Function to set up environment
setup_env() {
    local os=$(get_os)
    echo "Setting up environment for $os..."
    
    # Create necessary directories
    mkdir -p ./data/postgres/auth

    # Set correct permissions based on OS
    if [ "$os" != "windows" ]; then
        chmod -R 777 ./data/postgres/auth
    fi
}

# Function to deploy authentication service
deploy_auth() {
    echo "Deploying authentication service..."
    
    # Build and start the authentication service and its database
    docker-compose -f docker-compose.auth.yml up --build -d

    # Wait for the database to be ready
    echo "Waiting for database to be ready..."
    sleep 10

    # Check if services are running
    docker-compose -f docker-compose.auth.yml ps

    echo "Authentication service deployment completed!"
}

# Main execution
echo "Starting authentication service deployment..."
setup_env
deploy_auth

# Display service endpoints
echo "
Authentication Service Endpoints:
-------------------------------
POST   http://localhost:8080/api/v1/auth/signup
POST   http://localhost:8080/api/v1/auth/signin
GET    http://localhost:8080/api/v1/users/check-username-availability
GET    http://localhost:8080/api/v1/users/check-email-availability
GET    http://localhost:8080/api/v1/users
GET    http://localhost:8080/api/v1/users/{id}
PUT    http://localhost:8080/api/v1/users/{id}
DELETE http://localhost:8080/api/v1/users/{id}
" 