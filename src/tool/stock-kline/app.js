var klineChart = echarts.init(this.klineChartDiv);
var xueqiu = getXueqiuKlineData();

var klineData = buildKLineDataFromXueqiu(xueqiu.data);
klineData.config = kline.defaultKlineConfig();
klineData.config.color = buildKlineColorConfig();

calculateKLine(klineData);

var klineChartOption = buildKLineChartOption(klineData);
klineChart.setOption(klineChartOption);