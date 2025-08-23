var xueqiu = JSON.parse(blog.httpGet('/tool/stock/xueqiu-data.json'));
function adaptKDataFromXueqiu(xueqiu) {
    var result = {};
    result.symbol = xueqiu.symbol;
    result.items = [];

    var ki = {};
    for (var i = 0; i < xueqiu.column.length; i++) {
        ki[xueqiu.column[i]] = i;
    }

    for (var item of xueqiu.item) {
        result.items.push({
            日期: blog.dateFormat(moment(item[ki.timestamp])),
            开盘价: item[ki.open],
            最高价: item[ki.high],
            最低价: item[ki.low],
            收盘价: item[ki.close],
            涨跌额: item[ki.chg],
            涨跌幅: item[ki.percent],
            成交量: item[ki.volume],
            成交额: item[ki.amount],
            换手率: item[ki.turnoverrate],
        });
    }
    return result;
}

var kData = adaptKDataFromXueqiu(xueqiu.data);
kfunc.calculateAndSetMA(kData.items, [5, 10, 20, 30, 60, 90, 120]);
kfunc.calculateAndSetMACD(kData.items, 12, 26, 9);
kfunc.calculateAndSetBOLL(kData.items, 20, 2);
console.log("kData", kData.items[kData.items.length - 1]);