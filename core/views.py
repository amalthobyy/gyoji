from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum, F
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

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
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    CalculatorInputSerializer,
)
from .models import Goal, ProgressLog, WorkoutCategory, Workout, UserWorkoutLog, DietPlan, DailyNutrition, ChatRoom, Message, Product, Cart, CartItem, Order, OrderItem

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


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


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

    def get_queryset(self):
        qs = Workout.objects.select_related("category").prefetch_related("exercises")
        category = self.request.query_params.get("category")
        difficulty = self.request.query_params.get("difficulty")
        if category:
            qs = qs.filter(category__id=category) | qs.filter(category__name__iexact=category)
        if difficulty:
            qs = qs.filter(difficulty_level=difficulty)
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

    def get_queryset(self):
        return DietPlan.objects.all().order_by("id")


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

    def perform_create(self, serializer):
        # Ensure one room per user-trainer pair
        user = self.request.user
        trainer_id = self.request.data.get("trainer")
        if not trainer_id:
            raise ValueError("trainer is required")
        room, _ = ChatRoom.objects.get_or_create(user=user, trainer_id=trainer_id)
        return room


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
