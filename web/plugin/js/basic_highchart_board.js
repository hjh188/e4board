var board_execute = function(board){
    var chart_div = board.find('.dashboard_chart');

    var _board = new Board(board);
    var data = _board.get_data();
    var param = _board.get_param();

    chart_div.css("height", board.find(".board_content").height()*1.0);

    chart_div.css("overflow-y", "hidden");
    chart_div.css("overflow-x", "hidden");

    var qdata = Enumerable.From(data);


    // define chart data
    var _chart = {
            renderTo: chart_div[0],
            zoomType: 'xy',
        },
        _tooltip = {},
        _title = {
            text: 'Title',
        },
        _xAxis = {
            minRange: 3600*1000, // one hour
            type: 'datetime',
        },
        _yAxis = {
            title: {
                text: "Y",
            },
            opposite: false,
        },
        _legend = {
            enabled: true,
            maxHeight: 100
        },
        _credits = {
            enabled: false,
        },
        _exporting = {
            enabled: true,
        },
        _plotOptions = {
            column: {
                pointPadding: 0,
                borderWidth: 0,
                groupPadding: 0.2,
                shadow: false
            }
        },
        _scrollbar = {
            enabled: true,
        },
        _navigator = {
            enabled: true,
            height: 20,
        },
        _rangeSelector = {
            selected: 2,
            inputDateFormat: '%Y-%m-%d',
            buttons: [{
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'hour',
                count: 24,
                text: '24h'
            }, {
                type: 'day',
                count: 7,
                text: '7d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            },{
                type: 'all',
                text: 'All'
            }],
        };

    // Merge property from param outside
    if(param.xAxis){$.extend(_xAxis, param.xAxis);};
    if(param.yAxis){$.extend(_yAxis, param.yAxis);};
    if(param.title){$.extend(_title, param.title);};
    if(param.legend){$.extend(_legend, param.legend);};
    if(param.credits){$.extend(_credits, param.credits);};
    if(param.exporting){$.extend(_exporting, param.exporting);};
    if(param.plotOptions){$.extend(_plotOptions, param.plotOptions);};
    if(param.scrollbar){$.extend(_scrollbar, param.scrollbar);};
    if(param.navigator){$.extend(_navigator, param.navigator);};
    if(param.rangeSelector){$.extend(_rangeSelector, param.rangeSelector);};
    if(param.tooltip){$.extend(_tooltip, param.tooltip);};

    if(_xAxis.type != 'datetime'){
        _scrollbar.enabled = false;
        _navigator.enabled = false;
        _rangeSelector = {};
    };

    if(data.length == 0){
        _rangeSelector['enabled'] = false;
        //_rangeSelector['inputEnabled'] = false;
    }

    // process for series, in the original data, should at least set: x, y, legend
    var _data = {x: null, y: null, legend: null};
    if(data[0])
        $.each(data[0], function(k, v){
            // besides basic x, y, legend, extend more
            _data[k] = null;
        });

    var legend_data = qdata
                        .Select(function(d){return d.legend})
                        .Distinct()
                        .ToArray();
    var _series = [];
    var enable_found = false;
    $.each(legend_data, function(i, name){
        var sd = qdata
                   .Where(function(d){return d.legend == name})
                   .Select(function(item){
                       var value = $.extend(true, {}, _data);
                       $.each(item, function(k, v){
                           if(k == 'x' && _xAxis.type == 'datetime'){
                               value['x'] = moment.utc(item.x, "YYYY-MM-DD HH:mm:ss").valueOf();
                           }else{
                               value[k] = v;
                           }
                       });
                       return value;})
                   .ToArray();

        var s = {name: name, type: 'column', data: sd, visible: false};

        if(param.series){
            $.each(param.series, function(s_k, s_v){
                // set for all
                if(s_k.toLowerCase() == 'all'){
                    $.each(s_v, function(k, v){
                        s[k] = v;
                    });
                };
                // if set start with serie name attribute
                if(s.name.startsWith(s_k)){
                    enable_found = true;
                    $.each(s_v, function(k, v){
                        s[k] = v;
                    });
                };
            });
        };

        _series.push(s);
    });

    // at least enable one visiable
    if(!enable_found){
        if(_series.length > 0){
            _series[0].visible = true;
        }
    }

    // Init chart
    Highcharts.StockChart({
        chart: _chart,
        tooltip: _tooltip,
        title: _title,
        xAxis: _xAxis,
        yAxis: _yAxis,
        legend: _legend,
        plotOptions: _plotOptions,
        credits: _credits,
        exporting: _exporting,
        series: _series,
        rangeSelector: _rangeSelector,
        scrollbar: _scrollbar,
        navigator: _navigator,
    }, function(chart) {
            // apply the date pickers
            setTimeout(function() {
                $('input.highcharts-range-selector', $(chart.options.chart.renderTo)).datepicker()
            }, 0)
        });

    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        onSelect: function(dateText) {
            this.onchange();
            this.onblur();
        }
    });

}
