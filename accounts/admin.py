from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Edit form
    fieldsets = (
        ("Login Info", {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Add form
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "role", "password1", "password2", "is_staff", "is_active")}
        ),
    )

    list_display = ("username", "email", "role", "is_staff", "is_active")
    search_fields = ("username", "email", "role")
    ordering = ("username",)
