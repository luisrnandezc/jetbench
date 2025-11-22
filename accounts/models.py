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
    """ A custom user model to represent a user of the application """

    email = models.EmailField(
        unique=True,
        help_text="Example: john.doe@example.com"
    )
    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
        null=True,
        help_text="Optional"
    )
    company_name = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Optional"
    )
    role = models.CharField(
        max_length=50, 
        choices=UserRoles.choices
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{{ self.email }} {{ self.role }}"

