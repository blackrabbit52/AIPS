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

# Function to clean up Docker resources
function Cleanup-Docker {
    Write-Host "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
}

# Function to start services
function Start-Services {
    Write-Host "Starting services..."
    docker-compose up --build aips auth-service
}

# Main
Write-Host "Starting development environment..."
Check-Docker
Cleanup-Docker
Start-Services 