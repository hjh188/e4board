from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    first_login = models.CharField(max_length=10, default="no")
    manager = models.CharField(max_length=100, blank=True)
    display_name = models.CharField(max_length=50, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)

