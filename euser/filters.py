import django_filters

from euser.models import (
    User,
)

"""
Query filter

On how to set filter class, you can refer to
Django filter for detail management.
"""

class UserFilter(django_filters.FilterSet):
    """
    User filter
    """
    max_last_login = django_filters.DateTimeFilter(name='last_login', lookup_type='lte')
    min_birth_date = django_filters.DateTimeFilter(name='birth_date', lookup_type='gte')
    min_date_joined = django_filters.DateTimeFilter(name='date_joined', lookup_type='gte')
    min_last_login = django_filters.DateTimeFilter(name='last_login', lookup_type='gte')
    max_date_joined = django_filters.DateTimeFilter(name='date_joined', lookup_type='lte')
    max_birth_date = django_filters.DateTimeFilter(name='birth_date', lookup_type='lte')

    class Meta:
        model = User
        fields = ['id', 'password', 'last_login', 'max_last_login', 'min_last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'max_date_joined', 'min_date_joined', 'phone', 'bio', 'location', 'birth_date', 'max_birth_date', 'min_birth_date', 'first_login', 'manager', 'display_name', 'employee_id']


