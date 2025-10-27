from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers

from .models import (
    Trainer,
    TrainerProfile,
    TrainerHiring,
    TrainerReview,
    Goal,
    ProgressLog,
    ProgressPhoto,
    WorkoutCategory,
    Workout,
    Exercise,
    UserWorkoutLog,
    DietPlan,
    Meal,
    DailyNutrition,
    ChatRoom,
    Message,
    Product,
    Order,
    OrderItem,
    Cart,
    CartItem,
)

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "chat_room", "sender", "content", "timestamp", "is_read"]
        read_only_fields = ["timestamp", "is_read"]


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ["id", "user", "trainer", "created_at", "last_message"]
        read_only_fields = ["created_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-timestamp").first()
        return MessageSerializer(msg).data if msg else None


class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = [
            "id",
            "specialization",
            "experience_years",
            "hourly_rate",
            "certifications",
            "rating",
        ]


class TrainerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerProfile
        fields = [
            "id",
            "specialization",
            "certifications",
            "bio",
            "rating",
            "availability_schedule",
        ]


class TrainerHiringSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TrainerHiring
        fields = [
            "id",
            "user",
            "trainer",
            "status",
            "start_date",
            "session_type",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "created_at", "updated_at"]


class TrainerReviewSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TrainerReview
        fields = [
            "id",
            "user",
            "trainer",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class UserSerializer(serializers.ModelSerializer):
    trainer_profile = TrainerSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "bio",
            "fitness_level",
            "role",
            "trainer_profile",
        ]
        read_only_fields = ["id", "role"]


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
        ]

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.get("role", User.ROLE_USER)
        user = User(**validated_data)
        user.role = role
        user.set_password(password)
        user.save()
        if role == User.ROLE_TRAINER:
            Trainer.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("username")
        password = attrs.get("password")
        user = None
        if identifier and "@" in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=identifier, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        attrs["user"] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email")
        return value

    def save(self, **kwargs):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{kwargs.get('frontend_url')}/reset-password?uid={uidb64}&token={token}"
        send_mail(
            subject="Password Reset",
            message=f"Use this link to reset your password: {reset_link}",
            from_email=kwargs.get("from_email"),
            recipient_list=[email],
            fail_silently=False,
        )
        return {"detail": "Password reset email sent"}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value: str) -> str:
        validate_password(value)
        return value

    def save(self, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(self.validated_data["uid"]))
            user = User.objects.get(pk=uid)
        except Exception as exc:  # noqa: BLE001
            raise serializers.ValidationError("Invalid user") from exc
        token = self.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Invalid or expired token")
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return {"detail": "Password has been reset"}


class ProgressPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressPhoto
        fields = ["id", "image", "created_at"]
        read_only_fields = ["id", "created_at"]


class GoalSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Goal
        fields = [
            "id",
            "user",
            "goal_type",
            "target_value",
            "current_value",
            "deadline",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProgressLogSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    photos = ProgressPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = ProgressLog
        fields = [
            "id",
            "user",
            "goal",
            "date",
            "value",
            "notes",
            "photos",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class WorkoutCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutCategory
        fields = ["id", "name"]


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "name", "description", "sets", "reps", "rest_time"]


class WorkoutSerializer(serializers.ModelSerializer):
    category = WorkoutCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=WorkoutCategory.objects.all(), write_only=True
    )
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = Workout
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_id",
            "difficulty_level",
            "duration",
            "calories_burned",
            "equipment_needed",
            "video_url",
            "exercises_list",
            "exercises",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class UserWorkoutLogSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserWorkoutLog
        fields = [
            "id",
            "user",
            "workout",
            "completed_at",
            "duration_actual",
            "calories_burned_actual",
            "notes",
        ]
        read_only_fields = ["completed_at"]


class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = [
            "id",
            "meal_type",
            "name",
            "calories",
            "protein",
            "carbs",
            "fat",
            "ingredients",
        ]


class DietPlanSerializer(serializers.ModelSerializer):
    meals = MealSerializer(many=True, read_only=True)

    class Meta:
        model = DietPlan
        fields = [
            "id",
            "name",
            "goal_type",
            "daily_calories",
            "meals_per_day",
            "meals",
        ]


class DailyNutritionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DailyNutrition
        fields = ["id", "user", "date", "calories", "protein", "carbs", "fat"]


class ProteinCalculatorSerializer(serializers.Serializer):
    weight_kg = serializers.FloatField(min_value=1)
    activity_level = serializers.ChoiceField(choices=["sedentary", "moderate", "active"])  # simple choices
    goal = serializers.ChoiceField(choices=["weight_loss", "muscle_gain", "maintenance"])  # goals


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "description", "price", "category", "stock_quantity", "images", "created_at"]
        read_only_fields = ["created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source="product", queryset=Product.objects.all(), write_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_id", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "user", "total_amount", "status", "created_at", "items"]
        read_only_fields = ["user", "total_amount", "status", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source="product", queryset=Product.objects.all(), write_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "created_at"]
        read_only_fields = ["user", "created_at"]


class CalculatorInputSerializer(serializers.Serializer):
    weight_kg = serializers.FloatField(min_value=1)
    height_cm = serializers.FloatField(min_value=30)
    age = serializers.IntegerField(min_value=5, max_value=120)
    gender = serializers.ChoiceField(choices=["male", "female"])
    activity_level = serializers.ChoiceField(
        choices=["sedentary", "light", "moderate", "active", "very_active"],
    )
    goal = serializers.ChoiceField(choices=["weight_loss", "muscle_gain", "maintenance"])
