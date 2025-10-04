from django.contrib import admin
from .models import Engine


@admin.register(Engine)
class EngineAdmin(admin.ModelAdmin):
    model = Engine

    # Edit form
    fieldsets = (
        ("Engine Info", {"fields": ("manufacturer", "type", "model", "serial")}),
        ("Time Tracking", {"fields": ("time_since_new", "cycles_since_new", "time_since_overhaul", "cycles_since_overhaul")}),
        ("Maintenance", {"fields": ("time_between_overhauls",)}),
    )

    # Add form
    add_fieldsets = (
        ("Engine Info", {"fields": ("manufacturer", "type", "model", "serial")}),
        ("Time Tracking", {"fields": ("time_since_new", "cycles_since_new", "time_since_overhaul", "cycles_since_overhaul")}),
        ("Maintenance", {"fields": ("time_between_overhauls",)}),
    )

    list_display = ("manufacturer", "type", "model", "serial", "time_since_new", "cycles_since_new", "time_since_overhaul", "cycles_since_overhaul")
    list_filter = ("manufacturer", "type")
    search_fields = ("manufacturer", "model", "serial")
    ordering = ("manufacturer", "model", "serial")