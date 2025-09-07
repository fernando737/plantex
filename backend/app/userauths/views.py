from core.utils.error_handling import ErrorResponseBuilder
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import BadHeaderError, EmailMultiAlternatives
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserSerializer,
)


class SetCSRFTokenView(APIView):
    """
    View to set the CSRF token
    """

    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        csrf_token = get_token(request)
        return JsonResponse({"csrf_token": csrf_token})


class CreateUserView(generics.CreateAPIView):
    """
    Create a new user in the system
    """

    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom view to include user name and email in the response
    """

    serializer_class = CustomTokenObtainPairSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    """
    Manage the authenticated user
    """

    serializer_class = UserSerializer
    authentication_classes = (JWTAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """
        Retrieve and return authenticated user
        """
        return self.request.user


class PasswordResetRequestView(generics.GenericAPIView):
    """
    View to handle password reset requests
    """

    serializer_class = PasswordResetRequestSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        """
        Handle password reset request
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email).first()

        if user:
            try:
                tokengenerator = PasswordResetTokenGenerator()
                token = tokengenerator.make_token(user)
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

                frontend_url = settings.FRONTEND_URL

                reset_url = f"{frontend_url}/password-reset-confirm/{uidb64}/{token}/"

                context = {
                    "user": user,
                    "reset_url": reset_url,
                }

                subject = "Restablecimiento de contraseña"
                text_body = render_to_string("email/password_reset_email.txt", context)
                html_body = render_to_string("email/password_reset_email.html", context)

                msg = EmailMultiAlternatives(
                    subject=subject,
                    from_email=settings.FROM_EMAIL,
                    to=[user.email],
                    body=text_body,
                )

                msg.attach_alternative(html_body, "text/html")
                msg.send()
                return Response(
                    {
                        "message": "Si existe una cuenta con este correo electrónico, \
                        hemos enviado un enlace para restablecer la contraseña."
                    },
                    status=status.HTTP_200_OK,
                )
            except BadHeaderError:
                # Handle bad email headers
                return ErrorResponseBuilder.email_error(
                    "Se encontró un encabezado de correo inválido."
                )

            except Exception:
                # Handle other exceptions, e.g., Mailgun API errors or general errors
                return ErrorResponseBuilder.email_error()

        else:
            return Response(
                {
                    "message": "Si existe una cuenta con este correo electrónico, \
                    hemos enviado un enlace para restablecer la contraseña."
                },
                status=status.HTTP_200_OK,
            )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    View to handle password reset confirmation
    """

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        uidb64 = kwargs.get("uidb64")
        token = kwargs.get("token")
        try:
            uidb64 = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uidb64)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        token_generator = PasswordResetTokenGenerator()

        if user is not None and token_generator.check_token(user, token):
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user.set_password(serializer.validated_data["new_password"])
                user.save()
                return Response(
                    {"message": "La contraseña ha sido establecida exitosamente."},
                    status=status.HTTP_200_OK,
                )
            return ErrorResponseBuilder.validation_error(serializer.errors)
        return ErrorResponseBuilder.generic_error("Token o usuario inválido.")
