"""
Serializers for the userauths app
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer to include user name and email in the response
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["name"] = user.name
        token["email"] = user.email

        return token


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model
    """

    class Meta:
        model = get_user_model()
        fields = ["email", "password", "name"]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "min_length": 8,
                "style": {"input_type": "password"},
                "error_messages": {
                    "min_length": "La contraseña debe tener al menos 8 caracteres.",
                    "blank": "La contraseña es requerida.",
                },
            },
            "name": {
                "required": True,
                "error_messages": {
                    "blank": "El nombre es requerido.",
                    "required": "El nombre es requerido.",
                },
            },
            "email": {
                "required": True,
                "style": {"input_type": "email"},
                "error_messages": {
                    "blank": "El correo electrónico es requerido.",
                    "required": "El correo electrónico es requerido.",
                    "invalid": "Ingrese un correo electrónico válido.",
                },
            },
        }

    def create(self, validated_data):
        """
        Create a new user with encrypted password and return it
        """
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """
        Update a user, setting the password correctly and return it
        """
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for the PasswordResetRequestView
    """

    email = serializers.EmailField(
        required=True,
        style={"input_type": "email"},
        error_messages={
            "blank": "El correo electrónico es requerido.",
            "required": "El correo electrónico es requerido.",
            "invalid": "Ingrese un correo electrónico válido.",
        },
    )

    class Meta:
        fields = ["email"]
        extra_kwargs = {"email": {"required": True, "style": {"input_type": "email"}}}


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for the PasswordResetConfirmView
    """

    new_password = serializers.CharField(
        min_length=8,
        style={"input_type": "password"},
        error_messages={
            "min_length": "La contraseña debe tener al menos 8 caracteres.",
            "blank": "La nueva contraseña es requerida.",
        },
    )
    new_password_confirm = serializers.CharField(
        min_length=8,
        style={"input_type": "password"},
        error_messages={
            "min_length": "La confirmación de contraseña debe tener al menos 8 caracteres.",
            "blank": "La confirmación de contraseña es requerida.",
        },
    )

    def validate(self, attrs):
        """
        Check if the new passwords match
        """
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs
