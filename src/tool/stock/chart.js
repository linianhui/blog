var chartColor = {
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
};

var kChart = echarts.init(this.kChartDiv);
var kChartDatas = kData.itemsTimeAsc.reverse();
var kChartOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    axisPointer: {
        link: [
            {
                xAxisId: 'all'
            }
        ]
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
        top: 20,
        selected: {
            '日K': true,
            'MA5': true,
            'MA10': false,
            'MA20': true,
            'MA30': false,
            'MA60': false,
        }
    },
    grid: [
        {
            id: 'Grid股价',
            top: 80,
            left: 20,
            right: 20,
            height: 360,
            containLabel: true
        },
        {
            id: 'Grid成交量',
            top: 460,
            left: 20,
            right: 20,
            containLabel: true,
            height: 100
        },
        {
            id: 'GridMACD',
            top: 580,
            left: 20,
            right: 20,
            containLabel: true,
            height: 160,
            bottom: 60
        },
    ],
    xAxis: [
        {
            id: 'x股价',
            type: 'category',
            show: false,
            gridId: 'Grid股价'
        },
        {
            id: 'x成交量',
            type: 'category',
            gridId: 'Grid成交量',
            show: false
        },
        {
            id: 'xMACD',
            type: 'category',
            gridId: 'GridMACD'
        }
    ],
    yAxis: [
        {
            id: 'y股价',
            name: '股价(元)',
            type: 'value',
            scale: true,
            gridId: 'Grid股价'
        },
        {
            id: 'y换手率',
            name: '换手率(%)',
            type: 'value',
            scale: true,
            position: 'right',
            gridId: 'Grid股价'
        },
        {
            id: 'y成交量',
            name: '成交量(万手)',
            type: 'value',
            scale: true,
            gridId: 'Grid成交量',
            axisLabel: {
                formatter: x => blog.round(x / 10000_00)
            }
        },
        {
            id: 'yMACD',
            name: 'MACD',
            type: 'value',
            scale: true,
            gridId: 'GridMACD'
        }
    ],
    series: [
        {
            name: '日K',
            type: 'candlestick',
            xAxisId: 'x股价',
            yAxisId: 'y股价',
            dimensions: ['日期', '开盘价', '收盘价', '最高价', '最低价'],
            encode: {
                x: '日期',
                y: ['开盘价', '收盘价', '最高价', '最低价'],
                tooltip: ['开盘价', '收盘价', '最高价', '最低价'],
            },
            itemStyle: {
                color: chartColor.red,
                color0: chartColor.green,
                borderColor: chartColor.red,
                borderColor0: chartColor.green,
                borderColorDoji: chartColor.gray,
            }
        },
        {
            name: 'MA5',
            type: 'line',
            xAxisId: 'x股价',
            yAxisId: 'y股价',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma5
            },
            encode: {
                x: '日期',
                y: 'ma5'
            }
        },
        {
            name: 'MA10',
            type: 'line',
            xAxisId: 'x股价',
            yAxisId: 'y股价',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma10
            },
            encode: {
                x: '日期',
                y: 'ma10'
            }
        },
        {
            name: 'MA20',
            type: 'line',
            xAxisId: 'x股价',
            yAxisId: 'y股价',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma20
            },
            encode: {
                x: '日期',
                y: 'ma20'
            }
        },
        {
            name: 'MA30',
            type: 'line',
            xAxisId: 'x股价',
            yAxisId: 'y股价',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma30
            },
            encode: {
                x: '日期',
                y: 'ma30'
            }
        },
        {
            name: 'MA60',
            type: 'line',
            xAxisId: 'x股价',
            yAxisId: 'y股价',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.ma60
            },
            encode: {
                x: '日期',
                y: 'ma60'
            }
        },
        {
            name: '换手率',
            type: 'line',
            xAxisId: 'x股价',
            yAxisId: 'y换手率',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1,
                color: chartColor.turnoverRate
            },
            encode: {
                x: '日期',
                y: '换手率'
            },
            tooltip: {
                valueFormatter: x => x + '%'
            }
        },
        {
            name: '成交量',
            type: 'bar',
            xAxisId: 'x成交量',
            yAxisId: 'y成交量',
            smooth: true,
            showSymbol: false,
            itemStyle: {
                color: x => x.data.收盘价 >= x.data.开盘价 ? chartColor.red : chartColor.green,
            },
            encode: {
                x: '日期',
                y: '成交量'
            },
            tooltip: {
                valueFormatter: x => blog.round(x / 10000_00) + '万手'
            }
        },
        {

            name: 'MACD-DIF',
            type: 'line',
            xAxisId: 'xMACD',
            yAxisId: 'yMACD',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                color: chartColor.dif,
                width: 1
            },
            encode: {
                x: '日期',
                y: 'macdDIF'
            }
        },
        {
            name: 'MACD-DEA',
            type: 'line',
            xAxisId: 'xMACD',
            yAxisId: 'yMACD',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                color: chartColor.dea,
                width: 1
            },
            encode: {
                x: '日期',
                y: 'macdDEA'
            }
        },
        {
            name: 'MACD',
            type: 'bar',
            xAxisId: 'xMACD',
            yAxisId: 'yMACD',
            smooth: true,
            showSymbol: false,
            itemStyle: {
                color: x => x.data.macd >= 0 ? chartColor.red : chartColor.green,
            },
            encode: {
                x: '日期',
                y: 'macd'
            }
        }
    ]
};

kChart.setOption(kChartOption);