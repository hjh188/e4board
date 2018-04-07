from django import template

register = template.Library()

"""
Dashboard/Board height mechanism adjust:
* scenario 1 -- change the header height
    step 1: modify board.html, default h5
    step 2: change the board_header_height in this file accordingly, Everything should work

* scenario 2 -- change board padding (+/-delta)
    step 1: modify index.js board_padding variable
    step 2: change the board_padding in this file accordingly
    step 3: change index.css .dashboard.column padding accordingly
    step 4: modify index.css .ui-resizable-se bottom accordingly: 4 +/- delta, everything should work
"""

board_header_height = 23;
board_padding = 7;

wide_size_number_map = {
    'one wide': '1',
    'two wide': '2',
    'three wide': '3',
    'four wide': '4',
    'five wide': '5',
    'six wide': '6',
    'seven wide': '7',
    'eight wide': '8',
    'nine wide': '9',
    'ten wide': '10',
    'eleven wide': '11',
    'twelve wide': '12',
    'thirteen wide': '13',
    'fourteen wide': '14',
    'fifteen wide': '15',
    'sixteen wide': '16',
}

@register.filter
def convert_wide_size(value):
    try:
        return wide_size_number_map[value]
    except:
        return '0'

@register.filter
def convert_segments_height(value):
    try:
        return str(int(value) - board_padding)
    except:
        return str(450 - board_padding)

@register.filter
def convert_board_content_height(value, arg):
    try:
        return str(int(value) - board_header_height - board_padding*2 - int(arg))
    except:
        return str(450 - board_header_height - board_padding*2)


