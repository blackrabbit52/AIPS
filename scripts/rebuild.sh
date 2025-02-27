#!/bin/bash

# Enable error handling
set -e

echo "🔄 Stopping existing containers..."
docker-compose down --remove-orphans

echo "🏗️ Building services..."
docker-compose build \
    --build-arg DOCKER_TIMEOUT=600 \
    --build-arg PIP_TIMEOUT=1000

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🚀 Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services!"
    docker-compose logs
    exit 1
fi

echo "⏳ Waiting for services to start..."
sleep 10

echo "📊 Services status:"
docker-compose ps

# Verify each service
echo "🏥 Health check..."
services=(
    "aips:3000"
    "api-gateway:8888"
    "authentication:8080"
    "analysis:8000"
    "recommendation:5000"
)

for service in "${services[@]}"; do
    name="${service%%:*}"
    port="${service#*:}"
    if docker-compose ps "$name" | grep -q "Up"; then
        echo "✅ $name is running (http://localhost:$port)"
    else
        echo "❌ $name is not running"
        echo "Logs for $name:"
        docker-compose logs "$name"
    fi
done 