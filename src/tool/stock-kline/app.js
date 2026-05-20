var TICK_FLOW_API_KEY_CACHE_KEY = "stockKLineTickFlowApiKey";
var SYMBOL_KEY = "stockKLineSymbol";
var klineChart = echarts.init(this.klineChartDiv);
var klineMacdChart = echarts.init(this.klineMacdChartDiv);
var klineCountChart = echarts.init(this.klineCountChartDiv);
var klineOvbChart = echarts.init(this.klineOvbChartDiv);

var charts = [klineChart, klineMacdChart, klineCountChart, klineOvbChart];
onChartDispatchDataZoom(charts);
onChartDispatchToolTip(charts);
loadStockKLineSymbol();


function loadStockKLineSymbol() {
    var symbolList = blog.cacheGet(SYMBOL_KEY);
    if (symbolList) {
        document.getElementById(SYMBOL_KEY).value = symbolList[0];
    }
}

function loadStockKLineSymbols() {
    var symbolList = blog.cacheGet(SYMBOL_KEY);
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
    var apiKey = blog.cacheGet(TICK_FLOW_API_KEY_CACHE_KEY);
    if (!apiKey) {
        apiKey = prompt("TickFlow API Key");
        if (!apiKey) {
            alert("TickFlow API Key");
            return;
        }
    }

    var param = {
        key: apiKey,
        symbol: document.getElementById(SYMBOL_KEY).value,
        period: document.querySelector('input[name="stockKLinePeriod"]:checked').value,
        adjust: document.querySelector('input[name="stockKLineAdjust"]:checked').value
    };
    blog.cacheSet(TICK_FLOW_API_KEY_CACHE_KEY, apiKey);
    blog.cacheSetPut(SYMBOL_KEY, param.symbol);
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