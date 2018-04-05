from django.conf.urls import url

from eboard.views import (
    BoardViewSet,
)


"""
Lucommon didn't use the Router class to register url,
Actually we set urls explicitly, one point is to control
what method we want to expose clearly.

By default, we set CURD and patch update. Please modify according
to your project
"""

urlpatterns = [
    url(r'^boards/$', BoardViewSet.as_view({'get':'list',
                                        'post': 'create'})),
    url(r'^boards/(?P<pk>[0-9]+)$', BoardViewSet.as_view({'get':'retrieve',
                                                      'put': 'update',
                                                      'patch': 'partial_update',
                                                      'delete': 'destroy'})),
    url(r'^boards/(?P<pk>[0-9]+)/history$', BoardViewSet.as_view({'get':'history'})),

]


