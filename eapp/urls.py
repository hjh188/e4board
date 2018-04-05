from django.conf.urls import url

from eapp.views import (
    AppViewSet,
)


"""
Lucommon didn't use the Router class to register url,
Actually we set urls explicitly, one point is to control
what method we want to expose clearly.

By default, we set CURD and patch update. Please modify according
to your project
"""

urlpatterns = [
    url(r'^apps/$', AppViewSet.as_view({'get':'list',
                                        'post': 'create'})),
    url(r'^apps/(?P<pk>[0-9]+)$', AppViewSet.as_view({'get':'retrieve',
                                                      'put': 'update',
                                                      'patch': 'partial_update',
                                                      'delete': 'destroy'})),
    url(r'^apps/(?P<pk>[0-9]+)/history$', AppViewSet.as_view({'get':'history'})),

]


