from django.contrib import admin
from .models import Aircraft, AircraftFlightRecord


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    model = Aircraft

    fieldsets = (
        ("Aircraft Information", {
            "fields": ("manufacturer", "aircraft_type", "model", "serial", "registration")
        }),
        ("Time & Cycles", {
            "fields": ("total_time", "total_cycles")
        }),
    )

    list_display = (
        "get_manufacturer_display",
        "get_aircraft_type_display",
        "model",
        "serial",
        "registration",
        "total_time",
        "total_cycles"
    )
    list_filter = ("manufacturer", "aircraft_type")
    search_fields = ("model", "serial", "registration")
    ordering = ("manufacturer", "aircraft_type", "model", "serial", "registration")

    def get_manufacturer_display(self, obj):
        return obj.get_manufacturer_display()
    get_manufacturer_display.short_description = "Manufacturer"

    def get_aircraft_type_display(self, obj):
        return obj.get_aircraft_type_display()
    get_aircraft_type_display.short_description = "Aircraft Type"


@admin.register(AircraftFlightRecord)
class AircraftFlightRecordAdmin(admin.ModelAdmin):
    model = AircraftFlightRecord

    fieldsets = (
        ("Flight Information", {
            "fields": ("aircraft", "flight_date", "flight_hours")
        }),
        ("Cruise Flight Conditions", {
            "fields": ("press_altitude", "outside_air_temp", "indicated_air_speed", "mach_number")
        }),
        ("System Information", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    readonly_fields = ("created_at", "updated_at")

    list_display = (
        "aircraft",
        "flight_date",
        "flight_hours",
        "press_altitude",
        "outside_air_temp",
        "indicated_air_speed",
        "mach_number"
    )
    list_filter = ("flight_date", "aircraft", "press_altitude")
    search_fields = ("aircraft__registration", "aircraft__model", "aircraft__serial")
    date_hierarchy = "flight_date"
    ordering = ("-flight_date",)