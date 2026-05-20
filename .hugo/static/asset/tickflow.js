"use strict";

(function (window) {
    var API_HOST = "https://api.tickflow.org";
    var EXCHANGES = {
        "00": ".SZ",
        "60": ".SH",
        "30": ".SZ",
        "68": ".SH"
    };

    var KLINE_PERIODS = {
        "1分钟": "1m",
        "5分钟": "5m",
        "10分钟": "10m",
        "30分钟": "30m",
        "60分钟": "60m",
        "日线": "1d",
        "周线": "1w",
        "月线": "1M",
        "季线": "1Q",
        "年线": "1Y"
    };

    var KLINE_ADJUSTS = {
        "前复权": "forward",
        "前复权2": "forward_additive",
        "后复权": "backward",
        "后复权2": "backward_additive",
        "不复权": "none"
    };

    function buildHeaders(param) {
        return {
            "x-api-key": param.key
        };
    }

    function buildQueryString(param, names) {
        var query = [];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (param[name]) {
                query.push(name + "=" + encodeURIComponent(param[name]));
            }
        }
        return query.join("&");
    }

    function v1InstrumentsAsync(param, callback) {
        var headers = buildHeaders(param);
        var path = "/v1/instruments?symbols=" + param.symbol;
        var expireMinute = minuteOfDayRemaining();
        httpGetJsonAsync(path, headers, callback, expireMinute);
    }

    function v1KlinesAsync(param, callback) {
        var headers = buildHeaders(param);
        var queryString = buildQueryString(param, ["symbol", "period", "count", "start_time", "end_time", "adjust"]);
        var path = "/v1/klines?" + queryString;
        var expireMinute = minuteOfDayRemaining();
        httpGetJsonAsync(path, headers, callback, expireMinute);
    }

    function minuteOfDayRemaining(minuteOfDay) {
        var now = new Date();
        var tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
        return Math.ceil((tomorrow.getTime() - now.getTime()) / 60000);
    }

    function httpGetJsonAsync(path, headers, callback, expireMinute) {
        var cache = blog.cacheGet(path);
        if (cache) {
            callback(cache);
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.responseText) {
                    var data = JSON.parse(xhr.responseText);
                    blog.cacheSet(path, data, expireMinute);
                    callback(data);
                }
            }
        };
        xhr.open("GET", API_HOST + path, true);
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.send();
    }

    function exchangeOf(symbol) {
        if (symbol) {
            var prefix = symbol.substring(0, 2);
            return EXCHANGES[prefix];
        }
    }

    function klinePeriodOf(text) {
        if (text) {
            return KLINE_PERIODS[text];
        }
    }

    function klineAdjustOf(text) {
        if (text) {
            return KLINE_ADJUSTS[text];
        }
    }

    function dateToTimestamp(yyyyMMdd) {
        if (yyyyMMdd) {
            return Date.parse(yyyyMMdd);
        }
    }

    function tickflowParam(param) {
        return {
            key: param.key,
            symbol: param.symbol + exchangeOf(param.symbol),
            period: klinePeriodOf(param.period),
            start_time: dateToTimestamp(param.startDate),
            end_time: dateToTimestamp(param.endDate),
            adjust: klineAdjustOf(param.adjust)
        };
    }

    window.tickflow = {
        klinePeriods: KLINE_PERIODS,
        klineAdjusts: KLINE_ADJUSTS,
        v1InstrumentsAsync: v1InstrumentsAsync,
        v1KlinesAsync: v1KlinesAsync,
        tickflowParam: tickflowParam
    };

})(window);
