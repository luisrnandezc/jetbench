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

    TEMPERATURE_UNIT_CHOICES = [
        ("C", "°C"),
        ("F", "°F"),
    ]
    FUEL_FLOW_UNIT_CHOICES = [
        ("KPH", "kg/h"),
        ("LPH", "lb/h"),
    ]

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
        verbose_name="TTAF",
        help_text="Total Time Airframe in Hours. Example: 2500.5"
    )
    total_cycles = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100000)],
        default=0,
        verbose_name="TAC",
        help_text="Total Accumulated Cycles. Example: 1200",
    )
    fuel_flow_unit = models.CharField(
        max_length=3,
        choices=FUEL_FLOW_UNIT_CHOICES,
        default="kgh",
        verbose_name="Fuel Flow Unit",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["manufacturer", "model", "serial", "registration"],
                name="unique_aircraft"
            )
        ]

    def save(self, *args, **kwargs):

        if self.aircraft_type:
            self.aircraft_type = self.aircraft_type.upper()

        if self.model:
            self.model = self.model.upper()

        if self.registration:
            self.registration = self.registration.upper()

        if self.serial:
            self.serial = self.serial.upper()

        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.registration}"


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

    def save(self, *args, **kwargs):

        if self.departure_airport:
            self.departure_airport = self.departure_airport.upper()

        if self.arrival_airport:
            self.arrival_airport = self.arrival_airport.upper()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.departure_airport}-{self.arrival_airport} | {self.aircraft.registration} | {self.flight_date}"

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
        verbose_name="Cruise OAT",
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
    SpeedN1 = models.DecimalField(
        max_digits=4, 
        decimal_places=1,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        verbose_name="LPC Speed (%)",
        help_text="Low Pressure Compressor Speed. Example: 85.5",
    )
    SpeedN2 = models.DecimalField(
        max_digits=4, 
        decimal_places=1,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        verbose_name="HPC Speed (%)",
        help_text="High Pressure Compressor Speed. Example: 97.2",
    )
    EnginePR = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="EPR",
        help_text="Engine Pressure Ratio. Example: 1.53",
    )
    InterstageTT = models.DecimalField(
        max_digits=5, 
        decimal_places=1,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10000)],
        verbose_name="ITT",
        help_text="Interstage Turbine Temperature. Example: 1090.5",
    )
    EngineFF = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(50000)],
        verbose_name="FF",
        help_text="Fuel Flow. Example: 1200.5",
    )
    OilPress = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1000)]
    )
    OilTemp = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(500)]
    )
    OilAdded = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(50)]
    )
    EngineVib = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="Engine Vibration",
        help_text="Example: 0.56",
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