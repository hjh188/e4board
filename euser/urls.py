from django.conf.urls import url

from euser.views import (
    UserViewSet,
)


"""
Lucommon didn't use the Router class to register url,
Actually we set urls explicitly, one point is to control
what method we want to expose clearly.

By default, we set CURD and patch update. Please modify according
to your project
"""

urlpatterns = [
    url(r'^users/$', UserViewSet.as_view({'get':'list',
                                        'post': 'create'})),
    url(r'^users/(?P<pk>[0-9]+)$', UserViewSet.as_view({'get':'retrieve',
                                                      'put': 'update',
                                                      'patch': 'partial_update',
                                                      'delete': 'destroy'})),
    url(r'^users/(?P<pk>[0-9]+)/history$', UserViewSet.as_view({'get':'history'})),

]


