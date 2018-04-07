from eboard.serializers import (
    BoardSerializer,
)

from eboard.models import (
    Board,
)

from eboard.confs import (
    BoardConf,
)

from eboard.filters import (
    BoardFilter,
)

from lucommon import (
    viewsets,
)

from lucommon.response import LuResponse
from lucommon.logger import lu_logger

from django.http import (
    HttpResponse,
)

from django.template import loader

import time
import json
import requests
import timeago
import datetime
import os

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


def render(request, template_name, context):
    board_input = loader.render_to_string(
        'board_input.html', context, request=request, using=None)

    content = loader.render_to_string(
        template_name, context, request=request, using=None)

    content = board_input + content

    response =  HttpResponse(content, content_type='text/plain', status=None)
    response['Content-Length'] = len(content)

    return response


class BoardData(dict):
    """
    Board Data
    """
    __getattr__= dict.__getitem__
    __setattr__= dict.__setitem__
    __delattr__= dict.__delitem__

    def __getattr__(self, item):
        return ''


def post_process(_data, _param):
    for i, item in enumerate(_data):
        if "created_at" in item:
            now = datetime.datetime.now()
            created_at = datetime.datetime.strptime(item["created_at"], '%Y-%m-%dT%H:%M:%S.%f')
            ago = timeago.format(created_at, now)
            _data[i]["created_at"] = ago

        # For echart data
        if "l_data" in item:
            l_data = []
            x_data = []
            for ele in _data:
                if ele['l_data'] not in l_data:
                    l_data.append(ele['l_data'])
                if ele['x_data'] not in x_data:
                    x_data.append(ele['x_data'])

            if len(_data) == len(l_data)*len(x_data):
                break

            data = []
            for l in l_data:
                for x in x_data:
                    data.append({'l_data': l, 'x_data': x, 'y_data': 0})

            for ele in _data:
                for ele2 in data:
                    if ele['l_data'] == ele2['l_data'] and ele['x_data'] == ele2['x_data']:
                        ele2['y_data'] = ele['y_data']
                        break

            _data = data
            break

    if 'offset' in _param and 'limit' in _param:
        _param['offset'] = int(_param['offset']) + int(_param['limit'])

    return (_data, _param)

class BoardViewSet(viewsets.LuModelViewSet):
    """
    ViewSet for Board operation
    """
    # Query set
    queryset = Board.objects.using(BoardConf.db).all()

    # Serializer class
    serializer_class = BoardSerializer

    # Filter class
    filter_class = BoardFilter

    # Conf class
    conf = BoardConf

    # APP name
    app = "eboard"

    # Model name
    model = "Board"

    def perform_create(self, serializer):
        """
        Keep this function for POST db select
        """
        serializer.save(using=BoardConf.db)

    def get_queryset(self):
        # Add whatever to filter the response if you want
        return Board.objects.using(BoardConf.db).all()


    def save_personal_board(self, request, *args, **kwargs):
        """
        Save personal board
        """
        if 'ids[]' in request.data:
            ids = request.data.getlist('ids[]')
            for index, id in enumerate(ids):
                try:
                    id = int(id)
                except:
                    continue

                obj = Board.objects.using(BoardConf.db).get(id=id)
                obj.index = index
                if obj.enable_save == 'True':
                    obj.save()

        items = ['state', 'size', 'color', 'pre_size', 'height', 'pre_height']

        if 'id' in request.data:
            obj = Board.objects.using(BoardConf.db).get(id=request.data.get('id'))
            for item in items:
                if item in request.data:
                    setattr(obj, item, request.data.get(item))
            if obj.enable_save == 'True':
                obj.save()

        return LuResponse(status=200)

    def list(self, request, *args, **kwargs):
        """
        HTTP GET list entry
        """
        board_name = request.query_params.get('board', None)
        query_params = {}

        allow_fields = []
        for field in self.serializer_class.Meta.model._meta.local_fields:
            allow_fields.append(field.name)

        for k, v in request.query_params.items():
            if k in allow_fields:
                query_params[k] = v

        if board_name:
            try:
                # extend group to application. if query_params has group, we use the group instead of 'public'
                # for application board, set group the application name, just a unique lable. like group = 'scheduler', remain the created_by as "default" (must right now)
                group = query_params.pop('group') if 'group' in query_params else 'public'

                # find in public group or application group
                board = Board.objects.using(BoardConf.db).get(group=group, created_by='default', status='enable', **query_params)
            except:
                try:
                    # find shared from others
                    board = Board.objects.using(BoardConf.db).get(group='share', created_by=request.user.username, status='enable', **query_params)
                    board = Board.objects.using(BoardConf.db).get(group='private', created_by=board.shared_by, status='enable', **query_params)
                except:
                    # find myself
                    board = Board.objects.using(BoardConf.db).get(group='private', created_by=request.user.username, status='enable', **query_params)

            # no matter board search style, process token first
            token = request.query_params.get('token', '')

            try:
                token = json.loads(token)
            except:
                token = {}

            if board.search:
                board.search = board.search.replace('$current_user$', request.user.username)
                
                try:
                    # if param has, update param by token, token is the standard if both have
                    if board.search_param:
                        _param = json.loads(board.search_param)
                        _param.update(token)

                        token = _param

                    for k, v in token.items():
                        if(isinstance(v, int) or isinstance(v, str) or isinstance(v, unicode)):
                            os.environ[k] = v

                    board.search = os.path.expandvars(board.search)

                    for k, v in token.items():
                        if(isinstance(v, int) or isinstance(v, str) or isinstance(v, unicode)):
                            del os.environ[k]
                except Exception, err:
                    lu_logger.warn("Parse token fail: %s" % str(err))


            _param = {}
            _data = []

            if board.search_param:
                board.search_param = board.search_param.replace('$current_user$', request.user.username)
                _param = json.loads(board.search_param)

                for k, v in request.query_params.items():
                    _param.update({k: v})

            if board.process == '1':
                if board.fixed_data == '1':
                    try:
                        _data = json.loads(board.search)
                    except:
                        _data = []
                    for item in _data:
                        for key in item:
                            if item[key].startswith('lu_sql:'):
                                item[key] = requests.post(self.conf.post_data_url,
                                                          data={'lu_sql': item[key].split(':')[1]}).json()["data"][0].values()[0]

                else:
                    try:
                        if board.search_param:
                            board.search = board.search.format(**_param)

                        _data = requests.post(self.conf.post_data_url,
                                              data={'lu_sql': board.search}).json()["data"]
                    except Exception, err:
                        _data = []

            try:
                _data, _param = post_process(_data, _param)
            except:
                pass

            _data = _data if _data else []

            data = [BoardData(d) for d in _data]
            param = BoardData(_param)

            _token = token
            token = BoardData(token)

            context = {'data': data, 'param': param, 'token': token,
                    'data_json': json.dumps(_data), 'param_json': json.dumps(_param), 'token_json': json.dumps(_token)}

            return render(request, board.template, context)

        return super(BoardViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        HTTP GET item entry
        """
        return super(BoardViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        HTTP POST item entry
        """
        return super(BoardViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        HTTP PUT item entry
        """
        return super(BoardViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        HTTP PATCH item entry
        """
        return super(BoardViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        HTTP DELETE item entry
        """
        return super(BoardViewSet, self).destroy(request, *args, **kwargs)

    def history(self, request, *args, **kwargs):
        """
        Object History
        """
        return super(BoardViewSet, self).history(request, *args, **kwargs)


