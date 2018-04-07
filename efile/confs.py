"""
App setting for efile

We suggest you put all the app related settings here,
it's easy to maintain and good catch.

"""

from lucommon.confs import (
    LuConf,
    LuSQLConf,
)

from lucommon import sql_func


class CustomerFileConf(LuConf):
    """
    It's a good practice to write CustomerFile
    related setting here.
    """
    # In a real world, you mostly need to change db here
    db = 'default'

    # Generate the default SEARCH for the model by lu SQL injection
    sql_injection_map = {'get_customerfile':'SELECT LU_RESPONSE_FIELD FROM efile_customerfile WHERE LU_SEARCH_CONDITION'}

    enable_reversion_post = True
    enable_reversion_put = True

    # Customer file folder
    customer_file_folder = 'customer_file'

    enable_perm_delete_check = False


class UserImageConf(LuConf):
    """
    It's a good practice to write UserImage
    related setting here.
    """
    # In a real world, you mostly need to change db here
    db = 'default'

    # Generate the default SEARCH for the model by lu SQL injection
    sql_injection_map = {'get_userimage':'SELECT LU_RESPONSE_FIELD FROM efile_userimage WHERE LU_SEARCH_CONDITION'}

    enable_reversion_post = True
    enable_reversion_put = True

    user_image_write_path = 'eweb/web/img/user/'
    user_image_read_path = '/web/img/user/'

    default_user_image = '/web/img/elliot.jpg'


