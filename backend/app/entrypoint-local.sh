#!/bin/sh
set -e  # Exit script on first error

echo "Waiting for database..."
python manage.py wait_for_db

echo "Running migrations..."
python manage.py migrate_schemas --shared

echo "Creating tenants..."
python manage.py create_public_tenant
python manage.py create_demo_tenant

# Set environment variables for superuser creation
export DJANGO_SUPERUSER_EMAIL=admin@email.com
export DJANGO_SUPERUSER_PASSWORD=1234admin.

echo "Creating superuser..."
python manage.py createsuperuser --noinput || echo "Superuser already exists"

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting application: $@"
exec "$@"
