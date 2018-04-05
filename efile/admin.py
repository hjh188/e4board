from django.contrib import admin
from lucommon.reversion_compare_admin import CompareVersionAdmin
from reversion import revisions
from lucommon import admin as luadmin

from efile.models import (
    CustomerFile,
    UserImage,
)

from efile.confs import (
    CustomerFileConf,
    UserImageConf,
)

"""
Register models for django admin
"""


class CustomerFileAdmin(luadmin.MultiDBModelAdmin, CompareVersionAdmin):
    """
    CustomerFile admin part
    """
    using = CustomerFileConf.db
    # Update `search_fields` for the which field took for search
    search_fields = ['id', 'file', 'file_name', 'size', 'created_at', 'created_by', 'comment', 'report_status', 'report_url', 'customer_name']
    # Update `list_display` to show which field display in the admin page
    list_display = ['id', 'file', 'file_name', 'size', 'created_at', 'created_by', 'comment', 'report_status', 'report_url', 'customer_name']


class UserImageAdmin(luadmin.MultiDBModelAdmin, CompareVersionAdmin):
    """
    UserImage admin part
    """
    using = UserImageConf.db
    # Update `search_fields` for the which field took for search
    search_fields = ['id', 'img', 'user_id', 'created_at']
    # Update `list_display` to show which field display in the admin page
    list_display = ['id', 'img', 'user_id', 'created_at']



CustomerFile._meta.using = CustomerFileConf.db

revisions.register(CustomerFile)

admin.site.register(CustomerFile, CustomerFileAdmin)
UserImage._meta.using = UserImageConf.db

revisions.register(UserImage)

admin.site.register(UserImage, UserImageAdmin)


