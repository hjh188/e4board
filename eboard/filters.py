import django_filters

from eboard.models import (
    Board,
)

"""
Query filter

On how to set filter class, you can refer to
Django filter for detail management.
"""

class BoardFilter(django_filters.FilterSet):
    """
    Board filter
    """
    min_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='gte')
    min_footer_height = django_filters.NumberFilter(name='footer_height', lookup_type='gte')
    max_footer_height = django_filters.NumberFilter(name='footer_height', lookup_type='lte')
    max_updated_at = django_filters.DateTimeFilter(name='updated_at', lookup_type='lte')
    max_refresh = django_filters.NumberFilter(name='refresh', lookup_type='lte')
    min_index = django_filters.NumberFilter(name='index', lookup_type='gte')
    min_refresh = django_filters.NumberFilter(name='refresh', lookup_type='gte')
    max_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='lte')
    min_updated_at = django_filters.DateTimeFilter(name='updated_at', lookup_type='gte')
    max_index = django_filters.NumberFilter(name='index', lookup_type='lte')

    class Meta:
        model = Board
        fields = ['id', 'title', 'name', 'type', 'url', 'search', 'search_param', 'fixed_data', 'color', 'size', 'state', 'created_at', 'max_created_at', 'min_created_at', 'updated_at', 'max_updated_at', 'min_updated_at', 'created_by', 'group', 'comment', 'index', 'max_index', 'min_index', 'template', 'js_template', 'status', 'refresh', 'max_refresh', 'min_refresh', 'process', 'shared_by', 'pre_size', 'height', 'pre_height', 'footer_height', 'max_footer_height', 'min_footer_height', 'enable_header_menu', 'enable_resize', 'enable_save']


