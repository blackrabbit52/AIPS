#!/bin/bash
set -e

# Change to the correct directory
cd /app

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

# Configure Kaggle authentication
echo "Configuring Kaggle authentication..."
mkdir -p /root/.kaggle
echo "{\"username\":\"brucesiani\",\"key\":\"559c5ffec8dbf9b6b2fdad3f156a2d81\"}" > /root/.kaggle/kaggle.json
chmod 600 /root/.kaggle/kaggle.json
echo "Kaggle authentication configured."

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start Celery worker
echo "Starting Celery worker..."
celery -A analysis worker --loglevel=info 