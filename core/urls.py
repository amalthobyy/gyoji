from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CustomTokenRefreshView,
    MeView,
    GoogleLoginView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    GoalViewSet,
    ProgressLogViewSet,
    statistics_view,
    WorkoutCategoryViewSet,
    WorkoutViewSet,
    UserWorkoutLogViewSet,
    DietPlanViewSet,
    DailyNutritionViewSet,
    ChatRoomViewSet,
    MessageViewSet,
    MarkMessagesAsReadView,
    ProductViewSet,
    CartViewSet,
    OrderViewSet,
    calculator_protein,
    calculator_bmi,
    calculator_tdee,
    calculator_body_fat,
    TrainerViewSet,
    TrainerHiringViewSet,
    AdminStatsView,
    AdminUserListView,
    StripeWebhookView,
)

router = DefaultRouter()
router.register(r"trainers", TrainerViewSet, basename="trainers")
router.register(r"trainer-hiring", TrainerHiringViewSet, basename="trainer-hiring")
router.register(r"goals", GoalViewSet, basename="goals")
router.register(r"progress", ProgressLogViewSet, basename="progress")
router.register(r"workout-categories", WorkoutCategoryViewSet, basename="workout-categories")
router.register(r"workouts", WorkoutViewSet, basename="workouts")
router.register(r"workout-logs", UserWorkoutLogViewSet, basename="workout-logs")
router.register(r"diet-plans", DietPlanViewSet, basename="diet-plans")
router.register(r"daily-nutrition", DailyNutritionViewSet, basename="daily-nutrition")
router.register(r"chat/rooms", ChatRoomViewSet, basename="chat-rooms")
router.register(r"chat/messages", MessageViewSet, basename="chat-messages")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"orders", OrderViewSet, basename="orders")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/google/", GoogleLoginView.as_view(), name="auth-google"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("chat/messages/mark_as_read/", MarkMessagesAsReadView.as_view(), name="mark-messages-as-read"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("payments/stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("", include(router.urls)),
    path("stats/", statistics_view, name="stats"),
    path("calc/protein/", calculator_protein, name="calc-protein"),
    path("calc/bmi/", calculator_bmi, name="calc-bmi"),
    path("calc/tdee/", calculator_tdee, name="calc-tdee"),
    path("calc/body-fat/", calculator_body_fat, name="calc-body-fat"),
]
