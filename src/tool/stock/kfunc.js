
/**
 * 计算MACD指标并设置到k线数据中
 * @param {array} itemsTimeAsc k线数据，需包含close字段
 * @param {number} shortPeriod 快速EMA周期，常用12
 * @param {number} longPeriod 慢速EMA周期，常用26
 * @param {number} signalPeriod DEA周期，常用9
 * @returns {void}
 */
function calculateAndSetMACD(itemsTimeAsc, shortPeriod, longPeriod, signalPeriod) {
    if (!itemsTimeAsc || !itemsTimeAsc.length) {
        return;
    }

    var emaShortPrev = itemsTimeAsc[0].close;
    var emaLongPrev = itemsTimeAsc[0].close;
    var deaPrev = 0;

    for (var i = 0; i < itemsTimeAsc.length; i++) {
        var item = itemsTimeAsc[i];
        var close = itemsTimeAsc[i].close;

        // 计算EMA、DIF、DEA
        var emaShort = calculateMacdEMA(emaShortPrev, close, shortPeriod);
        var emaLong = calculateMacdEMA(emaLongPrev, close, longPeriod);
        var dif = calculateMacdDIF(emaShort, emaLong);
        var dea = calculateMacdDEA(deaPrev, dif, signalPeriod);

        // MACD柱（通常乘以2）
        var macd = (dif - dea) * 2;

        // 保存到数据
        item['macdDIF'] = blog.round(dif);
        item['macdDEA'] = blog.round(dea);
        item['macd'] = blog.round(macd);

        // 更新上一次值
        emaShortPrev = emaShort;
        emaLongPrev = emaLong;
        deaPrev = dea;
    }
}

/**
* 计算均线MA并设置到k线数据中
* @param {array} itemsTimeAsc k线数据
* @param {array} periods 均线周期数组
* @returns {void}
*/
function calculateAndSetMA(itemsTimeAsc, periods) {
    if (!itemsTimeAsc || !itemsTimeAsc.length) {
        return;
    }
    if (!periods || !periods.length) {
        return;
    }
    for (var index = 0; index < itemsTimeAsc.length; index++) {
        var item = itemsTimeAsc[index];
        var ma = calculateMA(itemsTimeAsc, index, periods);
        for (var period of periods) {
            item['ma' + period] = ma[period];
        }
    }
}

/**
* 计算MACD的EMA
* @param {number} prevEMA 上一周期EMA
* @param {number} close 当前收盘价
* @param {number} period 周期
* @returns {number} EMA值
*/
function calculateMacdEMA(prevEMA, close, period) {
    return prevEMA * (period - 1) / (period + 1) + close * 2 / (period + 1);
}

/**
* 计算MACD的DIF
* @param {number} emaShort 快速EMA
* @param {number} emaLong 慢速EMA
* @returns {number} DIF值
*/
function calculateMacdDIF(emaShort, emaLong) {
    return emaShort - emaLong;
}

/**
* 计算MACD的DEA
* @param {number} prevDEA 上一周期DEA
* @param {number} dif 当前DIF
* @param {number} period DEA周期
* @returns {number} DEA值
*/
function calculateMacdDEA(prevDEA, dif, period) {
    return prevDEA * (period - 1) / (period + 1) + dif * 2 / (period + 1);
}

/**
* 计算MA
* @param {array} items k线数据
* @param {number} endIndex 结束索引
* @param {array} periods 多周期
* @returns {object} 平均值
*/
function calculateMA(items, endIndex, periods) {
    if (!items || !items.length) {
        return;
    }

    if (!periods || !periods.length) {
        return;
    }

    var result = {};
    var beginIndex = 0;
    for (var period of periods) {
        beginIndex = endIndex - period + 1;
        result[period] = calculateAvg(items, x => x.close, beginIndex, endIndex);
    }

    return result;
}

/**
* 计算平均值
* @param {array} items k线数据
* @param {function} valueFunction 获取值的函数，参数为单个k线数据，返回值为数字
* @param {number} beginIndex 开始索引
* @param {number} endIndex 结束索引
* @returns {number} 平均值
*/
function calculateAvg(items, valueFunction, beginIndex, endIndex) {
    if (!items || !items.length) {
        return;
    }

    if (!valueFunction) {
        return;
    }
    var sum = 0;
    var count = 0;
    for (var i = beginIndex; i <= endIndex; i++) {
        if (i < 0) {
            continue;
        }
        var item = items[i];
        if (item) {
            var value = valueFunction(item);
            if (value) {
                sum = sum + value;
                count = count + 1;
            }
        }
    }
    if (count === 0) {
        return;
    }
    var avg = sum / count;
    return blog.round(avg);
}