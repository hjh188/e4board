var board_execute = function(board){
    var chart_div = board.find('.dashboard_chart');
    var _board = new Board(board);
    var data = _board.get_data();
    var param = _board.get_param();

    var myChart = echarts.init(chart_div[0]);

    var qdata = Enumerable.From(data);

    var title = {
        text: param.title_text
    };

    var tooltip = {
        trigger: 'axis'
    };

    var toolbox = {
        show : true,
        feature : {
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar']},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    };

    var legend_data = qdata
                        .Select(function(d){return d.l_data})
                        .Distinct()
                        .ToArray();

    var legend = {
        data: legend_data
    };

    var series = [];
    $.each(legend_data, function(i, item){
        var sd = qdata
                   .Where(function(d){return d.l_data == item})
                   .Select("$.y_data")
                   .ToArray();
        var s = {name: item, type: 'bar', data: sd};

        if (param.stack){s.stack = param.stack};
        if (param.markLine){
            s.markPoint = {
                data : [
                    {type : 'max', name: '最大值'},
                    {type : 'min', name: '最小值'}
                ]
            },
            s.markLine = {
                data : [
                    {type : 'average', name: '平均值'}
                ]
            }
        }

        series.push(s);
    });

    var yAxis = {
        name: param.y_name,
        type : 'value'
    };

    var xAxis_data = qdata
                       .Where(function(d){return d.l_data == legend_data[0]})
                       .Select("$.x_data")
                       .ToArray();
    var xAxis = {
        type: 'category',
        data: xAxis_data
    };


    var option = {
        title: title,
        tooltip: tooltip,
        toolbox: toolbox,
        legend: legend,
        xAxis: xAxis,
        yAxis: yAxis,
        series: series,
    };

    myChart.setOption(option);
}
