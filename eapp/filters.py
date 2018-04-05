import django_filters

from eapp.models import (
    App,
)

"""
Query filter

On how to set filter class, you can refer to
Django filter for detail management.
"""

class AppFilter(django_filters.FilterSet):
    """
    App filter
    """
    min_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='gte')
    max_updated_at = django_filters.DateTimeFilter(name='updated_at', lookup_type='lte')
    min_index = django_filters.NumberFilter(name='index', lookup_type='gte')
    max_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='lte')
    max_index = django_filters.NumberFilter(name='index', lookup_type='lte')
    min_updated_at = django_filters.DateTimeFilter(name='updated_at', lookup_type='gte')

    class Meta:
        model = App
        fields = ['id', 'name', 'url', 'version', 'type', 'status', 'index', 'max_index', 'min_index', 'color', 'icon', 'img', 'description', 'created_at', 'max_created_at', 'min_created_at', 'updated_at', 'max_updated_at', 'min_updated_at', 'created_by']


