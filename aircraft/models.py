from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


# ============================
# ENUM CHOICES
# ============================

class AircraftManufacturer(models.TextChoices):
    CS = "CS", "Cessna Aircraft"
    PA = "PA", "Piper Aircraft"
    BC = "BC", "Beechcraft Aircraft"
    BD = "BD", "Bombardier"
    DH = "DH", "Daher"
    DS = "DS", "Dassault Aviation"
    EB = "EB", "Embraer"
    GS = "GS", "Gulfstream Aerospace"
    PL = "PL", "Pilatus Aircraft"
    TX = "TX", "Textron Aviation"
    OT = "OT", "Other"


class AircraftType(models.TextChoices):
    ST = "ST", "Single Engine Turboprop"
    TT = "TT", "Twin Engine Turboprop"
    SJ = "SJ", "Single Engine Jet"
    TJ = "TJ", "Twin Engine Jet"
    JJ = "JJ", "Three Engine Jet"
    OT = "OT", "Other"


# ============================
# AIRCRAFT MODEL
# ============================

class Aircraft(models.Model):
    """ A model to represent an aircraft """

    manufacturer = models.CharField(
        max_length=2,
        choices=AircraftManufacturer.choices,
        default=AircraftManufacturer.OT
    )
    aircraft_type = models.CharField(
        max_length=2,
        choices=AircraftType.choices,
        default=AircraftType.OT
    )
    model = models.CharField(
        max_length=255
    )
    serial = models.CharField(
        max_length=255
    )
    registration = models.CharField(
        max_length=50
    )
    total_time = models.DecimalField(
        max_digits=7,
        decimal_places=1,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(500000)
        ],
        default=0
    )
    total_cycles = models.DecimalField(
        max_digits=6,
        decimal_places=1,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100000)
        ],
        default=0
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["manufacturer", "model", "serial", "registration"],
                name="unique_aircraft"
            )
        ]
    
    def __str__(self):
        return f"{self.get_manufacturer_display()} {self.model} {self.serial} {self.registration}"


# ============================
# AIRCRAFT FLIGHT RECORD MODEL
# ============================

class AircraftFlightRecord(models.Model):
    """" A model to record flight data for an aircraft """
    
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.CASCADE,
        related_name="flight_records",
        verbose_name="Aircraft"
    )
    flight_date = models.DateTimeField(
        verbose_name="Flight Date"
    )
    flight_hours = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        default=0,
        verbose_name="Flight Hours"
    )
    press_altitude = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(70000)],
        help_text="Pressure Altitude in feet",
        verbose_name="Pressure Altitude"
    )
    outside_air_temp = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(-100), MaxValueValidator(100)],
        help_text="OAT in degrees Celsius",
        verbose_name="Outside Air Temperature"
    )
    indicated_air_speed = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(1000)],
        null=True,
        blank=True,
        help_text="IAS in knots",
        verbose_name="Indicated Air Speed"
    )
    mach_number = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(3)],
        null=True,
        blank=True,
        help_text="Mach Number",
        verbose_name="Mach Number"
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
        ordering = ["-flight_date"]
        verbose_name = "Aircraft Flight Record"
        verbose_name_plural = "Aircraft Flight Records"

    def __str__(self):
        return f"{self.aircraft.registration} {self.flight_date} {self.flight_hours}"