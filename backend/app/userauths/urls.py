from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    CreateUserView,
    CustomTokenObtainPairView,
    ManageUserView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    SetCSRFTokenView,
)

urlpatterns = [
    path("create/", CreateUserView.as_view(), name="create"),
    path("me/", ManageUserView.as_view(), name="me"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("set-csrf-token/", SetCSRFTokenView.as_view(), name="set_csrf_token"),
]
