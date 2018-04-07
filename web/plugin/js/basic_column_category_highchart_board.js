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
        _tooltip = {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
        },
        _title = {
            text: 'Title',
        },
        _xAxis = {
            type: 'category',
        },
        _yAxis = {
            title: {
                text: "Y",
            },
            opposite: false,
        },
        _legend = {
            enabled: true,
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
        };

    // Merge property from param outside
    if(param.xAxis){$.extend(_xAxis, param.xAxis);};
    if(param.yAxis){$.extend(_yAxis, param.yAxis);};
    if(param.title){$.extend(_title, param.title);};
    if(param.legend){$.extend(_legend, param.legend);};
    if(param.credits){$.extend(_credits, param.credits);};
    if(param.exporting){$.extend(_exporting, param.exporting);};
    if(param.plotOptions){$.extend(_plotOptions, param.plotOptions);};
    if(param.tooltip){$.extend(_tooltip, param.tooltip);};

    var legend_data = qdata
                        .Select(function(d){return d.legend})
                        .Distinct()
                        .ToArray();
    var _series = [];
    $.each(legend_data, function(i, name){
        var sd = qdata
                   .Where(function(d){return d.legend == name})
                   .Select(function(item){return [item.x, item.y]})
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
                    $.each(s_v, function(k, v){
                        s[k] = v;
                    });
                };
            });
        };

        _series.push(s);
    });

    // Init chart
    new Highcharts.chart({
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
    });

}
