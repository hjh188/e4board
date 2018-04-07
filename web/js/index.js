$.getMultiScripts = function(arr, path) {
    var _arr = $.map(arr, function(scr) {
        return $.getScript( (path||"") + scr );
    });

    _arr.push($.Deferred(function( deferred ){
        $( deferred.resolve );
    }));

    return $.when.apply($, _arr);
}

var lu_agg_func = {
    'avg': math.mean,
    'sum': math.sum,
    'max': math.max,
    'min': math.min,
    'count': function(d){return d.length},
    'join': function(d){return d.join('|')},
};

// get object by namespace
function reval(str){
   try{
       var str=str.split("."),obj=window;
       for(var z=0;z<str.length;z++){
         obj=obj[str[z]];
       }
       return obj;
   }catch(e){
       return null;
   };
}

// used for multiple table column filter
var jquery_datatable_obj = {};

get_lu_token = function(data){
    var _data = {};
    $.each(data, function(k, v){
        if(k.startsWith('lu_')){
            _data[k.slice(3)] = v;
        }
    });
    return _data;
};

var enable_localStorage = true;

// Search wrapper
var lu_search_local_content = [];
var lu_search_remote_content = [];
var lu_search = '';
var lu_search_mode = 'AND';

var search_dropdown = $(".search_index.input");
var search_input = $(".search_index.input input");
var search_menu = $(".search_index.input .menu");

var Search = function(config, keyup_callback, keypress_callback){
    this.search_index = elasticlunr();
    this.search_index.setRef('id');
    this.search_index.addField('title');
    this.search_index.addField('body');
    this.config = config;
    this.keyup_callback = keyup_callback;
    this.keypress_callback = keypress_callback;
    elasticlunr.clearStopWords();
};

Search.prototype.search = function(text){
    if(this.config){
        return this.search_index.search(text, this.config);
    }else{
        return this.search_index.search(text, {});
    };
};

Search.prototype.set_config = function(config){
    this.config = config;
};

Search.prototype.keyup = function(callback){
    this.keyup_callback = callback;
};

Search.prototype.keypress = function(callback){
    this.keypress_callback = callback;
};

Search.prototype.addField = function(field){
    this.search_index.addField(field);
};

Search.prototype.addDoc = function(doc){
    this.search_index.addDoc(doc);
};

Search.prototype.removeDoc = function(doc){
    this.search_index.removeDoc(doc);
};

Search.prototype.updateDoc = function(doc){
    this.search_index.update(doc);
};

// update search result, trigger a search
Search.prototype.update = function(){
    var search_div = $(".search_index.input input");
    var _text = get_query('lu_search');
    if(typeof _text !== 'undefined' && _text != '' && _text !== true){
        search_div.val(_text);
        var e = $.Event("keypress");
        e.which = 13;
        search_div.trigger(e);
    };
};

Search.prototype.search_menu_default_click_action = function(){
    var text = $(this).text();

    search_input.val(text);

    lu_show = '1';
    lu_search = text;
    var url = $.query.set('lu_search', text).set('lu_show', lu_show).set('lu_search_mode', lu_search_mode);
    history.pushState(null, null, url);

    $(".lu_show.checkbox").checkbox('set checked');

    var e = $.Event("keypress");
    e.which = 13;
    search_input.trigger(e);

    search_dropdown.dropdown('hide');
};

Search.prototype.init_search_tip = function(){
    // TODO: extend from the backend search, backend can use elasticsearch
    // Besides the default contents, will also show the user favorate, user
    // search recently, ... combine all and popup
    // below commented use the semantic ui search, why will implement it, because
    // can have more control on the tip
    /*$(".lu_search .ui.search").search({
        source: lu_search_local_content,
    });*/
    var _search = this;

    search_menu.empty();

    // add default
    search_menu.append('<div class="header"><i class="share alternate icon"></i>Public Board</div>');
    $.each(lu_search_local_content, function(i, item){
        search_menu.append('<div data-value="' + item + '"class="item">' + item + '</div>');
    });

    // bind event, later will change to the specified item, like add button, ...
    search_menu.find("div.item").click(_search.search_menu_default_click_action);

};

Search.prototype.update_search_tip = function(result, text){
    var _search = this;

    if(text == ''){
        this.init_search_tip();
    }else{
        search_menu.find("div.item").remove();

        $.each(result, function(i, item){
            search_menu.append('<div data-value="' + item.doc.body + '"class="item">' + item.doc.body  + '</div>');
        });

        // bind event, later will change to the specified item, like add button, ...
        search_menu.find("div.item").click(_search.search_menu_default_click_action);

    };
};



// this function should be call only once, if call multiple times
// the real code should only execute once
var query_search_done = false;
Search.prototype.enable_query_search = function(force){
    // related search with url query
    // if didn't refresh page, query_lu_search is not set
    // for this case, just not set by query_lu_search, as
    // lu_search have been set by keyup callback
    //
    // $.query has problem, the get query not update
    // but getUrlVar didn't have the problem, this is
    // a ugly check, please fixed it. in the long term
    // should find a better way for query
  if(!query_search_done || force){
    var query_lu_search = $.query.get('lu_search');
    var _query_lu_search = $.getUrlVar('lu_search');
    if(query_lu_search !== true && query_lu_search && _query_lu_search){
        lu_search = query_lu_search;
    };

    var query_lu_search_mode = $.query.get('lu_search_mode');
    var _query_lu_search_mode = $.getUrlVar('lu_search_mode');
    if(query_lu_search_mode !== true && query_lu_search_mode && _query_lu_search_mode){
        lu_search_mode = query_lu_search_mode;
    };

    var query_lu_show = $.query.get('lu_show');
    var _query_lu_show = $.getUrlVar('lu_show');
    if(query_lu_show !== true && query_lu_show && _query_lu_show){
        lu_show = query_lu_show;
    };

    /*if(lu_show == '1'){
        $(".lu_show.checkbox").checkbox('set checked');
    }else{
        $(".lu_show.checkbox").checkbox('set unchecked');
    }*/

    if(lu_search !== true){
        var search_div = $(".search_index.input input");
        search_div.val(lu_search);
        // use keypress instead, as the new feature all board is invisiable
        // to solve the board splash issue, keyup will not load board if search
        // query provided
        var e = $.Event("keypress");
        //var e = $.Event("keyup");
        e.which = 13;
        search_div.trigger(e);
    };
    query_search_done = true;
  };
};
// setup global search index instance, user can use in individual page, or can create new one
var _config = {fields: {
                title: {boost: 1},
                body: {boost: 1}
              },
              bool: lu_search_mode, expand: true};
var search_index = new Search(_config);
/*var search_index = elasticlunr(function () {
  this.setRef('id');
  this.addField('title');
  this.addField('body');
});
elasticlunr.clearStopWords();*/


// Dashboard wrapper, Dashboard is group of board
var Dashboard = function(dashboard_name, board_name_list){
    this.dashboard_name = dashboard_name;
    // if no board_name_list, will do the action on all boards
    this.board_name_list = board_name_list;

    if(!this.board_name_list){
        this.board_name_list = this.list();
    }

};

// default invisible, set this to '1' in your application page, can make it visiable by default
var lu_show = '0';

Dashboard.prototype.show_by_id = function(id){
    if(this.dashboard_name){
        var board_name = $(".dashboard.grid." + this.dashboard_name).find('#' + id).attr('name');
    }else{
        var board_name = $(".dashboard.grid").find('#' + id).attr('name');
    }

    if(board_name){
        this.show(board_name);
    };
}

Dashboard.prototype.show = function(board_name){
    if(this.dashboard_name){
        if(board_name){
            $(".dashboard.grid." + this.dashboard_name).find('.dashboard.column[name="' + board_name + '"]').show();
        }else{
            lu_show = '1';
            var new_url = $.query.set('lu_show', lu_show);

            var _lu_search = get_query('lu_search');
            if(typeof _lu_search !== 'undefined'){
                new_url = new_url.set('lu_search', _lu_search);
            }else{
                new_url = new_url.set('lu_search', lu_search);
            };

            var _lu_search_mode = get_query('lu_search_mode');
            if(typeof _lu_search_mode !== 'undefined'){
                new_url = new_url.set('lu_search_mode', _lu_search_mode);
            }else{
                new_url = new_url.set('lu_search_mode', lu_search_mode);
            };

            history.pushState(null, null, new_url);

            $(".dashboard.grid." + this.dashboard_name).find('.dashboard.column[lu_search="1"]').show();
        }
    }else{
        if(board_name){
            $(".dashboard.grid").find('.dashboard.column[name="' + board_name + '"]').show();
        }else{
            lu_show = '1';
            var new_url = $.query.set('lu_show', lu_show);

            var _lu_search = get_query('lu_search');
            if(typeof _lu_search !== 'undefined'){
                new_url = new_url.set('lu_search', _lu_search);
            }else{
                new_url = new_url.set('lu_search', lu_search);
            };

            var _lu_search_mode = get_query('lu_search_mode');
            if(typeof _lu_search_mode !== 'undefined'){
                new_url = new_url.set('lu_search_mode', _lu_search_mode);
            }else{
                new_url = new_url.set('lu_search_mode', lu_search_mode);
            };

            history.pushState(null, null, new_url);

            $(".dashboard.grid").find('.dashboard.column[lu_search="1"]').show();
        }
    }
};

// This methods(show_boards/hide_boards) extends the `show/hide` with board_name, here will do the all boards list 
// different from the show, this function is not affected by lu_search
Dashboard.prototype.show_boards = function(refresh){
    var _d = this;

    $.each(this.board_name_list, function(i, item){
        _d.show(item);
    });

    if(refresh){
        _d.refresh();
    };
};

Dashboard.prototype.hide_boards = function(){
    var _d = this;

    $.each(this.board_name_list, function(i, item){
        _d.hide(item);
    });
};

Dashboard.prototype.hide_by_id = function(id){
    if(this.dashboard_name){
        var board_name = $(".dashboard.grid." + this.dashboard_name).find('#' + id).attr('name');
    }else{
        var board_name = $(".dashboard.grid").find('#' + id).attr('name');
    }

    if(board_name){
        this.hide(board_name);
    };
}

Dashboard.prototype.hide = function(board_name){
    if(this.dashboard_name){
        if(board_name){
            $(".dashboard.grid." + this.dashboard_name).find('.dashboard.column[name="' + board_name + '"]').hide();
        }else{
            lu_show = '0';
            var new_url = $.query.set('lu_show', lu_show);

            var _lu_search = get_query('lu_search');
            if(typeof _lu_search !== 'undefined'){
                new_url = new_url.set('lu_search', _lu_search);
            }else{
                new_url = new_url.set('lu_search', lu_search);
            };

            var _lu_search_mode = get_query('lu_search_mode');
            if(typeof _lu_search_mode !== 'undefined'){
                new_url = new_url.set('lu_search_mode', _lu_search_mode);
            }else{
                new_url = new_url.set('lu_search_mode', lu_search_mode);
            };

            history.pushState(null, null, new_url);

            $(".dashboard.grid." + this.dashboard_name).find('.dashboard.column').hide();
        }
    }else{
        if(board_name){
            $(".dashboard.grid").find('.dashboard.column[name="' + board_name + '"]').hide();
        }else{
            lu_show = '0';
            var new_url = $.query.set('lu_show', lu_show);

            var _lu_search = get_query('lu_search');
            if(typeof _lu_search !== 'undefined'){
                new_url = new_url.set('lu_search', _lu_search);
            }else{
                new_url = new_url.set('lu_search', lu_search);
            };

            var _lu_search_mode = get_query('lu_search_mode');
            if(typeof _lu_search_mode !== 'undefined'){
                new_url = new_url.set('lu_search_mode', _lu_search_mode);
            }else{
                new_url = new_url.set('lu_search_mode', lu_search_mode);
            };

            history.pushState(null, null, new_url);

            $(".dashboard.grid").find('.dashboard.column').hide();
        }
    }
};

Dashboard.prototype.refresh = function(board_name){
    if(this.dashboard_name){
        if(board_name){
            $("input.dashboard." + this.dashboard_name).trigger("change", [[board_name]]);
        }else{
            $("input.dashboard." + this.dashboard_name).trigger("change", [this.board_name_list]);
        };
    }else{
        if(board_name){
            $("input.dashboard").trigger("change", [[board_name]]);
        }else{
            $("input.dashboard").trigger("change", [this.board_name_list]);
        };
    };
};

Dashboard.prototype.set_token = function(key, value){
    if(this.dashboard_name){
        $(".dashboard.grid." + this.dashboard_name).data('lu_' + key, value);
    }else{
        $(".dashboard.grid").data('lu_' + key, value);
    };
};

Dashboard.prototype.list = function(){
    if(this.dashboard_name){
        var boards = $(".dashboard.grid." + this.dashboard_name).find(".dashboard.column");
    }else{
        var boards = $(".dashboard.grid").find(".dashboard.column");
    };

    var board_name_list = [];

    $.each(boards, function(){
        board_name_list.push($(this).attr('name'));
    });

    return board_name_list;
};

// initial a global broadcast instance
var _dashboard = new Dashboard();

// Board wrapper
var board_padding = 7;
var board_progress_height = 2; // to remove this impact for board height system, just change css ui-resizable-se

function get_height(obj){
    var h = 0;

    if(obj instanceof jQuery){
        h = parseInt(obj.height());
    }else{
        h = parseInt(obj);
    };

    return h;
};

var Board = function(board){
    if(board instanceof jQuery){
        this.board = board;
        this.name = this.board.attr("name");
    }else{
        this.board = $('.dashboard.column[name="' + board + '"]');
        this.name = board;
    };

    this.board_input = this.board.find(".board_input");
    this.board_header = this.board.find(".board_header");
    this.board_footer = this.board.find(".board_footer");
    this.board_content = this.board.find(".board_content");
    this.board_progress = this.board.find(".board_progress");
    this.board_resizable_part = this.board.find(".segments.ui-resizable");

    this.board_default_height = get_height(this.board.attr('current_height'));
};

Board.prototype.get_data = function(){
    var data = this.board_input.find('input[name="data"]').val();

    try{
        data = JSON.parse(data);
    }catch(e){
        data = {};
    }

    return data;
};

Board.prototype.get_param = function(){
    var param = this.board_input.find('input[name="param"]').val();

    try{
        param = JSON.parse(param);
    }catch(e){
        param = {};
    }

    return param;
};

Board.prototype.get_token = function(){
    var token = this.board_input.find('input[name="token"]').val();

    try{
        token = JSON.parse(token);
    }catch(e){
        token = {};
    }

    return token;
};

Board.prototype.adjust_height_by_content = function(h){
    var header_height = get_height(this.board_header);
    var footer_height = get_height(this.board_footer);

    if (this.board_default_height > h + header_height + board_padding*2 + footer_height){
        var content_height = h + header_height;
        this.board_content.css("max-height", content_height);
        this.board_resizable_part.css("max-height", content_height + header_height + board_padding + footer_height);
        this.board.css("height", content_height + header_height + board_padding*2 + footer_height);
    }else{
        var content_height = this.board_default_height - header_height - board_padding*2 - footer_height;
        this.board_content.css("max-height", content_height);
        this.board_resizable_part.css("max-height", content_height + header_height + board_padding + footer_height);
        this.board.css("height", this.board_default_height);
    }
};

Board.prototype.set_progress_callback = function(){
    var xhr = new window.XMLHttpRequest();
    var that = this;
    this.board_content.find('.board_load_msg').remove();
    this.board_progress.removeClass('error');
    this.board_progress.css({width: Math.floor(Math.random() * 20) + '%'});
    this.board_progress.removeClass('hide');

    xhr.upload.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            that.board_progress.css({
                width: percentComplete * 100 + '%'
            });
            if (percentComplete === 1) {
                that.board_progress.addClass('hide');
            };
        }
    }, false);

    xhr.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            that.board_progress.css({
                width: percentComplete * 100 + '%'
            });
        };
    }, false);

    return xhr;
}

var plugin_js_dir = '/web/plugin/js/',
    plugin_css_dir = '/web/plugin/css/';

function swap(obj){
  var ret = {};
  for(var key in obj){
    ret[obj[key]] = key;
  }
  return ret;
}

var size_wide_number_map = {
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
};

size_wide_number_map = $.extend(size_wide_number_map, swap(size_wide_number_map));

function get_query(name, default_value){
    var _v = $.getUrlVar(name);
    var result;

    if(typeof default_value !== 'undefined'){result = default_value};

    if(typeof _v !== 'undefined' && _v !== true){
        result = decodeURI(_v.replace(/\+/g, ' '));
    };

    return result;
};

$(document).ready(function(){

    // set global token from query url
    $.each($.query.keys, function(k, v){
        // convert v to string, as if query like "test=", v will be boolean value,
        // will cause token parse fail
        _dashboard.set_token(k, String(v));
    });

    function save_personal_board(data){
        $.ajax({
            url: '/eboard/board/boards/save_personal_board',
            type: 'POST',
            data: data,
        });
    };

    function load(board){
        if(board.is(':visible') === false || board.attr('state') == 'none'){
            // placeholder here for extend
        }else{
          var board_content = board.find(".board_content");
          var board_progress = board.find(".board_progress");

          var board_grid = board.parents(".dashboard.grid");
          var token = ''

          try{
              token = JSON.stringify(get_lu_token(board_grid.data()));
          }catch(e){};

          $.ajax({
              xhr: function () {
                  var xhr = new window.XMLHttpRequest();
                  board_content.find('.board_load_msg').remove();
                  board_progress.removeClass('error');
                  board_progress.css({width: Math.floor(Math.random() * 20) + '%'});
                  board_progress.removeClass('hide');

                  xhr.upload.addEventListener("progress", function (evt) {
                      if (evt.lengthComputable) {
                          var percentComplete = evt.loaded / evt.total;
                          board_progress.css({
                              width: percentComplete * 100 + '%'
                          });
                         if (percentComplete === 1) {
                             board_progress.addClass('hide');
                         };
                      }
                  }, false);

                  xhr.addEventListener("progress", function (evt) {
                      if (evt.lengthComputable) {
                          var percentComplete = evt.loaded / evt.total;
                          board_progress.css({
                              width: percentComplete * 100 + '%'
                          });
                      };
                  }, false);

                  return xhr;
              },
              url: board.attr("url"),
              type: 'GET',
              data: {name: board.attr('name'), board: true, token: token},
              success: function(result){
                  board_content.empty();
                  board_content.css('min-height', '0px');
                  board_content.append(result);

                  var js_template = board.attr("js_template");
                  if(js_template && js_template != "None"){
                      var source_list = js_template.split(",");
                      var engine = source_list.slice(0, 1);
                      // just load the source_list[0](the main js engine)
                      // other load use the head js
                      // if all load by getMultiScripts, if js_list > 2, the render sometimes fail, not always
                      // if all load by head js, the load function basically not work
                      // thing look like the head load function from js will override each other,
                      // but the getMultiScripts will not affect each other
                      if(source_list.length == 1){
                          var func = localStorage.getItem(board.attr('name'));
                          if(func){
                              try{
                                  eval('(' + func + ')')(board);
                                  board_progress.addClass('hide');
                              }catch(e){
                                  console.log(e);
                                  board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                  board_progress.addClass('error');
                              }
                          }else{
                              $.getMultiScripts(engine, plugin_js_dir).done(function() {
                                  // all scripts loaded
                                  if(enable_localStorage){
                                      localStorage.setItem(board.attr('name'), board_execute.toString());
                                  };

                                  try{
                                      board_execute(board);
                                      board_progress.addClass('hide');
                                  }catch(e){
                                      console.log(e);
                                      board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                      board_progress.addClass('error');
                                  }
                              });
                          };
                      }else{
                          var args = source_list.slice(1, source_list.length);
                          $.each(args, function(i, item){
                              if(item.endsWith('.css')){
                                  args[i] = plugin_css_dir + item;
                              }else{
                                  args[i] = plugin_js_dir + item;
                              };
                          });
                          head.load(args, function(){
                              var func = localStorage.getItem(board.attr('name'));
                              if(func){
                                  try{
                                      eval('(' + func + ')')(board);
                                      board_progress.addClass('hide');
                                  }catch(e){
                                      console.log(e);
                                      board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                      board_progress.addClass('error');
                                  }
                              }else{
                                  $.getMultiScripts(engine, plugin_js_dir).done(function() {
                                      // all scripts loaded
                                      if(enable_localStorage){
                                        localStorage.setItem(board.attr('name'), board_execute.toString());
                                      };

                                      try{
                                          board_execute(board);
                                          board_progress.addClass('hide');
                                      }catch(e){
                                          console.log(e);
                                          board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                          board_progress.addClass('error');
                                      }
                                  });
                              };
                          });
                      };
                  }else{board_progress.addClass('hide');}
              },
              error: function(result){
                  board_content.empty();
                  board_content.css('min-height', '0px');
                  board_content.append('<p class = "board_load_msg error">Load data fail!</p>');
                  board_progress.addClass('error');
                  board_progress.css({
                      width: 100 + '%'
                  });
                  //board_progress.addClass('hide');
              },
          });
        };
    };

    $(".dashboard.input > input").change(function(event, board_name_list){
        var $dashboard = $(this).parents('.dashboard.grid');

        if(board_name_list){
            $.each(board_name_list, function(i, name){
                var board = $dashboard.find('.dashboard.column[name="' + name + '"]');
                load(board);
            });
        }else{
            var boards = $dashboard.find(".dashboard.column");
            $.each(boards, function(){
                var board = $(this);
                load(board);
            });
        };
    });

    // init progress bar
    $(".size.progress").progress({
        showActivity: false,
    });

    // - size callback
    $(".decrement.button").click(function(){
        var b = $(this).parents('.dashboard.column'),
        size = b.attr('size'),
        pre_size = b.attr('pre_size');

        var number = parseInt(size_wide_number_map[size]) - 1;
        $(this).parents('.size.progress').progress('set progress', number);

        b.attr('pre_size', size);
        b.attr('size', size_wide_number_map[number]);

        $(".increment.button").removeClass("disabled");
        if(number == 1){
            $(this).addClass("disabled");
        }else{
            $(this).removeClass("disabled");
        }
    });
    // + size callback
    $(".increment.button").click(function(){
        var b = $(this).parents('.dashboard.column'),
        size = b.attr('size'),
        pre_size = b.attr('pre_size');

        var number = parseInt(size_wide_number_map[size]) + 1;
        $(this).parents('.size.progress').progress('set progress', number);

        b.attr('pre_size', size);
        b.attr('size', size_wide_number_map[number]);

        $(".decrement.button").removeClass("disabled");
        if(number == 16){
            $(this).addClass("disabled");
        }else{
            $(this).removeClass("disabled");
        }
    });

    $(".item.size").popup({
        hoverable: true,
        delay: {
            hide: 100,
        },
        onHidden: function(){
            // save personal data here
            var board = $(this).parents('.dashboard.column');
            if(!board.hasClass(board.attr('size'))){
                board.removeClass(board.attr('pre_size')).addClass(board.attr('size'));
                save_personal_board({id: board.attr('id'), size: board.attr('size'), pre_size: board.attr('pre_size')});
            };
        },
    });

    // color dropdown
    $(".item.color").dropdown({
        on: 'hover',
        onShow: function(){
            $(this).parents(".ui.basic.segments").resizable( "option", "disabled", true );
        },
        onHide: function(){
            var board = $(this).parents('.dashboard.column');
            if(board.attr("state").toLowerCase() == "show"){
                $(this).parents(".ui.basic.segments").resizable( "option", "disabled", false );
            }
        },
    });

    $("div.segments").hover(
        function(){$(this).find("h5.right.header").show();$(this).find(".ui-resizable-se.ui-icon").show();},
        function(){$(this).find("h5.right.header").hide();$(this).find(".ui-resizable-se.ui-icon").hide();}
    );

    $(".floated.header i.show").click(function(){
        var board = $(this).parents('.dashboard.column'); 
        if($(this).hasClass("horizontal")){
            board.removeClass(board.attr('size'));
            board.addClass("sixteen wide");
            board.attr('pre_size', board.attr('size'));
            board.attr('size', 'sixteen wide');
            board.find('.size.progress').progress('set progress', 16);
            $(this).removeClass("horizontal").addClass("minus");
            save_personal_board({id: board.attr('id'), size: 'sixteen wide'});
            if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
        }else{
            board.removeClass("sixteen wide");
            board.addClass(board.attr('pre_size'));
            $(this).removeClass("minus").addClass("horizontal");
            save_personal_board({id: board.attr('id'), size: board.attr('pre_size')});
            board.attr('size', board.attr('pre_size'));
            board.attr('pre_size', 'sixteen wide');
            var number = parseInt(size_wide_number_map[board.attr('size')]);
            board.find('.size.progress').progress('set progress', number);
            if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
        };

    });

    // full screen control
    $(".floated.header i.bscreen").click(function(){
        var board = $(this).parents('.dashboard.column');
        var bscreen = $(this);
        if($.support.fullscreen){
            board.fullScreen({
                callback: function(isFullScreen){
                    if(isFullScreen){
                        bscreen.removeClass("expand").addClass("compress");
                    }else{
                        bscreen.removeClass("compress").addClass("expand");
                    }

                    // check if need to refresh
                    if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
                }
            });
        };
    });

    /*$(".menu .size.item").click(function(){
        var board = $(this).parents('.dashboard.column'); 

        if($(this).text() == "Maximize"){
            //$(".wrapper").dimmer('show');
            board.removeClass("eight wide");
            board.addClass("sixteen wide");
            $(this).text("Minimize");
            save_personal_board({id: board.attr('id'), size: 'sixteen wide'});
            //board.addClass("fullscreen");
            if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
        }else{
            //$(".wrapper").dimmer('hide');
            board.removeClass("sixteen wide");
            board.addClass("eight wide");
            $(this).text("Maximize");
            save_personal_board({id: board.attr('id'), size: 'eight wide'});
            //board.removeClass("fullscreen");
            if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
        }
    });*/

    $(".menu .toggle.item").click(function(){
        var board = $(this).parents('.dashboard.column'); 
        var header_height = get_height(board.find('.board_header'));

        if($(this).text() == "Collapse"){
            // Add fixed height support, just need to set height to 0.
            var height = parseInt(board.height()) + board_padding*2;

            board.find(".board_content").hide();
            board.find(".board_footer").hide();
            board.find(".ui.basic.segments").resizable( "option", "disabled", true );

            if(board.attr("fixed_height") != "no"){
                height = board.attr("current_height");
            };

            board.css("height", header_height + board_padding);
            board.attr("current_height", header_height + board_padding);
            board.attr("pre_height", height);
            board.attr("state", "none");
            board.find(".basic.segments").css("height", header_height + board_padding);
            $(this).text("Expand");

            if(board.attr("fixed_height") != "no"){
                save_personal_board({id: board.attr('id'), state: 'none', height: header_height + board_padding, pre_height: height});
            }else{
                save_personal_board({id: board.attr('id'), state: 'none', height: '0', pre_height: height});
            };
            //load(board);
        }else{
            board.find(".board_content").show();
            board.find(".board_footer").show();
            board.css("height", board.attr("pre_height"));
            board.attr("current_height", board.attr("pre_height"));
            board.attr("pre_height", header_height + board_padding);
            board.attr("state", "show");
            board.find(".basic.segments").css("height", parseInt(board.attr("current_height")) - board_padding);
            board.find(".board_content").css("height", parseInt(board.attr("current_height")) - header_height - board_padding*2 - parseInt(board.find(".board_footer").attr("footer_height")));
            board.find(".ui.basic.segments").resizable( "option", "disabled", false );
            $(this).text("Collapse");

            if(board.attr("fixed_height") != "no"){
                save_personal_board({id: board.attr('id'), state: 'show', height: board.attr('current_height'), pre_height: board.attr("pre_height") });
            }else{
                save_personal_board({id: board.attr('id'), state: 'show', height: '0', pre_height: board.attr("pre_height") });
            };

            if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
        }
    });

    $(".menu .color.item .item").click(function(){
        var header = $(this).parents(".board_header");
        var color = $(this).attr("color");
        header.removeClass(header.attr("color"));
        header.addClass(color);
        header.attr("color", color);
        if(color != "white"){
            header.addClass("inverted");
        }else{
            header.removeClass("inverted");
        };
        save_personal_board({id: $(this).parents('.dashboard.column').attr('id'), color: color});
    });

    if($(".dashboard.grid").hasClass('sortable')){
        $(".dashboard.grid").sortable({
            connectWith: ".dashboard.grid",
            handle: ".board_header",
            placeholder: "ui-state-highlight",
            stop: function(event, ui){
                var ids = $(this).sortable("toArray");
                save_personal_board({ids: ids});
            },
        });
        //$(".dashboard.grid").disableSelection();
    };

    function do_search(text, refresh, callback){
        var result = search_index.search(text);
        var ids = $.map(result, function(r){return r.ref});
        var dashboards = $(".dashboard.column");

        if(text == '' && lu_show == '1'){dashboards.show(function(){
            // add searchable tag to board
            $(this).attr('lu_search', '1');
            if(refresh){
                load($(this))
            }});
        }else{
            $.each(dashboards, function(){
                // hide only the needed, solve the screen refresh issue
                if(ids.indexOf($(this).attr('id')) != -1){
                    $(this).attr('lu_search', '1');
                    if($(this).is(':visible') === false && lu_show == '1'){
                        $(this).show(function(){
                            if(refresh){
                                load($(this));
                            };
                        });
                    }else{
                        if(refresh){
                            load($(this));
                        };
                    };
                }else{
                    $(this).attr('lu_search', '0');
                    $(this).hide();
                };
            });
        };

        return result;

        // below code will make every keypress, animation the board
        /*$.each(result, function(i, item){
            var d = $(".dashboard.column[id='" + item.ref + "']");
            console.log(d.is(':visible'));
            if(d.is(':visible') === false){
                d.show(function(){
                    if(refresh){
                        load($(this));
                    };
                });
            };
        });*/
    };

    // start search
    $(".search_mode.dropdown").dropdown({
        on: 'hover',
        onChange: function(value, text, $choice){
            var _lu_search = get_query('lu_search');
            var _lu_show = get_query('lu_show');

            var url = $.query.set('lu_search_mode', value);

            if(typeof _lu_search !== 'undefined'){
                url = url.set('lu_search', _lu_search);
            }else{
                url = url.set('lu_search', lu_search);
            };

            if(typeof _lu_show !== 'undefined'){
                url = url.set('lu_show', _lu_show);
            }

            history.pushState(null, null, url);

            lu_search_mode = value;

            _config.bool = value;
            search_index.set_config(_config);
            search_index.update();
        },
    });

    lu_search_mode = get_query('lu_search_mode', lu_search_mode);
    $(".search_mode.dropdown").dropdown("set selected", lu_search_mode);


    $(".search_index.input input").keyup(function(event){
        var text = $(this).val();
        var refresh = false;

        // set the text to query string
        var url = $.query.set('lu_search', text).set('lu_show', lu_show);
        lu_search = text;
        history.pushState(null, null, url);

        if(text == ''){
            refresh=true;
            $(this).prev('i').removeClass('remove').addClass('search');
        }else{
            $(this).prev('i').removeClass('search').addClass('remove');
        };

        var result = do_search(text, refresh);
        search_index.update_search_tip(result, text);

        if(search_index.keyup_callback){return search_index.keyup_callback.apply(this, [result, text, event])};
    });

    $(".search_index.input input").keypress(function(event){
        var text = $(this).val();
        var refresh = false;

        if(text == ''){
            $(this).prev('i').removeClass('remove').addClass('search');
        }else{
            $(this).prev('i').removeClass('search').addClass('remove');
        };

        // default for dashboard, only for key enter
        if(event.which == 13){
            refresh=true;
            var result = do_search(text, refresh);

            if(search_index.keypress_callback){
                return search_index.keypress_callback.apply(this, [result, text, event]);
            };
        }else if(search_index.keypress_callback){
            var result = do_search(text, refresh);
            return search_index.keypress_callback.apply(this, [result, text, event]);
        };
    });

    $(".search_index.input i").click(function(){
        var search_div = $(".search_index.input input");

        if($(this).hasClass("remove")){
            /*// when click remove, take query as standard, as search will not update query lu_show
            // this can restore user show state after search
            var _lu_show = get_query('lu_show');
            if(_lu_show == '0'){
                lu_show = 0;
                $(".lu_show.checkbox").checkbox('set unchecked');
            };*/

            search_div.val("");
            var e = $.Event("keyup");
            search_div.trigger(e);
        }else{
            var e = $.Event("keyup");
            search_div.trigger(e);
        };
    });
    // end search

    // refresh of each board start
    $(".floated.header i.refresh").click(function(){
        var board = $(this).parents('.dashboard.column'); 
        // no matter the board has auto refresh feature, just do it
        load(board);
    });
    $(".floated.header i.refresh").dblclick(function(){
        var board = $(this).parents('.dashboard.column'); 
        // no matter the board has auto refresh feature, just do it
        load(board);
    });
    // refresh of each board end

    // tab control start
    $(window).focus(function(){
        $(".dashboard.column").each(function(){
            var board = $(this);
            if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
        });
    });
    // tab control end

    $(".board_header").dblclick(function(){
        var board = $(this).parents('.dashboard.column');

        if(board.attr('state') == 'none'){
            board.find('.floated.header .item.toggle').trigger('click');
        }else{
            board.find('.floated.header i.show').trigger('click');
        };
    });

    $(".dashboard.column").each(function(i, b){
        var board = $(this);
        var board_content = board.find(".board_content");
        var board_footer = board.find(".board_footer");
        board_footer.children().css("max-height", board_footer.attr("footer_height"));

        // index data
        var board_header = board.find(".header .content");
        var _body = '';
        var _title = '';
        _body += i + 1;
        _body += ' ' + board.attr('b_type');
        _body += ' ' + board_header.text().replace(/[-_]/g, ' ');
        var doc = {"id": board.attr("id"), "title": _title, "body": _body};
        search_index.addDoc(doc);

        lu_search_local_content.push(_body);
        //lu_search_local_content.push(i+1 + ' ' + board_header.text().replace(/[-_]/g, ' '));

        // Add number for each header
        board_header.text(i+1 + '. ' + board_header.text());

        if(board.attr('resize') == "True"){
            var board_seg = board.find(".ui.basic.segments");
            board_seg.resizable({
                //animate: true, //there's bug for animate, the size is not correct
                stop: function(event, ui){},
                start: function(event, ui){},
            });

            board_seg.on("resizestart", function(event, ui){
                $(this).addClass("ui-resizable-helper");
            });

            var one_wide = board.width()/parseInt(size_wide_number_map[board.attr('size')]);
            var one_height = 50;
            board_seg.on("resizestop", function(event, ui){
                $(this).removeClass("ui-resizable-helper");

                var w = ui.size.width,
                number = parseInt(w/one_wide),
                size_wide = size_wide_number_map[number],
                footer_height = parseInt(board_footer.attr("footer_height")),
                header_height = get_height(board.find(".board_header")),
                h = ui.size.height;

                h = parseInt(h/one_height)*one_height;

                board.css("height", h);
                $(this).css("height", h-board_padding);
                $(this).css("width", "auto");
                board_content.css("width", "auto");
                board_content.css("height", h-header_height-board_padding*2-footer_height);
                board_footer.css("height", footer_height);
                board_footer.children().css("max-height", footer_height);
                board.removeClass(board.attr("size")).addClass(size_wide);
                board.attr("pre_size", board.attr("size"));
                board.attr("size", size_wide);
                board.attr("current_height", h);
                board.find('.size.progress').progress('set progress', number);

                save_personal_board({id: board.attr('id'), size: board.attr('size'), pre_size: board.attr('pre_size'), height: h});
                if (board.attr("refresh") && board.attr("refresh") != "0"){load(board);};
            });
            board_seg.find(".ui-resizable-se.ui-icon").hide();
        };

        if(board.find(".toggle.item").text() == "Expand"){
            board.find(".ui.basic.segments").resizable( "option", "disabled", true );
            board.find(".board_content").hide();
            board.find(".board_footer").hide();
        }


        var _load = function(){
          // do only for the visiable board, performance improvement
          if(board.is(':visible') === false || board.attr('state') == 'none'){
              // placeholder here for extend
          }else{
            var board_progress = board.find(".board_progress");
            var board_grid = board.parents(".dashboard.grid");
            var token = ''

            try{
                token = JSON.stringify(get_lu_token(board_grid.data()));
            }catch(e){};

            $.ajax({
              xhr: function () {
                  var xhr = new window.XMLHttpRequest();
                  board_content.find('.board_load_msg').remove();
                  board_progress.removeClass('error');
                  board_progress.css({width: Math.floor(Math.random() * 20) + '%'});
                  board_progress.removeClass('hide');

                  xhr.upload.addEventListener("progress", function (evt) {
                      if (evt.lengthComputable) {
                          var percentComplete = evt.loaded / evt.total;
                          board_progress.css({
                              width: percentComplete * 100 + '%'
                          });
                         if (percentComplete === 1) {
                             board_progress.addClass('hide');
                         };
                      }
                  }, false);

                  xhr.addEventListener("progress", function (evt) {
                      if (evt.lengthComputable) {
                          var percentComplete = evt.loaded / evt.total;
                          board_progress.css({
                              width: percentComplete * 100 + '%'
                          });
                      };
                  }, false);

                  return xhr;
              },
              url: board.attr("url"),
              type: 'GET',
              data: {name: board.attr('name'), board: true, token: token},
              success: function(result){
                  board_content.empty();
                  board_content.css('min-height', '0px');
                  board_content.append(result);

                  var js_template = board.attr("js_template");
                  if(js_template && js_template != "None"){
                      var source_list = js_template.split(",");
                      var engine = source_list.slice(0, 1);
                      // just load the source_list[0](the main js engine)
                      // other load use the head js
                      // if all load by getMultiScripts, if js_list > 2, the render sometimes fail, not always
                      // if all load by head js, the load function basically not work
                      // thing look like the head load function from js will override each other,
                      // but the getMultiScripts will not affect each other
                      if(source_list.length == 1){
                          var func = localStorage.getItem(board.attr('name'));
                          if(func){
                              try{
                                  eval('(' + func + ')')(board);
                                  board_progress.addClass('hide');
                              }catch(e){
                                  console.log(e);
                                  board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                  board_progress.addClass('error');
                              }
                          }else{
                              $.getMultiScripts(engine, plugin_js_dir).done(function() {
                                  // all scripts loaded
                                  if(enable_localStorage){
                                      localStorage.setItem(board.attr('name'), board_execute.toString());
                                  };

                                  try{
                                      board_execute(board);
                                      board_progress.addClass('hide');
                                  }catch(e){
                                      console.log(e);
                                      board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                      board_progress.addClass('error');
                                  }

                              });
                          };
                      }else{
                          var args = source_list.slice(1, source_list.length);
                          $.each(args, function(i, item){
                              if(item.endsWith('.css')){
                                  args[i] = plugin_css_dir + item;
                              }else{
                                  args[i] = plugin_js_dir + item;
                              };
                          });
                          head.load(args, function(){
                              var func = localStorage.getItem(board.attr('name'));
                              if(func){
                                  try{
                                      eval('(' + func + ')')(board);
                                      board_progress.addClass('hide');
                                  }catch(e){
                                      console.log(e);
                                      board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                      board_progress.addClass('error');
                                  }
                              }else{
                                  $.getMultiScripts(engine, plugin_js_dir).done(function() {
                                      // all scripts loaded
                                      if(enable_localStorage){
                                          localStorage.setItem(board.attr('name'), board_execute.toString());
                                      };

                                      try{
                                          board_execute(board);
                                          board_progress.addClass('hide');
                                      }catch(e){
                                          console.log(e);
                                          board_content.append('<p class = "board_load_msg error">Render data fail!</p>');
                                          board_progress.addClass('error');
                                      }
                                  });
                              };
                          });
                      };
                  }else{board_progress.addClass('hide');}
              },
              error: function(result){
                  board_content.empty();
                  board_content.css('min-height', '0px');
                  board_content.append('<p class = "board_load_msg error">Load data fail!</p>');
                  board_progress.addClass('error');
                  board_progress.css({
                      width: 100 + '%'
                  });
                  //board_progress.addClass('hide');
              },
            });
          };
        };
        _load();

        var refresh = parseInt(board.attr('refresh'))*1000;

        if (refresh && refresh != 0){
            setInterval(_load, refresh);
        }
    });

    // related search with url query, move this part to the page self
    // as custom search index callback associate with the enable_query_search
    //search_index.enable_query_search();

    // lu show
    if($(".lu_show.checkbox").length > 0){
        lu_show = $.query.get('lu_show');

        if(lu_show == '1'){
            $(".lu_show.checkbox").checkbox('set checked');
            search_index.enable_query_search();
            _dashboard.show();
        }else{
            $(".lu_show.checkbox").checkbox('set unchecked');
            search_index.enable_query_search();
            _dashboard.hide();
        };
    };

    $(".lu_show.checkbox").checkbox({
        onChecked: function(){
            if(!query_search_done){
                lu_show = '1';
                var new_url = $.query.set('lu_show', lu_show);

                var _lu_search = get_query('lu_search');
                if(typeof _lu_search !== 'undefined'){
                    new_url = new_url.set('lu_search', _lu_search);
                }else{
                    new_url = new_url.set('lu_search', lu_search);
                };

                var _lu_search_mode = get_query('lu_search_mode');
                if(typeof _lu_search_mode !== 'undefined'){
                    new_url = new_url.set('lu_search_mode', _lu_search_mode);
                }else{
                    new_url = new_url.set('lu_search_mode', lu_search_mode);
                };

                history.pushState(null, null, new_url);

                search_index.enable_query_search();
                _dashboard.show();
            }else{
                lu_show = '1';
                var new_url = $.query.set('lu_show', lu_show);

                var _lu_search = get_query('lu_search');
                if(typeof _lu_search !== 'undefined'){
                    new_url = new_url.set('lu_search', _lu_search);
                }else{
                    new_url = new_url.set('lu_search', lu_search);
                };

                var _lu_search_mode = get_query('lu_search_mode');
                if(typeof _lu_search_mode !== 'undefined'){
                    new_url = new_url.set('lu_search_mode', _lu_search_mode);
                }else{
                    new_url = new_url.set('lu_search_mode', lu_search_mode);
                };

                history.pushState(null, null, new_url);

                if(lu_search == ''){
                    var search_div = $(".search_index.input input");
                    search_div.val(lu_search);
                    var e = $.Event("keypress");
                    //var e = $.Event("keyup");
                    e.which = 13;
                    search_div.trigger(e);
                }else{
                    _dashboard.show();
                    _dashboard.refresh();
                };
            };
        },
        onUnchecked: function(){
            lu_show = '0';
            var new_url = $.query.set('lu_show', lu_show);

            var _lu_search = get_query('lu_search');
            if(typeof _lu_search !== 'undefined'){
                new_url = new_url.set('lu_search', _lu_search);
            }else{
                new_url = new_url.set('lu_search', lu_search);
            };

            var _lu_search_mode = get_query('lu_search_mode');
            if(typeof _lu_search_mode !== 'undefined'){
                new_url = new_url.set('lu_search_mode', _lu_search_mode);
            }else{
                new_url = new_url.set('lu_search_mode', lu_search_mode);
            };

            history.pushState(null, null, new_url);

            _dashboard.hide();
        },
    });


    // search dropdown
    search_dropdown.dropdown({
        on: 'click',
        onShow: function(){
            //as keypress event is block by semantic ui, so let keydown to do a transfer
            // https://github.com/Semantic-Org/Semantic-UI/issues/2462
            search_input.on('keydown', function(event){
                if(event.which == '13'){
                    var e = $.Event("keypress");
                    e.which = 13;
                    search_input.trigger(e);
                }
            });
        },
        onHide: function(){
            search_input.off('keydown');
        },
        action: 'nothing',
        // use action or, after menu append item, bind the click event
        // here we bind event, as it's more extendable
        /*action: function(text, value){
            search_input.val(text);

            lu_show = '1';
            lu_search = text;
            var url = $.query.set('lu_search', text).set('lu_show', lu_show).set('lu_search_mode', lu_search_mode);
            history.pushState(null, null, url);

            $(".lu_show.checkbox").checkbox('set checked');

            var e = $.Event("keypress");
            e.which = 13;
            search_input.trigger(e);

            search_dropdown.dropdown('hide');
        }*/
    });

    search_index.init_search_tip();

})
