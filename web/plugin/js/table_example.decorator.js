// access namespace variable like param, token, _board, etc in namespace function _board_table_row_func
// this.param, this.token, this._board
// in _board_table_column_func_map function, can access by self.param, self.token, self._board
//
var perf_scheduler_pr_trigger_policy_table = {};

// progress customize
perf_scheduler_pr_trigger_policy_table.scheduler_progress = {};
perf_scheduler_pr_trigger_policy_table.set_scheduler_progress = function(){
        var self = this;
        $.each(self.scheduler_progress, function(k, v){
            var _l=0, _v=0, _t=0;
            $.each(v, function(j, jv){
                _t += jv.count;
                if(["created", "pending", "running"].indexOf(jv.status)>=0){
                    _l += jv.count;
                };
            });
            _v = _t - _l;
            if(_v == 0){_v = -1};
            self.board.find('.progress.scheduler[scheduler_id="' + k + '"]').progress({
                value: _v,
                total: _t,
            });

            var pie_value = Enumerable.From(v).Select(function(x){return x.count}).ToArray();
            var pie_label = Enumerable.From(v).Select(function(x){return x.status}).ToArray();
            var pie_color = [];
            var pie_tooltip = {};
            $.each(pie_label, function(i, s){
                pie_tooltip[i] = s;
                pie_color[i] = self._board.color[s];
            });
            self.board.find('.sparkline.scheduler[scheduler_id="' + k + '"]').sparkline(pie_value, {
                type: "pie",
                width: '25px',
                height: '25px',
                tooltipFormat: '{{offset:offset}} ({{percent.0}}%)',
                sliceColors: pie_color,
                tooltipValueLookups: {
                    'offset': pie_tooltip,
                }
            });

            // as sparkline will import other elements, will affect the table content height,
            // so do the table adjust here to make table in good height
            //var table_height = self.board.find('.dataTables_wrapper').height();
            //self._board.adjust_height_by_content(table_height);
        });
};

perf_scheduler_pr_trigger_policy_table._board_table_row_func = function(row, data, dataIndex){
        if(login_user == data.created_by){
            $('td.custom', row).css('background-color', "#fffaf3");
        };
};

perf_scheduler_pr_trigger_policy_table._board_table_column_func_map = {
        "Scheduler_ID_id": function($td, row, data, dataIndex, self){
            $td.addClass("scheduler_id");
            $td.html('<a class="ui olive circular label" style="line-height:2em;" name="' + data.policy_name + '" ph_id="' + data.ph_id + '">' + data.id + '</a>');
        },
        "Policy_Name_policy_name": function($td, row, data, dataIndex, self){
            if(!data.policy_name.startsWith('Real-time-trigger') && !data.policy_name.startsWith('PR-trigger')){
                $td.html('<a href="/eboard/web/perfscheduler?page=policy&lu_show=1&lu_search=' + data.policy_name.replace(/_/g, ' ') + '">' + data.policy_name + '</a>');
            };
        },
        "Created_At_created_at": function($td, row, data, dataIndex, self){
            var ta = timeago().format(data.created_at);
            $td.html('<div class="ui basic label timeago" data-tooltip="' + data.created_at + '"><i class="wait icon"></i>' + ta + '</div>');
        },
        "Run_By_created_by": function($td, row, data, dataIndex, self){
            var _user = data['created_by'];
            if(data['created_by'].length >= 10){
                _user = data['created_by'].slice(0, 9) + '...';
            };
            var created_by = '<a class="ui image label" href="/eboard/web/user/?username=' + data['created_by'] + '"><img src="/' + data['img'] + '">' + _user + '</a>';
            $td.html(created_by);
        },
        "Progress_id": function($td, row, data, dataIndex, self){
            var progress_bar = '<div class="ui indicating small progress scheduler" scheduler_id="' + data.id + '"  data-value="-1" data-total="8" style="margin-top:3px;"><div class="bar"><div class="progress"></div></div></div>';
            var progress_pie = '<span class="sparkline scheduler" scheduler_id="' + data.id + '">...</span>';
            //var progress = '<div class="ui accordion" policy_name="' + data.policy_name + '"><div class="title" style="padding-bottom:0px;"><div class="ui grid"><div class="one wide column" style="padding-right:0px;"><i class="dropdown icon"></i></div><div class="ten wide column">' + progress_bar + '</div></div></div><div class="content" style="padding-top:0px"><div class="ui segment"><div class="ui active inverted dimmer"><div class="ui text tiny loader"></div></div><p></p></div></div></div>';
            var progress = '<div class="ui accordion" policy_name="' + data.policy_name + '"><div class="title" style="padding-bottom:0px;"><div class="ui grid"><div class="one wide column" style="padding-right:0px;"><i class="dropdown icon"></i></div><div class="nine wide column">' + progress_bar + '</div><div class="one wide column">' + progress_pie + '</div></div></div><div class="content" style="padding-top:0px"><div class="ui segment"><div class="ui active inverted dimmer"><div class="ui text tiny loader"></div></div><p></p></div></div></div>';
            $td.html(progress);
        },
        "Status_status": function($td, row, data, dataIndex, self){
            var status = data.status;
            var color = self._board.color;
            if(status == 'created'){status = 'pending'};
            $td.html('<div class="ui status tiny ' + color[status]  + ' label">' + status + '</div>');
        },
        "Action_id": function($td, row, data, dataIndex, self){
            if(["running", "created"].indexOf(data.status) >=0){
                $td.html('<a class="ui label cancel" scheduler_id="' + data.id + '" data-tooltip="double click">Cancel<i class="red delete icon"></i></a>');
            }else{
                $td.html('');
            }
        },
        "Link_id": function($td, row, data, dataIndex, self){
            var link = '';
            var token = self._board.get_token();

            if(!token.time_token){token.time_token='24 hour'};

            link += '<a class="basic mini image label" data-tooltip="Result Analysis" target="_blank" href="http://arewefastyet.sv.splunk.com:8000/en-US/app/splunk_app_perf_automation/performance_smoke_test_triage?form.ph_id=' + data.ph_id + '"><img src="/web/img/splunk_logo_green.png" style="padding-left:10px;margin:0;max-height:20px;"></a>';
            link += '<a class="basic mini icon label" data-tooltip="Scheduled Job Detail" href="' + '/eboard/web/perfscheduler?page=job&policy_name=PR-trigger&ph_id=' + data.ph_id + '&scroll_to=testscheduler_table&time_token='+ token.time_token + '"><i class="teal spinner large icon" style="padding-left:10px;margin-top:2px;max-height:20px;vertical-align:top;line-height:unset;"></i></a>';
            $td.html(link);
        },
};

perf_scheduler_pr_trigger_policy_table._board_table_init_func_map = {
    "Progress_id": function(self){
        // get scheduler progress
        var id_list = Enumerable.From(self.data).Select(function(x){return x.id}).ToArray();
        $.each(id_list, function(i, item){
            self.scheduler_progress[item] = [];
        });
        if(id_list.length > 0){
            $.ajax({
                url: '/eboard/pperfscheduler/perfschedulers/?lu_sql=get_perfscheduler_progress_by_scheduler_id&lu_sql_param=' + id_list.join('|') + ',' + id_list.join('|'),
                type: 'GET',
                dataType: 'json',
                success: function(r){
                    $.each(r.data, function(i, item){
                        self.scheduler_progress[item.scheduler_id].push(item);
                    });
                    self.set_scheduler_progress();
                },
            });
        }
    },
};

perf_scheduler_pr_trigger_policy_table._board_table_draw_func_map = {
    "Scheduler_ID_id": function(self){
        self.table.find(".scheduler_id").click(function(){
            /*var id = $(this).find("a").text();
            var policy_name = $(this).find("a").attr("name");
            var scheduler_job_filter = $("#testscheduler_table_filter").find("input");
            scheduler_job_filter.val(id + ' ' + policy_name);
            scheduler_job_filter.trigger("keyup");*/
            var ph_id = self.table.find("a").attr("ph_id");
            window.location.href = '/eboard/web/perfscheduler?page=job&policy_name=PR-trigger&ph_id=' + ph_id + '&scroll_to=testscheduler_table&time_token=' + self.token.time_token;
        });
    },
    "Action_id": function(self){
        // action cancel
        self.table.find("a.cancel").dblclick(function(){
            var $a = $(this);
            var $status = $a.parents('tr').find('div.status');
            var pre_status = $status.text();
            $.ajax({
                url: '/eboard/pperfscheduler/perfschedulers/cancel/' + $a.attr('scheduler_id'),
                type: 'GET',
                success: function(result){
                    $status.removeClass(self._board.color[pre_status]).addClass(self._board.color['canceled']).text('canceled');
                },
                error: function(result){
                    var resp = JSON.parse(result.responseText);
                    var message_box = $('.message_box');

                    message_box.children('.header').text('Abort schedule job fail');
                    message_box.find('.content p').empty();
                    message_box.find('.content p').text(resp.message);
                    message_box.find('.actions .button').text('Close').append('<i class="checkmark icon"></i>');
                    message_box.modal('show');
                },
            });
        });
    },
    "Progress_id": function(self){
        self.set_scheduler_progress();

        // init accordion
        self.board.find('.ui.accordion')
            .accordion({
                onClose: function(){
                    // adjust table height
                    var table_height = self.board.find('.dataTables_wrapper').height();
                    self._board.adjust_height_by_content(table_height);
                },
                onOpen: function(){
                    var pcontent = $(this).parents('.ui.accordion').find('div.content');
                    var pprogress = $(this).parents('.ui.accordion').find('.progress.scheduler');
                    var policy_name = $(this).parents('.ui.accordion').attr('policy_name');
                    $.ajax({
                        url: '/eboard/pperfscheduler/perfschedulers/?lu_sql=get_perfscheduler_detail_by_policy_name&lu_sql_param=' + policy_name + ',' + policy_name,
                        type: 'GET',
                        dataType: 'json',
                        success: function(result){
                            pcontent.empty();
                            var l = '<ul class="ui list">';
                            var all_v = 0;
                            $.each(result.data, function(i, item){
                                // process for progress
                                var v=-1, t=100;
                                if(["running"].indexOf(item.testcase_status) >=0){
                                    v = item.duration*1;
                                    t = item.test_duration*1;
                                    if(v > t){
                                        v = 99;
                                        t = 100;
                                    }
                                }else if(["created", "pending"].indexOf(item.testcase_status) >=0){
                                    v = -1;
                                    t = 100;
                                }else{
                                    all_v += 1;
                                    v = 100;
                                    t = 100;
                                }

                                l += '<li>';
                                l += '<span>' + '<i><b>' + item.testcase  + '</b></i>: ' + '</span>';
                                l += '<span>' + '<div class="ui basic status mini ' + self._board.color[item.testcase_status] + ' label">' + item.testcase_status + '</div>' + '</span>';
                                l += '<div class="ui indicating small progress testcase" data-value="' + v + '" data-total="' + t + '" style="margin-bottom:4px;margin-top:2px;width:70%;"><div class="bar"><div class="progress"></div></div></div>'; 
                                l += '</li>';
                            });
                            l += '</ul>';
                            pcontent.append(l);

                            self.board.find('.progress.testcase').progress();
                            if(all_v == 0){all_v = -1};
                            pprogress.progress('set progress', all_v);

                            // adjust table height
                            var table_height = self.board.find('.dataTables_wrapper').height();
                            self._board.adjust_height_by_content(table_height);
                        },
                        error: function(result){
                            pcontent.empty();
                            pcontent.append('<p>Load progress fail!</p>');

                            // adjust table height
                            var table_height = self.board.find('.dataTables_wrapper').height();
                            self._board.adjust_height_by_content(table_height);
                        },
                    });
                },
            });
    },
};

