var board_execute = function(board){
    var table_div = board.find('.table');
    var _board = new Board(board);
    var param = _board.get_param();

    var columns = Enumerable.From(param.title)
                    .Select(function(d){return {title: d[0], data: d[1]}})
                    .ToArray();

    $.fn.dataTable.ext.errMode = 'none';

    $.ajax({
        url: board.attr('url'),
        type: 'POST',
        data: {lu_sql: param.query},
        success: function(result){
            var table = board.find(".table");
            table.DataTable({
                destroy: true,
                order: [[ 0, "desc" ]],
                processing: true,
                data: result.data,
                columns: columns,
                lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]],
                initComplete: function(settings, json){
                    // resolve the width auto adjust problem
                    $(this).find('thead th').css('width', 'auto');
                },
                rowCallback: function(row, data, dataIndex){
                },
                fnDrawCallback: function(settings){
                    // scroll board height
                    var table_height = board.find('.dataTables_wrapper').height();
                    _board.adjust_height_by_content(table_height);
                },
            });
        },
    });
}
