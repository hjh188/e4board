from django.contrib import admin
from lucommon.reversion_compare_admin import CompareVersionAdmin
from reversion import revisions
from lucommon import admin as luadmin

from euser.models import (
    User,
)

from euser.confs import (
    UserConf,
)

"""
Register models for django admin
"""


class UserAdmin(luadmin.MultiDBModelAdmin, CompareVersionAdmin):
    """
    User admin part
    """
    using = UserConf.db
    # Update `search_fields` for the which field took for search
    search_fields = ['id', 'password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'phone', 'bio', 'location', 'birth_date', 'first_login', 'manager', 'display_name', 'employee_id']
    # Update `list_display` to show which field display in the admin page
    list_display = ['id', 'password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'phone', 'bio', 'location', 'birth_date', 'first_login', 'manager', 'display_name', 'employee_id']



User._meta.using = UserConf.db

revisions.register(User)

admin.site.register(User, UserAdmin)


