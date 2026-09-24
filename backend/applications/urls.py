from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    ApplicationViewSet,
    PreparationTaskViewSet,
    RegisterView,
    CustomLoginView,
)


router = DefaultRouter()

router.register(
    r"applications",
    ApplicationViewSet,
    basename="application"
)

router.register(
    r"preparation-tasks",
    PreparationTaskViewSet,
    basename="preparation-task"
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        CustomLoginView.as_view(),
        name="login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),
]

urlpatterns += router.urls