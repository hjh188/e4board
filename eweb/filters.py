import django_filters

from eweb.models import (
    WebSource,
)

"""
Query filter

On how to set filter class, you can refer to
Django filter for detail management.
"""

class WebSourceFilter(django_filters.FilterSet):
    """
    WebSource filter
    """

    class Meta:
        model = WebSource
        fields = ['id', 'user_app_endpoint']


