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
        default=AircraftType.OT,
        verbose_name="Type"
    )
    model = models.CharField(
        max_length=255,
        help_text="Example: King Air 350"
    )
    serial = models.CharField(
        max_length=255,
        verbose_name="S/N"
    )
    registration = models.CharField(
        max_length=50,
        help_text="Example: N123456"
    )
    total_time = models.DecimalField(
        max_digits=7,
        decimal_places=1,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(500000)
        ],
        default=0,
        verbose_name="Total Time (hours)",
        help_text="Example: 2500.5"
    )
    total_cycles = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100000)],
        default=0,
        verbose_name="Total Cycles",
        help_text="Example: 1200",
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
# FLIGHT MODEL
# ============================

class Flight(models.Model):
    """" A simple model to record a flight """
    
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.CASCADE,
        related_name="flights",
        verbose_name="Aircraft",
    )
    flight_date = models.DateField(
        help_text="Flight date",
    )
    departure_airport = models.CharField(
        max_length=4,
        help_text="For example: KJFK",
    )
    arrival_airport = models.CharField(
        max_length=4,
        help_text="For example: LFPG",
    )
    hours_flown = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        default=0.0,
        help_text="Example: 2.5",
    )

    class Meta:
        ordering = ["-flight_date"]
        verbose_name = "Flight"
        verbose_name_plural = "Flights"

    def __str__(self):
        return f"{self.departure_airport}-{self.arrival_airport} | {self.aircraft.registration} | {self.flight_date} | {self.hours_flown} hours"

# ============================
# FLIGHT ENGINE DATA MODEL
# ============================

class FlightEngineData(models.Model):
    """" A model to record engine data for a flight """
    
    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name="engine_data",
        verbose_name="Flight",
    )
    press_altitude = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(70000)],
        verbose_name="Cruise Pressure Altitude (feet)",
        help_text="Example: 27500",
    )
    outside_air_temp = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(-100), MaxValueValidator(100)],
        verbose_name="Cruise OAT (°C)",
        help_text="Example: -38.5",
    )
    indicated_air_speed = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(1000)],
        null=True,
        blank=True,
        verbose_name="Cruise IAS (knots)",
        help_text="Example: 320",
    )
    mach_number = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(3)],
        null=True,
        blank=True,
        verbose_name="Cruise Mach Number",
        help_text="Example: 0.85",
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
        verbose_name = "Flight Engine Data"
        verbose_name_plural = "Flight Engine Data"

    def __str__(self):
        return f"{self.flight.aircraft.registration} {self.flight.flight_date} {self.flight.flight_hours}"