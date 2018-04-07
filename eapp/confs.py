"""
App setting for eapp

We suggest you put all the app related settings here,
it's easy to maintain and good catch.

"""

from lucommon.confs import (
    LuConf,
    LuSQLConf,
)

from lucommon import sql_func


class AppConf(LuConf):
    """
    It's a good practice to write App
    related setting here.
    """
    # In a real world, you mostly need to change db here
    db = 'default'

    # Generate the default SEARCH for the model by lu SQL injection
    sql_injection_map = {'get_app':'SELECT LU_RESPONSE_FIELD FROM eapp_app WHERE LU_SEARCH_CONDITION'}

    default_app_color = 'grey_two'

