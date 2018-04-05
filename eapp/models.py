from django.db import models
from lucommon.models import LuModel

# Create your models here.

class App(LuModel):
    name = models.CharField(max_length=100, unique=True)
    url = models.CharField(max_length=200, default="")
    version = models.CharField(max_length=10, default="1.0.0")
    type = models.CharField(max_length=20, null=True)
    status = models.CharField(max_length=10, default="online")
    index = models.IntegerField(null=True, default=0)
    color = models.CharField(max_length=20, default="blue_two")
    icon = models.CharField(max_length=20, default="")
    img = models.CharField(max_length=100, default="")
    description = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=30, default="guest")

