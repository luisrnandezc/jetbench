from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Edit form
    fieldsets = (
        ("Login Info", {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "username", "company_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Add form
    add_fieldsets = (
        ("Login Info", {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "username", "company_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    list_display = ("email", "first_name", "last_name", "company_name", "role", "is_staff", "is_active")
    search_fields = ("email", "company_name", "role")
    ordering = ("email",)
