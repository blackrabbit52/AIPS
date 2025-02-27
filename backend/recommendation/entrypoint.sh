#!/bin/sh
echo "Waiting for database..."
sleep 5
echo "Running migrations..."
flask db upgrade
echo "Starting application..."
flask run --host=0.0.0.0 