var board_execute = function(board){
    var st = board.find('.ui.statistics')

    var _board = new Board(board);
    var data = _board.get_data();
    var param = _board.get_param();

    st.addClass(param["color"]);
    st.find(".value").text(data[0]["value"]);
    st.find(".label").text(param["label"]);
}
