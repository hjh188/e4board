from django.db import models

# Create your models here.

class WebSource(models.Model):
    """
    Define web source and depencency
    """
    user_app_endpoint = models.CharField(max_length=50)

