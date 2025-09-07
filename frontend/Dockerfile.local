# Build stage
FROM node:20-alpine as build-stage

# Set build arguments
ARG VITE_DNS_URL
ARG VITE_BACKEND_PREFIX

# Set working directory
WORKDIR /app

# Copy package files
COPY app/package.json app/yarn.lock ./

# Install dependencies with logging
RUN yarn install --frozen-lockfile || { echo 'Yarn install failed'; exit 1; }

# Copy application source
COPY ./app /app

# Validate environment variables
RUN test -n "$VITE_DNS_URL" || { echo "VITE_DNS_URL is not set"; exit 1; }
RUN test -n "$VITE_BACKEND_PREFIX" || { echo "VITE_BACKEND_PREFIX is not set"; exit 1; }

# Set environment variables for Vite
ENV VITE_DNS_URL=$VITE_DNS_URL
ENV VITE_BACKEND_PREFIX=$VITE_BACKEND_PREFIX
ENV DEBUG=vite:*

# Run build and log output
RUN yarn build || { echo 'Build failed'; exit 1; }

# No need for a production stage since the Nginx container will serve the files
