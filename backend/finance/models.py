from django.db import models
from aircraft.models import Flight
from django.core.validators import MinValueValidator, MaxValueValidator


class ExpenseType(models.TextChoices):
    FBO = "FBO", "FBO"
    FUEL = "FUEL", "Fuel"
    HOTEL = "HOTEL", "Hotel"
    MAINTENANCE = "MAINTENANCE", "Maintenance"
    MEAL = "MEAL", "Meal"
    PARKING = "PARKING", "Parking"
    TAXI = "TAXI", "Taxi"
    OTHER = "OTHER", "Other"


class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Cash"
    CHECK = "CHECK", "Check"
    CREDIT_CARD = "CREDIT_CARD", "Credit Card"
    DEBIT_CARD = "DEBIT_CARD", "Debit Card"
    TRANSFER = "TRANSFER", "Transfer"
    ZELLE = "ZELLE", "Zelle"
    OTHER = "OTHER", "Other"


class FuelUnits(models.TextChoices):
    LITERS = "L", "Liters"
    GALLONS = "GAL", "Gallons"
    KILOGRAMS = "KG", "Kilograms"
    POUNDS = "LB", "Pounds"


class FuelType(models.TextChoices):
    JET_A = "JET_A", "Jet A"
    JET_A1 = "JET_A1", "Jet A-1"
    JET_B = "JET_B", "Jet B"
    AVGAS = "AVGAS", "Avgas"


class FlightExpense(models.Model):
    """" A model to record expenses for a flight """
    
    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name="expenses",
        verbose_name="Flight",
    )
    expense_type = models.CharField(
        max_length=20,
        choices=ExpenseType.choices,
        default=ExpenseType.OTHER,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.OTHER,
    )
    expense_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1000000)],
        verbose_name="Expense Amount (USD)",
        help_text="Example: 1200.50",
    )
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        ordering = ["-flight__flight_date"]
        verbose_name = "Flight Expense"
        verbose_name_plural = "Flight Expenses"

    def __str__(self):
        return f"{self.flight.aircraft.registration} {self.flight.flight_date}"


class FuelPaid(models.Model):
    """" A model to record fuel paid for a flight """
    
    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name="fuel_paid",
        verbose_name="Flight",
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=FuelType.choices,
        default=FuelType.JET_A1,
        verbose_name="Type",
    )
    fuel_units = models.CharField(
        max_length=20,
        choices=FuelUnits.choices,
        default=FuelUnits.LITERS,
        verbose_name="Units",
    )
    fuel_quantity = models.DecimalField(
        max_digits=7,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(100000)],
        default=0.0,
        verbose_name="Quantity",
        help_text="No units, just the quantity. Example: 1200.5",
    )
    amount_paid = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100000)],
        default=0.00,
        verbose_name="Amount Paid (USD)",
        help_text="Example: 960.75",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        ordering = ["-flight__flight_date"]
        verbose_name = "Fuel Paid"
        verbose_name_plural = "Fuel Paid"

    def __str__(self):
        return (f"{self.flight.departure_airport}-{self.flight.arrival_airport} | "
                f"{self.flight.aircraft.registration} | {self.fuel_quantity} {self.fuel_units} | "
                f"{self.fuel_type} | USD ${self.amount_paid}")
