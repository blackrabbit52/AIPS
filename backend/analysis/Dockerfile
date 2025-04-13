# Build stage
FROM python:3.9-slim as builder

WORKDIR /app

# Install system dependencies including wget
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Setup pip cache and virtual environment
ENV PIP_CACHE_DIR=/root/.cache/pip
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install dependencies and download model directly
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install --default-timeout=100 -r requirements.txt && \
    wget https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.6.0/en_core_web_sm-3.6.0-py3-none-any.whl && \
    pip install en_core_web_sm-3.6.0-py3-none-any.whl && \
    python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Runtime stage
FROM python:3.9-slim

WORKDIR /app

# Copy virtual environment from builder
ENV VIRTUAL_ENV=/opt/venv
COPY --from=builder $VIRTUAL_ENV $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy source code
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=analysis.settings

# Install curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /app/data/datasets /app/data/models

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Function to check if PostgreSQL is ready\n\
postgres_ready() {\n\
  python << END\n\
import sys\n\
import psycopg2\n\
import os\n\
import time\n\
try:\n\
    dbname = os.environ.get("DB_NAME", "analysis_db")\n\
    user = os.environ.get("DB_USER", "postgres")\n\
    password = os.environ.get("DB_PASSWORD", "postgres")\n\
    host = os.environ.get("DB_HOST", "analysis_db")\n\
    port = os.environ.get("DB_PORT", "5432")\n\
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)\n\
except psycopg2.OperationalError:\n\
    sys.exit(-1)\n\
sys.exit(0)\n\
END\n\
}\n\
\n\
# Wait for PostgreSQL to be ready\n\
until postgres_ready; do\n\
  echo "PostgreSQL is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
echo "PostgreSQL is up - executing migrations"\n\
\n\
# Apply migrations\n\
echo "Creating migrations if needed..."\n\
python manage.py makemigrations personality_analyzer\n\
\n\
echo "Applying migrations..."\n\
python manage.py migrate\n\
\n\
# Configure Kaggle authentication if credentials are provided\n\
if [ ! -z "$KAGGLE_USERNAME" ] && [ ! -z "$KAGGLE_KEY" ]; then\n\
  echo "Configuring Kaggle authentication..."\n\
  mkdir -p /root/.kaggle\n\
  echo "{\\"username\\":\\"$KAGGLE_USERNAME\\",\\"key\\":\\"$KAGGLE_KEY\\"}" > /root/.kaggle/kaggle.json\n\
  chmod 600 /root/.kaggle/kaggle.json\n\
  echo "Kaggle authentication configured."\n\
else\n\
  echo "Kaggle credentials not provided as environment variables. Skipping Kaggle configuration."\n\
fi\n\
\n\
# Start the Django application\n\
echo "Starting Django application..."\n\
exec "$@"\n\
' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command to run the server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] 