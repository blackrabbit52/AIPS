#!/bin/bash
set -e

# Wait for the database to be ready
echo "Waiting for database to be ready..."
python -c "
import sys
import time
import psycopg2
while True:
    try:
        conn = psycopg2.connect(
            dbname=\"${DB_NAME}\",
            user=\"${DB_USER}\",
            password=\"${DB_PASSWORD}\",
            host=\"${DB_HOST}\",
            port=\"${DB_PORT}\"
        )
        conn.close()
        break
    except psycopg2.OperationalError:
        print('Database not ready yet. Waiting...')
        time.sleep(1)
"
echo "Database is ready!"

# Check Kaggle installation version
echo "Checking installed Kaggle version:"
pip show kaggle

# Configure Kaggle authentication if credentials are provided
if [ ! -z "$KAGGLE_USERNAME" ] && [ ! -z "$KAGGLE_KEY" ]; then
  echo "Configuring Kaggle authentication..."
  mkdir -p /root/.kaggle
  echo "{\"username\":\"$KAGGLE_USERNAME\",\"key\":\"$KAGGLE_KEY\"}" > /root/.kaggle/kaggle.json
  chmod 600 /root/.kaggle/kaggle.json
  echo "Kaggle authentication configured."
else
  echo "Kaggle credentials not provided as environment variables. Skipping Kaggle configuration."
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start Celery worker
echo "Starting Celery worker..."
celery -A analysis worker --loglevel=info 