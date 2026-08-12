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
        if (!param.startDate) {
            klineParam.startDate = blog.dateAddDays(klineParam.endDate, -1000);
        }

        console.log("getKlineData klineParam", klineParam);
        var v1KlinesParam = tickflow.tickflowParam(klineParam);
        v1KlinesParam.count = blog.dateDiffDays(klineParam.endDate, klineParam.startDate) + 1;
        console.log("getKlineData v1KlinesParam", v1KlinesParam);
        var kline = tickflow.v1KlinesAsync(v1KlinesParam, function (data) {
            console.log("getKlineData v1KlinesData", data);
            callback({
                meta: stock.data[0],
                kline: data.data,
                exchange: tickflow.exchangeOf(klineParam.symbol)
            });
        });
    });
}

function buildKLineData(param, data, config) {
    if (blog.isNull(data)) {
        return;
    }
    var kline = data.kline;
    if (blog.isNull(kline)) {
        return;
    }
    var result = {};
    result.symbol = param.symbol;
    result.items = [];
    var count = kline.timestamp.length;
    result.count = count;
    // amount 全为 0（如部分指数/基金）时，无法用 成交额/成交量 计算均价，改用接口返回的原始 OHLC
    var amountIsAllZero = kline.amount.every(value => value === 0);
    var avgPrev = 0;
    if (!amountIsAllZero) {
        avgPrev = blog.round(kline.amount[0] / kline.volume[0] / 100, 2);
    }
    for (var index = 0; index < count; index++) {
        var date = blog.dateFormat(moment(kline.timestamp[index]));
        var open;
        var close;
        var high;
        var low;
        var avg;
        if (amountIsAllZero) {
            open = kline.open[index];
            close = kline.close[index];
            high = kline.high[index];
            low = kline.low[index];
            avg = close;
        } else {
            avg = blog.round(kline.amount[index] / kline.volume[index] / 100, 2);
            open = avgPrev;
            close = avg;
            high = Math.max(avg, avgPrev);
            low = Math.min(avg, avgPrev);
            avgPrev = avg;
        }

        result.items.push({
            日期: date,
            open: open,
            close: close,
            high: high,
            low: low,
            开盘价: open,
            最高价: high,
            最低价: low,
            收盘价: close,
            涨跌额: blog.round(close - open, 2),
            涨跌幅: blog.round((close - open) / open * 100, 2),
            成交量: kline.volume[index] * 100,
            成交额: kline.amount[index],
            均价: avg,
            换手率: 1,
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
    kline.calculateAndSetMADIFF(klineData.items, klineData.config.madiff);
    kline.calculateAndSetMACD(klineData.items, klineData.config.macd);
    kline.calculateAndSetBOLL(klineData.items, klineData.config.boll);
    kline.calculateAndSetOBV(klineData.items, klineData.config.obv);
    kline.calculateAndSetKDJ(klineData.items, klineData.config.kdj);
    console.log("calculateKLine end", klineData, klineData.config);
    console.log("calculateKLine end last item", klineData.items[klineData.items.length - 1]);
}