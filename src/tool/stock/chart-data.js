var xueqiu = JSON.parse(blog.httpGet('/tool/stock/xueqiu-data.json'));
function adaptKDataFromXueqiu(xueqiu) {
    var result = {};
    result.symbol = xueqiu.symbol;
    result.itemsTimeAsc = [];

    var ki = {};
    for (var i = 0; i < xueqiu.column.length; i++) {
        ki[xueqiu.column[i]] = i;
    }

    for (var item of xueqiu.item) {
        result.itemsTimeAsc.push({
            date: blog.dateFormat(moment(item[ki.timestamp])),
            open: item[ki.open],
            high: item[ki.high],
            low: item[ki.low],
            close: item[ki.close],
            changeAmount: item[ki.chg],
            changePercent: item[ki.percent],
            count: item[ki.volume],
            amount: item[ki.amount],
            turnoverRate: item[ki.turnoverrate],
        });
    }
    return result;
}

var kData = adaptKDataFromXueqiu(xueqiu.data);
calculateAndSetMA(kData.itemsTimeAsc, [5, 10, 20, 30, 60, 90, 120]);
calculateAndSetMACD(kData.itemsTimeAsc, 12, 26, 9);
console.log("kData", kData.itemsTimeAsc.reverse());