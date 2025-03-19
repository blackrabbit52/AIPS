# Stop all running containers
docker-compose down --volumes --remove-orphans

# Remove all containers, networks, and volumes
docker system prune -af --volumes

# Function to create necessary directories
function Create-Directories {
    New-Item -ItemType Directory -Force -Path data/postgres/auth
    New-Item -ItemType Directory -Force -Path data/postgres/analysis
    New-Item -ItemType Directory -Force -Path data/postgres/recommendation
    New-Item -ItemType Directory -Force -Path data/elasticsearch
    New-Item -ItemType Directory -Force -Path data/redis
}

# Main setup
Write-Host "Starting setup..."
Create-Directories
Write-Host "Setup completed successfully!" 