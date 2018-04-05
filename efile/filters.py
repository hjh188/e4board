import django_filters

from efile.models import (
    CustomerFile,
    UserImage,
)

"""
Query filter

On how to set filter class, you can refer to
Django filter for detail management.
"""

class CustomerFileFilter(django_filters.FilterSet):
    """
    CustomerFile filter
    """
    min_size = django_filters.NumberFilter(name='size', lookup_type='gte')
    min_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='gte')
    max_size = django_filters.NumberFilter(name='size', lookup_type='lte')
    max_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='lte')

    class Meta:
        model = CustomerFile
        fields = ['id', 'file', 'file_name', 'size', 'max_size', 'min_size', 'created_at', 'max_created_at', 'min_created_at', 'created_by', 'comment', 'report_status', 'report_url', 'customer_name']


class UserImageFilter(django_filters.FilterSet):
    """
    UserImage filter
    """
    min_user_id = django_filters.NumberFilter(name='user_id', lookup_type='gte')
    max_user_id = django_filters.NumberFilter(name='user_id', lookup_type='lte')
    max_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='lte')
    min_created_at = django_filters.DateTimeFilter(name='created_at', lookup_type='gte')

    class Meta:
        model = UserImage
        fields = ['id', 'img', 'user_id', 'max_user_id', 'min_user_id', 'created_at', 'max_created_at', 'min_created_at']


