"use strict";

(function () {

    /**
     * 计算BOLL指标并设置到k线数据中
     * @param {array} items k线数据，需包含收盘价字段
     * @param {number} period BOLL周期，常用20
     * @param {number} k 标准差倍数，常用2
     * @returns {void}
     */
    function calculateAndSetBOLL(items, config) {
        if (blog.isEmptyArray(items) || blog.isNull(config)) {
            console.log("calculateAndSetBOLL param error", items, config);
            return;
        }
        const period = config.period;
        const k = config.k;
        if (blog.isNullOrLte0(period) || blog.isNullOrLte0(k)) {
            return;
        }
        for (let i = 0; i < items.length; i++) {
            const ma = calculateMA(config, items, i, period);
            const std = calculateBollStd(config, items, i, period, ma);
            if (!ma || !std) {
                continue;
            }
            const item = items[i];
            item.bollMA = blog.round(ma);
            item.bollUP = blog.round(ma + k * std);
            item.bollDN = blog.round(ma - k * std);
        }
    }


    /**
     * 计算BOLL标准差
     * @param {object} config 配置对象，需包含 value 函数
     * @param {array} items k线数据
     * @param {number} endIndex 结束索引
     * @param {number} period BOLL周期
     * @param {number} ma BOLL均线
     * @returns {number} 标准差
     */
    function calculateBollStd(config, items, endIndex, period, ma) {
        if (blog.isNullOrLte0(ma)) {
            return;
        }

        const beginIndex = endIndex - period + 1;
        const avg = calculateAvgWeight(items, x => {
            const v = x.均价;
            return { value: (v - ma) * (v - ma), weight: 1 };
        }, beginIndex, endIndex);
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
    function calculateAndSetMACD(items, config) {
        if (blog.isEmptyArray(items) || blog.isNull(config)) {
            console.log("calculateAndSetMACD param error", items, config);
            return;
        }

        const shortPeriod = config.shortPeriod;
        const longPeriod = config.longPeriod;
        const signalPeriod = config.signalPeriod;
        if (blog.isNullOrLte0(shortPeriod) || blog.isNullOrLte0(longPeriod) || blog.isNullOrLte0(signalPeriod)) {
            return;
        }
        if (longPeriod <= shortPeriod) {
            return;
        }

        let emaShortPrev = items[0].均价;
        let emaLongPrev = items[0].均价;
        let deaPrev = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const close = item.均价;

            const emaShort = calculateEMA(emaShortPrev, close, shortPeriod);
            const emaLong = calculateEMA(emaLongPrev, close, longPeriod);
            const dif = emaShort - emaLong;
            const dea = calculateEMA(deaPrev, dif, signalPeriod);
            const macd = (dif - dea) * 2;

            item.macdDIF = blog.round(dif);
            item.macdDEA = blog.round(dea);
            item.macd = blog.round(macd);

            emaShortPrev = emaShort;
            emaLongPrev = emaLong;
            deaPrev = dea;
        }
    }

    /**
    * 计算均线MA并设置到k线数据中
    * @param {array} items k线数据
    * @param {object} config 配置对象，需包含 periods 数组和 value 函数
    * @returns {void}
    */
    function calculateAndSetMA(items, config) {
        if (blog.isEmptyArray(items) || blog.isNull(config)) {
            console.log("calculateAndSetMA param error", items, config);
            return;
        }

        const periods = config.periods;
        if (blog.isEmptyArray(periods)) {
            return;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            for (const period of periods) {
                const ma = calculateMA(config, items, i, period);
                item['ma' + period] = ma;
            }
        }
    }

    /**
    * 计算OBV指标（On-Balance Volume，能量潮）并设置到k线数据中
    * @param {array} items k线数据
    * @param {object} config 配置对象，需包含 value 函数
    * @returns {void}
    */
    function calculateAndSetOBV(items, config) {
        if (blog.isEmptyArray(items) || blog.isNull(config)) {
            console.log("calculateAndSetOBV param error", items, config);
            return;
        }
        const first = items[0];
        first.obv = blog.round(first.成交量 / 100);
        for (let i = 1; i < items.length; i++) {
            const prev = items[i - 1];
            const item = items[i];
            const prevValue = prev.均价;
            const itemValue = item.均价;
            if (itemValue > prevValue) {
                item.obv = blog.round(prev.obv + item.成交量 / 100);
            } else if (itemValue < prevValue) {
                item.obv = blog.round(prev.obv - item.成交量 / 100);
            } else {
                item.obv = blog.round(prev.obv);
            }
        }
    }

    /**
    * 计算KDJ指标并设置到k线数据中
    * @param {array} items k线数据
    * @param {object} config { period, value }
    * @returns {void}
    */
    function calculateAndSetKDJ(items, config) {
        if (blog.isEmptyArray(items) || blog.isNull(config)) {
            console.log("calculateAndSetKDJ param error", items, config);
            return;
        }
        const period = config.period;
        if (blog.isNullOrLte0(period)) {
            return;
        }
        let kPrev = 50;
        let dPrev = 50;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const close = item.均价;

            // 最近 N 日的最高价和最低价
            const beginIndex = i - period + 1;
            let highN = -Infinity;
            let lowN = Infinity;
            for (let j = beginIndex; j <= i; j++) {
                if (j < 0) {
                    continue;
                }
                const h = items[j].最高价;
                const l = items[j].最低价;
                if (h > highN) {
                    highN = h;
                }
                if (l < lowN) {
                    lowN = l;
                }
            }

            // RSV
            const rsv = (highN === lowN) ? 50 : (close - lowN) / (highN - lowN) * 100;

            // K、D、J
            const kVal = 2 / 3 * kPrev + 1 / 3 * rsv;
            const dVal = 2 / 3 * dPrev + 1 / 3 * kVal;
            const jVal = 3 * kVal - 2 * dVal;

            item.kdjK = blog.round(kVal);
            item.kdjD = blog.round(dVal);
            item.kdjJ = blog.round(jVal);

            kPrev = kVal;
            dPrev = dVal;
        }
    }


    /**
    * 计算MADIFF指标并设置到k线数据中
    * 基于MA5, MA10, MA20与MA60的差值和偏离率
    * @param {array} items k线数据，需包含ma5, ma10, ma20, ma60字段
    * @param {object} config 配置对象
    * @returns {void}
    */
    function calculateAndSetMADIFF(items, config) {
        if (blog.isEmptyArray(items) || blog.isNull(config)) {
            console.log("calculateAndSetMADIFF param error", items, config);
            return;
        }
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const ma5 = item.ma5;
            const ma10 = item.ma10;
            const ma20 = item.ma20;
            const ma60 = item.ma60;
            if (blog.isNullOrLte0(ma60)) {
                continue;
            }
            item.madiffR5 = blog.round((ma5 - ma60) / ma60 * 100);
            item.madiffR10 = blog.round((ma10 - ma60) / ma60 * 100);
            item.madiffR20 = blog.round((ma20 - ma60) / ma60 * 100);
        }
    }

    /**
    * 计算EMA（指数移动平均）
    * EMA = prev * (1 - k) + value * k, 其中 k = 2 / (period + 1)
    * @param {number} prev 上一周期EMA
    * @param {number} value 当前值
    * @param {number} period 周期
    * @returns {number} EMA值
    */
    function calculateEMA(prev, value, period) {
        const k = 2 / (period + 1);
        return prev * (1 - k) + value * k;
    }

    /**
    * 计算加权移动平均线MA（以成交量为权重）
    * @param {object} config 配置对象，需包含 value 函数
    * @param {array} items k线数据
    * @param {number} endIndex 结束索引
    * @param {number} period 周期
    * @returns {number|undefined} MA值
    */
    function calculateMA(config, items, endIndex, period) {
        const beginIndex = endIndex - period + 1;
        return calculateAvgWeight(items, x => ({
            value: x.成交额,
            weight: x.成交量
        }), beginIndex, endIndex);
    }

    /**
    * 计算加权平均值
    * @param {array} items k线数据
    * @param {function} valueFunction 获取值和权重的函数，参数为单个k线数据，返回 { value, weight }
    * @param {number} beginIndex 开始索引（含）
    * @param {number} endIndex 结束索引（含）
    * @returns {number|undefined} 加权平均值
    */
    function calculateAvgWeight(items, valueFunction, beginIndex, endIndex) {
        let sum = 0;
        let count = 0;
        for (let i = beginIndex; i <= endIndex; i++) {
            if (i < 0) {
                continue;
            }
            const result = valueFunction(items[i]);
            if (result) {
                sum += result.value;
                count += result.weight;
            }
        }
        if (count === 0) {
            return;
        }
        return blog.round(sum / count);
    }

    function defaultKlineConfig() {
        return {
            ma: {
                periods: [5, 10, 20, 60, 240]
            },
            macd: {
                shortPeriod: 10,
                longPeriod: 20,
                signalPeriod: 5
            },
            boll: {
                period: 20,
                k: 2
            },
            obv: {},
            madiff: {},
            kdj: {
                period: 9
            }
        };
    }

    window.kline = {
        calculateAndSetBOLL: calculateAndSetBOLL,
        calculateAndSetMACD: calculateAndSetMACD,
        calculateAndSetMA: calculateAndSetMA,
        calculateAndSetMADIFF: calculateAndSetMADIFF,
        calculateAndSetOBV: calculateAndSetOBV,
        calculateAndSetKDJ: calculateAndSetKDJ,
        defaultKlineConfig: defaultKlineConfig
    };
})();