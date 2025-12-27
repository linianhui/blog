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

    for (var item of xueqiu.item) {
        result.items.push({
            avgAsClose: config.avgAsClose,
            日期: blog.dateFormat(moment(item[ki.timestamp])),
            开盘价: item[ki.open],
            最高价: item[ki.high],
            最低价: item[ki.low],
            收盘价: item[ki.close],
            涨跌额: item[ki.chg],
            涨跌幅: item[ki.percent],
            成交量: item[ki.volume],
            成交量万手: blog.round(item[ki.volume] / 10000_00),
            成交额: item[ki.amount],
            均价: blog.round(item[ki.amount] / item[ki.volume], 2),
            换手率: item[ki.turnoverrate],
        });
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