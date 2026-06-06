
/**
 * 校验 klineData 是否有效，无效时打印日志并返回 true
 */
function isInvalidKlineData(klineData, callerName) {
    if (blog.isNull(klineData) || blog.isEmptyArray(klineData.items) || blog.isNull(klineData.config)) {
        console.log(callerName + " param error", klineData);
        return true;
    }
    return false;
}

/**
 * 格式化大数字（用于轴标签）
 */
function formatLargeNumber(v) {
    var absV = Math.abs(v);
    if (absV >= 100000000) {
        return (v / 100000000).toFixed(1) + '亿';
    }
    if (absV >= 10000) {
        return (v / 10000).toFixed(1) + '万';
    }
    if (absV >= 1000) {
        return (v / 1000).toFixed(1) + '千';
    }
    return v.toFixed(0);
}

function buildKlineColorConfig() {
    return {
        avg: '#CCC',
        red: '#dd2200',
        green: '#337f4c',
        gray: '#333',
        dif: '#E53935',
        dea: '#43A047',
        ma5: '#E53935',
        ma10: '#FB8C00',
        ma20: '#43A047',
        ma60: '#1E88E5',
        ma240: '#8E24AA',
        turnoverRate: '#CCC',
        bollUP: '#ff9306',
        bollMA: '#1472d0',
        bollDN: '#de0cad',
    };
}

function buildKLineChartOption(klineData) {
    if (isInvalidKlineData(klineData, "buildKLineChartOption")) {
        return;
    }

    const config = klineData.config;
    const series = [];
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
        },
        markPoint: buildMarkPoint('元')
    });

    if (config.ma.periods) {
        for (const period of config.ma.periods) {
            series.push(buildChartLine({
                name: 'MA' + period,
                color: config.color['ma' + period],
                x: '日期',
                y: 'ma' + period,
            }));
        }
    }

    const legend = buildChartLegend();
    legend.top = 0;
    const toolbox = buildChartToolBox();
    toolbox.top = 0;
    toolbox.feature.dataZoom = { show: true };
    toolbox.feature.restore = { show: true };
    const xAxis = buildChartXAxis({ show: true });
    xAxis.axisLine = { show: false };
    const zoom = buildChartDataZoom({ type: 'slider', start: config.zoomStart });
    zoom.top = 20;
    const grid = buildChartGrid();
    grid[0].top = 100;
    grid[0].bottom = 20;

    return {
        tooltip: buildChartToolTip(),
        toolbox: toolbox,
        dataZoom: [
            buildChartDataZoom({ type: 'inside', start: config.zoomStart }),
            zoom
        ],
        dataset: buildChartDataset(klineData),
        legend: legend,
        grid: grid,
        xAxis: [xAxis],
        yAxis: [buildChartYAxis({ name: '股价(元)' })],
        series: series
    };
}

function buildKLineCountChartOption(klineData) {
    if (isInvalidKlineData(klineData, "buildKLineCountChartOption")) {
        return;
    }

    const config = klineData.config;
    const tip = buildChartToolTip();
    tip.show = false;
    return {
        tooltip: tip,
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside', start: config.zoomStart })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [Object.assign(buildChartYAxis({ name: '成交量(万手)' }), {
            axisLabel: {
                formatter: function (v) {
                    return formatLargeNumber(v / 100);
                }
            }
        })],
        series: [
            buildChartBar({
                name: '成交量(万手)',
                color: x => x.data.收盘价 >= x.data.开盘价 ? config.color.red : config.color.green,
                x: '日期',
                y: '成交量',
                valueFormatter: x => x + '手',
                markPoint: buildMarkPoint('手')
            })
        ]
    };
}

function buildKLineObvChartOption(klineData) {
    if (isInvalidKlineData(klineData, "buildKLineObvChartOption")) {
        return;
    }

    const config = klineData.config;
    const tip = buildChartToolTip();
    tip.show = false;
    return {
        tooltip: tip,
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside', start: config.zoomStart })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [Object.assign(buildChartYAxis({ name: 'OBV' }), {
            axisLabel: { show: false }
        })],
        series: [
            buildChartLine({
                name: 'OBV',
                color: config.color.red,
                x: '日期',
                y: 'obv',
                markPoint: buildMarkPoint()
            })
        ]
    };
}

function buildKLineMacdChartOption(klineData) {
    if (isInvalidKlineData(klineData, "buildKLineMacdChartOption")) {
        return;
    }

    const config = klineData.config;
    const macd = config.macd;
    const name = 'MACD(' + macd.shortPeriod + ',' + macd.longPeriod + ',' + macd.signalPeriod + ')';
    const tip = buildChartToolTip();
    tip.show = false;
    return {
        tooltip: tip,
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside', start: config.zoomStart })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [buildChartYAxis({ name: name })],
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
                y: 'macd',
                markArea: {
                    silent: true,
                    data: [[{
                        yAxis: 0,
                        itemStyle: { color: 'rgba(255, 80, 80, 0.05)' }
                    }, {
                        yAxis: 'max'
                    }], [{
                        yAxis: 0,
                        itemStyle: { color: 'rgba(80, 180, 80, 0.05)' }
                    }, {
                        yAxis: 'min'
                    }]]
                },
                markPoint: buildMarkPoint()
            })
        ]
    };
}

function buildKLineKdjChartOption(klineData) {
    if (isInvalidKlineData(klineData, "buildKLineKdjChartOption")) {
        return;
    }

    const config = klineData.config;
    const tip = buildChartToolTip();
    tip.show = false;
    return {
        tooltip: tip,
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside', start: config.zoomStart })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [Object.assign(buildChartYAxis({ name: 'KDJ' }), {
            axisLabel: { show: false }
        })],
        series: [
            buildChartLine({
                name: 'K', color: '#ff9100', x: '日期', y: 'kdjK',
            }),
            buildChartLine({
                name: 'D', color: '#0066cc', x: '日期', y: 'kdjD'
            }),
            buildChartLine({
                name: 'J', color: '#dd05ab', x: '日期', y: 'kdjJ',
                markArea: {
                    silent: true,
                    data: [[{
                        yAxis: 50,
                        itemStyle: { color: 'rgba(255, 80, 80, 0.05)' }
                    }, {
                        yAxis: 'max'
                    }], [{
                        yAxis: 50,
                        itemStyle: { color: 'rgba(80, 180, 80, 0.05)' }
                    }, {
                        yAxis: 'min'
                    }]]
                },
                markPoint: buildMarkPoint()
            })
        ]
    };
}

function buildKLineMadiffChartOption(klineData) {
    if (isInvalidKlineData(klineData, "buildKLineMadiffChartOption")) {
        return;
    }

    const config = klineData.config;
    const tip = buildChartToolTip();
    tip.show = false;
    return {
        tooltip: tip,
        toolbox: buildChartToolBox(),
        dataZoom: [buildChartDataZoom({ type: 'inside', start: config.zoomStart })],
        dataset: buildChartDataset(klineData),
        legend: buildChartLegend(),
        grid: buildChartGrid(),
        xAxis: [buildChartXAxis()],
        yAxis: [
            Object.assign(buildChartYAxis({ name: 'MA60偏离率(%)' }), { gridIndex: 0 })
        ],
        series: [
            buildChartLine({
                name: 'R5', color: config.color.ma5, x: '日期', y: 'madiffR5',
                markPoint: buildMarkPoint('%'),
                markLine: {
                    silent: true,
                    data: [{ yAxis: 0 }],
                    symbol: 'none',
                    lineStyle: { color: '#666', width: 1, type: 'dashed' },
                    label: { show: false }
                },
                markArea: {
                    silent: true,
                    data: [[{
                        yAxis: 0,
                        itemStyle: { color: 'rgba(255, 80, 80, 0.05)' }
                    }, {
                        yAxis: 'max'
                    }], [{
                        yAxis: 0,
                        itemStyle: { color: 'rgba(80, 180, 80, 0.05)' }
                    }, {
                        yAxis: 'min'
                    }]]
                }
            }),
            buildChartLine({
                name: 'R10', color: config.color.ma10, x: '日期', y: 'madiffR10'
            }),
            buildChartLine({
                name: 'R20', color: config.color.ma20, x: '日期', y: 'madiffR20'
            })
        ]
    };
}

function buildChartLine(option = {}) {
    return {
        name: option.name,
        yAxisIndex: option.yAxisIndex,
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: option.color },
        lineStyle: Object.assign({ width: 1 }, option.lineStyle),
        z: 0,
        dimensions: [option.x, option.y],
        encode: { x: option.x, y: option.y },
        tooltip: { valueFormatter: option.valueFormatter },
        markPoint: option.markPoint,
        markLine: option.markLine,
        markArea: option.markArea,
    };
}

function buildChartBar(option = {}) {
    return {
        name: option.name,
        type: 'bar',
        itemStyle: { color: option.color },
        dimensions: [option.x, option.y],
        encode: { x: option.x, y: option.y },
        tooltip: { valueFormatter: option.valueFormatter },
        markPoint: option.markPoint,
        markArea: option.markArea,
    };
}

function buildChartYAxis(option = {}) {
    return { name: option.name, type: 'value', scale: true };
}

function buildChartXAxis(option = {}) {
    return { id: 'xAxis0', type: 'category', show: option.show };
}

function buildChartGrid(option = {}) {
    return [{
        id: 'guid0', top: 50, left: 20, right: 20,
        containLabel: true, bottom: option.bottom
    }];
}

function buildChartLegend() {
    return { id: 'legend0', show: true, top: 20 };
}

function buildChartDataset(klineData) {
    return { id: 'dataset0', sourceHeader: false, source: klineData.items };
}

function buildChartDataZoom(option = {}) {
    return {
        type: option.type,
        start: option.start || 90,
        end: 100,
        filterMode: 'filter'
    };
}

function buildChartToolBox() {
    return {
        id: 'toolbox0', show: false, right: '20px',
        feature: {
            dataZoom: { yAxisIndex: 'none' },
            restore: {},
            saveAsImage: {}
        }
    };
}

function buildChartToolTip() {
    return {
        id: 'tooltip0', trigger: 'axis',
        axisPointer: { type: 'cross' },
    };
}

/**
 * 计算 series 中最大值、最小值、最新值，生成 markPoint 配置
 * @param {array} items k线数据
 * @param {string} yField 要标记的字段名
 * @param {string} unit 值单位后缀
 */
function buildMarkPoint(unit) {
    unit = unit || '';
    return {
        symbol: 'pin',
        symbolSize: 36,
        label: {
            show: true,
            formatter: function (params) {
                return params.name + ': ' + params.value + unit;
            }
        },
        data: [
            { type: 'max', name: '最高', itemStyle: { color: '#dd2200' } },
            { type: 'min', name: '最低', itemStyle: { color: '#337f4c' } }
        ]
    };
}