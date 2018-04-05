"""
App setting for eboard

We suggest you put all the app related settings here,
it's easy to maintain and good catch.

"""

from lucommon.confs import (
    LuConf,
    LuSQLConf,
)

from lucommon import sql_func


class BoardConf(LuConf):
    """
    It's a good practice to write Board
    related setting here.
    """
    # In a real world, you mostly need to change db here
    db = 'default'

    # Generate the default SEARCH for the model by lu SQL injection
    sql_injection_map = {'get_board':'SELECT LU_RESPONSE_FIELD FROM eboard_board WHERE LU_SEARCH_CONDITION'}


