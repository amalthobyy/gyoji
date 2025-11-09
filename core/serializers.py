from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers
from urllib.parse import urlparse, parse_qs

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
    sender_name = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "chat_room", "sender", "sender_name", "sender_avatar", "content", "timestamp", "is_read"]
        read_only_fields = ["timestamp", "is_read"]

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

    def get_sender_avatar(self, obj):
        if not obj.sender.profile_picture:
            return None
        request = self.context.get("request")
        url = obj.sender.profile_picture.url
        return request.build_absolute_uri(url) if request else url


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()
    trainer_avatar = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "user",
            "user_name",
            "user_avatar",
            "trainer",
            "trainer_name",
            "trainer_avatar",
            "created_at",
            "last_message",
            "unread_count",
        ]
        read_only_fields = ["created_at", "user", "trainer"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-timestamp").first()
        return MessageSerializer(msg, context=self.context).data if msg else None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or not request.user:
            return 0
        # Count unread messages that are not sent by the current user
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()

    def _absolute_url(self, picture):
        if not picture:
            return None
        request = self.context.get("request")
        url = picture.url
        return request.build_absolute_uri(url) if request else url

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_user_avatar(self, obj):
        return self._absolute_url(obj.user.profile_picture)

    def get_trainer_name(self, obj):
        return obj.trainer.get_full_name() or obj.trainer.username

    def get_trainer_avatar(self, obj):
        return self._absolute_url(obj.trainer.profile_picture)


class TrainerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.SerializerMethodField()
    bio = serializers.CharField(source="user.bio", allow_blank=True, required=False)
    profile_picture = serializers.SerializerMethodField()
    upload_profile_picture = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Trainer
        fields = [
            "id",
            "user_id",
            "username",
            "name",
            "email",
            "profile_picture",
            "bio",
            "specialization",
            "experience_years",
            "hourly_rate",
            "certifications",
            "rating",
            "upload_profile_picture",
        ]
        read_only_fields = [
            "id",
            "user_id",
            "username",
            "name",
            "email",
            "profile_picture",
            "rating",
        ]

    def get_name(self, obj):
        full_name = obj.user.get_full_name()
        return full_name if full_name else obj.user.username

    def get_profile_picture(self, obj):
        picture = obj.user.profile_picture
        if not picture:
            return None
        request = self.context.get("request")
        url = picture.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def update(self, instance, validated_data):
        upload_picture = validated_data.pop("upload_profile_picture", None)
        user_data = validated_data.pop("user", {})
        bio = user_data.get("bio")

        user_fields_to_update = []

        if bio is not None:
            instance.user.bio = bio
            user_fields_to_update.append("bio")

        if upload_picture is not None:
            if upload_picture == "":
                instance.user.profile_picture = None
            else:
                instance.user.profile_picture = upload_picture
            user_fields_to_update.append("profile_picture")

        if user_fields_to_update:
            instance.user.save(update_fields=user_fields_to_update)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


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
    user_name = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()
    trainer_profile_picture = serializers.SerializerMethodField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, coerce_to_string=False)
    payment_status = serializers.CharField(read_only=True)
    paid_at = serializers.DateTimeField(read_only=True)
    can_pay = serializers.SerializerMethodField()

    class Meta:
        model = TrainerHiring
        fields = [
            "id",
            "user",
            "user_name",
            "trainer",
            "trainer_name",
            "trainer_profile_picture",
            "status",
            "start_date",
            "session_type",
            "time_slot",
            "amount",
            "payment_status",
            "paid_at",
            "can_pay",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "amount",
            "payment_status",
            "paid_at",
            "created_at",
            "updated_at",
            "can_pay",
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_trainer_name(self, obj):
        return obj.trainer.get_full_name() or obj.trainer.username

    def get_trainer_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.trainer.profile_picture:
            return request.build_absolute_uri(obj.trainer.profile_picture.url) if request else obj.trainer.profile_picture.url
        return None

    def get_can_pay(self, obj):
        return (
            obj.status == TrainerHiring.STATUS_ACCEPTED
            and obj.payment_status
            in {TrainerHiring.PAYMENT_PENDING, TrainerHiring.PAYMENT_REQUIRED, TrainerHiring.PAYMENT_FAILED}
            and obj.amount > 0
        )

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.method in {"PATCH", "PUT"}:
            status = attrs.get("status")
            if status and status not in dict(TrainerHiring.STATUS_CHOICES):
                raise serializers.ValidationError({"status": "Invalid status"})
        return super().validate(attrs)


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
            "is_staff",
            "is_superuser",
            "date_joined",
        ]
        read_only_fields = ["id", "role", "is_staff", "is_superuser", "date_joined"]
        extra_kwargs = {
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
            "bio": {"required": False, "allow_blank": True},
            "fitness_level": {"required": False, "allow_blank": True},
            "profile_picture": {"required": False, "allow_null": True},
        }


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
            TrainerProfile.objects.get_or_create(user=user)
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
    difficulty_label = serializers.CharField(source="get_difficulty_level_display", read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Workout
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_id",
            "difficulty_level",
            "difficulty_label",
            "duration",
            "calories_burned",
            "equipment_needed",
            "video_url",
            "thumbnail",
            "exercises_list",
            "exercises",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def get_thumbnail(self, obj):
        url = obj.video_url or ""
        if not url:
            return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop"

        parsed = urlparse(url)
        host = parsed.netloc.lower()
        video_id = None
        if "youtu.be" in host:
            video_id = parsed.path.lstrip("/")
        elif "youtube.com" in host:
            query = parse_qs(parsed.query)
            video_id = query.get("v", [None])[0]
            if not video_id and parsed.path.startswith("/embed/"):
                video_id = parsed.path.split("/embed/")[-1]
        if video_id:
            return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

        return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop"


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
            "image_url",
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

