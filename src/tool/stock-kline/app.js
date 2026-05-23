var TICK_FLOW_API_KEY_CACHE_KEY = "stockKLineTickFlowApiKey";
var SYMBOL_HISTORY_KEY = "stockKLineSymbolHistory";
var klineChart = echarts.init(this.klineChartDiv);
var klineMacdChart = echarts.init(this.klineMacdChartDiv);
var klineCountChart = echarts.init(this.klineCountChartDiv);
var klineOvbChart = echarts.init(this.klineOvbChartDiv);

var charts = [klineChart, klineMacdChart, klineCountChart, klineOvbChart];
onChartDispatchDataZoom(charts);
onChartDispatchToolTip(charts);


new Vue({
    el: '#app',
    data: {
        symbol: '000001',
        period: '日线',
        adjust: '前复权',
        symbolHistory: {},
        loading: false,
        apiKey: ''
    },
    created: function () {
        this.apiKey = blog.cacheGet(TICK_FLOW_API_KEY_CACHE_KEY) || '';
        this.loadSymbolHistory();
    },
    computed: {
        sortedSymbolHistory: function () {
            var history = this.symbolHistory;
            return Object.keys(history)
                .sort(function (a, b) { return history[a].localeCompare(history[b]); })
                .map(function (code) { return { code: code, name: history[code] }; });
        }
    },
    methods: {
        loadSymbolHistory: function () {
            var history = blog.cacheGet(SYMBOL_HISTORY_KEY);
            if (history) {
                this.symbolHistory = history;
                var symbols = Object.keys(history);
                if (symbols.length > 0) {
                    this.symbol = symbols[0];
                }
            }
        },
        saveSymbolHistory: function (symbol, name) {
            var map = blog.cacheGet(SYMBOL_HISTORY_KEY) || {};
            map[symbol] = name;
            blog.cacheSet(SYMBOL_HISTORY_KEY, map);
            this.symbolHistory = map;
        },
        removeSymbol: function (code) {
            var map = blog.cacheGet(SYMBOL_HISTORY_KEY) || {};
            delete map[code];
            blog.cacheSet(SYMBOL_HISTORY_KEY, map);
            this.symbolHistory = map;
        },
        renderKLine: function () {
            var self = this;
            if (!self.apiKey) {
                var key = prompt('TickFlow API Key');
                if (!key) {
                    alert('TickFlow API Key');
                    return;
                }
                self.apiKey = key;
            }
            blog.cacheSet(TICK_FLOW_API_KEY_CACHE_KEY, self.apiKey);

            var param = {
                key: self.apiKey,
                symbol: self.symbol,
                period: self.period,
                adjust: self.adjust
            };
            self.loading = true;
            getKlineData(param, function (data) {
                console.log('getKlineData', data);
                var klineDataConfig = kline.defaultKlineConfig();
                var klineData = buildKLineData(param, data.klines, klineDataConfig);
                klineData.meta = data.meta;
                klineData.config = klineDataConfig;
                klineData.config.color = buildKlineColorConfig();
                klineData.config.zoomStart = Math.max(0, (klineData.count - 90) * 100 / klineData.count);

                calculateKLine(klineData);

                klineChart.setOption(buildKLineChartOption(klineData));
                klineMacdChart.setOption(buildKLineMacdChartOption(klineData));
                klineCountChart.setOption(buildKLineCountChartOption(klineData));
                klineOvbChart.setOption(buildKLineOvbChartOption(klineData));
                self.loading = false;
                document.getElementById('stockName').innerHTML = data.meta.name;
                self.saveSymbolHistory(param.symbol, data.meta.name);
            });
        }
    }
});