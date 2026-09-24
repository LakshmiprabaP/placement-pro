from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import (
    viewsets,
    generics,
    permissions,
    status,
)

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import (
    SearchFilter,
    OrderingFilter,
)
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Application,
    PreparationTask,
    StudentProfile,
)

from .serializers import (
    ApplicationSerializer,
    PreparationTaskSerializer,
    RegisterSerializer,
)


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer

    permission_classes = [
        permissions.AllowAny
    ]


class CustomLoginView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        login_value = request.data.get(
            "login",
            ""
        ).strip()

        password = request.data.get(
            "password",
            ""
        )

        if not login_value or not password:
            return Response(
                {
                    "detail":
                        "Email/phone and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None

        # EMAIL LOGIN
        if "@" in login_value:

            try:
                found_user = User.objects.get(
                    email__iexact=login_value
                )

                user = authenticate(
                    username=found_user.username,
                    password=password,
                )

            except User.DoesNotExist:
                user = None

        # PHONE LOGIN
        else:

            try:
                profile = StudentProfile.objects.select_related(
                    "user"
                ).get(
                    phone_number=login_value
                )

                user = authenticate(
                    username=profile.user.username,
                    password=password,
                )

            except StudentProfile.DoesNotExist:
                user = None

        if user is None:
            return Response(
                {
                    "detail":
                        "Invalid email/phone or password."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(
                    refresh.access_token
                ),
                "user": {
                    "id": user.id,
                    "name": (
                        user.get_full_name()
                        or user.email
                    ),
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


class ApplicationViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    filter_backends = [
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = [
        "company",
        "role",
        "location",
        "status",
    ]

    ordering_fields = [
        "company",
        "ctc",
        "applied_date",
        "created_at",
    ]

    def get_queryset(self):

        return Application.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            user=self.request.user
        )


class PreparationTaskViewSet(
    viewsets.ModelViewSet
):

    serializer_class = (
        PreparationTaskSerializer
    )

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return PreparationTask.objects.filter(
            application__user=self.request.user
        ).order_by("created_at")

    def perform_create(
        self,
        serializer
    ):

        application = (
            serializer.validated_data[
                "application"
            ]
        )

        if (
            application.user
            != self.request.user
        ):
            raise PermissionDenied(
                "You cannot add tasks to another user's application."
            )

        serializer.save()