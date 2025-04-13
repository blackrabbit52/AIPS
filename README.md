# AIPS - AI Personality Analysis System

## Detailed Architecture

### System Overview
```
┌─────────────────┐     ┌──────────────┐
│   API Gateway   │────▶│    Redis     │
│    (Nginx)      │     │   (Cache)    │
└─────────┬───────┘     └──────────────┘
          │             ┌──────────────┐
          │        ┌───▶│    Celery    │
          ▼        │    │   (Workers)  │
┌─────────┴───────┐│    └──────────────┘
│  Load Balancer  ││    ┌──────────────┐
└─────────┬───────┘├───▶│ Elasticsearch │
          │        │    │   (Search)    │
          ▼        │    └──────────────┘
┌─────────┴───────┐│    
│  Authentication ││    ┌──────────────┐
│  (Spring Boot)  │├───▶│   Auth DB    │
└─────────┬───────┘│    │  (Postgres)  │
          │        │    └──────────────┘
┌─────────┴───────┐│    
│    Analysis     ││    ┌──────────────┐
│    (Django)     │├───▶│ Analysis DB  │
└─────────┬───────┘│    │  (Postgres)  │
          │        │    └──────────────┘
┌─────────┴───────┐│    
│ Recommendation  ││    ┌──────────────┐
│    (Flask)      │├───▶│   Recom DB   │
└─────────┬───────┘│    │  (Postgres)  │
          │        │    └──────────────┘
┌─────────┴───────┐│
│    Frontend     ││
│    (React)      ││
└─────────────────┘│

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
- Role-based access control (RBAC)
- Permission-based access control
- User session management
- Password encryption with BCrypt
- Token blacklisting
- Account verification

##### Authentication Endpoints
```
POST /api/v1/auth/signup
- Register a new user
- Body: {
    "username": "string",
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string"
  }
- Response: User details with roles and permissions

POST /api/v1/auth/signin
- Authenticate user
- Body: {
    "usernameOrEmail": "string",
    "password": "string"
  }
- Response: JWT token with user details

GET /api/v1/users/check-username-availability
- Check if username is available
- Query: ?username=string
- Response: boolean

GET /api/v1/users/check-email-availability
- Check if email is available
- Query: ?email=string
- Response: boolean

GET /api/v1/users
- Get all users (admin only)
- Headers: Authorization: Bearer {token}
- Response: Array of users

GET /api/v1/users/{id}
- Get user by ID
- Headers: Authorization: Bearer {token}
- Response: User details

PUT /api/v1/users/{id}
- Update user
- Headers: Authorization: Bearer {token}
- Body: User update data
- Response: Updated user details

DELETE /api/v1/users/{id}
- Delete user
- Headers: Authorization: Bearer {token}
- Response: 200 OK
```

##### Role Management Endpoints
```
GET /api/v1/roles
- Get all roles
- Headers: Authorization: Bearer {token}
- Response: Array of roles

POST /api/v1/roles
- Create new role
- Headers: Authorization: Bearer {token}
- Body: {
    "name": "string",
    "description": "string",
    "permissions": ["string"]
  }
- Response: Created role

PUT /api/v1/roles/{id}
- Update role
- Headers: Authorization: Bearer {token}
- Body: Role update data
- Response: Updated role

DELETE /api/v1/roles/{id}
- Delete role
- Headers: Authorization: Bearer {token}
- Response: 200 OK
```

##### Default Roles and Permissions
```
Roles:
- ROLE_ADMIN: Full system access
- ROLE_USER: Basic user access
- ROLE_ANALYST: Analysis-specific access

Permissions:
- User Management:
  - user:create, user:read, user:update, user:delete
- Role Management:
  - role:create, role:read, role:update, role:delete
- Analysis:
  - analysis:create, analysis:read, analysis:update, analysis:delete
- Recommendation:
  - recommendation:create, recommendation:read, recommendation:update, recommendation:delete
- Admin:
  - admin:access
```

#### Analysis Service (Django)
- Personality analysis algorithms
- Machine learning models integration
- Data processing and feature extraction
- Results caching and optimization
- API endpoints for analysis requests
- Asynchronous task processing with Celery
- Dataset management and model training
- Progress tracking with visual stepper component
- Memory-optimized model training process
- Improved error handling for large datasets

##### Automatic Dataset Management
The Analysis Service includes an automated dataset management system that:
- Automatically fetches relevant personality datasets from Kaggle
- Supports both MBTI and OCEAN personality models
- Downloads and organizes datasets by type
- Tracks dataset metadata and usage statistics
- Intelligent file format detection and conversion
- Support for CSV, TSV, Excel, and fixed-width formats
- Memory-efficient data loading through chunking

Pre-configured datasets include:
1. MBTI Datasets:
   - MBTI Personality Types Dataset (16 personality types)
   - Twitter Personality Dataset (social media correlations)

2. OCEAN Datasets:
   - Big Five Personality Test Dataset
   - Facebook Posts and Personality Scores

##### New API Endpoints (v1)
```
POST /api/v1/analysis/analyze_text/
- Analyze personality from text input
- Body: { "text": "string" }
- Response: Personality analysis results (MBTI & OCEAN)

POST /api/v1/analysis/analyze_social_media/
- Analyze personality from social media profile
- Body: {
    "username": "string",
    "platform": "twitter|facebook|linkedin",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD"
  }
- Response: Personality analysis results

GET /api/v1/datasets/
- List available datasets
- Response: Array of datasets with metadata

POST /api/v1/datasets/fetch_kaggle/
- Automatically download all relevant personality datasets
- No body required
- Response: Task status and dataset information

GET /api/v1/datasets/by_type?type=MBTI|OCEAN
- Get datasets filtered by type
- Response: Filtered list of datasets

POST /api/v1/datasets/fetch_and_train/
- Download datasets and train models in one operation
- Body: {
    "model_types": ["MBTI", "OCEAN"],
    "data_limit": 1000,  # Optional limit for training samples
    "force_limit": true, # Strictly enforce data limit
    "check_existing_files": true # Whether to use existing datasets if available
  }
- Response: Task status with multi-stage progress tracking

GET /api/v1/analysis/task_status/?task_id=xxx
- Check status of long-running analysis tasks
- Response: Task status, progress, and results

GET /api/v1/analysis/check_models_status/
- Check if models are available for analysis
- Response: Availability status of personality models
```

##### Dataset Organization
```
data/
├── datasets/
│   ├── kaggle/
│   │   ├── mbti/              # MBTI-related datasets
│   │   │   ├── mbti-type/
│   │   │   │   └── mbti_1.csv
│   │   │   └── twitter-personality-data/
│   │   └── ocean/             # OCEAN-related datasets
│   │       ├── big-five-personality-test/
│   │       │   └── IPIP-FFM-data-8Nov2018/
│   │       └── facebook-posts-and-personality-scores/
└── models/
    ├── mbti/             # Trained MBTI models
    │   ├── model/        # Model files
    │   ├── tokenizer/    # Tokenizer configuration
    │   └── results/      # Training results
    └── ocean/            # Trained OCEAN models
        ├── model/        # Model files
        ├── tokenizer/    # Tokenizer configuration
        └── results/      # Training results
```

##### Frontend Analysis Features
- Visual progress tracking for model training process
- Multi-stage stepper component showing:
  - Downloading Datasets
  - Processing Data
  - Training Models
  - Finalizing
- Real-time status updates for model training
- Responsive error handling with user-friendly messages
- Dynamic model availability indicators
- Redirection to contact form when models unavailable
- Memory-efficient model training visualization

##### Asynchronous Processing
The Analysis Service uses Celery for handling time-consuming tasks:
- Dataset downloads and preprocessing
- Model training and evaluation
- Social media data collection
- Batch personality analysis
- Cache management

Tasks are queued in Redis and processed by Celery workers, ensuring:
- Scalable processing
- Background execution
- Task prioritization
- Progress tracking with detailed step information
- Error handling and retries
- Memory-optimized processing for large datasets

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

Alternative commands using Docker Compose directly:
```bash
# Launch all services
docker-compose up

# Launch a specific service (e.g., frontend)
DOCKER_BUILDKIT=1 docker-compose build aips && docker-compose up aips

# Launch multiple services (e.g., frontend and analysis)
DOCKER_BUILDKIT=1 docker-compose build aips analysis && docker-compose up aips analysis

# Launch a service with its dependencies (e.g., analysis service with its database)
DOCKER_BUILDKIT=1 docker-compose build analysis && docker-compose up analysis analysis-db
```

Note: Using `DOCKER_BUILDKIT=1` enables better caching and faster builds. The build step can be skipped if no changes were made to the service's files.

4. **Access the services**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8888
- Authentication Service: http://localhost:8080
- Analysis Service: http://localhost:8000
- Recommendation Service: http://localhost:5000

## Cache Management

To clean all Docker volumes (which will clear all caches) for the project:
```bash
# Remove all volumes with 'aips' prefix
docker volume rm $(docker volume ls -q | grep aips)
```

This command will remove all Docker volumes associated with the project (those prefixed with 'aips'). Use this when you want to:
- Clear all caches and start fresh
- Resolve dependency conflicts
- Free up disk space
- Reset the project to a clean state

Note: After running this command, the next build will take longer as it needs to download all dependencies again.

## Development Setup

### Prerequisites
- Docker Desktop
- Git

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aips.git
cd aips
```

2. Initial Setup:

For Unix-based systems (Linux/macOS):
```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

For Windows:
```powershell
.\scripts\setup.ps1
```

3. Start Development Environment:

For Unix-based systems (Linux/macOS):
```bash
./scripts/dev.sh
```

For Windows:
```powershell
.\scripts\dev.ps1
```

The development environment will start with:
- Frontend (React) at http://localhost:3000
- Authentication Service at http://localhost:8080
- PostgreSQL Database at localhost:5433

### Development Workflow

- The frontend code in `./aips` directory is mounted as a volume, so changes will automatically trigger hot-reload
- The authentication service in `./backend/authentication` is also mounted as a volume for live development
- Database data persists in `./data/postgres/auth`
- Node modules are stored in a named volume for better performance
- Maven repository is cached in a named volume for faster builds

### Troubleshooting

If you encounter any issues:

1. Ensure Docker Desktop is running
2. Clean up Docker resources:
```bash
docker-compose down --volumes --remove-orphans
docker system prune -af
```
3. Remove data directories:
```bash
rm -rf data/*  # Unix
Remove-Item -Recurse -Force data/*  # Windows
```
4. Run setup script again
5. Start development environment

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

## Docker Deployment

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2 or later

### Development Setup

#### Windows
```powershell
# Initial setup
.\scripts\setup.ps1

# Start services
docker-compose up --build aips auth-service
```

#### Linux/MacOS
```bash
# Initial setup
chmod +x ./scripts/setup.sh
./scripts/setup.sh

# Start services
docker-compose up --build aips auth-service
```

### Volume Management
The project uses Docker volumes for data persistence:
- `./data/postgres/auth`: Authentication service database
- `./data/postgres/analysis`: Analysis service database
- `./data/postgres/recommendation`: Recommendation service database
- `./data/elasticsearch`: Elasticsearch data
- `./data/redis`: Redis data

### Development Notes
- Hot reloading is enabled for the frontend (React) application
- The frontend is accessible at http://localhost:3000
- The authentication service API is accessible at http://localhost:8080
- The authentication database is accessible at localhost:5433
- Environment variables are configured in docker-compose.yml for easy development
- Data persistence is handled through Docker volumes mapped to ./data directory

### Troubleshooting
If you encounter any issues:
1. Stop all containers: `docker-compose down`
2. Clean up Docker system: `docker system prune -af`
3. Remove the ./data directory
4. Run the setup script again
5. Start the services

## Environment Setup

### Authentication Service Configuration
Create a `.env` file in the `backend/authentication` directory:
```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://postgres-auth:5432/auth
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_min_32_chars
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*
CORS_EXPOSED_HEADERS=Authorization
```

### Frontend Configuration
Update the `.env` file in the `aips` directory to include:
```bash
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_NAME=AIPS
REACT_APP_VERSION=1.0.0
```

## Testing the Authentication Service

1. **Start the Authentication Service**
```bash
# Using Docker Compose
docker-compose up auth-service postgres-auth

# Check service health
curl http://localhost:8080/api/v1/actuator/health
```

2. **Register a New User**
```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

3. **Login**
```bash
curl -X POST http://localhost:8080/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "password123"
  }'
```

## Testing Individual Services

### Authentication Service

To test the authentication service independently:

```bash
# For Unix-based systems (Linux/macOS)
chmod +x scripts/deploy-auth.sh
./scripts/deploy-auth.sh

# For Windows (PowerShell)
.\scripts\deploy-auth.sh
```

#### Available Endpoints

1. Authentication
```
POST /api/v1/auth/signup
- Register new user
- Body: {
    "username": "string",
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string"
  }

POST /api/v1/auth/signin
- Authenticate user
- Body: {
    "usernameOrEmail": "string",
    "password": "string"
  }
```

2. User Management
```
GET /api/v1/users/check-username-availability?username=string
GET /api/v1/users/check-email-availability?email=string
GET /api/v1/users
GET /api/v1/users/{id}
PUT /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

#### Testing with cURL

1. Register a new user:
```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. Sign in:
```bash
curl -X POST http://localhost:8080/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "password123"
  }'
```

3. Check username availability:
```bash
curl http://localhost:8080/api/v1/users/check-username-availability?username=testuser
```

#### Development Notes

- The authentication service runs on port 8080
- PostgreSQL database runs on port 5433
- Remote debugging is enabled on port 5005
- Swagger UI is available at http://localhost:8080/swagger-ui.html
- Spring Boot Actuator endpoints are available at http://localhost:8080/actuator

├───aips
│   ├───.cache
│   ├───node_modules
│   ├───public
│   └───src
│       ├───assets
│       ├───components
│       │   ├───common
│       │   └───layout
│       ├───pages
│       ├───services
│       ├───store
│       │   └───slices
│       └───theme
├───backend
│   ├───analysis
│   │   ├───analysis
│   │   │   └───__pycache__
│   │   ├───data
│   │   │   ├───datasets
│   │   │   └───models
│   │   ├───personality_analyzer
│   │   │   └───__pycache__
│   │   └───venv
│   ├───authentication
│   │   ├───.mvn
│   │   │   └───wrapper
│   │   ├───src
│   │   │   ├───main
│   │   │   │   ├───java
│   │   │   │   │   └───com
│   │   │   │   │       └───aips
│   │   │   │   │           └───authentication
│   │   │   │   │               ├───config
│   │   │   │   │               ├───controller
│   │   │   │   │               ├───dto
│   │   │   │   │               ├───exception
│   │   │   │   │               ├───model
│   │   │   │   │               │   └───audit
│   │   │   │   │               ├───repository
│   │   │   │   │               ├───security
│   │   │   │   │               └───service
│   │   │   │   └───resources
│   │   │   └───test
│   │   │       └───java
│   │   │           └───com
│   │   │               └───aips
│   │   │                   └───authentication
│   │   │                       └───service
│   │   └───target
│   │       ├───classes
│   │       │   └───com
│   │       │       └───aips
│   │       │           └───authentication
│   │       │               ├───config
│   │       │               ├───controller
│   │       │               ├───dto
│   │       │               ├───exception
│   │       │               ├───model
│   │       │               │   └───audit
│   │       │               ├───repository
│   │       │               ├───security
│   │       │               └───service
│   │       ├───generated-sources
│   │       │   └───annotations
│   │       ├───generated-test-sources
│   │       │   └───test-annotations
│   │       ├───maven-archiver
│   │       ├───maven-status
│   │       │   └───maven-compiler-plugin
│   │       │       ├───compile
│   │       │       │   └───default-compile
│   │       │       └───testCompile
│   │       │           └───default-testCompile
│   │       └───test-classes
│   │           └───com
│   │               └───aips
│   │                   └───authentication
│   │                       └───service
│   └───recommendation
│       ├───app
│       │   └───__pycache__
│       ├───migrations
│       │   ├───versions
│       │   │   └───__pycache__
│       │   └───__pycache__
│       └───venv
├───Data
│   ├───elasticsearch
│   ├───models
│   ├───postgres
│   │   ├───analysis
│   │   ├───auth
│   │   └───recommendation
│   ├───processed
│   ├───raw
│   └───redis
├───deployment
│   ├───kubernetes
│   └───nginx
│       └───ssl
├───monitoring
│   ├───grafana
│   │   └───provisioning
│   │       ├───dashboards
│   │       └───datasources
│   ├───logstash
│   │   ├───config
│   │   └───pipeline
│   └───prometheus
│       └───rules
└───scripts


backend/
├── src/main/java/com/aips/authentication/
│   ├── controller/
│   │   └── AuthController.java
│   ├── dto/
│   │   ├── SignInRequest.java
│   │   ├── SignUpRequest.java
│   │   └── JwtAuthenticationResponse.java
│   ├── model/
│   │   ├── User.java
│   │   ├── Role.java
│   │   └── RoleType.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── RoleRepository.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   └── UserPrincipal.java
│   ├── service/
│   │   ├── AuthenticationService.java
│   │   └── UserService.java
│   └── AuthenticationApplication.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml