#!/bin/sh
# entrypoint.sh

# Only attempt to install pre-commit hooks if .git exists.
if [ -d ".git" ]; then
  echo "Installing pre-commit hooks..."
  pre-commit install --config=backend/.pre-commit-config.yml
else
  echo ".git directory not found, skipping pre-commit hook installation."
fi

# Execute the main command
exec "$@"
