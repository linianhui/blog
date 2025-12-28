function getXueqiuKlineData() {
    return JSON.parse(blog.httpGet('/tool/stock-kline/data/kline-data-xueqiu.json'));
}

function buildKLineDataFromXueqiu(xueqiu, config) {
    if (blog.isNull(xueqiu)) {
        return;
    }
    var result = {};
    result.symbol = xueqiu.symbol;
    result.items = [];

    var ki = {};
    for (var i = 0; i < xueqiu.column.length; i++) {
        ki[xueqiu.column[i]] = i;
    }

    var avgPrev = blog.round(xueqiu.item[0][ki.amount] / xueqiu.item[0][ki.volume], 2);
    for (var item of xueqiu.item) {
        var avg = blog.round(item[ki.amount] / item[ki.volume], 2);
        var date = blog.dateFormat(moment(item[ki.timestamp]));
        result.items.push({
            avgAsClose: config.avgAsClose,
            日期: date,
            开盘价: config.avgAsClose ? avgPrev : item[ki.open],
            最高价: config.avgAsClose ? Math.max(avgPrev, avg) : item[ki.high],
            最低价: config.avgAsClose ? Math.min(avgPrev, avg) : item[ki.low],
            收盘价: config.avgAsClose ? avg : item[ki.close],
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