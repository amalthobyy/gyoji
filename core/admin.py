from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, Trainer


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email", "profile_picture", "bio", "fitness_level")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions", "role")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2", "role"),
            },
        ),
    )
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "role")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("username",)


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ("user", "specialization", "experience_years", "hourly_rate", "rating")
    search_fields = ("user__username", "specialization")
