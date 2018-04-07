from eweb.serializers import (
    WebSourceSerializer,
)

from eweb.models import (
    WebSource,
)

from eweb.confs import (
    WebSourceConf,
)

from eweb.filters import (
    WebSourceFilter,
)

from euser.models import (
    User,
)

from euser.confs import (
    UserConf,
)

from eapp.models import (
    App,
)

from eapp.confs import (
    AppConf,
)

from efile.models import (
    UserImage,
)

from efile.confs import (
    UserImageConf,        
)

from eboard.models import (
    Board,
)

from eboard.confs import (
    BoardConf,
)

from lucommon import (
    viewsets,
)

from lucommon.response import LuResponse
from lucommon.logger import lu_logger

from django.shortcuts import render

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
from django.contrib.auth.models import Group

from lucommon.sql import LuSQL
from euser.confs import UserConf

import json
import os
import copy

from urlparse import urlparse
try:
    #python2
    from urllib import urlencode
except ImportError:
    #python3
    from urllib.parse import urlencode

"""
Write less, do more

* By viewsets.ModelViewSet, we can write restful API easily.
Usually, it's necessary to write CRUD operation in the viewset,
it's enough for common scenario. However, we can override
these functions(`list`, `create`, `retrieve`, `update`,
`partial_update`, `destroy`) for more detail control.

Example for HTTP GET:

def retrieve(self, request, *args, **kwargs):
    #`args` indicate the path without ?P(item) in urls route
    #`kwargs` indicate the param in ?P(item) in urls route
    do_something_before()
    response = super(viewsets.ModelViewSet, self).retrieve(request, *args, **kwargs)
    do_something_after()
    return response

* API docs(http://django-rest-swagger.readthedocs.org/en/latest/yaml.html)
Use the YAML Docstring for API docs

"""


class WebSourceViewSet(viewsets.LuModelViewSet):
    """
    ViewSet for WebSource operation
    """
    # Query set
    queryset = WebSource.objects.using(WebSourceConf.db).all()

    # Serializer class
    serializer_class = WebSourceSerializer

    # Filter class
    filter_class = WebSourceFilter

    # Conf class
    conf = WebSourceConf

    # APP name
    app = "eweb"

    # Model name
    model = "WebSource"

    def perform_create(self, serializer):
        """
        Keep this function for POST db select
        """
        serializer.save(using=WebSourceConf.db)

    def get_queryset(self):
        # Add whatever to filter the response if you want
        return WebSource.objects.using(WebSourceConf.db).all()


    def list(self, request, *args, **kwargs):
        """
        HTTP GET list entry
        """
        return super(WebSourceViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        HTTP GET item entry
        """
        return super(WebSourceViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        HTTP POST item entry
        """
        return super(WebSourceViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        HTTP PUT item entry
        """
        return super(WebSourceViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        HTTP PATCH item entry
        """
        return super(WebSourceViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        HTTP DELETE item entry
        """
        return super(WebSourceViewSet, self).destroy(request, *args, **kwargs)

    def history(self, request, *args, **kwargs):
        """
        Object History
        """
        return super(WebSourceViewSet, self).history(request, *args, **kwargs)

    def get_login(self, request, *args, **kwargs):
        """
        Login page
        """
        logout(request)

        next_page = request.query_params.get('next') if request.query_params.get('next') != 'None' else 'index'

        # As query params will missing parts, need process it
        _query_params = request.query_params.dict()
        if 'next' in _query_params and _query_params['next'] != 'None':
            _next = _query_params.pop('next')
            if _next.startswith('http') or _next.startswith('https'):
                try:
                    o = urlparse(_next)
                    _query_params = urlencode(_query_params)
                    next_page = o.scheme + '://' + o.netloc + o.path + '?' + _query_params + '&' + o.query
                except:
                    pass
            else:
                next_page = _next

        return render(request, 'login.html', dict({'next': next_page}, **self.conf.base_resp_context))

    def post_login(self, request, *args, **kwargs):
        """
        Login Form
        """
        logout(request)

        username = request.data.get('username', '')
        password = request.data.get('password', '')

        #try:
        #    u = User.objects.using(UserConf.db).get(username__exact=username)
        #    if u.first_login == 'yes':
        #        user = authenticate(username=username, password=UserConf.default_password)
        #        login(request, user)

        #        u.first_login = 'no'
        #        u.save()

        #        return HttpResponseRedirect('password')
        #except Exception, err:
        #    lu_logger.warn(str(err))


        user = authenticate(username=username, password=password)

        error_msg, error_style = ('<ul class="list"><li>username or password is invalid!</li></ul>', 'display:block') if user is None else ('', '')

        next_page = request.query_params.get('next') if request.query_params.get('next') != 'None' else 'index'

        # As query params will missing parts, need process it
        _query_params = request.query_params.dict()
        if 'next' in _query_params and _query_params['next'] != 'None':
            _next = _query_params.pop('next')
            if _next.startswith('http') or _next.startswith('https'):
                try:
                    o = urlparse(_next)
                    _query_params = urlencode(_query_params)
                    next_page = o.scheme + '://' + o.netloc + o.path + '?' + _query_params + '&' + o.query
                except:
                    pass
            else:
                next_page = _next

        if user is not None:
            if user.is_active:
                login(request, user)
                ui = UserImage.objects.using(UserImageConf.db).filter(user_id=user.id)
                if not ui:
                    ui = UserImage(user_id=user.id, img='web/img/user/elliot.jpg')
                    ui.save()

                # Add group control
                default_groups = WebSourceConf.default_user_group
                if not user.is_superuser:
                    for g_name in default_groups:
                        g_obj = Group.objects.filter(name=g_name)
                        if g_obj and (g_name not in user.groups.values_list('name', flat=True)):
                            g_obj[0].user_set.add(user)

                return HttpResponseRedirect(next_page)

        return render(request, 'login.html', dict({'next': next_page, 'error_msg': error_msg, 'error_style': error_style}, **self.conf.base_resp_context))

    def get_change_password(self, request, *args, **kwargs):
        """
        Get change password page
        """
        next_page = request.query_params.get('next') if request.query_params.get('next') != 'None' else 'index'

        return render(request, 'change_password.html', dict({'next': next_page}, **self.conf.base_resp_context))

    def post_change_password(self, request, *args, **kwargs):
        """
        Change Password
        """
        password = request.data.get('password', '')
        password2 = request.data.get('password2', '')

        error_msg, error_style = ('<ul class="list"><li>Please enter the same password twice!</li></ul>', 'display:block') if password != password2 else ('','')

        next_page = request.query_params.get('next') if request.query_params.get('next') != 'None' else 'index'

        if not error_msg:
            u = User.objects.using(UserConf.db).get(username__exact=request.user.username)
            u.set_password(password)
            u.save()

            return HttpResponseRedirect(next_page)
        else:
            return render(request, 'change_password.html', dict({'next': next_page, 'error_msg': error_msg, 'error_style': error_style}, **self.conf.base_resp_context))

    def __get_app_context(self, context, request):
        """
        Get app related context
        """
        context['public_app'] = App.objects.using(AppConf.db).filter(status='online', created_by='default').order_by('index')
        context['my_app'] = App.objects.using(AppConf.db).filter(status='online', created_by=request.user.username).order_by('index')
        context['current_app'] = request.query_params.get('lu_app', '')

        try:
            if context['current_app']:
                context['current_app_color'] = App.objects.using(AppConf.db).get(name=context['current_app']).color
            else:
                app = App.objects.using(AppConf.db).get(url=request.META['PATH_INFO'])
                context['current_app'] = app.name
                context['current_app_color'] = app.color
        except:
            context['current_app_color'] = AppConf.default_app_color

    def __get_user_context(self, request):
        user = request.user
        context = user._wrapped.__dict__
        user_image = UserImage.objects.using(UserImageConf.db).filter(user_id=user.id).order_by('-created_at')
        user_image_small = os.path.join(UserImageConf.user_image_read_path + os.path.basename(str(user_image[0].img))) if user_image else UserImageConf.default_user_image
        context['user_image_small'] = user_image_small
        context['user_image_big'] = user_image_small

        if request.query_params.get('username', ''):
            _user = User.objects.using(UserConf.db).filter(username=request.query_params.get('username'))
            if _user and _user[0].id != user.id:
                user = _user[0]
                context = user.__dict__
                context['username'] = request.user.username
                user_image = UserImage.objects.using(UserImageConf.db).filter(user_id=user.id).order_by('-created_at')
                user_image_big = os.path.join(UserImageConf.user_image_read_path + os.path.basename(str(user_image[0].img))) if user_image else UserImageConf.default_user_image
                context['user_image_big'] = user_image_big
                context['user_image_small'] = user_image_small
                context['upload_image'] = 'disabled'
        try:
            manager = user.manager.split(',')[0].split('=')[1]
        except:
            manager = ''

        context['manager'] = manager

        # load app, will load user private app also
        self.__get_app_context(context, request)

        return context

    def get_user(self, request, *args, **kwargs):
        """
        User Info
        """
        context = self.__get_user_context(request)

        return render(request, 'user.html', context)

    def __enable_dashboard_customized(self, request, dashboards):
        for dashboard in dashboards:
            obj = Board.objects.using(BoardConf.db).filter(name=dashboard.name, group='protect', status='enable', created_by=request.user.username)

            if not obj:
                dashboard.pk = None
                dashboard.created_by = request.user.username
                dashboard.group = 'protect'
                dashboard.save()
            else:
                dashboard.pk = obj[0].pk
                dashboard.size = obj[0].size
                dashboard.pre_size = obj[0].pre_size
                dashboard.height = obj[0].height
                dashboard.pre_height = obj[0].pre_height
                dashboard.color = obj[0].color
                dashboard.index = obj[0].index
                dashboard.state = obj[0].state
                dashboard.enable_header_menu = obj[0].enable_header_menu
                dashboard.enable_resize = obj[0].enable_resize

    def index(self, request, *args, **kwargs):
        """
        Index page
        """
        context = self.__get_user_context(request)

        dashboards = Board.objects.using(BoardConf.db).filter(group='public', created_by='default', status='enable').order_by('index')

        self.__enable_dashboard_customized(request, dashboards)

        # Load shared from other
        _s_dashboards = Board.objects.using(BoardConf.db).filter(group='share', created_by=request.user.username, status='enable')
        s_dashboards = []
        for dashboard in _s_dashboards:
            obj = Board.objects.using(BoardConf.db).filter(name=dashboard.name, group='private', status='enable', created_by=dashboard.shared_by)
            if obj:
                obj[0].pk = dashboard.pk
                s_dashboards.append(obj[0])

        # Load private board
        p_dashboards = Board.objects.using(BoardConf.db).filter(group='private', created_by=request.user.username, status='enable')

        dashboards = list(dashboards) + list(p_dashboards) + s_dashboards

        dashboards.sort(key=lambda x: x.index)

        context['dashboards'] = dashboards
        context['sortable'] = 'sortable'
        context['dashboard_name'] = 'index'

        # Actually, you can add more dashboards group by django 'include'
        # just place something like
        # `{% include "board.html" with dashboards=dashboards2 %}` in the html,
        # then in view by adding context['dashboards2'] = other_dashboard, everything works well
        # it's pretty amazing to reuse the board template

        return render(request, 'index.html', context)

