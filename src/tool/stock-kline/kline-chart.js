
function buildKlineColorConfig() {
    return {
        avg: '#CCC',
        red: '#dd2200',
        green: '#337f4c',
        gray: '#333',
        dif: '#ff9100',
        dea: '#0066cc',
        ma5: '#ff9100',
        ma10: '#0066cc',
        ma20: '#dd05ab',
        ma30: '#ff7042',
        ma60: '#5bd3a0',
        turnoverRate: '#CCC',
        bollUP: '#ff9306',
        bollMA: '#1472d0',
        bollDN: '#de0cad',
    };
}

function buildKLineChartOption(klineData) {
    if (blog.isNull(klineData) || blog.isEmptyArray(klineData.items) || blog.isNull(klineData.config)) {
        console.log("buildKLineChartOption param error", klineData);
        return;
    }

    var config = klineData.config;
    var series = [];
    series.push({
        name: '日K',
        type: 'candlestick',
        dimensions: ['日期', 'open', 'close', 'high', 'low'],
        encode: {
            x: '日期',
            y: ['open', 'close', 'high', 'low'],
            tooltip: ['开盘价', '收盘价', '最高价', '最低价'],
        },
        itemStyle: {
            color: config.color.red,
            color0: config.color.green,
            borderColor: config.color.red,
            borderColor0: config.color.green,
            borderColorDoji: config.color.gray,
        }
    });

    if (config.ma.periods) {
        for (var i = 0; i < config.ma.periods.length; i++) {
            var period = config.ma.periods[i];
            series.push(buildChartLine({
                name: 'MA' + period,
                color: config.color['ma' + period],
                x: '日期',
                y: 'ma' + period
            }));
        }
    }

    // series.push(buildChartLine({
    //     name: 'BOLL-UP',
    //     color: config.color.bollUP,
    //     x: '日期',
    //     y: 'bollUP'
    // }));

    // series.push(buildChartLine({
    //     name: 'BOLL-MA',
    //     color: config.color.bollMA,
    //     x: '日期',
    //     y: 'bollMA'
    // }));

    // series.push(buildChartLine({
    //     name: 'BOLL-DN',
    //     color: config.color.bollDN,
    //     x: '日期',
    //     y: 'bollDN'
    // }));

    series.push(buildChartLine({
        name: '均价',
        yAxisIndex: 0,
        color: config.color.avg,
        x: '日期',
        y: '均价',
        valueFormatter: x => x + '元'
    }));

    // series.push(buildChartLine({
    //     name: '换手率',
    //     yAxisIndex: 1,
    //     color: config.color.turnoverRate,
    //     x: '日期',
    //     y: '换手率',
    //     valueFormatter: x => x + '%'
    // }));

    return {
        tooltip: buildChartToolTip(),
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside' })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [
            buildChartYAxis({ name: '股价(元)' }),
            //buildChartYAxis({ name: '换手率(%)' })
        ],
        series: series
    };
}

function buildKLineCountChartOption(klineData) {
    if (blog.isNull(klineData) || blog.isEmptyArray(klineData.items) || blog.isNull(klineData.config)) {
        console.log("buildKLineCountChartOption param error", klineData);
        return;
    }

    var config = klineData.config;
    return {
        tooltip: buildChartToolTip(),
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside' })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [buildChartYAxis({ name: '成交量(万手)' }),],
        series: [
            buildChartBar({
                name: '成交量',
                color: x => x.data.收盘价 >= x.data.开盘价 ? config.color.red : config.color.green,
                x: '日期',
                y: '成交量万手',
                valueFormatter: x => x + '万手'
            })
        ]
    };
}

function buildKLineOvbChartOption(klineData) {
    if (blog.isNull(klineData) || blog.isEmptyArray(klineData.items) || blog.isNull(klineData.config)) {
        console.log("buildKLineOvbChartOption param error", klineData);
        return;
    }

    var config = klineData.config;
    return {
        tooltip: buildChartToolTip(),
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside' })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [buildChartYAxis({ name: 'OVB' }),],
        series: [
            buildChartLine({
                name: 'OVB',
                color: config.color.red,
                x: '日期',
                y: 'ovb'
            })
        ]
    };
}

function buildKLineMacdChartOption(klineData) {
    if (blog.isNull(klineData) || blog.isEmptyArray(klineData.items) || blog.isNull(klineData.config)) {
        console.log("buildKLineCountChartOption param error", klineData);
        return;
    }

    var config = klineData.config;
    var macd = config.macd;
    var name = 'MACD(' + macd.shortPeriod + ',' + macd.longPeriod + ',' + macd.signalPeriod + ')';
    return {
        tooltip: buildChartToolTip(),
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside' }), buildChartDataZoom({ type: 'slider' })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid({ bottom: 60 }),
        xAxis: [buildChartXAxis({ show: true })],
        yAxis: [buildChartYAxis({ name: name }),],
        series: [
            buildChartLine({
                name: 'DIF',
                color: config.color.dif,
                x: '日期',
                y: 'macdDIF'
            }),
            buildChartLine({
                name: 'DEA',
                color: config.color.dea,
                x: '日期',
                y: 'macdDEA'
            }),
            buildChartBar({
                name: 'MACD',
                color: x => x.data.macd >= 0 ? config.color.red : config.color.green,
                x: '日期',
                y: 'macd'
            })
        ]
    };
}

function buildChartLine(option) {
    option = option || {};
    return {
        name: option.name,
        yAxisIndex: option.yAxisIndex,
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: {
            color: option.color
        },
        lineStyle: {
            width: 1
        },
        z: 0,
        dimensions: [option.x, option.y],
        encode: {
            x: option.x,
            y: option.y
        },
        tooltip: {
            valueFormatter: option.valueFormatter
        },
    };
}

function buildChartBar(option) {
    option = option || {};
    return {
        name: option.name,
        type: 'bar',
        smooth: true,
        showSymbol: false,
        itemStyle: {
            color: option.color
        },
        dimensions: [option.x, option.y],
        encode: {
            x: option.x,
            y: option.y
        },
        tooltip: {
            valueFormatter: option.valueFormatter
        },
    };
}

function buildChartYAxis(option) {
    option = option || {};
    return {
        name: option.name,
        type: 'value',
        scale: true
    };
}

function buildChartXAxis(option) {
    option = option || {};
    return {
        id: 'xAxis0',
        type: 'category',
        show: option.show
    };
}

function buildChartGrid(option) {
    option = option || {};
    return [
        {
            id: 'guid0',
            top: 50,
            left: 20,
            right: 20,
            containLabel: true,
            bottom: option.bottom
        }
    ];
}

function buildChartLegend() {
    return {
        id: 'legend0',
        show: true,
        top: 20
    };
}

function buildChartDataset(klineData) {
    return {
        id: 'dataset0',
        sourceHeader: false,
        source: klineData.items
    };
}

function buildChartDataZoom(option) {
    option = option || {};
    return {
        type: option.type,
        start: 50,
        end: 100
    };
}

function buildChartToolBox() {
    return {
        id: 'toolbox0',
        show: false,
        right: '20px',
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
        }
    };
}

function buildChartToolTip() {
    return {
        id: 'tooltip0',
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        },
    };
}