function getKlineData(param, callback) {
    var symbol = param.symbol;
    var v1InstrumentsParam = tickflow.tickflowParam(param);
    console.log("getKlineData v1InstrumentsParam", v1InstrumentsParam);
    tickflow.v1InstrumentsAsync(v1InstrumentsParam, function (stock) {
        console.log("getKlineData v1InstrumentsData", stock);
        var klineParam = {
            key: param.key,
            symbol: param.symbol,
            period: param.period,
            startDate: stock.data[0].ext.listing_date,
            endDate: blog.dateFormat(moment()),
            adjust: param.adjust,
        };

        console.log("getKlineData klineParam", klineParam);

        var v1KlinesParam = tickflow.tickflowParam(klineParam);
        console.log("getKlineData v1KlinesParam", v1KlinesParam);
        var kline = tickflow.v1KlinesAsync(v1KlinesParam, function (data) {
            console.log("getKlineData v1KlinesData", data);
            v1KlinesParam.count = blog.dateDiffDays(klineParam.endDate, klineParam.startDate) + 1;
            var periodDays = { '日线': 1, '周线': 7, '月线': 30 }[klineParam.period] || 1;
            v1KlinesParam.count = Math.ceil(v1KlinesParam.count / periodDays);
            callback({
                meta: stock.data[0],
                klines: data.data
            });
        });
    });
}

function buildKLineData(param, data, config) {
    if (blog.isNull(data)) {
        return;
    }
    var result = {};
    result.symbol = param.symbol;
    result.items = [];
    var count = data.timestamp.length;
    result.count = count;
    var avgPrev = blog.round(data.amount[0] / data.volume[0] / 100, 2);
    for (var index = 0; index < count; index++) {
        var avg = blog.round(data.amount[index] / data.volume[index] / 100, 2);
        var date = blog.dateFormat(moment(data.timestamp[index]));
        var open = avgPrev;
        var close = avg;

        result.items.push({
            日期: date,
            open: open,
            close: close,
            high: Math.max(avg, avgPrev),
            low: Math.min(avg, avgPrev),
            开盘价: open,
            最高价: Math.max(avg, avgPrev),
            最低价: Math.min(avg, avgPrev),
            收盘价: close,
            涨跌额: blog.round(close - open, 2),
            涨跌幅: blog.round((close - open) / open * 100, 2),
            成交量: data.volume[index] * 100,
            成交量万手: blog.round(data.volume[index] / 100, 2),
            成交额: data.amount[index],
            均价: avg,
            换手率: 1,
        });
        avgPrev = avg;
    }
    return result;
}

function calculateKLine(klineData) {
    if (blog.isNull(klineData) || blog.isNull(klineData.config)) {
        console.log("calculateKLine param error", klineData);
        return;
    }
    if (blog.isEmptyArray(klineData.items)) {
        console.log("calculateKLine klineData.items is empty", klineData);
        return;
    }
    console.log("calculateKLine begin", klineData, klineData.config);
    kline.calculateAndSetMA(klineData.items, klineData.config.ma);
    kline.calculateAndSetMACD(klineData.items, klineData.config.macd);
    kline.calculateAndSetBOLL(klineData.items, klineData.config.boll);
    kline.calculateAndSetOVB(klineData.items, klineData.config.ovb);
    kline.calculateAndSetKDJ(klineData.items, klineData.config.kdj);
    console.log("calculateKLine end", klineData, klineData.config);
    console.log("calculateKLine end last item", klineData.items[klineData.items.length - 1]);
}