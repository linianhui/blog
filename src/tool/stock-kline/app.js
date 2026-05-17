var klineChart = echarts.init(this.klineChartDiv);
var klineMacdChart = echarts.init(this.klineMacdChartDiv);
var klineCountChart = echarts.init(this.klineCountChartDiv);
var klineOvbChart = echarts.init(this.klineOvbChartDiv);

var charts = [klineChart, klineMacdChart, klineCountChart, klineOvbChart];
onChartDispatchDataZoom(charts);
onChartDispatchToolTip(charts);

blog.tryLoadInputValueFromLocalStorage("stockKLineTickFlowApiKey");
blog.tryLoadInputValueFromLocalStorage("stockKLineSymbol");

function removeCache() {
    if (!window.localStorage) {
        return;
    }
    var stockKLineTickFlowApiKeyValue = localStorage.getItem("stockKLineTickFlowApiKey");
    localStorage.clear();
    localStorage.setItem("stockKLineTickFlowApiKey", stockKLineTickFlowApiKeyValue);
}

function renderKLine() {
    var param = {
        key: document.getElementById("stockKLineTickFlowApiKey").value,
        symbol: document.getElementById("stockKLineSymbol").value
    };
    blog.trySaveInputValueToLocalStorage("stockKLineTickFlowApiKey");
    blog.trySaveInputValueToLocalStorage("stockKLineSymbol");
    document.getElementById("renderButton").disabled = "disabled";
    getKlineData(param, function (data) {
        console.log("getKlineData", data);
        var klineDataConfig = kline.defaultKlineConfig();
        var klineData = buildKLineData(param, data.klines, klineDataConfig);
        klineData.meta = data.meta;
        klineData.config = klineDataConfig;
        klineData.config.color = buildKlineColorConfig();
        klineData.config.zoomStart = Math.max(0, (klineData.count - 60) * 100 / klineData.count);

        calculateKLine(klineData);

        klineChart.setOption(buildKLineChartOption(klineData));
        klineMacdChart.setOption(buildKLineMacdChartOption(klineData));
        klineCountChart.setOption(buildKLineCountChartOption(klineData));
        klineOvbChart.setOption(buildKLineOvbChartOption(klineData));
        document.getElementById("renderButton").disabled = "";
        document.getElementById("stockName").innerHTML = data.meta.name;
    });
}