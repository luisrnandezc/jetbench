from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

class EngineManufacturer(models.TextChoices):
    HW = "hw", "Honeywell"
    RR = "rr", "Rolls-Royce"
    GE = "ge", "General Electric"
    PW = "pw", "Pratt & Whitney"
    WL = "wl", "Williams"
    OT = "ot", "Other"

class EngineType(models.TextChoices):
    TR = "tr", "Turbojet"
    TF = "tf", "Turbofan"
    TP = "tp", "Turboprop"
    TS = "ts", "Turboshaft"
    OT = "ot", "Other"

class Engine(models.Model):
    manufacturer = models.CharField(
        max_length=255, 
        blank=True,
        null=False,
        default="",
        choices=EngineManufacturer.choices
    )
    engine_type = models.CharField(
        max_length=255, 
        blank=True,
        null=False,
        default="",
        choices=EngineType.choices
    )
    model = models.CharField(
        max_length=255, 
        blank=True,
        null=False,
        default="",
    )
    serial = models.CharField(
        unique=True,
        max_length=255, 
        blank=False, 
        null=False,
    )
    time_since_new = models.DecimalField(
        max_digits=7,
        decimal_places=1,
        null=False,
        default=Decimal("0.0"),
        validators=[MinValueValidator(Decimal("0.0")), MaxValueValidator(Decimal("999999.9"))],
        verbose_name="TSN (hours)",
    )
    cycles_since_new = models.PositiveIntegerField(
        null=False,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(1000000)],
        verbose_name="CSN (cycles)",
    )
    time_since_overhaul = models.DecimalField(
        max_digits=6,
        decimal_places=1,
        null=False,
        default=Decimal("0.0"),
        validators=[MinValueValidator(Decimal("0.0")), MaxValueValidator(Decimal("99999.9"))],
        verbose_name="TSO (hours)",
    )
    cycles_since_overhaul = models.PositiveIntegerField(
        null=False,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100000)],
        verbose_name="CSO (cycles)",
    )
    time_between_overhauls = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=False,
        default=Decimal("3500.0"),
        validators=[MinValueValidator(Decimal("0.0")), MaxValueValidator(Decimal("9999.9"))],
        verbose_name="TBO (hours)",
    )

    def __str__(self):
        return f"{self.manufacturer} {self.model} {self.serial}"

