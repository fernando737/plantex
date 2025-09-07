# backend/app/core/views.py
"""
Core views for the baseline application.
Add your API views here or import them from separate modules.
"""

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint to verify the API is running.
    """
    return Response({
        'status': 'healthy',
        'message': 'API is running successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_info(request):
    """
    API information endpoint.
    """
    return Response({
        'name': 'Baseline Multi-Tenant API',
        'version': '1.0.0',
        'description': 'A baseline Django REST API with multi-tenancy and authentication',
        'tenant': getattr(request, 'tenant', None),
    }, status=status.HTTP_200_OK)