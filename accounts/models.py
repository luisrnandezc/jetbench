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
    company_name = models.CharField(
        max_length=255, 
        blank=True, 
        null=True
    )
    role = models.CharField(
        max_length=50, 
        choices=UserRoles.choices
    )

    def __str__(self):
        return f"{{ self.email }} {{ self.role }}"

