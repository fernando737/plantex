FROM python:3.9-slim
LABEL maintainer="fer.empire@gmail.com"

ENV PYTHONUNBUFFERED 1
ENV DEBIAN_FRONTEND=noninteractive

ARG FRONTEND_URL

# Install system dependencies required for WeasyPrint
RUN apt-get update && apt-get install -y \
    # WeasyPrint dependencies
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    # Additional dependencies for better PDF generation
    fonts-liberation \
    fonts-dejavu \
    # PostgreSQL dependencies
    libpq-dev \
    postgresql-client \
    # Build dependencies
    gcc \
    g++ \
    # Add sudo for permission management
    sudo \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /tmp/requirements.txt
COPY ./app /app
WORKDIR /app
EXPOSE 8000

# Install Python dependencies
RUN python -m venv /py \
    && /py/bin/pip install --upgrade pip \
    && /py/bin/pip install -r /tmp/requirements.txt

# Create non-root user
RUN adduser \
    --disabled-password \
    --no-create-home \
    django-user

# Create media directory and set permissions
RUN mkdir -p /app/media && \
    chown -R django-user:django-user /app && \
    chmod -R 755 /app/media

ENV PATH="/py/bin:$PATH"
ENV FRONTEND_URL=$FRONTEND_URL

COPY entrypoint-prod.sh /entrypoint-prod.sh
RUN chmod +x /entrypoint-prod.sh
ENTRYPOINT ["/entrypoint-prod.sh"]

USER django-user
