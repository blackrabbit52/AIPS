# Function to check if Docker is running
function Check-Docker {
    try {
        docker info | Out-Null
    }
    catch {
        Write-Host "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Function to start authentication service
function Start-AuthService {
    Write-Host "Starting authentication service..."
    Push-Location backend/authentication
    docker-compose up -d
    Pop-Location
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting frontend service..."
    Push-Location aips
    docker-compose up -d
    Pop-Location
}

# Main execution
Check-Docker

# Start services
Start-AuthService
Start-Frontend

Write-Host "All services are starting up..."
Write-Host "Frontend will be available at: http://localhost:3000"
Write-Host "Authentication service will be available at: http://localhost:8080" 