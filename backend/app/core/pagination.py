# backend/app/core/pagination.py
"""
Pagination configuration for the core app.
Responsibility: Define pagination behavior for API endpoints.
"""

from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class for API endpoints.

    Features:
    - Default page size: 10 items
    - Configurable page size via query parameter
    - Maximum page size: 100 items
    """

    page_size = 10
    page_size_query_param = (
        "page_size"  # Allows clients to choose the page size via query param
    )
    max_page_size = 100
