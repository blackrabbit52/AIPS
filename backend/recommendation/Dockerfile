# Build stage
FROM python:3.9-slim as builder

WORKDIR /app

# Install system dependencies for build
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY requirements.txt .

# Setup pip cache and virtual environment
ENV PIP_CACHE_DIR=/root/.cache/pip
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r requirements.txt

# Runtime stage
FROM python:3.9-slim

WORKDIR /app

# Copy virtual environment from builder
ENV VIRTUAL_ENV=/opt/venv
COPY --from=builder $VIRTUAL_ENV $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install minimal system dependencies for runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Environment variables
ENV FLASK_APP=app
ENV FLASK_DEBUG=1
ENV PYTHONUNBUFFERED=1

# Exposed port
EXPOSE 5000

# Health check with correct API path
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/recommend/health || exit 1

# Startup command
CMD sh -c 'echo "Waiting for database..." && \
           sleep 5 && \
           echo "Initializing migrations..." && \
           if [ ! -d /app/migrations ]; then \
             flask db init && \
             flask db migrate -m "Initial migration" && \
             echo "Migrations initialized." ; \
           fi && \
           echo "Running migrations..." && \
           flask db upgrade && \
           echo "Starting application..." && \
           flask run --host=0.0.0.0' 