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
