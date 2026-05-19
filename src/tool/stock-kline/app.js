var TICK_FLOW_API_KEY_CACHE_KEY = "stockKLineTickFlowApiKey";
var klineChart = echarts.init(this.klineChartDiv);
var klineMacdChart = echarts.init(this.klineMacdChartDiv);
var klineCountChart = echarts.init(this.klineCountChartDiv);
var klineOvbChart = echarts.init(this.klineOvbChartDiv);

var charts = [klineChart, klineMacdChart, klineCountChart, klineOvbChart];
onChartDispatchDataZoom(charts);
onChartDispatchToolTip(charts);

blog.tryLoadInputValueFromLocalStorage(TICK_FLOW_API_KEY_CACHE_KEY);
if (symbolList) {
    document.getElementById("stockKLineSymbol").value = symbolList[0];
}

function loadStockKLineSymbols() {
    var symbolList = blogCache.getCacheObject("stockKLineSymbol");
    if (symbolList) {
        var datalist = document.getElementById("stockKLineSymbolList");
        datalist.innerHTML = "";
        symbolList.forEach(function (symbol) {
            var option = document.createElement("option");
            option.value = symbol;
            option.innerHTML = symbol;
            datalist.appendChild(option);
        });
    }
}

function renderKLine() {
    var param = {
        key: document.getElementById(TICK_FLOW_API_KEY_CACHE_KEY).value,
        symbol: document.getElementById("stockKLineSymbol").value
    };
    blog.trySaveInputValueToLocalStorage(TICK_FLOW_API_KEY_CACHE_KEY);
    blogCache.addSet("stockKLineSymbol", param.symbol);
    loadStockKLineSymbols();
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