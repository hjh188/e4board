var board_execute = function(board){
    var _board = new Board(board);
    var param = _board.get_param();
    var token = _board.get_token();

    var ns = reval(param.namespace);

    if(ns){
        ns.board = board;
        ns._board = _board;
        ns.param = param;
        ns.token = token;
    }

    if(!token.time_token){token.time_token='24 hour'};

    //var columns = Enumerable.From(param.title)
    //                .Select(function(d){return {title: d[0], data: d[1], sClass: d[0] + " custom"}})
    //                .ToArray();
    var columns = param.columns;

    // use columns_bak to back up the backend data structure
    var columns_bak = $.extend(true, {}, columns);

    var table_id = "lu_table_" + Math.random().toString(36).substring(7);
    board.find('table').attr('id', table_id);

    var page_no = 0;

    // column filter status
    var column_filter_state = {};

    // Example on add aggregate on columns by specified group
    //columns[3]["aggregate_func"] = "sum";

    var lu_table_search = get_query('lu_table_search', '');
    if(!lu_table_search || lu_table_search == true){
        lu_table_search="";
    };
    // TODO: column search from query, extend like `lu_table_search_*`

    $.fn.dataTable.ext.errMode = 'none';

    var lu_apply_column_filter = function($table, sTableId, filter){
        // get column filter text, and reset to new column filter
        board.find("#" + table_id).find('tr.custom_filter th').each(function(){
            var $th = $(this);
            var column_name = $th.attr("title");

            column_filter_state[column_name] = {};
            column_filter_state[column_name]['text'] = [];

            $th.find("input").each(function(){
                var text = $(this).val();
                if(!text){
                    text = '';
                }
                column_filter_state[column_name]['text'].push(text);
                $(this).val('');
            });
        });
        //it's important to clear the old filter
        board.find("#" + sTableId).find('tr.custom_filter input').keyup();

        board.find("#" + sTableId).find('tr.custom_filter th').empty();

        var s = Enumerable.From(columns).Select(function(d){return d.column_filter}).ToArray();
        $table.columnFilter({
            sPlaceHolder: "head:after",
            sTableId: sTableId,
            aoColumns: s});

        // restore column filter text
        if(!$.isEmptyObject(column_filter_state)){
            board.find("#" + sTableId).find('tr.custom_filter th').each(function(){
                var $th = $(this);
                var column_name = $th.attr("title");

                $th.find("input").each(function(i){
                    var text = column_filter_state[column_name]['text'][i];
                    if(text){
                        $(this).val(text);
                    }
                    //$(this).keyup();
                });
            });
            //it's important to trigger new filter
            board.find("#" + sTableId).find('tr.custom_filter input').keyup();
        };
    };

    // table column resizable
    var lu_table_column_resizable = {
        enable: function(options){

            var defaults = {
                resizeMode: 'fit',
                minWidth: 60,
                liveDrag: true,
                //gripInnerHtml:"<div class='grip'></div>",
                //draggingClass:"dragging",
                hoverCursor: "ew-resize",
                dragCursor: "ew-resize",
                headerOnly: false,
                onResize: function(){
                    var table_height = board.find('.dataTables_wrapper').height();
                    _board.adjust_height_by_content(table_height);
                },
            };

            var properties = $.extend(defaults, options); 

            board.find("table").colResizable(properties);
        },
        disable: function(){
            board.find("table").colResizable({disable:true});
        }
    };

    var color = {'done': 'green', 'success': 'green', 'failure': 'red', 'exception': 'red', 'erroring': 'orange', 'error': 'red', 'running': 'blue', 'created': 'yellow', 'pending': 'orange', 'aborted': 'red', 'timeout': 'red', 'canceled': 'grey'};
    _board.color = color;

    // remove duplicate fixedheader table before initialize
    $("table.fixedHeader-floating").remove();

    $.ajax({
        url: param.url || board.attr('url'),
        type: 'POST',
        data: {lu_sql: param.query, lu_sql_token: JSON.stringify(token), lu_sql_db: param.query_db},
        success: function(result){
            var _data = result.data;
            if(ns){
                if(ns._board_table_data_preprocess_func){
                    _data = ns._board_table_data_preprocess_func(_data);
                }
                ns.data = _data;
            };

          var lu_draw_table = function(){
            var table = board.find(".table");
            if(ns){ns.table = table;}
            //$(...).dataTable(), or
            //$(...).DataTable()
            //The difference between the two is that the first will return a jQuery object, while the second returns a DataTables API instance.
            var $table = table.dataTable({
                dom: '<"ui grid"<"row"<"five wide column"l><"extend_toolbar six wide column"><"right aligned five wide column"f>><"row custom_column_filter"><"row dt-table"rt><"row"<"seven wide column"i><"right aligned nine wide column"p>>>',
                destroy: true,
                order: param.order || [[ 0, "asc" ]],// as rowsGroup affect, the order is reverse
                processing: true,
                data: _data,
                //stateSave: true,
                columns: columns,
                // autoWidth need to set true, or fixed header will auto adjust width
                autoWidth: true,
                oSearch: {sSearch: lu_table_search},
                language: {
                    "processing": '<img class="ui mini image" style="margin-left:40%;" src="/web/img/loader.gif"><div>Loading data...</div>',
                },
                lengthMenu: param.lengthMenu || [[10, 20, 50, -1], [10, 20, 50, "All"]],
                fixedHeader: {
                    header: param.fixedHeader_header || false,
                    headerOffset: 65,
                    footer: param.fixedHeader_footer || false,
                },
                //rowsGroup: param.rowsGroup || [],// [2, 5, 7]
                deferRender: true,
                bPaginate: param.bPaginate,
                bLengthChange: param.bLengthChange,
                bFilter: param.bFilter,
                bInfo: param.bInfo,
                bSort: param.bSort,
                initComplete: function(settings, json){
                    // resolve the width auto adjust problem
                    //$(this).find('thead').addClass("ui sticky");
                    //$(this).find('thead th').css('width', 'auto');
                    //$(this).find('thead th:nth-child(6)').css('width', '10%');
                    //$(this).find('thead th:nth-child(7)').css('width', '20%');

                    // add footer and enhance header
                    var that = this;
                    
                    if($(this).find("tfoot").length == 0){
                        $(this).append('<tfoot><tr></tr></tfoot>');
                        //$(this).find("thead").prepend('<tr class="custom_filter drag"></tr>');
                        if(param.bFilter){
                            $(this).find("thead").append('<tr class="custom_filter search"></tr>');
                        }else{
                            $(this).find("thead").append('<tr class="custom_filter search" style="display:none;"></tr>');
                        }
                        var tf = $(this).find("thead tr.custom_filter");
                        var footer = $(this).find("tfoot tr");
                        this.api().columns().every(function (i) {
                            var text = $(this.header()).text();
                            tf.append('<th title="' + text + '"></th>');
                            // disable footer
                            //footer.append('<th><div class="ui small filter input" style="width: 100%;"><input col="' + i + '"type="text" placeholder="Search ' + text + '" style="padding:4px!important;"></div></th>');
                        });
                    };

                    // rewrite refresh but keep dblclick for full refresh(load data and refresh)
                    if(!param.rewrite_click){
                    board.find('i.refresh').unbind('click');
                    board.find('i.refresh').click(function(){
                        that.api().clear().draw();
                        $(that).find('tbody').empty().append('<tr><td colspan="100"><div class="ui segment"><div class="ui active inverted dimmer"><div class="ui text mini loader">Loading data...</div></div><p></p></div></td></tr>');
                        $.ajax({
                            xhr: function(){return _board.set_progress_callback();},
                            url: param.url || board.attr('url'),
                            type: 'POST',
                            data: {lu_sql: param.query, lu_sql_token: JSON.stringify(token), lu_sql_db:param.query_db},
                            success: function(r){
                                var _data = r.data;
                                if(ns){
                                    if(ns._board_table_data_preprocess_func){
                                        _data = ns._board_table_data_preprocess_func(_data);
                                    }
                                    ns.data = _data;
                                }
                                that.api().rows.add(_data).draw();

                                // page to page
                                that.api().page(page_no).draw('page');
                            },
                            error: function(r){
                                $(that).find('tbody').empty().append('<tr><td colspan="100" style="text-align:center"><p class = "error" style="color:red;">Load data fail!</p></td><tr>');
                                _board.board_progress.addClass('error');
                                _board.board_progress.css({
                                    width: 100 + '%'
                                });
                            },
                         });
                    });
                    };

                    // event for input change
                    $(".dataTables_filter input").keyup(function(){
                        var text = $(this).val();
                        var new_url = $.query.set('lu_table_search', text);
                        history.pushState(null, null, new_url);
                    });

                    // column resize
                    if(param.bResize){
                        lu_table_column_resizable.enable();
                    };

                    // column drag
                    board.find('th.custom').each(function(){
                        if(param.bDrag){
                            $(this).prepend('<div class="dragable_div" title="' + $(this).text() + '"></div>');
                        };
                    });
                    //board.find('thead tr[role="row"]').sortable({
                    board.find('thead tr').sortable({
                        handle: ".dragable_div",
                        helper: "clone",
                        opacity: '.5',
                        placeholder: 'thead-state-highlight',
                        stop: function(event, ui){
                            var _columns = [];
                            var _columns_bak = [];

                            board.find('th.custom').each(function(i){
                                var title = $(this).find('div.dragable_div').attr('title');

                                // get updated datatable columns
                                $.each(settings.aoColumns, function(j, column){
                                    if(column.title == title){
                                        _columns[i] = column;

                                        // update aDataSort by the sequence, seems have problem after sortable
                                        _columns[i].aDataSort = [i];
                                    }
                                });

                                // get updated backend columns
                                $.each(columns_bak, function(j, column){
                                    if(column.title == title){
                                        _columns_bak[i] = column;
                                    }
                                });
                            })

                            // update columns in local side
                            columns = _columns;
                            settings.aoColumns = _columns;
                            columns_bak = _columns_bak;

                            // update backend columns_bak by datatable columns
                            $.each(columns_bak, function(i, column){
                                $.each(column, function(k, v){
                                    columns_bak[i][k] = columns[i][k];
                                });
                            });

                            // store data to server side
                            // TODO

                            //redraw table without refresh data
                            that.api().rows.add(_data).draw();

                            // full refresh board, need to do store data in server side before this action
                            //board.find('.floated.header i.refresh').trigger('dblclick');

                            // move column filter
                            var current_text = ui.item.find(".dragable_div").attr('title');
                            var next_text = ui.item.next('th').find(".dragable_div").attr('title');
                            var prev_text = ui.item.prev('th').find(".dragable_div").attr('title');

                            var $source = board.find('tr.custom_filter th[title="' + current_text + '"]');
                            if(next_text){
                                var $next = board.find('tr.custom_filter th[title="' + next_text + '"]');
                                $source.insertBefore($next);
                            }else{
                                var $prev = board.find('tr.custom_filter th[title="' + prev_text + '"]');
                                $source.insertAfter($prev);
                            }

                            if(param.bFilter){lu_apply_column_filter($table, table_id, columns);};

                            if(param.bResize){
                                lu_table_column_resizable.enable();
                            };

                            // page to page
                            that.api().page(page_no).draw('page');
                        },
                        start: function(event, ui){
                            // disable resizable, as column dom updated
                            if(param.bResize){
                                lu_table_column_resizable.disable();
                            };

                            $(ui.item).show();
                            that.api().clear().draw();
                            $(that).find('tbody').empty().append('<tr><td colspan="100" style="text-align: center"><p>Adjust column sequence...</p></td></tr>');
                        },
                    }).disableSelection();

                    // call ns for custom init
                    if(ns){
                        $.each(columns, function(i, column){
                            // init order by columns
                            var l = column.title.split(' ');
                            l.push(column.data);
                            var n = l.join('_')
                            var f = ns._board_table_init_func_map[n];
                            if(f){
                                f(ns);
                            };
                        });
                    };

                    // add init func callback, no need to map to column
                    if(ns._board_table_init_func){
                        ns._board_table_init_func(ns);
                    };
                },
                rowCallback: function(row, data, dataIndex){
                    if(ns){
                        $.each(columns, function(i, column){
                            var $td = $('td.custom:eq(' + i + ')', row);

                            $.each(ns._board_table_column_func_map, function(c, f){
                                // Important change:
                                // _board_table_*_map function will map class to decorator,
                                // also don't use title, as title may be the same
                                // rename class Name in:
                                // "_".join(column.title) + "_" + column.data
                                if($td.hasClass(c)){
                                    f($td, row, data, dataIndex, ns);
                                };
                            });
                        });

                        if(ns._board_table_row_func){
                            ns._board_table_row_func(row, data, dataIndex);
                        };
                    };
                },
                fnDrawCallback: function(settings){
                    // if resizable, make JCLRgrip is the same as dt-table
                    board.find("div.JCLRgrip").css("height", board.find(".row.dt-table").height());

                    // scroll board height
                    var table_height = board.find('.dataTables_wrapper').height();
                    _board.adjust_height_by_content(table_height);

                    // show the filter data
                    var api = this.api();
                    //console.log(api.rows({filter: 'applied'}).data());

                    // column aggregate based on group implementation
                    $.each(api.rows('.lu_group').nodes().to$(), function(i, row){
                        // get rows from the jquery object, pluck convert column data to Array
                        var agg_rows = api.rows([$(row), $(row).nextUntil('.lu_group')]);
                        $.each(columns, function(j, column){
                            if(column.aggregate_func){
                                var d = agg_rows.data().pluck(column.data).toArray();
                                var r = lu_agg_func[column.aggregate_func](d);
                                var cc = "." + column.sClass.split(' ').join(".");
                                $(row).find(cc).attr('rowspan', d.length).html(r);
                                $(row).nextUntil('.lu_group').find(cc).hide();
                            }
                        });
                    });

                    // call ns for custom draw
                    if(ns){
                        $.each(columns, function(i, column){
                            // init order by columns
                            var l = column.title.split(' ');
                            l.push(column.data);
                            var n = l.join('_')
                            var f = ns._board_table_draw_func_map[n];
                            if(f){
                                f(ns);
                            };
                        });
                    };
                },
            });

            if(ns){ns.$table = $table;};

            // table api
            var _api = $table.api();
            var sTableId = table_id;
            table.attr('name', sTableId);

            // page change event listener
            table.on('page.dt', function(){
                page_no = _api.page.info().page;
            });
            
            // apply column filter
            // enable apply_column_filter will caused rowCallback multiple times
            if(param.bFilter){lu_apply_column_filter($table, sTableId, columns);};

            // add column show/hidden filter TODO
            board.find('.extend_toolbar').append('<div></div>');
            board.find('.custom_column_filter').append('<div></div>');

            // add column hide/show filter implement
            /*
            $.each(columns, function(i, c){
                board.find('.custom_column_filter').append('<a class="ui basic blue label" column-idx="' + i + '">' + c.title +  '</a>');
            });
            board.find('.custom_column_filter a').click(function(){
                var idx = $(this).attr("column-idx")*1;
                var column = _api.column(idx);

                var isVisible = column.visible();
                column.visible(!isVisible);

                // process for thead filter item
                var _s_idx = idx + 1;
                table.find('thead tr.custom_filter th:nth-child(' + _s_idx + ')').toggle();

                // process for width
                board.find('table').css('width', '100%');
                board.find('thead th').css('width', 'auto');
                $.each(columns, function(i, c){
                    if(c.sWidth){
                        _api.columns(i).header().to$().css('width', c.sWidth);  
                    }
                });

                _api.rows().invalidate().draw(false);
            });*/

            /* Enable footer column search
            // add column filter
            table.find('.filter.input input').on('keyup change', function(){
                var col = $(this).attr('col');
                var text = $(this).val();
                _api
                  .column(col)
                  .search(text.replace(/[,]/g, '|'), true, false)
                  .draw();
            });
            */

            /*$(".ui.sticky").sticky({
                context: 'table',
                offset: 65,
                setSize: false,
                onStick: function(){
                    $(this).css('background', 'white');

                    var table_height = board.find('.dataTables_wrapper').height();
                    _board.adjust_height_by_content(table_height);
                },
                onUnstick: function(){
                    var table_height = board.find('.dataTables_wrapper').height();
                    _board.adjust_height_by_content(table_height);
                },
            });*/

            // init board height
            var table_height = board.find('.dataTables_wrapper').height();
            _board.adjust_height_by_content(table_height);
          };
          lu_draw_table();

        },
    });
}
