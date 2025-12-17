from django.contrib import admin
from .models import Aircraft, Flight, FlightEngineData


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

@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    model = Flight

    fieldsets = (
        ("Flight Information", {
            "fields": ("aircraft", "flight_date", "departure_airport", "arrival_airport", "hours_flown")
        }),
    )

    list_display = (
        "aircraft",
        "departure_airport",
        "arrival_airport",
        "flight_date",
        "hours_flown",
    )
    list_filter = ("flight_date", "aircraft__manufacturer", "aircraft__aircraft_type")
    search_fields = ("aircraft__registration", "aircraft__model", "aircraft__serial")
    date_hierarchy = "flight_date"
    ordering = ("-flight_date",)


@admin.register(FlightEngineData)
class FlightEngineDataAdmin(admin.ModelAdmin):
    model = FlightEngineData

    fieldsets = (
        ("Flight Information", {
            "fields": ("flight", "flight__departure_airport", "flight__arrival_airport")
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
        "flight",
        "flight__departure_airport",
        "flight__arrival_airport",
        "press_altitude",
        "outside_air_temp",
        "indicated_air_speed",
        "mach_number",
        "created_at",
        "updated_at"
    )
    list_filter = ("flight__aircraft__registration", "press_altitude", "flight__flight_date")
    search_fields = ("flight__aircraft__registration", "flight__aircraft__model", "flight__aircraft__serial")
    date_hierarchy = "flight__flight_date"
    ordering = ("-flight__flight_date",)