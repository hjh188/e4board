from django.db import models
from lucommon.models import LuModel

# Create your models here.

class CustomerFile(LuModel):
    file = models.FileField(upload_to="customer_file")
    file_name = models.CharField(max_length=200)
    size = models.IntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100, null=True, default="Guest")
    comment = models.TextField(null=True)
    report_status = models.CharField(max_length=10, null=True)
    report_url = models.CharField(max_length=200, null=True)
    customer_name = models.CharField(max_length=100, null=True)

class UserImage(LuModel):
    img = models.FileField(upload_to="web/img/user/")
    user_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

