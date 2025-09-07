# Baseline Multi-Tenant Django + React Application

A production-ready baseline for building multi-tenant SaaS applications with Django REST Framework backend and React TypeScript frontend.

## 🚀 Features

### Backend (Django)
- **Multi-tenancy** with `django-tenants` for isolated client data
- **JWT Authentication** with refresh token support
- **RESTful API** with Django REST Framework
- **API Documentation** with drf-spectacular (Swagger/OpenAPI)
- **Admin Interface** with Jazzmin theme
- **Environment Configuration** with django-environ
- **Production-ready** with Daphne ASGI server

### Frontend (React + TypeScript)
- **Modern React 18** with TypeScript
- **Material-UI (MUI)** component library
- **State Management** with Zustand
- **Server State** management with TanStack Query
- **Form Handling** with React Hook Form + Yup validation
- **Routing** with React Router v6
- **Authentication** utilities and protected routes
- **Error Boundaries** for robust error handling
- **Hot Toast** notifications

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.9+ (for local development)

## 🛠️ Quick Start

### 1. Environment Setup

Create environment files:

**Project root `.env`:**
```bash
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
BACKEND_PREFIX=api
```

**Backend `.env` (backend/.env):**
```bash
DB_HOST=db
POSTGRES_DB=baseline_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
```

### 2. Local Development

# Build frontend packages
```bash
docker-compose -f docker-compose-local.yml run --rm yarn-update
```

```bash
# Build and start all services
docker-compose -f docker-compose-local.yml build
docker-compose -f docker-compose-local.yml up

# Create superuser (in another terminal)
docker-compose -f docker-compose-local.yml run --rm backend python manage.py createsuperuser
```

Access the application:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/schema/swagger-ui/

### 3. Production Deployment

```bash
# Set production environment variables
echo "FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com
BACKEND_PREFIX=api" > .env

# Deploy
docker-compose -f docker-compose-prod.yml up -d
```

## 🏗️ Architecture

### Multi-Tenant Structure
- **Public Schema:** Shared data (users, tenants)
- **Tenant Schemas:** Isolated per-tenant data
- **Domain-based routing:** Each tenant gets a subdomain or custom domain

### Authentication Flow
1. User login via JWT tokens
2. Automatic token refresh
3. Protected routes and API endpoints
4. Multi-tenant context awareness

### Key Directories

```
├── backend/
│   ├── app/
│   │   ├── app/           # Django project settings
│   │   ├── userauths/     # Authentication app
│   │   ├── customers/     # Multi-tenant models
│   │   └── core/          # Shared utilities
│   └── requirements.txt
├── frontend/
│   └── app/
│       ├── src/
│       │   ├── components/ # Reusable components
│       │   ├── stores/     # Zustand stores
│       │   ├── hooks/      # Custom React hooks
│       │   ├── utils/      # Utility functions
│       │   ├── config/     # App configuration
│       │   └── views/      # Main views
│       └── package.json
└── docker-compose-*.yml
```

## 🔧 Development

### Adding New Features

1. **Backend Models:**
   ```python
   # In your app's models.py
   from core.models import TimeStampedModel
   
   class YourModel(TimeStampedModel):
       name = models.CharField(max_length=100)
   ```

2. **Frontend Components:**
   ```tsx
   // In src/components/YourComponent/
   import React from 'react';
   import { useAuthStore } from '../../stores/authStore';
   
   const YourComponent: React.FC = () => {
     const { user } = useAuthStore();
     return <div>Hello {user?.name}</div>;
   };
   ```

### Available Scripts

**Backend:**
```bash
python manage.py migrate_schemas --shared  # Migrate shared schema
python manage.py migrate_schemas           # Migrate all tenant schemas
python manage.py create_tenant             # Create new tenant
```

**Frontend:**
```bash
yarn dev        # Development server
yarn build      # Production build
yarn lint       # ESLint
yarn type-check # TypeScript check
```

## 🛡️ Security Features

- JWT token authentication with refresh
- CORS protection configured
- CSRF protection enabled
- Multi-tenant data isolation
- Environment-based configuration
- Secure headers in production

## 📦 Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- django-tenants (multi-tenancy)
- djangorestframework-simplejwt
- drf-spectacular (API docs)
- PostgreSQL
- Daphne (ASGI server)

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Zustand (state management)
- TanStack Query
- React Hook Form + Yup
- React Router v6
- Vite (build tool)

### Infrastructure
- Docker & Docker Compose
- Nginx (production)
- Let's Encrypt SSL (production)

## 🚀 Deployment

The baseline includes production-ready Docker configurations with:
- Multi-stage Docker builds
- Nginx reverse proxy
- SSL certificate automation
- Environment-based configuration
- Health checks and logging

## 🤝 Contributing

This baseline is designed to be extended for your specific use case. Key extension points:

1. Add new Django apps for your business logic
2. Create new React components and views
3. Extend the authentication system
4. Add new API endpoints
5. Customize the admin interface

## 📄 License

This baseline template is provided as-is for building your own applications.

---

**Happy Building!** 🎉