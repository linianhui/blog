var chartColor = {
    red: '#dd2200',
    green: '#337f4c',
    dif: '#ff9100',
    dea: '#0066cc',
    ma5: '#ff9100',
    ma10: '#0066cc',
    ma20: '#dd05ab',
    ma30: '#ff7042',
    ma60: '#5bd3a0',
};

var kChart = echarts.init(this.kChartDiv);
var kChartDatas = kData.itemsTimeAsc.reverse();
var kChartOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            link: { xAxisIndex: 'all' },
            type: 'cross'
        }
    },
    toolbox: {
        show: true,
        right: '20px',
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
        }
    },
    dataZoom: [
        {
            type: 'inside',
            xAxisIndex: [0, 1, 2],
            start: 90,
            end: 100
        }, {
            type: 'slider',
            xAxisIndex: [0, 1, 2],
            start: 90,
            end: 100
        }
    ],
    dataset: {
        sourceHeader: false,
        source: kChartDatas
    },
    legend: {
        show: true,
        top: 20
    },
    grid: [
        {
            top: 60,
            left: 20,
            right: 20,
            height: 360,
            containLabel: true
        },
        {
            top: 420,
            left: 20,
            right: 20,
            containLabel: true,
            height: 80
        },
        {
            top: 500,
            left: 20,
            right: 20,
            containLabel: true,
            height: 140,
            bottom: 60
        }
    ],
    xAxis: [
        {
            type: 'category',
            show: false,
        },
        {
            type: 'category',
            gridIndex: 1,
            show: false,
        },
        {
            type: 'category',
            gridIndex: 2,
        }
    ],
    yAxis: [
        {
            type: 'value',
            scale: true,
        },
        {
            type: 'value',
            scale: true,
            gridIndex: 1,
            axisLabel: {
                formatter: x => blog.round(x / 10000_00) + '万手'
            }
        },
        {
            type: 'value',
            scale: true,
            gridIndex: 2,
        }
    ],
    series: [
        {
            name: '日K',
            type: 'candlestick',
            dimensions: ['date', 'open', 'close', 'high', 'low'],
            encode: {
                x: 'date',
                y: ['open', 'close', 'high', 'low'],
                tooltip: ['open', 'close', 'high', 'low'],
            },
            itemStyle: {
                color: chartColor.red,
                color0: chartColor.green,
                borderColor: chartColor.red,
                borderColor0: chartColor.green,
            }
        },
        {
            name: 'MA-5',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma5
            },
            encode: {
                x: 'date',
                y: 'ma5'
            }
        },
        {
            name: 'MA-10',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma10
            },
            encode: {
                x: 'date',
                y: 'ma10'
            }
        }
        ,
        {
            name: 'MA-20',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma20
            },
            encode: {
                x: 'date',
                y: 'ma20'
            }
        }, {
            name: 'MA-30',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma30
            },
            encode: {
                x: 'date',
                y: 'ma30'
            }
        }, {
            name: 'MA-60',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma60
            },
            encode: {
                x: 'date',
                y: 'ma60'
            }
        },
        {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: '成交量',
            type: 'bar',
            smooth: true,
            showSymbol: false,
            itemStyle: {
                color: x => x.data.close >= x.data.open ? chartColor.red : chartColor.green,
            },
            encode: {
                x: 'date',
                y: 'count'
            }
        },
        {
            xAxisIndex: 2,
            yAxisIndex: 2,
            name: 'MACD-DIF',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                color: chartColor.dif,
                width: 1
            },
            encode: {
                x: 'date',
                y: 'macdDIF'
            }
        },
        {
            xAxisIndex: 2,
            yAxisIndex: 2,
            name: 'MACD-DEA',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                color: chartColor.dea,
                width: 1
            },
            encode: {
                x: 'date',
                y: 'macdDEA'
            }
        },
        {
            xAxisIndex: 2,
            yAxisIndex: 2,
            name: 'MACD',
            type: 'bar',
            smooth: true,
            showSymbol: false,
            itemStyle: {
                color: x => x.data.macd >= 0 ? chartColor.red : chartColor.green,
            },
            encode: {
                x: 'date',
                y: 'macd'
            }
        }
    ]
};

kChart.setOption(kChartOption);