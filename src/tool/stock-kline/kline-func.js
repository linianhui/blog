"use strict";

(function () {

    /**
     * 计算BOLL指标并设置到k线数据中
     * @param {array} items k线数据，需包含收盘价字段
     * @param {number} period BOLL周期，常用20
     * @param {number} k 标准差倍数，常用2
     * @returns {void}
     */
    function calculateAndSetBOLL(items, bollConfig) {
        if (blog.isEmptyArray(items) || blog.isNull(bollConfig)) {
            console.log("calculateAndSetBOLL param error", items, bollConfig);
            return;
        }
        var period = bollConfig.period;
        var k = bollConfig.k;
        for (var i = 0; i < items.length; i++) {
            var ma = calculateMA(items, i, period);
            var std = calculateBollStd(items, i, period, ma);
            if (!ma || !std) {
                continue;
            }
            // 计算BOLL线
            var up = ma + k * std;
            var dn = ma - k * std;
            var item = items[i];
            item.bollMA = blog.round(ma);
            item.bollUP = blog.round(up);
            item.bollDN = blog.round(dn);
        }
    }


    /**
     * 计算BOLL标准差
     * @param {array} items k线数据，需包含收盘价字段
     * @param {number} endIndex 结束索引
     * @param {number} period BOLL周期
     * @param {number} ma BOLL均线
     * @returns {number} 标准差
     */
    function calculateBollStd(items, endIndex, period, ma) {
        if (blog.isNullOrLte0(ma)) {
            return;
        }

        // 计算标准差
        var beginIndex = endIndex - period + 1;
        var avg = calculateAvg(items, x => Math.pow(x.avgAsClose ? x.均价 : x.收盘价 - ma, 2), beginIndex, endIndex);
        if (!avg || avg <= 0) {
            return;
        }
        return Math.sqrt(avg);
    }


    /**
     * 计算MACD指标并设置到k线数据中
     * @param {array} items k线数据，需包含close字段
     * @param {number} shortPeriod 快速EMA周期，常用12
     * @param {number} longPeriod 慢速EMA周期，常用26
     * @param {number} signalPeriod DEA周期，常用9
     * @returns {void}
     */
    function calculateAndSetMACD(items, macdConfig) {
        if (blog.isEmptyArray(items) || blog.isNull(macdConfig)) {
            console.log("calculateAndSetMACD param error", items, macdConfig);
            return;
        }

        var shortPeriod = macdConfig.shortPeriod;
        if (blog.isNullOrLte0(shortPeriod)) {
            return;
        }
        var longPeriod = macdConfig.longPeriod;
        if (blog.isNullOrLte0(longPeriod)) {
            return;
        }
        if (longPeriod <= shortPeriod) {
            return;
        }
        var signalPeriod = macdConfig.signalPeriod;
        if (blog.isNullOrLte0(signalPeriod)) {
            return;
        }

        var emaShortPrev = items[0].avgAsClose ? items[0].均价 : items[0].收盘价;
        var emaLongPrev = items[0].avgAsClose ? items[0].均价 : items[0].收盘价;
        var deaPrev = 0;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var close = items[i].avgAsClose ? items[i].均价 : items[i].收盘价;

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
    * @param {array} items k线数据
    * @param {array} periods 均线周期数组
    * @returns {void}
    */
    function calculateAndSetMA(items, maConfig) {
        if (blog.isEmptyArray(items) || blog.isNull(maConfig)) {
            console.log("calculateAndSetMA param error", items, maConfig);
            return;
        }

        var periods = maConfig.periods;
        if (blog.isEmptyArray(periods)) {
            return;
        }

        for (var index = 0; index < items.length; index++) {
            var item = items[index];
            for (var period of periods) {
                var ma = calculateMA(items, index, period);
                item['ma' + period] = ma;
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
    * @param {array} period 周期
    * @returns {object} 周期内收盘价平均值
    */
    function calculateMA(items, endIndex, period) {
        var beginIndex = endIndex - period + 1;
        return calculateAvg(items, x => x.avgAsClose ? x.均价 : x.收盘价, beginIndex, endIndex);
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

    function defaultKlineConfig() {
        return {
            avgAsClose: true,
            ma: {
                periods: [5, 10, 20, 30, 60]
            },
            macd: {
                shortPeriod: 12,
                longPeriod: 26,
                signalPeriod: 9
            },
            boll: {
                period: 20,
                k: 2
            }
        };
    }

    window.kline = {
        calculateAndSetBOLL: calculateAndSetBOLL,
        calculateAndSetMACD: calculateAndSetMACD,
        calculateAndSetMA: calculateAndSetMA,
        defaultKlineConfig: defaultKlineConfig,
    };
})();