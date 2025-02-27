# AIPS Platform (Advanced Intelligent Personality System)

Une application web moderne pour l'analyse de personnalité basée sur l'IA.

## Technologies Utilisées

- React 
- Material-UI
- Docker
- Node.js 16

## Fonctionnalités

- Interface utilisateur moderne et responsive
- Thème clair/sombre
- Authentification utilisateur
- Tableau de bord analytique
- Analyse de personnalité
- Navigation intuitive
- Design responsive

## Prérequis

- Docker
- Docker Compose
- Node.js 16+
- npm

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd aips
```

2. Lancer l'application avec Docker :
```bash
docker-compose up -d
```

L'application sera accessible à l'adresse : http://localhost:3000

## Développement

Pour le développement en local :

1. Installer les dépendances :
```bash
npm install --legacy-peer-deps
```

2. Lancer l'application en mode développement :
```bash
npm start
```

## Structure du Projet

```
aips/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── layout/
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Navbar.jsx
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Analysis.jsx
│   │   ├── Settings.jsx
│   │   └── Profile.jsx
│   ├── App.jsx
│   └── index.js
├── public/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Configuration

L'application utilise les variables d'environnement suivantes pour le hot reload :

```
NODE_ENV=development
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
FAST_REFRESH=true
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

# AIPS - AI Personality Analysis System

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

Alternatively, using Docker Compose directly:
```bash
# Stop existing containers
docker-compose down --remove-orphans

# Build and start services
docker-compose build
docker-compose up -d
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

## License

## Support Multi-Plateforme

### Configuration Spécifique par Système

#### Windows
1. **Prérequis supplémentaires**
   ```bash
   # Installation de WSL2 (PowerShell Admin)
   wsl --install
   
   # Configuration de Git pour les fins de ligne
   git config --global core.autocrlf input
   ```

2. **Configuration WSL2**
   Créer `.wslconfig` dans `C:\Users\<votre-nom>`:
   ```
   [wsl2]
   memory=6GB
   processors=4
   ```

3. **Docker Desktop**
   - Activer l'intégration WSL2
   - Allouer au moins 6GB de RAM
   - Activer BuildKit

#### macOS
1. **Optimisation Docker**
   ```bash
   # Installation des outils via Homebrew
   brew install docker docker-compose
   
   # Configuration des ressources
   # Modifier dans Docker Desktop > Preferences > Resources:
   # - CPU: 4
   # - Memory: 6GB
   # - Swap: 1GB
   ```

2. **Permissions**
   ```bash
   # Accès aux dossiers
   sudo chown -R $USER:staff /path/to/AIPS
   ```

#### Linux
1. **Configuration système**
   ```bash
   # Elasticsearch
   sudo sysctl -w vm.max_map_count=262144
   
   # Docker sans sudo
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Optimisation des ressources**
   ```bash
   # Limites système
   sudo tee /etc/sysctl.d/99-docker.conf <<EOF
   vm.max_map_count=262144
   fs.file-max=65536
   EOF
   
   sudo sysctl --system
   ```

### Scripts de Lancement Multi-Plateforme

Le script `rebuild.sh` est compatible avec tous les systèmes d'exploitation :

```bash
# Linux/macOS
chmod +x scripts/rebuild.sh
./scripts/rebuild.sh

# Windows (Git Bash)
chmod +x scripts/rebuild.sh
./scripts/rebuild.sh

# Windows (PowerShell)
.\scripts\rebuild.ps1
```

### Résolution des Problèmes Courants

1. **Problèmes de Performance**
   - Windows : Utiliser WSL2 au lieu de WSL1
   - macOS : Activer le mode expérimental dans Docker Desktop
   - Linux : Utiliser le storage driver overlay2

2. **Problèmes de Montage**
   - Windows : Vérifier les chemins dans WSL2
   - macOS : Autoriser les dossiers dans Docker Desktop
   - Linux : Vérifier les permissions des dossiers

3. **Problèmes de Réseau**
   ```bash
   # Vérification des ports (tous OS)
   # Windows (PowerShell)
   netstat -ano | findstr "PORT"
   
   # macOS/Linux
   netstat -tulpn | grep LISTEN
   ```

## Cross-Platform Support

### System-Specific Configuration

#### Windows
1. **Additional Prerequisites**
   ```bash
   # Install WSL2 (PowerShell Admin)
   wsl --install
   
   # Configure Git line endings
   git config --global core.autocrlf input
   ```

2. **WSL2 Configuration**
   Create `.wslconfig` in `C:\Users\<your-username>`:
   ```
   [wsl2]
   memory=6GB
   processors=4
   swap=0
   ```

3. **Docker Desktop**
   - Enable WSL2 integration
   - Allocate at least 6GB RAM
   - Enable BuildKit

#### macOS
1. **Docker Optimization**
   ```bash
   # Install tools via Homebrew
   brew install docker docker-compose
   
   # Resource configuration
   # Modify in Docker Desktop > Preferences > Resources:
   # - CPU: 4
   # - Memory: 6GB
   # - Swap: 1GB
   ```

2. **Permissions**
   ```bash
   # Folder access
   sudo chown -R $USER:staff /path/to/AIPS
   ```

#### Linux
1. **System Configuration**
   ```bash
   # Elasticsearch
   sudo sysctl -w vm.max_map_count=262144
   
   # Docker without sudo
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Resource Optimization**
```bash
   # System limits
   sudo tee /etc/sysctl.d/99-docker.conf <<EOF
   vm.max_map_count=262144
   fs.file-max=65536
   EOF
   
   sudo sysctl --system
   ```

### Cross-Platform Launch Scripts

The `rebuild.sh` script is compatible with all operating systems:

```bash
# Linux/macOS
chmod +x scripts/rebuild.sh
./scripts/rebuild.sh

# Windows (Git Bash)
chmod +x scripts/rebuild.sh
./scripts/rebuild.sh

# Windows (PowerShell)
.\scripts\rebuild.ps1
```

### Common Issues Resolution

1. **Performance Issues**
   - Windows: Use WSL2 instead of WSL1
   - macOS: Enable experimental mode in Docker Desktop
   - Linux: Use overlay2 storage driver

2. **Mount Issues**
   - Windows: Check paths in WSL2
   - macOS: Allow folders in Docker Desktop
   - Linux: Check folder permissions

3. **Network Issues**
```bash
   # Check ports (all OS)
   # Windows (PowerShell)
   netstat -ano | findstr "PORT"
   
   # macOS/Linux
   netstat -tulpn | grep LISTEN
   ```

## Running the Application

### Development Environment

To run the application in development mode with hot-reload:

```bash
# Start all services in development mode
./scripts/rebuild.sh

# Access the services:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8888
- Authentication Service: http://localhost:8080
- Analysis Service: http://localhost:8000
- Recommendation Service: http://localhost:5000
```

### Production Environment

To run the application in production mode:

```bash
# Build and start all services in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Access the services:
- Frontend: http://localhost
- API Gateway: http://localhost:80
```

### Monitoring Environment

To run the monitoring stack (Prometheus, Grafana, etc.):

```bash
# Start the monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Access the monitoring interfaces:
- Grafana: http://localhost:3001 (default credentials: admin/admin)
- Prometheus: http://localhost:9090
```

## Development Scripts

### rebuild.sh

The `rebuild.sh` script in the `scripts` directory handles the development workflow:

1. Stops any existing containers
2. Rebuilds all services using cached dependencies
3. Starts all services in development mode
4. Performs health checks
5. Displays service URLs and status

Features:
- Preserves dependency caches between builds
- Hot-reload enabled for all services
- Automatic health checking
- Clear status output

### Useful Commands

```bash
# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f [service_name]

# Restart a specific service
docker-compose restart [service_name]

# Stop all services
docker-compose down

# Clean up unused resources (use with caution)
docker system prune

# View service status
docker-compose ps
```

## Cache Management

The development environment uses Docker volumes to cache dependencies:

- Frontend (React): node_modules and npm cache
- Analysis (Django): pip cache and virtualenv
- Authentication (Spring): Maven cache
- Recommendation (Flask): pip cache and virtualenv

These caches are preserved between rebuilds to speed up development.

## Monitoring Stack

The monitoring setup includes:

- Prometheus: Metrics collection
- Grafana: Metrics visualization
- Node Exporter: System metrics
- cAdvisor: Container metrics

Custom dashboards are available in Grafana for:
- Service health monitoring
- Performance metrics
- Resource usage
- API endpoints statistics


