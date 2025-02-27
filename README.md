# AIPS - AI Personality Analysis System

## Detailed Architecture

### System Overview
```
┌─────────────────┐     ┌──────────────┐
│   API Gateway   │────▶│    Redis     │
│    (Nginx)      │     │   (Cache)    │
└─────────┬───────┘     └──────────────┘
          │
          ▼
┌─────────┴───────┐     ┌──────────────┐
│  Load Balancer  │────▶│ Elasticsearch │
└─────────┬───────┘     │   (Search)    │
          │             └──────────────┘
          ▼
┌─────────┴───────┐     ┌──────────────┐
│  Authentication │────▶│   Auth DB     │
│  (Spring Boot)  │     │  (Postgres)   │
└─────────┬───────┘     └──────────────┘
          │
┌─────────┴───────┐     ┌──────────────┐
│    Analysis     │────▶│ Analysis DB   │
│    (Django)     │     │  (Postgres)   │
└─────────┬───────┘     └──────────────┘
          │
┌─────────┴───────┐     ┌──────────────┐
│ Recommendation  │────▶│   Recom DB    │
│    (Flask)      │     │  (Postgres)   │
└─────────┬───────┘     └──────────────┘
          │
┌─────────┴───────┐
│    Frontend     │
│    (React)      │

AIPS is built using a microservices architecture, with the following components:

### Frontend (React)
- Modern UI built with React and Material-UI
- Responsive design with mobile-first approach
- Theme switching (light/dark mode)
- Real-time data visualization
- State management with React Context
- Protected routes and authentication

### Backend Services

#### API Gateway (Spring Cloud Gateway)
- Central entry point for all client requests
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and circuit breaking
- API documentation with Swagger

#### Authentication Service (Spring Boot)
- User authentication and authorization
- JWT token management
- OAuth2 integration for social login
- User profile management
- Role-based access control

#### Analysis Service (Django)
- Personality analysis algorithms
- Machine learning models integration
- Data processing and feature extraction
- Results caching and optimization
- API endpoints for analysis requests

#### Recommendation Service (Flask)
- Personalized recommendations
- Collaborative filtering
- Content-based filtering
- Real-time recommendation updates
- Cache management for quick responses

### Data Storage
- PostgreSQL for user data and profiles
- MongoDB for analysis results
- Redis for caching and session management
- Elasticsearch for full-text search

### Monitoring Stack
- Prometheus for metrics collection
- Grafana for visualization
- ELK Stack for log management
- Custom health check endpoints

## Prerequisites

### Windows
- Docker Desktop for Windows
- Git Bash or WSL2 (recommended)
- Make sure Docker Desktop is running with WSL2 backend
- Enable BuildKit in Docker Desktop settings

### macOS
- Docker Desktop for Mac
- Homebrew (recommended)
- Git

### Linux
- Docker Engine
- Docker Compose
- Git

## Quick Start

1. **Clone the repository**
```bash
git clone git@github.com:blackrabbit52/AIPS.git (ssh)
git clone https://github.com/blackrabbit52/AIPS.git (https)
cd AIPS
```

2. **Set up environment variables**
Create a `.env` file in the root directory:
```bash
# Linux/macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (Command Prompt)
copy .env.example .env
```

3. **Launch the application**

Using the rebuild script:
```bash
# Linux/macOS
chmod +x scripts/rebuild.sh
./scripts/rebuild.sh

# Windows (Git Bash)
chmod +x scripts/rebuild.sh
./scripts/rebuild.sh

# Windows (PowerShell)
scripts/rebuild.ps1
```

4. **Access the services**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8888
- Authentication Service: http://localhost:8080
- Analysis Service: http://localhost:8000
- Recommendation Service: http://localhost:5000

## Development Setup

### Hot Reload Configuration
All services are configured with hot reload for development:

1. **Frontend (React)**
- Changes in `./frontend/src` are automatically reflected
- Environment variables:
```env
NODE_ENV=development
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
```

2. **Analysis Service (Django)**
- Auto-reloads on Python file changes
- Debug mode enabled
- Volume mounted: `./backend/analysis:/app`

3. **Authentication Service (Spring)**
- Spring DevTools enabled
- Remote debugging on port 5005
- Volume mounted: `./backend/authentication:/app`

4. **Recommendation Service (Flask)**
- Flask debug mode enabled
- Volume mounted: `./backend/recommendation:/app`

### Cache Configuration
The project uses Docker volume caching to improve build times:

```yaml
volumes:
  pip_cache:        # Python packages
  maven_cache:      # Java packages
  npm_cache:        # Node.js packages
  node_modules:     # Frontend dependencies
```

### Troubleshooting

#### Windows-specific issues
1. **Line endings**
```bash
# Configure Git to handle line endings
git config --global core.autocrlf input
```

2. **WSL2 memory issues**
Create `.wslconfig` in your Windows home directory:
```
[wsl2]
memory=6GB
processors=4
```

3. **Docker Desktop settings**
- Enable WSL2 backend
- Allocate sufficient resources (CPU/Memory)
- Enable BuildKit

#### macOS-specific issues
1. **Resource limits**
- Increase Docker Desktop memory allocation
- Configure CPU limits in Docker Desktop preferences

2. **File sharing**
- Ensure project directory is in Docker Desktop file sharing paths

#### Linux-specific issues
1. **Permissions**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

2. **Resource limits**
```bash
# Increase virtual memory for Elasticsearch
sudo sysctl -w vm.max_map_count=262144
```

### Common Issues

1. **Services not starting**
```bash
# Check service logs
docker-compose logs [service_name]

# Rebuild specific service
docker-compose build [service_name]
docker-compose up -d [service_name]
```

2. **Cache issues**
```bash
# Clear specific cache
docker-compose down -v
./scripts/rebuild.sh
```

3. **Port conflicts**
```bash
# Check ports in use
netstat -tulpn | grep LISTEN

# Modify ports in docker-compose.yml if needed
```

## Monitoring

### Local Development Monitoring

1. **Service Logs**
```bash
# Watch all services logs
docker-compose logs -f

# Watch specific service logs
docker-compose logs -f [service-name]

# Watch last 100 lines and follow
docker-compose logs -f --tail=100 [service-name]

# Filter logs by time
docker-compose logs -f --since 30m [service-name]  # Last 30 minutes
```

2. **Container Health**
```bash
# View running containers and their status
docker-compose ps

# View container resource usage
docker stats

# Check container health status
docker inspect --format='{{.State.Health.Status}}' [container-name]
```

3. **Service Health Endpoints**
- Frontend (React): http://localhost:3000/health
- API Gateway: http://localhost:8888/actuator/health
- Authentication: http://localhost:8080/actuator/health
- Analysis: http://localhost:8000/health
- Recommendation: http://localhost:5000/health

### Production Monitoring Stack

1. **Prometheus Setup**
```bash
# Start Prometheus
docker-compose -f docker-compose.monitoring.yml up -d prometheus

# Access Prometheus UI
open http://localhost:9090

# Common metrics
- container_memory_usage_bytes
- container_cpu_usage_seconds_total
- http_requests_total
- http_request_duration_seconds
```

2. **Grafana Configuration**
```bash
# Start Grafana
docker-compose -f docker-compose.monitoring.yml up -d grafana

# Access Grafana UI
open http://localhost:3000/monitoring

# Default credentials
username: admin
password: admin
```

3. **ELK Stack Integration**
```bash
# Start ELK Stack
docker-compose -f docker-compose.monitoring.yml up -d elasticsearch kibana logstash

# Access interfaces
Elasticsearch: http://localhost:9200
Kibana: http://localhost:5601
```

### Monitoring Dashboard URLs

1. **Application Metrics**
- System Overview: http://localhost:3000/monitoring/d/system
- API Performance: http://localhost:3000/monitoring/d/api
- Service Health: http://localhost:3000/monitoring/d/health
- Error Tracking: http://localhost:3000/monitoring/d/errors

2. **Log Analysis (Kibana)**
- Application Logs: http://localhost:5601/app/discover
- Error Analysis: http://localhost:5601/app/dashboard/error-analysis
- Performance Metrics: http://localhost:5601/app/dashboard/performance

### Alert Configuration

1. **Prometheus Alerting**
```yaml
# Example alert rules
groups:
- name: service_alerts
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 1m
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 1
    for: 2m
```

2. **Health Check Alerts**
```bash
# Check all services health
./scripts/health-check.sh

# Configure alert thresholds
export MEMORY_THRESHOLD=85  # Alert at 85% memory usage
export CPU_THRESHOLD=90     # Alert at 90% CPU usage
```

### Debugging Tools

1. **Container Debugging**
```bash
# Enter container shell
docker-compose exec [service-name] sh

# View container processes
docker-compose top [service-name]

# Check container networking
docker-compose exec [service-name] netstat -tulpn
```

2. **Log Analysis**
```bash
# Search logs for errors
docker-compose logs | grep -i error

# Export logs to file
docker-compose logs > logs.txt

# Analyze specific time range
docker-compose logs --since "2024-01-01T00:00:00" --until "2024-01-02T00:00:00"
```

3. **Performance Analysis**
```bash
# CPU profiling
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Memory leaks detection
docker-compose exec [service-name] top -o %MEM
```

### Maintenance Commands

1. **Cleanup**
```bash
# Remove old logs
docker-compose exec [service-name] truncate -s 0 /var/log/*.log

# Clear monitoring data
docker-compose down -v prometheus grafana elasticsearch

# Restart monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d
```

2. **Backup**
```bash
# Backup Prometheus data
docker run --rm -v prometheus_data:/source -v $(pwd)/backup:/backup \
    alpine tar czf /backup/prometheus-$(date +%Y%m%d).tar.gz /source

# Backup Grafana dashboards
curl -X GET http://admin:admin@localhost:3000/api/dashboards/uid/[dashboard-uid] \
    > backup/dashboard-$(date +%Y%m%d).json
```


