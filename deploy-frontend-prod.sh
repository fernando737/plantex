#!/bin/bash
# Script to properly deploy frontend updates in production

echo "Stopping frontend and nginx services..."
docker-compose -f docker-compose-prod.yml stop frontend nginx
docker-compose -f docker-compose-prod.yml rm -f frontend nginx

echo "Removing old frontend volume..."
docker volume rm control-legal_frontend-dist || true

echo "Rebuilding frontend container..."
docker-compose -f docker-compose-prod.yml build --no-cache frontend

echo "Starting services..."
docker-compose -f docker-compose-prod.yml up -d

echo "Frontend deployment complete!"
