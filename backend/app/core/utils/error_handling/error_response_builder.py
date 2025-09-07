# backend/app/core/utils/error_handling/error_response_builder.py
"""
Error response builder utilities.
Responsibility: Standardized error response creation for API endpoints.
"""

import logging

from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class ErrorResponseBuilder:
    """
    Utility class for building standardized error responses.

    Responsibility: Create consistent error responses across the API.
    """

    @staticmethod
    def validation_error(serializer_errors, message="Error en la solicitud"):
        """
        Build a validation error response.

        Args:
            serializer_errors: Serializer validation errors
            message: Custom error message

        Returns:
            Response: HTTP 400 response with validation errors
        """
        return Response(
            {
                "success": False,
                "message": message,
                "errors": serializer_errors,
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    @staticmethod
    def not_found_error(message="Resource not found"):
        """
        Build a not found error response.

        Args:
            message: Custom error message

        Returns:
            Response: HTTP 404 response
        """
        return Response(
            {
                "success": False,
                "message": message,
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    @staticmethod
    def server_error(message="An unexpected error occurred"):
        """
        Build a server error response.

        Args:
            message: Custom error message

        Returns:
            Response: HTTP 500 response
        """
        return Response(
            {
                "success": False,
                "message": message,
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    @staticmethod
    def generic_error(message, status_code=status.HTTP_400_BAD_REQUEST):
        """
        Build a generic error response.

        Args:
            message: Custom error message
            status_code: HTTP status code

        Returns:
            Response: HTTP response with specified status code
        """
        return Response(
            {
                "success": False,
                "message": message,
                "timestamp": timezone.now().isoformat(),
            },
            status_code,
        )

    @staticmethod
    def exception_error(
        exception, context="operation", status_code=status.HTTP_400_BAD_REQUEST
    ):
        """
        Handle generic exceptions with logging.

        Args:
            exception: The exception that occurred
            context: Context where the exception occurred
            status_code: HTTP status code

        Returns:
            Response: HTTP response with error details
        """
        logger.error(f"Error in {context}: {str(exception)}", exc_info=True)
        return Response(
            {
                "success": False,
                "message": f"Error en {context}",
                "timestamp": timezone.now().isoformat(),
            },
            status=status_code,
        )

    @staticmethod
    def email_error(message="An error occurred while sending the email"):
        """
        Build an email error response.

        Args:
            message: Custom error message

        Returns:
            Response: HTTP 400 response for email errors
        """
        return Response(
            {
                "success": False,
                "message": message,
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
