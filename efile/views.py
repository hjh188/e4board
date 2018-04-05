from efile.serializers import (
    CustomerFileSerializer,
    UserImageSerializer,
)

from efile.models import (
    CustomerFile,
    UserImage,
)

from efile.confs import (
    CustomerFileConf,
    UserImageConf,
)

from efile.filters import (
    CustomerFileFilter,
    UserImageFilter,
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


class CustomerFileViewSet(viewsets.LuModelViewSet):
    """
    ViewSet for CustomerFile operation
    """
    # Query set
    queryset = CustomerFile.objects.using(CustomerFileConf.db).all()

    # Serializer class
    serializer_class = CustomerFileSerializer

    # Filter class
    filter_class = CustomerFileFilter

    # Conf class
    conf = CustomerFileConf

    # APP name
    app = "efile"

    # Model name
    model = "CustomerFile"

    def perform_create(self, serializer):
        """
        Keep this function for POST db select
        """
        serializer.save(using=CustomerFileConf.db)

    def get_queryset(self):
        # Add whatever to filter the response if you want
        return CustomerFile.objects.using(CustomerFileConf.db).all()


    def list(self, request, *args, **kwargs):
        """
        HTTP GET list entry
        """
        return super(CustomerFileViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        HTTP GET item entry
        """
        return super(CustomerFileViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        HTTP POST item entry
        """
        return super(CustomerFileViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        HTTP PUT item entry
        """
        return super(CustomerFileViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        HTTP PATCH item entry
        """
        return super(CustomerFileViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        HTTP DELETE item entry
        """
        return super(CustomerFileViewSet, self).destroy(request, *args, **kwargs)

    def history(self, request, *args, **kwargs):
        """
        Object History
        """
        return super(CustomerFileViewSet, self).history(request, *args, **kwargs)


class UserImageViewSet(viewsets.LuModelViewSet):
    """
    ViewSet for UserImage operation
    """
    # Query set
    queryset = UserImage.objects.using(UserImageConf.db).all()

    # Serializer class
    serializer_class = UserImageSerializer

    # Filter class
    filter_class = UserImageFilter

    # Conf class
    conf = UserImageConf

    # APP name
    app = "efile"

    # Model name
    model = "UserImage"

    def perform_create(self, serializer):
        """
        Keep this function for POST db select
        """
        serializer.save(using=UserImageConf.db)

    def get_queryset(self):
        # Add whatever to filter the response if you want
        return UserImage.objects.using(UserImageConf.db).all()


    def list(self, request, *args, **kwargs):
        """
        HTTP GET list entry
        """
        return super(UserImageViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        HTTP GET item entry
        """
        return super(UserImageViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        HTTP POST item entry
        """
        return super(UserImageViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        HTTP PUT item entry
        """
        return super(UserImageViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        HTTP PATCH item entry
        """
        return super(UserImageViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        HTTP DELETE item entry
        """
        return super(UserImageViewSet, self).destroy(request, *args, **kwargs)

    def history(self, request, *args, **kwargs):
        """
        Object History
        """
        return super(UserImageViewSet, self).history(request, *args, **kwargs)


