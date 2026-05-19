"use strict";

(function (window) {
    var apiHost = "https://api.tickflow.org";
    var exchanges = {
        "00": ".SZ",
        "60": ".SH",
        "30": ".SZ",
        "68": ".SH"
    };

    var klinePeriods = {
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

    var klineAdjusts = {
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
        var url = apiHost + "/v1/instruments?symbols=" + param.symbol;
        var cacheKey="v1_instruments_" + param.symbol;
        httpGetJsonAsync(cacheKey,url, headers, callback);
    }

    function v1KlinesAsync(param, callback) {
        var headers = buildHeaders(param);
        var queryString = buildQueryString(param, ["symbol", "period", "count", "start_time", "end_time", "adjust"]);
        var url = apiHost + "/v1/klines?" + queryString;
        var cacheKey="v1_klines_" + param.symbol + "_" + param.period;
        httpGetJsonAsync(cacheKey,url, headers, callback);
    }

    function httpGetJsonAsync(cacheKey, url, headers, callback) {
        var cache = blogCache.getCache(cacheKey);
        if (cache) {
            callback(JSON.parse(cache));
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.responseText) {
                    blogCache.setCache(cacheKey, xhr.responseText);
                }
                callback(JSON.parse(xhr.responseText));
            }
        };
        xhr.open("GET", url, true);
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.send();
    }

    function exchangeOf(symbol) {
        if (symbol) {
            var prefix = symbol.substring(0, 2);
            return exchanges[prefix];
        }
    }

    function klinePeriodOf(text) {
        if (text) {
            return klinePeriods[text];
        }
    }

    function klineAdjustOf(text) {
        if (text) {
            return klineAdjusts[text];
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
        klinePeriods: klinePeriods,
        klineAdjusts: klineAdjusts,
        v1InstrumentsAsync: v1InstrumentsAsync,
        v1KlinesAsync: v1KlinesAsync,
        tickflowParam: tickflowParam
    };

})(window);
