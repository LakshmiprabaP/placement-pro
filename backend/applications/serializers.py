from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Application,
    PreparationTask,
    StudentProfile,
)


# ==========================================
# REGISTER SERIALIZER
# ==========================================

class RegisterSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(
        write_only=True
    )

    phone_number = serializers.CharField(
        write_only=True
    )

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "full_name",
            "email",
            "phone_number",
            "password",
            "confirm_password",
        ]

        extra_kwargs = {
            "email": {
                "required": True
            }
        }


    def validate_email(self, value):

        value = value.lower().strip()

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value


    def validate_phone_number(
        self,
        value
    ):

        value = value.strip()

        if not value.isdigit():

            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )


        if (
            len(value) < 10
            or len(value) > 15
        ):

            raise serializers.ValidationError(
                "Enter a valid phone number."
            )


        if StudentProfile.objects.filter(
            phone_number=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )

        return value


    def validate(self, data):

        if (
            data["password"]
            !=
            data["confirm_password"]
        ):

            raise serializers.ValidationError({
                "confirm_password":
                    "Passwords do not match."
            })

        return data


    def create(
        self,
        validated_data
    ):

        full_name = validated_data.pop(
            "full_name"
        )

        phone_number = validated_data.pop(
            "phone_number"
        )

        validated_data.pop(
            "confirm_password"
        )

        email = validated_data[
            "email"
        ]

        password = validated_data[
            "password"
        ]


        # Split full name

        name_parts = (
            full_name
            .strip()
            .split(maxsplit=1)
        )

        first_name = (
            name_parts[0]
        )

        last_name = (
            name_parts[1]
            if len(name_parts) > 1
            else ""
        )


        # Email automatically becomes
        # Django username

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )


        # Save phone number separately

        StudentProfile.objects.create(
            user=user,
            phone_number=phone_number,
        )


        return user


# ==========================================
# APPLICATION SERIALIZER
# ==========================================

class ApplicationSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Application

        fields = [
            "id",
            "company",
            "role",
            "location",
            "ctc",
            "status",
            "priority",
            "applied_date",
            "next_event_date",
            "notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


    def validate_ctc(
        self,
        value
    ):

        if (
            value is not None
            and value < 0
        ):

            raise serializers.ValidationError(
                "CTC cannot be negative."
            )

        return value


# ==========================================
# PREPARATION TASK SERIALIZER
# ==========================================

class PreparationTaskSerializer(
    serializers.ModelSerializer
):

    company = serializers.CharField(
        source="application.company",
        read_only=True
    )

    role = serializers.CharField(
        source="application.role",
        read_only=True
    )


    class Meta:
        model = PreparationTask

        fields = [
            "id",
            "application",
            "company",
            "role",
            "topic",
            "completed",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]
        