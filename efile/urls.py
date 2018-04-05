from django.conf.urls import url

from efile.views import (
    CustomerFileViewSet,
    UserImageViewSet,
)


"""
Lucommon didn't use the Router class to register url,
Actually we set urls explicitly, one point is to control
what method we want to expose clearly.

By default, we set CURD and patch update. Please modify according
to your project
"""

urlpatterns = [
    url(r'^customerfiles/$', CustomerFileViewSet.as_view({'get':'list',
                                        'post': 'create'})),
    url(r'^customerfiles/(?P<pk>[0-9]+)$', CustomerFileViewSet.as_view({'get':'retrieve',
                                                      'put': 'update',
                                                      'patch': 'partial_update',
                                                      'delete': 'destroy'})),
    url(r'^customerfiles/(?P<pk>[0-9]+)/history$', CustomerFileViewSet.as_view({'get':'history'})),

    url(r'^userimages/$', UserImageViewSet.as_view({'get':'list',
                                        'post': 'create'})),
    url(r'^userimages/(?P<pk>[0-9]+)$', UserImageViewSet.as_view({'get':'retrieve',
                                                      'put': 'update',
                                                      'patch': 'partial_update',
                                                      'delete': 'destroy'})),
    url(r'^userimages/(?P<pk>[0-9]+)/history$', UserImageViewSet.as_view({'get':'history'})),

]


