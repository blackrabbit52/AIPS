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
└─────────────────┘
```

### Service Roles and Technologies

#### 1. API Gateway (Nginx)
- **Role**: Request routing and load balancing
- **Features**:
  - SSL/TLS termination
  - Request rate limiting
  - Response caching
  - Load balancing
- **Configuration**: `/deployment/nginx/nginx.conf`

#### 2. Authentication Service (Spring Boot)
- **Role**: User management and authentication
- **Technologies**:
  - Spring Security
  - JWT Authentication
  - OAuth2 Integration
- **Features**:
  - User registration/login
  - Role-based access control
  - Session management
  - Password recovery

#### 3. Analysis Service (Django)
- **Role**: Personality analysis processing
- **Key Components**:
  - **Celery Workers**: Async task processing
  - **Celery Beat**: Scheduled tasks
  - **Redis**: Message broker
  - **Flower**: Task monitoring
- **Features**:
  - Text preprocessing
  - ML model inference
  - Batch processing
  - Real-time analysis

#### 4. Recommendation Service (Flask)
- **Role**: Team role recommendations
- **Technologies**:
  - scikit-learn
  - TensorFlow
  - Flask-RESTful
- **Features**:
  - Role matching algorithms
  - Personality-based recommendations
  - Team composition analysis

#### 5. Frontend (React)
- **Role**: User interface
- **Technologies**:
  - Material-UI
  - Redux Toolkit
  - React Router
  - Chart.js
- **Features**:
  - Responsive design
  - Real-time updates
  - Interactive visualizations

### Background Services

#### 1. Celery Configuration
```yaml
# Analysis Service Celery
celery:
  image: analysis
  command: celery -A analysis worker -l info
  volumes:
    - ./backend/analysis:/app
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
  depends_on:
    - redis

# Celery Beat (Scheduled Tasks)
celery-beat:
  image: analysis
  command: celery -A analysis beat -l info
  volumes:
    - ./backend/analysis:/app
  depends_on:
    - redis

# Celery Flower (Monitoring)
celery-flower:
  image: analysis
  command: celery -A analysis flower
  ports:
    - "5555:5555"
  depends_on:
    - redis
```

#### 2. Redis Usage
- **Session Storage**: User sessions
- **Caching Layer**: API responses
- **Message Broker**: Celery tasks
- **Rate Limiting**: API request throttling

#### 3. Elasticsearch
- **Purpose**: Full-text search and analytics
- **Usage**:
  - User search
  - Content indexing
  - Analytics aggregation

### Deployment Configuration

#### 1. Development Environment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start with scaling
docker-compose -f docker-compose.dev.yml --scale analysis=3 --scale recommendation=2
```

#### 2. Production Environment
```bash
# Start production environment
docker-compose -f deployment/docker-compose.prod.yml up -d

# Deploy with monitoring
docker-compose -f deployment/docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
```

#### 3. Monitoring Stack
```yaml
# Prometheus for metrics
prometheus:
  image: prom/prometheus
  volumes:
    - ./monitoring/prometheus:/etc/prometheus
  ports:
    - "9090:9090"

# Grafana for visualization
grafana:
  image: grafana/grafana
  volumes:
    - ./monitoring/grafana:/var/lib/grafana
  ports:
    - "3000:3000"

# ELK Stack for logging
elasticsearch:
  image: elasticsearch:7.9.3
logstash:
  image: logstash:7.9.3
kibana:
  image: kibana:7.9.3
```

### Data Flow

1. **Request Flow**:
```
Client → API Gateway → Service → Cache/DB → Response
```

2. **Analysis Flow**:
```
Text Input → Preprocessing → Model Inference → Celery Task → Results
```

3. **Authentication Flow**:
```
Login Request → JWT Generation → Token Validation → Protected Resource
```

### Scaling Strategy

1. **Horizontal Scaling**:
- Stateless services can be scaled using Docker Swarm/Kubernetes
- Database replication for read scaling
- Redis cluster for cache scaling

2. **Vertical Scaling**:
- Increase container resources
- Upgrade database instances
- Optimize application performance

### Backup and Recovery

1. **Database Backups**:
```bash
# Automated backup script
./scripts/backup-dbs.sh

# Manual backup
docker-compose exec postgres pg_dump -U postgres > backup.sql
```

2. **Volume Backups**:
```bash
# Backup volumes
docker run --rm -v aips_data:/data -v /backup:/backup alpine tar czf /backup/data.tar.gz /data
```

### Security Measures

1. **Network Security**:
- Internal network isolation
- Rate limiting
- SSL/TLS encryption

2. **Application Security**:
- JWT authentication
- CORS configuration
- Input validation
- XSS protection

3. **Database Security**:
- Encrypted connections
- Role-based access
- Regular security updates

### Performance Optimization

1. **Caching Strategy**:
- Redis for API responses
- Browser caching
- Database query caching

2. **Load Balancing**:
- Round-robin distribution
- Least connections
- Resource-based routing

3. **Resource Management**:
- Container resource limits
- Database connection pooling
- Memory optimization

## License
[Add your license information here] 

AIPS/
├── frontend/
├── backend/
├── docker-compose.dev.yml
└── deployment/
    ├── docker-compose.prod.yml
    └── nginx/
        ├── nginx.prod.conf
        └── ssl/ 