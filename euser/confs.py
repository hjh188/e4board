"""
App setting for euser

We suggest you put all the app related settings here,
it's easy to maintain and good catch.

"""

from lucommon.confs import (
    LuConf,
    LuSQLConf,
)

from lucommon import sql_func


class UserConf(LuConf):
    """
    It's a good practice to write User
    related setting here.
    """
    # In a real world, you mostly need to change db here
    db = 'default'

    # Generate the default SEARCH for the model by lu SQL injection
    sql_injection_map = {'get_user':'SELECT LU_RESPONSE_FIELD FROM euser_user WHERE LU_SEARCH_CONDITION'}


