var klineChart = echarts.init(this.klineChartDiv);
var klineMacdChart = echarts.init(this.klineMacdChartDiv);
var klineCountChart = echarts.init(this.klineCountChartDiv);
var klineOvbChart = echarts.init(this.klineOvbChartDiv);
var data = getKlineData('SZ300921');

var klineDataConfig = kline.defaultKlineConfig();
var klineData = buildKLineData(data.data, klineDataConfig);
klineData.config = klineDataConfig;
klineData.config.color = buildKlineColorConfig();

calculateKLine(klineData);

klineChart.setOption(buildKLineChartOption(klineData));
klineMacdChart.setOption(buildKLineMacdChartOption(klineData));
klineCountChart.setOption(buildKLineCountChartOption(klineData));
klineOvbChart.setOption(buildKLineOvbChartOption(klineData));

var charts = [klineChart, klineMacdChart, klineCountChart, klineOvbChart];

onChartDispatchDataZoom(charts);
onChartDispatchToolTip(charts);