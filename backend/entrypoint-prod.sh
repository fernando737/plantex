#!/bin/bash
# entrypoint.sh - runs as root first
chown -R django-user:django-user /app/media
chmod -R 755 /app/media

exec "$@"
