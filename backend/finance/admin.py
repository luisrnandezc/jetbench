from django.contrib import admin
from .models import FlightExpense, FuelPaid


@admin.register(FlightExpense)
class FlightExpenseAdmin(admin.ModelAdmin):
    model = FlightExpense

    fieldsets = (
        ("Flight Information", {
            "fields": ("flight",)
        }),
        ("Expense Details", {
            "fields": ("expense_type", "expense_amount", "payment_method")
        }),
        ("Additional Information", {
            "fields": ("notes",),
            "classes": ("collapse",)
        }),
        ("System Information", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    readonly_fields = ("created_at", "updated_at")

    list_display = (
        "flight",
        "get_expense_type_display",
        "expense_amount",
        "get_payment_method_display",
        "created_at",
    )
    list_filter = (
        "expense_type",
        "payment_method",
        "flight__aircraft__registration",
        "flight__flight_date",
    )
    search_fields = (
        "flight__aircraft__registration",
        "flight__aircraft__model",
        "flight__aircraft__serial",
        "notes",
    )
    date_hierarchy = "flight__flight_date"
    ordering = ("-flight__flight_date",)

    def get_expense_type_display(self, obj):
        return obj.get_expense_type_display()
    get_expense_type_display.short_description = "Expense Type"

    def get_payment_method_display(self, obj):
        return obj.get_payment_method_display()
    get_payment_method_display.short_description = "Payment Method"


@admin.register(FuelPaid)
class FuelPaidAdmin(admin.ModelAdmin):
    model = FuelPaid

    fieldsets = (
        ("Flight Information", {"fields": ("flight",)}),
        ("Fuel Details", {"fields": ("fuel_type", "fuel_units", "fuel_quantity", "amount_paid")}),
        ("System Information", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    readonly_fields = ("created_at", "updated_at")

    list_display = (
        "flight",
        "fuel_type",
        "fuel_units",
        "fuel_quantity",
        "amount_paid",
        "created_at",
    )
    list_filter = (
        "fuel_type",
        "fuel_units",
        "flight__aircraft__registration",
        "flight__flight_date",
    )
    search_fields = (
        "flight__aircraft__registration",
        "flight__departure_airport",
        "flight__arrival_airport",
    )
    date_hierarchy = "flight__flight_date"
    ordering = ("-flight__flight_date",)
