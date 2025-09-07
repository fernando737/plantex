from rest_framework.permissions import BasePermission


class IsConsultant(BasePermission):
    """
    Custom permission to only allow consultants to access certain views.
    """

    def has_permission(self, request, view):
        # Implement your logic to check if the user is a consultant
        # For example, you might check a user role or group
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_consultant
        )
