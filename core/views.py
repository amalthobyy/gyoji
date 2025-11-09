from decimal import Decimal

import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum, F
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets, mixins
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from .serializers import (
    UserSerializer,
    RegistrationSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    GoalSerializer,
    ProgressLogSerializer,
    WorkoutCategorySerializer,
    WorkoutSerializer,
    UserWorkoutLogSerializer,
    DietPlanSerializer,
    DailyNutritionSerializer,
    ProteinCalculatorSerializer,
    ChatRoomSerializer,
    MessageSerializer,
    TrainerSerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    CalculatorInputSerializer,
    TrainerHiringSerializer,
)
from .models import Trainer, TrainerProfile, Goal, ProgressLog, WorkoutCategory, Workout, UserWorkoutLog, DietPlan, DailyNutrition, ChatRoom, Message, Product, Cart, CartItem, Order, OrderItem, TrainerHiring

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:  # noqa: BLE001
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logged out"})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()

        data = request.POST.dict()
        files = request.FILES

        remove_photo = data.get("remove_profile_picture")
        if remove_photo in ["true", "True", "1", True]:
            if instance.profile_picture:
                instance.profile_picture.delete(save=False)
            data["profile_picture"] = None
        elif data.get("profile_picture") == "":
            data["profile_picture"] = None

        if "profile_picture" not in data and "profile_picture" in files:
            data["profile_picture"] = files.get("profile_picture")

        data.pop("remove_profile_picture", None)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get("id_token")
        if not token:
            return Response({"detail": "id_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            return Response({"detail": "Google login is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            id_info = google_id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        except ValueError as exc:  # noqa: PERF203
            return Response({"detail": "Invalid Google token", "error": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        email = id_info.get("email")
        if not email:
            return Response({"detail": "Google account email is required"}, status=status.HTTP_400_BAD_REQUEST)

        first_name = id_info.get("given_name", "")
        last_name = id_info.get("family_name", "")
        picture_url = id_info.get("picture")

        user = User.objects.filter(email=email).first()
        if not user:
            base_username = email.split("@")[0]
            username = base_username
            index = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{index}"
                index += 1
            user = User.objects.create(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
        else:
            updated_fields = []
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated_fields.append("first_name")
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                updated_fields.append("last_name")
            if updated_fields:
                user.save(update_fields=updated_fields)

        # Optionally store Google profile picture as URL hint in bio if empty
        if picture_url and not user.profile_picture:
            user.bio = user.bio or f"Imported from Google profile: {picture_url}"
            user.save(update_fields=["bio"])

        refresh = RefreshToken.for_user(user)
        payload = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
        return Response(payload)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(frontend_url=settings.FRONTEND_URL, from_email=settings.DEFAULT_FROM_EMAIL)
        return Response({"detail": "Password reset email sent"})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been reset"})


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProgressLogViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProgressLog.objects.filter(user=self.request.user).select_related("goal").order_by("-date", "-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return WorkoutCategory.objects.all().order_by("name")


class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if getattr(self, "action", None) in {"create", "update", "partial_update", "destroy"}:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = Workout.objects.select_related("category").prefetch_related("exercises")
        category = self.request.query_params.get("category")
        difficulty = self.request.query_params.get("difficulty")
        search = self.request.query_params.get("search")
        if category:
            qs = qs.filter(Q(category__id=category) | Q(category__name__iexact=category))
        if difficulty:
            qs = qs.filter(difficulty_level=difficulty)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        return qs.order_by("-created_at")


class UserWorkoutLogViewSet(viewsets.ModelViewSet):
    serializer_class = UserWorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserWorkoutLog.objects.filter(user=self.request.user).select_related("workout").order_by("-completed_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DietPlanViewSet(viewsets.ModelViewSet):
    serializer_class = DietPlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if getattr(self, "action", None) in {"create", "update", "partial_update", "destroy"}:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = DietPlan.objects.prefetch_related("meals").all()
        goal = self.request.query_params.get("goal_type")
        if goal:
            qs = qs.filter(goal_type=goal)
        return qs.order_by("id")


class DailyNutritionViewSet(viewsets.ModelViewSet):
    serializer_class = DailyNutritionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyNutrition.objects.filter(user=self.request.user).order_by("-date")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def statistics_view(request):
    user = request.user
    goals = Goal.objects.filter(user=user)
    goals_completed = goals.filter(status=Goal.STATUS_COMPLETED).count()
    active_goals = goals.exclude(status__in=[Goal.STATUS_COMPLETED, Goal.STATUS_CANCELLED]).count()
    total_goals = goals.count()
    success_rate = (goals_completed / total_goals * 100.0) if total_goals else 0.0

    # days streak: consecutive days with at least one progress log
    logs = (
        ProgressLog.objects.filter(user=user)
        .values_list("date", flat=True)
        .order_by("-date")
        .distinct()
    )
    today = timezone.localdate()
    streak = 0
    day = today
    dates_set = set(logs)
    while day in dates_set:
        streak += 1
        day = day - timezone.timedelta(days=1)

    return Response(
        {
            "goals_completed": goals_completed,
            "active_goals": active_goals,
            "success_rate": round(success_rate, 2),
            "days_streak": streak,
        }
    )


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_trainers = Trainer.objects.count()
        total_workouts = Workout.objects.count()
        total_diet_plans = DietPlan.objects.count()
        total_hirings = TrainerHiring.objects.count()
        pending_hirings = TrainerHiring.objects.filter(status=TrainerHiring.STATUS_PENDING).count()
        active_chat_rooms = ChatRoom.objects.count()

        recent_users = [
            {
                "id": user.id,
                "name": user.get_full_name() or user.username,
                "email": user.email,
                "role": user.role,
                "date_joined": user.date_joined,
            }
            for user in User.objects.order_by("-date_joined")[:5]
        ]

        recent_hirings = [
            {
                "id": hiring.id,
                "user_name": hiring.user.get_full_name() or hiring.user.username,
                "trainer_name": hiring.trainer.get_full_name() or hiring.trainer.username,
                "status": hiring.status,
                "start_date": hiring.start_date,
                "created_at": hiring.created_at,
            }
            for hiring in TrainerHiring.objects.select_related("user", "trainer").order_by("-created_at")[:5]
        ]

        return Response(
            {
                "totals": {
                    "users": total_users,
                    "trainers": total_trainers,
                    "workouts": total_workouts,
                    "diet_plans": total_diet_plans,
                    "hirings": total_hirings,
                    "pending_hirings": pending_hirings,
                    "chat_rooms": active_chat_rooms,
                },
                "recent_users": recent_users,
                "recent_hirings": recent_hirings,
            }
        )


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        return qs


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def calculator_protein(request):
    s = CalculatorInputSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    weight = s.validated_data["weight_kg"]
    activity = s.validated_data["activity_level"]
    goal = s.validated_data["goal"]

    base = 1.6
    if activity == "sedentary":
        base = 1.2
    elif activity == "light":
        base = 1.4
    elif activity == "moderate":
        base = 1.6
    elif activity == "active":
        base = 1.8
    elif activity == "very_active":
        base = 2.0

    if goal == "weight_loss":
        base += 0.2
    elif goal == "muscle_gain":
        base += 0.4

    grams = round(base * weight, 1)
    rec = {
        "min": round(0.8 * weight, 1),
        "target": grams,
        "max": round(2.2 * weight, 1),
        "notes": "Distribute protein evenly across meals (e.g., 3-5 meals).",
    }
    return Response({"recommended_protein_g": grams, "details": rec})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def calculator_bmi(request):
    s = CalculatorInputSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    weight = s.validated_data["weight_kg"]
    height_m = s.validated_data["height_cm"] / 100.0
    bmi = round(weight / (height_m ** 2), 1)
    if bmi < 18.5:
        category = "underweight"
    elif bmi < 25:
        category = "normal"
    elif bmi < 30:
        category = "overweight"
    else:
        category = "obese"
    rec = {
        "category": category,
        "notes": "Pair BMI with waist circumference and body fat for better assessment.",
    }
    return Response({"bmi": bmi, "details": rec})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def calculator_tdee(request):
    s = CalculatorInputSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    w = s.validated_data["weight_kg"]
    h = s.validated_data["height_cm"]
    a = s.validated_data["age"]
    g = s.validated_data["gender"]
    mult = _activity_multiplier(s.validated_data["activity_level"])

    # Mifflin-St Jeor BMR
    bmr = 10 * w + 6.25 * h - 5 * a + (5 if g == "male" else -161)
    tdee = round(bmr * mult)

    goal = s.validated_data["goal"]
    if goal == "weight_loss":
        target_calories = tdee - 500
        note = "Aim for ~500 kcal deficit for ~0.5 kg/week loss."
    elif goal == "muscle_gain":
        target_calories = tdee + 300
        note = "Aim for ~300 kcal surplus with progressive overload."
    else:
        target_calories = tdee
        note = "Maintain intake around TDEE and monitor weight."

    return Response({
        "bmr": round(bmr),
        "tdee": tdee,
        "target_calories": target_calories,
        "details": {"note": note, "activity_multiplier": mult},
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def calculator_body_fat(request):
    # Using Deurenberg formula approximation from BMI, age, and gender
    s = CalculatorInputSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    w = s.validated_data["weight_kg"]
    h_m = s.validated_data["height_cm"] / 100.0
    a = s.validated_data["age"]
    g = s.validated_data["gender"]

    bmi = w / (h_m ** 2)
    sex = 1 if g == "male" else 0
    bf = 1.2 * bmi + 0.23 * a - 10.8 * sex - 5.4
    bf = max(2.0, min(60.0, round(bf, 1)))

    rec = {
        "category": "athletes" if bf < 14 and g == "male" else "healthy" if bf < 25 else "overfat",
        "notes": "Use calipers or DEXA for more accurate measurement.",
    }
    return Response({"body_fat_percent": bf, "details": rec})


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(Q(user=user) | Q(trainer=user)).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role == User.ROLE_TRAINER:
            user_id = request.data.get("user")
            if not user_id:
                return Response({"detail": "user is required"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                room, created = ChatRoom.objects.get_or_create(user_id=user_id, trainer=user)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            trainer_id = request.data.get("trainer")
            if not trainer_id:
                return Response({"detail": "trainer is required"}, status=status.HTTP_400_BAD_REQUEST)
            if str(user.id) == str(trainer_id):
                return Response({"detail": "Cannot create a chat with yourself"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                room, created = ChatRoom.objects.get_or_create(user=user, trainer_id=trainer_id)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        room_id = self.request.query_params.get("room")
        qs = Message.objects.filter(chat_room__id=room_id) if room_id else Message.objects.none()
        return qs.select_related("chat_room", "sender").order_by("timestamp")

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)



class MarkMessagesAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Mark all messages in a room as read for the current user"""
        room_id = request.data.get("room_id")
        if not room_id:
            return Response({"detail": "room_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            room = ChatRoom.objects.get(id=room_id)
            # Verify user is part of this room
            if room.user != request.user and room.trainer != request.user:
                return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            
            # Mark all unread messages (not sent by current user) as read
            updated = Message.objects.filter(
                chat_room=room,
                is_read=False
            ).exclude(sender=request.user).update(is_read=True)
            
            return Response({"updated": updated}, status=status.HTTP_200_OK)
        except ChatRoom.DoesNotExist:
            return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Product.objects.all().order_by("-created_at")
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__iexact=category)
        return qs


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        cart = self._get_cart(request.user)
        data = CartSerializer(cart).data
        return Response(data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        cart = self._get_cart(request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        item.quantity = item.quantity + quantity if not created else quantity
        item.save()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"])
    def update_item(self, request):
        cart = self._get_cart(request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        try:
            item = CartItem.objects.get(cart=cart, product=product)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not in cart"}, status=404)
        item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"])
    def remove(self, request):
        cart = self._get_cart(request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        CartItem.objects.filter(cart=cart, product=product).delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"])
    def clear(self, request):
        cart = self._get_cart(request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items__product").order_by("-created_at")

    @action(detail=False, methods=["post"])
    def place(self, request):
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        items = list(cart.items.select_related("product"))
        if not items:
            return Response({"detail": "Cart is empty"}, status=400)
        order = Order.objects.create(user=user, status=Order.STATUS_PENDING, total_amount=0)
        total = 0
        for item in items:
            price = item.product.price
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=price)
            total += price * item.quantity
            # reduce stock
            Product.objects.filter(id=item.product_id).update(stock_quantity=F("stock_quantity") - item.quantity)
        order.total_amount = total
        order.status = Order.STATUS_PAID  # assuming immediate payment success for simplicity
        order.save(update_fields=["total_amount", "status"])
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=201)


class TrainerViewSet(viewsets.ModelViewSet):
    serializer_class = TrainerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Trainer.objects.select_related("user").all()
    http_method_names = ["get", "patch", "head", "options"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        qs = Trainer.objects.select_related("user").all().order_by("-rating", "user__date_joined")
        if self.request.method in permissions.SAFE_METHODS:
            return qs
        if not self.request.user.is_authenticated:
            return qs.none()
        return qs.filter(user=self.request.user)

    def perform_update(self, serializer):
        trainer = self.get_object()
        if trainer.user != self.request.user:
            raise PermissionDenied("You can only update your own trainer profile.")
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        trainer, _ = Trainer.objects.get_or_create(user=request.user)
        TrainerProfile.objects.get_or_create(user=request.user)
        if request.method == "GET":
            serializer = self.get_serializer(trainer)
            return Response(serializer.data)
        serializer = self.get_serializer(trainer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class TrainerHiringViewSet(viewsets.ModelViewSet):
    serializer_class = TrainerHiringSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _calculate_amount(self, trainer_id: int, session_type: str) -> Decimal:
        trainer_profile = Trainer.objects.filter(user_id=trainer_id).first()
        base_rate = trainer_profile.hourly_rate if trainer_profile and trainer_profile.hourly_rate else Decimal("0")
        if session_type == TrainerHiring.SESSION_MONTHLY:
            return (base_rate * Decimal("4")).quantize(Decimal("0.01"))
        return base_rate.quantize(Decimal("0.01")) if isinstance(base_rate, Decimal) else Decimal("0.00")

    def get_queryset(self):
        user = self.request.user
        if user.role == User.ROLE_TRAINER:
            return TrainerHiring.objects.filter(trainer=user).select_related("user", "trainer").order_by("-created_at")
        return TrainerHiring.objects.filter(user=user).select_related("user", "trainer").order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        trainer_id = self.request.data.get("trainer")
        if not trainer_id:
            raise PermissionDenied("Trainer is required")
        if str(user.id) == str(trainer_id):
            raise PermissionDenied("You cannot hire yourself")
        session_type = serializer.validated_data.get("session_type", TrainerHiring.SESSION_ONE_TIME)
        amount = self._calculate_amount(trainer_id, session_type)
        hiring = serializer.save(
            user=user,
            status=TrainerHiring.STATUS_PENDING,
            amount=amount,
            payment_status=TrainerHiring.PAYMENT_PENDING,
        )
        ChatRoom.objects.get_or_create(user=user, trainer_id=trainer_id)
        return hiring

    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        if user.role != User.ROLE_TRAINER or instance.trainer_id != user.id:
            raise PermissionDenied("Only the trainer can update this request")
        previous_status = instance.status
        hiring = serializer.save()
        updates = []
        if previous_status != TrainerHiring.STATUS_ACCEPTED and hiring.status == TrainerHiring.STATUS_ACCEPTED:
            if hiring.amount <= 0:
                recalculated_amount = self._calculate_amount(hiring.trainer_id, hiring.session_type)
                if recalculated_amount > 0:
                    hiring.amount = recalculated_amount
                    updates.append("amount")
            if hiring.amount > 0 and hiring.payment_status != TrainerHiring.PAYMENT_REQUIRED:
                hiring.payment_status = TrainerHiring.PAYMENT_REQUIRED
                updates.append("payment_status")
            if hiring.payment_status == TrainerHiring.PAYMENT_REQUIRED:
                hiring.stripe_checkout_session_id = ""
                hiring.stripe_payment_intent_id = ""
                updates.extend(["stripe_checkout_session_id", "stripe_payment_intent_id"])
        elif hiring.status == TrainerHiring.STATUS_REJECTED:
            if hiring.payment_status != TrainerHiring.PAYMENT_PENDING:
                hiring.payment_status = TrainerHiring.PAYMENT_PENDING
                updates.append("payment_status")
            if hiring.stripe_checkout_session_id or hiring.stripe_payment_intent_id:
                hiring.stripe_checkout_session_id = ""
                hiring.stripe_payment_intent_id = ""
                updates.extend(["stripe_checkout_session_id", "stripe_payment_intent_id"])
        if updates:
            updates.append("updated_at")
            hiring.save(update_fields=list(dict.fromkeys(updates)))

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def create_checkout_session(self, request, pk=None):
        hiring = self.get_object()
        if hiring.user != request.user:
            raise PermissionDenied("You can only pay for your own booking.")
        if hiring.status != TrainerHiring.STATUS_ACCEPTED:
            return Response({"detail": "Trainer must accept the booking before payment."}, status=status.HTTP_400_BAD_REQUEST)
        if hiring.payment_status == TrainerHiring.PAYMENT_PAID:
            return Response({"detail": "This booking is already paid."}, status=status.HTTP_400_BAD_REQUEST)
        if hiring.amount <= 0:
            return Response({"detail": "No payable amount configured for this booking."}, status=status.HTTP_400_BAD_REQUEST)
        if not settings.STRIPE_SECRET_KEY:
            return Response({"detail": "Stripe is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        amount_decimal = hiring.amount.quantize(Decimal("0.01"))
        amount_cents = int(amount_decimal * 100)

        success_url = request.data.get(
            "success_url",
            f"{settings.FRONTEND_URL}/payments/success?session_id={{CHECKOUT_SESSION_ID}}",
        )
        cancel_url = request.data.get(
            "cancel_url",
            f"{settings.FRONTEND_URL}/payments/cancelled",
        )
        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "inr",
                            "product_data": {
                                "name": f"Training session with {hiring.trainer.get_full_name() or hiring.trainer.username}",
                                "metadata": {
                                    "trainer_id": str(hiring.trainer_id),
                                },
                            },
                            "unit_amount": amount_cents,
                        },
                        "quantity": 1,
                    }
                ],
                metadata={
                    "hiring_id": str(hiring.id),
                    "user_id": str(hiring.user_id),
                    "trainer_id": str(hiring.trainer_id),
                },
                payment_intent_data={
                    "metadata": {
                        "hiring_id": str(hiring.id),
                        "user_id": str(hiring.user_id),
                        "trainer_id": str(hiring.trainer_id),
                    }
                },
                customer_email=hiring.user.email or None,
                success_url=success_url,
                cancel_url=cancel_url,
            )
        except stripe.error.StripeError as exc:  # noqa: BLE001
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        hiring.stripe_checkout_session_id = session.id
        if session.payment_intent:
            hiring.stripe_payment_intent_id = session.payment_intent
        hiring.payment_status = TrainerHiring.PAYMENT_REQUIRED
        hiring.save(update_fields=["stripe_checkout_session_id", "stripe_payment_intent_id", "payment_status", "updated_at"])

        return Response({"checkout_url": session.url, "session_id": session.id})


class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        if not settings.STRIPE_WEBHOOK_SECRET:
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        try:
            event = stripe.Webhook.construct_event(payload=payload, sig_header=sig_header, secret=settings.STRIPE_WEBHOOK_SECRET)
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get("type")
        data_object = event.get("data", {}).get("object", {})

        if event_type == "checkout.session.completed":
            metadata = data_object.get("metadata", {})
            hiring_id = metadata.get("hiring_id")
            if hiring_id:
                try:
                    hiring = TrainerHiring.objects.get(id=hiring_id)
                except TrainerHiring.DoesNotExist:
                    pass
                else:
                    updates = ["payment_status", "paid_at"]
                    hiring.payment_status = TrainerHiring.PAYMENT_PAID
                    hiring.paid_at = timezone.now()
                    if data_object.get("payment_intent"):
                        hiring.stripe_payment_intent_id = data_object["payment_intent"]
                        updates.append("stripe_payment_intent_id")
                    hiring.save(update_fields=list(dict.fromkeys(updates)))
        elif event_type == "payment_intent.payment_failed":
            metadata = data_object.get("metadata", {})
            hiring_id = metadata.get("hiring_id")
            if hiring_id:
                TrainerHiring.objects.filter(id=hiring_id).update(payment_status=TrainerHiring.PAYMENT_FAILED, updated_at=timezone.now())

        return Response({"received": True})
