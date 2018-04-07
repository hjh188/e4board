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
        textAlign: 'center',
        x:'center',
        y:'top',
    };

    var tooltip = {
        trigger: 'item',
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

    var _data = qdata.Select(function(item){return {'name': moment(new Date(item.x_data)).toString(), 'value': [item.x_data, item.y_data, item.legend]}}).ToArray();

    var yAxis = {
        name: param.y_name,
        type : 'value',
        //minInterval: 1,
        //min: 0,
        boundaryGap: [0, '100%'],
        splitLine: {
            show: false
        }
    };

    var xAxis = {
        type: 'time',
        splitLine: {
            show: false
        },
    };

    var series = [{
        name: '',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: _data,
        barGap: '20%',
    }];


    var option = {
        title: title,
        tooltip: tooltip,
        toolbox: toolbox,
        xAxis: xAxis,
        yAxis: yAxis,
        series: series,
    };

    myChart.setOption(option);
}
