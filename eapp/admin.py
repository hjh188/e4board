from django.contrib import admin
from lucommon.reversion_compare_admin import CompareVersionAdmin
from reversion import revisions
from lucommon import admin as luadmin

from eapp.models import (
    App,
)

from eapp.confs import (
    AppConf,
)

"""
Register models for django admin
"""


class AppAdmin(luadmin.MultiDBModelAdmin, CompareVersionAdmin):
    """
    App admin part
    """
    using = AppConf.db
    # Update `search_fields` for the which field took for search
    search_fields = ['id', 'name', 'url', 'version', 'type', 'status', 'index', 'color', 'icon', 'img', 'description', 'created_at', 'updated_at', 'created_by']
    # Update `list_display` to show which field display in the admin page
    list_display = ['id', 'name', 'url', 'version', 'type', 'status', 'index', 'color', 'icon', 'img', 'description', 'created_at', 'updated_at', 'created_by']



App._meta.using = AppConf.db

revisions.register(App)

admin.site.register(App, AppAdmin)


