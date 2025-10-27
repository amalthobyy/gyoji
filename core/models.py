from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_USER = "user"
    ROLE_TRAINER = "trainer"

    ROLE_CHOICES = [
        (ROLE_USER, "User"),
        (ROLE_TRAINER, "Trainer"),
    ]

    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    bio = models.TextField(blank=True)
    fitness_level = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)

    def __str__(self) -> str:
        return self.username


class Trainer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="trainer_profile")
    specialization = models.CharField(max_length=100, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    certifications = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self) -> str:
        return f"Trainer({self.user.username})"


class TrainerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="trainer_extra")
    specialization = models.CharField(max_length=100, blank=True)
    certifications = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    availability_schedule = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f"TrainerProfile({self.user.username})"


class TrainerHiring(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_REJECTED, "Rejected"),
    ]

    SESSION_ONE_TIME = "one-time"
    SESSION_MONTHLY = "monthly"
    SESSION_CHOICES = [
        (SESSION_ONE_TIME, "One-time"),
        (SESSION_MONTHLY, "Monthly"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hirings")
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trainer_hirings")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    start_date = models.DateField()
    session_type = models.CharField(max_length=10, choices=SESSION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Hiring(user={self.user.username}, trainer={self.trainer.username}, status={self.status})"


class TrainerReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trainer_reviews")
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_received")
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Review({self.rating}) by {self.user.username} for {self.trainer.username}"


class Goal(models.Model):
    TYPE_WEIGHT_LOSS = "weight_loss"
    TYPE_MUSCLE_BUILDING = "muscle_building"
    TYPE_ENDURANCE = "endurance"
    TYPE_FLEXIBILITY = "flexibility"
    GOAL_TYPE_CHOICES = [
        (TYPE_WEIGHT_LOSS, "Weight Loss"),
        (TYPE_MUSCLE_BUILDING, "Muscle Building"),
        (TYPE_ENDURANCE, "Endurance"),
        (TYPE_FLEXIBILITY, "Flexibility"),
    ]

    STATUS_PENDING = "pending"
    STATUS_ACTIVE = "active"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="goals")
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    target_value = models.DecimalField(max_digits=8, decimal_places=2)
    current_value = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    deadline = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Goal({self.goal_type}) for {self.user.username}"


class ProgressLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progress_logs")
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField()
    value = models.DecimalField(max_digits=8, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self) -> str:
        return f"Progress({self.value}) on {self.date} by {self.user.username}"


class ProgressPhoto(models.Model):
    log = models.ForeignKey(ProgressLog, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="progress_photos/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Photo for log {self.log_id}"


# Workout Management
class WorkoutCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self) -> str:
        return self.name


class Workout(models.Model):
    DIFF_BEGINNER = "beginner"
    DIFF_INTERMEDIATE = "intermediate"
    DIFF_ADVANCED = "advanced"
    DIFFICULTY_CHOICES = [
        (DIFF_BEGINNER, "Beginner"),
        (DIFF_INTERMEDIATE, "Intermediate"),
        (DIFF_ADVANCED, "Advanced"),
    ]

    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    category = models.ForeignKey(WorkoutCategory, on_delete=models.CASCADE, related_name="workouts")
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    calories_burned = models.PositiveIntegerField(default=0)
    equipment_needed = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    exercises_list = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class Exercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    sets = models.PositiveIntegerField(default=3)
    reps = models.PositiveIntegerField(default=10)
    rest_time = models.PositiveIntegerField(default=60, help_text="Rest time in seconds")

    def __str__(self) -> str:
        return f"{self.name} ({self.workout.title})"


class UserWorkoutLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout_logs")
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="logs")
    completed_at = models.DateTimeField(auto_now_add=True)
    duration_actual = models.PositiveIntegerField(null=True, blank=True)
    calories_burned_actual = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"{self.user.username} completed {self.workout.title}"


# Nutrition
class DietPlan(models.Model):
    GOAL_WEIGHT_LOSS = "weight_loss"
    GOAL_MUSCLE_GAIN = "muscle_gain"
    GOAL_CHOICES = [
        (GOAL_WEIGHT_LOSS, "Weight Loss"),
        (GOAL_MUSCLE_GAIN, "Muscle Gain"),
    ]

    name = models.CharField(max_length=120)
    goal_type = models.CharField(max_length=20, choices=GOAL_CHOICES)
    daily_calories = models.PositiveIntegerField()
    meals_per_day = models.PositiveSmallIntegerField(default=3)

    def __str__(self) -> str:
        return f"{self.name} ({self.get_goal_type_display()})"


class Meal(models.Model):
    MEAL_BREAKFAST = "breakfast"
    MEAL_LUNCH = "lunch"
    MEAL_DINNER = "dinner"
    MEAL_CHOICES = [
        (MEAL_BREAKFAST, "Breakfast"),
        (MEAL_LUNCH, "Lunch"),
        (MEAL_DINNER, "Dinner"),
    ]

    diet_plan = models.ForeignKey(DietPlan, on_delete=models.CASCADE, related_name="meals")
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    name = models.CharField(max_length=120)
    calories = models.PositiveIntegerField(default=0)
    protein = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    carbs = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    fat = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    ingredients = models.JSONField(default=list, blank=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.get_meal_type_display()})"


class DailyNutrition(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_nutrition")
    date = models.DateField()
    calories = models.PositiveIntegerField(default=0)
    protein = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    carbs = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    fat = models.DecimalField(max_digits=7, decimal_places=2, default=0)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"Nutrition {self.date} for {self.user.username}"


# Chat
class ChatRoom(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_rooms_user")
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_rooms_trainer")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "trainer")

    def __str__(self) -> str:
        return f"ChatRoom({self.user.username}-{self.trainer.username})"


class Message(models.Model):
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Msg by {self.sender.username} at {self.timestamp}"


# Merchandise store
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    stock_quantity = models.PositiveIntegerField(default=0)
    images = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_SHIPPED = "shipped"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_SHIPPED, "Shipped"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Order {self.id} by {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f"{self.quantity} x {self.product.name}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Cart of {self.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self) -> str:
        return f"{self.quantity} x {self.product.name}"
