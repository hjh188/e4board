from django.db import models
from lucommon.models import LuModel

# Create your models here.

class Board(LuModel):
    title = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20)
    url = models.TextField()
    search = models.TextField(null=True)
    search_param = models.TextField(null=True, default='')
    fixed_data = models.CharField(max_length=10, default='0')
    color = models.CharField(max_length=10, null=True)
    size = models.CharField(max_length=20, null=True)
    state = models.CharField(max_length=20, null=True, default='show')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=100, default="guest")
    # Group:
    # 'public': for everyone
    # 'protect': from 'public'
    # 'private' is self
    # 'share' is shared from others 
    group = models.CharField(max_length=50, null=True, default="public")
    comment = models.TextField(null=True)
    index = models.IntegerField(null=True, default=0)
    template = models.CharField(max_length=100, null=True, default="online_service")
    js_template = models.CharField(max_length=100, null=True, default="")
    status = models.CharField(max_length=20, null=True, default="enable")
    refresh = models.IntegerField(null=True, default=0)
    process = models.CharField(max_length=2, null=True, default="1")
    shared_by = models.CharField(max_length=100, null=True)

    # add pre_size to store the size before change
    pre_size = models.CharField(max_length=20, null=True, default="eight wide")

    # height of dashboard column
    height = models.CharField(max_length=20, null=True, default=450)
    pre_height = models.CharField(max_length=20, null=True, default=450)

    # footer height, default is 0, set to positive value, can enable it
    # footer use to extend for board in future
    footer_height = models.IntegerField(default=0)

    # style control
    # set 'True' to enable header menu
    enable_header_menu = models.CharField(max_length=20, default="")
    # set 'True' to enabel board resize
    enable_resize = models.CharField(max_length=20, default="")
    # set 'True' to enable save personal data
    enable_save = models.CharField(max_length=20, default="True")

