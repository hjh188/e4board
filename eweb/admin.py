from django.contrib import admin
from lucommon.reversion_compare_admin import CompareVersionAdmin
from reversion import revisions
from lucommon import admin as luadmin

from eweb.models import (
    WebSource,
)

from eweb.confs import (
    WebSourceConf,
)

"""
Register models for django admin
"""


class WebSourceAdmin(luadmin.MultiDBModelAdmin, CompareVersionAdmin):
    """
    WebSource admin part
    """
    using = WebSourceConf.db
    # Update `search_fields` for the which field took for search
    search_fields = ['id', 'user_app_endpoint']
    # Update `list_display` to show which field display in the admin page
    list_display = ['id', 'user_app_endpoint']



WebSource._meta.using = WebSourceConf.db

revisions.register(WebSource)

admin.site.register(WebSource, WebSourceAdmin)


