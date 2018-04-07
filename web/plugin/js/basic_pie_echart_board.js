var board_execute = function(board){
    var chart_div = board.find('.dashboard_chart');
    var _board = new Board(board);
    var data = _board.get_data();
    var param = _board.get_param();

    chart_div.css("height", board.find(".board_content").height()*1.0);

    chart_div.css("overflow-y", "hidden");
    chart_div.css("overflow-x", "hidden");

    var myChart = echarts.init(chart_div[0]);

    var qdata = Enumerable.From(data);

    var title = {
        text: param.title_text,
        x: 'center'
    };

    var tooltip = {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    };

    var legend_data = qdata
                        .Select(function(d){return d.l_data})
                        .Distinct()
                        .ToArray();

    var legend = {
        orient: 'vertical',
        left: 'left',
        data: legend_data
    };

    var series = [];
    $.each(legend_data, function(i, item){
        var sd = qdata
                   .Select(function(d){return {name: d.l_data, value: d.y_data}})
                   .ToArray();
        var s = {
            name: item,
            type: 'pie',
            data: sd,
            radius : '55%',
            center: ['50%', '60%'], 
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        formatter: '{b} : {c} ({d}%)',
                    },
                    labelLine :{show:true}
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };

        series.push(s);
    });

    var option = {
        title: title,
        tooltip: tooltip,
        //legend: legend,
        series: series,
    };

    myChart.setOption(option);
}
