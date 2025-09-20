from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRoles(models.TextChoices):
    PILOT = "pilot", "Pilot"
    MECHANIC = "mechanic", "Mechanic"
    ENGINEER = "engineer", "Engineer"
    STAFF = "staff", "Staff"
    OWNER = "owner", "Owner"
    ADMIN = "admin", "Admin"

class CustomUser(AbstractUser):
    email = models.EmailField(
        unique=True
    )
    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
        null=True
    )
    company_name = models.CharField(
        max_length=255, 
        blank=True, 
        null=True
    )
    role = models.CharField(
        max_length=50, 
        choices=UserRoles.choices
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{{ self.email }} {{ self.role }}"

