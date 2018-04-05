from django.contrib import admin
from lucommon.reversion_compare_admin import CompareVersionAdmin
from reversion import revisions
from lucommon import admin as luadmin

from eboard.models import (
    Board,
)

from eboard.confs import (
    BoardConf,
)

"""
Register models for django admin
"""


class BoardAdmin(luadmin.MultiDBModelAdmin, CompareVersionAdmin):
    """
    Board admin part
    """
    using = BoardConf.db
    # Update `search_fields` for the which field took for search
    search_fields = ['id', 'title', 'name', 'type', 'url', 'search', 'search_param', 'fixed_data', 'color', 'size', 'state', 'created_at', 'updated_at', 'created_by', 'group', 'comment', 'index', 'template', 'js_template', 'status', 'refresh', 'process', 'shared_by', 'pre_size', 'height', 'pre_height', 'footer_height', 'enable_header_menu', 'enable_resize', 'enable_save']
    # Update `list_display` to show which field display in the admin page
    list_display = ['id', 'title', 'name', 'type', 'url', 'search', 'search_param', 'fixed_data', 'color', 'size', 'state', 'created_at', 'updated_at', 'created_by', 'group', 'comment', 'index', 'template', 'js_template', 'status', 'refresh', 'process', 'shared_by', 'pre_size', 'height', 'pre_height', 'footer_height', 'enable_header_menu', 'enable_resize', 'enable_save']



Board._meta.using = BoardConf.db

revisions.register(Board)

admin.site.register(Board, BoardAdmin)


