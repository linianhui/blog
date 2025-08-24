var klineChart = echarts.init(this.klineChartDiv);
var klineMacdChart = echarts.init(this.klineMacdChartDiv);
var klineCountChart = echarts.init(this.klineCountChartDiv);
var xueqiu = getXueqiuKlineData();

var klineData = buildKLineDataFromXueqiu(xueqiu.data);
klineData.config = kline.defaultKlineConfig();
klineData.config.color = buildKlineColorConfig();

calculateKLine(klineData);

klineChart.setOption(buildKLineChartOption(klineData));
klineMacdChart.setOption(buildKLineMacdChartOption(klineData));
klineCountChart.setOption(buildKLineCountChartOption(klineData));

var charts = [klineChart, klineMacdChart, klineCountChart];

onChartDispatchDataZoom(charts);
onChartDispatchToolTip(charts);