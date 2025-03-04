#!/bin/bash

# Create necessary directories
mkdir -p monitoring/prometheus/rules
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/logstash/config
mkdir -p monitoring/logstash/pipeline

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "Waiting for monitoring services to start..."
sleep 30

# Check services health
echo "Checking monitoring services status..."
docker-compose -f docker-compose.monitoring.yml ps

# Display access URLs
echo -e "\nMonitoring URLs:"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin)"
echo "Kibana: http://localhost:5601"
echo "Elasticsearch: http://localhost:9200"

# Check if services are responding
echo -e "\nChecking service health..."
curl -s "http://localhost:9090/-/healthy" > /dev/null && echo "✅ Prometheus is healthy" || echo "❌ Prometheus is not responding"
curl -s "http://localhost:3000/api/health" > /dev/null && echo "✅ Grafana is healthy" || echo "❌ Grafana is not responding"
curl -s "http://localhost:5601/api/status" > /dev/null && echo "✅ Kibana is healthy" || echo "❌ Kibana is not responding"
curl -s "http://localhost:9200/_cluster/health" > /dev/null && echo "✅ Elasticsearch is healthy" || echo "❌ Elasticsearch is not responding" 