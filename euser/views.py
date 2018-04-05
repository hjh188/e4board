from euser.serializers import (
    UserSerializer,
)

from euser.models import (
    User,
)

from euser.confs import (
    UserConf,
)

from euser.filters import (
    UserFilter,
)

from lucommon import (
    viewsets,
)

from lucommon.response import LuResponse
from lucommon.logger import lu_logger

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


class UserViewSet(viewsets.LuModelViewSet):
    """
    ViewSet for User operation
    """
    # Query set
    queryset = User.objects.using(UserConf.db).all()

    # Serializer class
    serializer_class = UserSerializer

    # Filter class
    filter_class = UserFilter

    # Conf class
    conf = UserConf

    # APP name
    app = "euser"

    # Model name
    model = "User"

    def perform_create(self, serializer):
        """
        Keep this function for POST db select
        """
        serializer.save(using=UserConf.db)

    def get_queryset(self):
        # Add whatever to filter the response if you want
        return User.objects.using(UserConf.db).all()


    def list(self, request, *args, **kwargs):
        """
        HTTP GET list entry
        """
        return super(UserViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        HTTP GET item entry
        """
        return super(UserViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        HTTP POST item entry
        """
        return super(UserViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        HTTP PUT item entry
        """
        return super(UserViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        HTTP PATCH item entry
        """
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        HTTP DELETE item entry
        """
        return super(UserViewSet, self).destroy(request, *args, **kwargs)

    def history(self, request, *args, **kwargs):
        """
        Object History
        """
        return super(UserViewSet, self).history(request, *args, **kwargs)


