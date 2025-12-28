function getKlineData(symbol) {
    return JSON.parse(blog.httpGet('/tool/stock-kline/data/' + symbol + '.json'));
}

function buildKLineData(data, config) {
    if (blog.isNull(data)) {
        return;
    }
    var enabledAvgAsClose = config.enabledAvgAsClose;
    var result = {};
    result.symbol = data.symbol;
    result.items = [];

    var ki = {};
    for (var i = 0; i < data.column.length; i++) {
        ki[data.column[i]] = i;
    }

    var avgPrev = blog.round(data.item[0][ki.amount] / data.item[0][ki.volume], 2);
    for (var item of data.item) {
        var avg = blog.round(item[ki.amount] / item[ki.volume], 2);
        var date = blog.dateFormat(moment(item[ki.timestamp]));
        var open = item[ki.open];
        var close = item[ki.close];
        if (enabledAvgAsClose) {
            open = avgPrev;
            close = avg;
        }
        result.items.push({
            日期: date,
            开盘价: open,
            最高价: Math.max(avg, avgPrev),
            最低价: Math.min(avg, avgPrev),
            收盘价: close,
            涨跌额: item[ki.chg],
            涨跌幅: item[ki.percent],
            成交量: item[ki.volume],
            成交量万手: blog.round(item[ki.volume] / 10000_00),
            成交额: item[ki.amount],
            均价: avg,
            换手率: item[ki.turnoverrate],
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
    console.log("calculateKLine end", klineData, klineData.config);
    console.log("calculateKLine end last item", klineData.items[klineData.items.length - 1]);
}