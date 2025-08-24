"use strict";

(function (window, document, navigator) {
    var byteUnits = [
        {
            unit: 'PB',
            index: 5,
        },
        {
            unit: 'TB',
            index: 4,
        },
        {
            unit: 'GB',
            index: 3,
        },
        {
            unit: 'MB',
            index: 2,
        },
        {
            unit: 'KB',
            index: 1,
        }
    ];

    function initByteUnits(base) {
        for (var i = 0; i < byteUnits.length; i++) {
            var byteUnit = byteUnits[i];
            var min = baseIndex(base, byteUnit.index);
            byteUnit[base] = {
                min: min,
                max: min * base
            };
        }

        function baseIndex(base, index) {
            var resut = base;
            for (var i = 1; i < index; i++) {
                resut = resut * base;
            }
            return resut;
        }
    }

    function findByteUnit(func) {
        for (var i = 0; i < byteUnits.length; i++) {
            var byteUnit = byteUnits[i];
            if (func(byteUnit)) {
                return byteUnit;
            }
        }
    }

    function id(id) {
        return document.getElementById(id);
    }

    function isMobile() {
        return /.*Mobile.*/.test(navigator.userAgent);
    }

    function isPC() {
        return !isMobile();
    }

    function getViewportAxis() {
        var viewportY1 = window.scrollY;
        var viewportHeight = document.documentElement.clientHeight;
        return {
            y1: viewportY1,
            height: viewportHeight,
            y2: viewportY1 + viewportHeight,
        };
    }

    function getBodyAxis() {
        return {
            width: document.body.offsetWidth,
            height: document.body.offsetHeight,
        };
    }

    function getScrollAxis() {
        var viewport = getViewportAxis();
        var body = getBodyAxis();
        var y1ScrollPercentage = Math.min(1, Math.max(0, viewport.y1 / body.height));
        var y2ScrollPercentage = Math.min(1, Math.max(0, viewport.y2 / body.height));
        return {
            viewport: viewport,
            body: body,
            scroll: {
                percentage: {
                    y1: y1ScrollPercentage,
                    y2: y2ScrollPercentage
                }
            }
        }
    }

    function inViewport(elementAxis, viewportAxis) {
        if (elementAxis.y1 > viewportAxis.y2) {
            return false;
        }
        return Math.max(elementAxis.y1, viewportAxis.y1) < Math.min(elementAxis.y2, viewportAxis.y2);
    }

    function getClassNameArray(element) {
        if (element) {
            return element.className.split(" ") || [];
        }
        return [];
    }

    function setClassNameArray(element, classNameArray) {
        if (element) {
            element.className = (classNameArray || []).join(" ").trim();
        }
    }

    function hasClassName(element, className) {
        if (element && className) {
            return getClassNameArray(element).indexOf(className) != -1;
        }
        return false;
    }

    function removeArrayItem(array, item) {
        var index = array.indexOf(item);
        if (index != -1) {
            array.splice(index, 1);
        }
    }

    function removeClassName(element, className) {
        if (element && className) {
            var classNameArray = getClassNameArray(element);
            removeArrayItem(classNameArray, className);
            setClassNameArray(element, classNameArray);
        }
    }

    function appendClassName(element, className) {
        if (element && className) {
            var classNameArray = getClassNameArray(element);
            removeArrayItem(classNameArray, className);
            classNameArray.push(className);
            setClassNameArray(element, classNameArray);
        }
    }

    function toggleClassNameCore(element, className) {
        if (hasClassName(element, className)) {
            removeClassName(element, className);
        } else {
            appendClassName(element, className);
        }
    }

    function toggleClassName() {
        var lastIndex = arguments.length - 1;
        var className = arguments[lastIndex];
        for (var i = 0; i < lastIndex; i++) {
            var element = id(arguments[i]);
            toggleClassNameCore(element, className);
        }
        refreshStyleOnHeightChange();
    }

    function getFragmentIdFromUrl(url) {
        var fragmentIdIndex = (url || '').indexOf('#');
        if (fragmentIdIndex != -1) {
            return url.substr(fragmentIdIndex + 1);
        }
    }

    function refreshBodyStyle() {
        var tocElement = id('toc');
        if (hasClassName(tocElement, 'opened')) {
            var tocElementOffsetWidth = tocElement.offsetWidth;
            document.body.style.marginLeft = tocElementOffsetWidth + 'px';
        } else {
            document.body.style.marginLeft = '0px';
        }
    }

    function getTocItemArray() {
        var tocItemArray = [];
        document.querySelectorAll('#toc a').forEach(function (a) {
            var fragmentId = getFragmentIdFromUrl(a.href);
            var locator = id('locator-' + fragmentId);
            if (locator) {
                tocItemArray.push({
                    a: a,
                    locator: locator
                });
            }
        });
        return tocItemArray;
    }

    function refreshSelectedTocStyle(scrollAxis, tocItemArray) {
        var selectedTocItemArray = [];
        for (var i = 0; i < tocItemArray.length; i++) {
            var current = tocItemArray[i];
            var next = tocItemArray[i + 1];
            var locatorAxis = {
                y1: current.locator.offsetTop,
                y2: (next && next.locator.offsetTop) || scrollAxis.viewport.y2
            };
            if (inViewport(locatorAxis, scrollAxis.viewport)) {
                selectedTocItemArray.push(current);
            }
        }

        refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray);
    }

    function refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray) {
        tocItemArray.forEach(function (tocItem) {
            removeClassName(tocItem.a, 'selected');
        });
        selectedTocItemArray.forEach(function (tocItem) {
            appendClassName(tocItem.a, 'selected');
        });
    }

    function refreshHorizontalProgressStyle(scrollAxis) {
        scrollAxis = scrollAxis || getScrollAxis();
        var progressWidth = scrollAxis.scroll.percentage.y2 * scrollAxis.body.width;
        id('horizontal-progress').style.width = progressWidth + 'px';
    }


    function refreshTocSytle(scrollAxis) {
        scrollAxis = scrollAxis || getScrollAxis();
        var tocElement = id('toc');
        if (!tocElement) {
            return;
        }
        var viewportHeight = scrollAxis.viewport.height;
        var tocElementHeight = tocElement.scrollHeight;
        if (viewportHeight >= tocElementHeight) {
            return;
        }
        var top = tocElementHeight * scrollAxis.scroll.percentage.y1 - viewportHeight / 2;
        tocElement.scroll({
            top: top,
            left: 0,
            behavior: 'smooth'
        });
    }

    function refreshStyleOnHeightChange(scrollAxis) {
        scrollAxis = scrollAxis || getScrollAxis();
        refreshHorizontalProgressStyle(scrollAxis);
        refreshTocSytle(scrollAxis);
    }

    function onScorllEventCore(scrollAxis, tocItemArray) {
        refreshSelectedTocStyle(scrollAxis, tocItemArray);
        refreshStyleOnHeightChange(scrollAxis);
    }

    function addOnScorllEvent() {
        var tocItemArray = getTocItemArray();
        window.onscroll = function () {
            var scrollAxis = getScrollAxis();
            onScorllEventCore(scrollAxis, tocItemArray);
        };
        onScorllEventCore(getScrollAxis(), tocItemArray);
    }

    function toggleToc() {
        toggleClassName('toc', 'opened');
        refreshBodyStyle();
        refreshStyleOnHeightChange();
    }

    function getJDSearchUrl(keyword) {
        if (isMobile()) {
            return 'openapp.jdmobile://virtual?params=' + encodeURIComponent('{"des":"productList","keyWord":"' + keyword + '","from":"search","category":"jump"}');
        }
        return 'https://search.jd.com/Search?keyword=' + encodeURIComponent(keyword);
    }

    function getTBSearchUrl(keyword) {
        if (isMobile()) {
            return 'taobao://s.taobao.com/search?q=' + encodeURIComponent(keyword);
        }
        return 'https://s.taobao.com/search?q=' + encodeURIComponent(keyword);
    }

    function parseBytes(value, base) {
        var item = findByteUnit(function (x) {
            return value.endsWith(x.unit);
        });

        var size = parseFloat(value.replace(item.unit), 10);
        return size * item[base].min;
    }

    function formatBytes(bytes, base, unit, fixed) {
        var item = findByteUnit(function (x) {
            if (unit) {
                return x.unit == unit;
            }
            return (bytes >= x[base].min && bytes <= x[base].max);
        });

        return (bytes / item[base].min).toFixed(fixed) + item.unit;
    }

    function round(value, precision) {
        precision = precision || 2;
        value = value || 0;
        return number(value, precision).value;
    }

    function sum(items, func) {
        var result = 0;
        for (let index in items) {
            var item = items[index];
            result = round(result + func(item));
        }
        return round(result);
    }

    function deepClone(value) {
        if (value) {
            return JSON.parse(JSON.stringify(value));
        }
    }

    function log() {
        console.log(arguments);
    }

    function getLocationParam(index, defaultValue) {
        var param = window.location.hash.split("#")[index];
        return param || defaultValue;
    }

    function getLocationParamJson() {
        var json = getLocationParam(1);
        if (json) {
            try {
                return JSON.parse(decodeURI(json));
            } catch (error) {
                console.error(json, error);
            }
        }
        return null;
    }

    function setLocationParamJson(value) {
        setLocationParams(encodeURI(JSON.stringify(value)));
    }

    function setLocationParams() {
        window.location.hash = Array.from(arguments).join("#");
    }

    function number(value, precision) {
        var optionPrecision = precision || 2;
        var option = {
            symbol: '',
            decimal: '.',
            separator: ',',
            errorOnInvalid: false,
            precision: optionPrecision
        };
        return currency(value, option);
    }

    function dateNow() {
        return dateFormat(moment());
    }

    function dateAddDays(date, days) {
        return dateFormat(moment(date).add(days, 'days'));
    }

    function dateAddMonths(date, months) {
        return dateFormat(moment(date).add(months, 'months'));
    }

    function dateAddMonthsSetDay(date, months, dayOfMonth) {
        return dateFormat(moment(dateAddMonths(date, months)).date(dayOfMonth));
    }

    function dateFormat(date) {
        return date.format('YYYY-MM-DD');
    }

    function dateIsBefore(date1, date2) {
        return moment(date1).isBefore(moment(date2));
    }

    function dateMax(date1, date2) {
        if (!date1) {
            return date2;
        }
        if (!date2) {
            return date1;
        }
        return dateIsBefore(date1, date2) ? date2 : date1;
    }

    function dateMin(date1, date2) {
        if (!date1) {
            return date2;
        }
        if (!date2) {
            return date1;
        }
        return dateIsBefore(date1, date2) ? date1 : date2;
    }

    function dateIsBetween(beginDate, endDate, date, option) {
        option = option || '[]';
        return moment(date).isBetween(beginDate, endDate, undefined, option);
    }

    function dateDiffDays(date1, date2) {
        return moment(date1).diff(date2, 'days');
    }

    function dateYearMonthDayDuration(days) {
        var duration = moment.duration(days, 'days');
        var result = '';
        var years = duration.years();
        if (years) {
            result = result + years + '年';
        }
        var months = duration.months();
        if (months) {
            result = result + months + '月';
        }
        var days = duration.days();
        if (days) {
            result = result + days + '天';
        }
        return result;
    }

    function arrayUnique(values) {
        if (values) {
            return Array.from(new Set(values));
        }
    }

    function echartsSankeyLinks2Nodes(links) {
        var nodeNames = [];
        for (var index = 0; index < links.length; index++) {
            var link = links[index];
            nodeNames.push(link.source)
            nodeNames.push(link.target);
        }

        var uniqueNodeNames = arrayUnique(nodeNames);
        return uniqueNodeNames.map(name => {
            return { name: name };
        });
    }

    function httpGet(url, callback) {
        var xhr = new XMLHttpRequest();
        var async = callback != null;
        if (async) {
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    callback(xhr.responseText);
                }
            };
        }
        xhr.open("GET", url, async);
        xhr.send();
        if (!async) {
            return xhr.responseText;
        }
    }

    function httpGetJson(url, callback) {
        return JSON.stringify(httpGet(url, callback));
    }

    function isNotEmptyArray(array) {
        if (array) {
            return array.length > 0;
        }
        return false;
    }

    function isEmptyArray(array) {
        return !isNotEmptyArray(array);
    }

    function isNotNull(value) {
        if (value) {
            return true;
        }
        return false;
    }

    function isNull(value) {
        return !isNotNull(value);
    }

    function isNullOrLte0(value) {
        return isNull(value) || value <= 0;
    }

    initByteUnits(1000);
    initByteUnits(1024);

    window.blog = {
        isMobile: isMobile,
        isPC: isPC,
        toggleClassName: toggleClassName,
        addOnScorllEvent: addOnScorllEvent,
        toggleToc: toggleToc,
        getJDSearchUrl: getJDSearchUrl,
        getTBSearchUrl: getTBSearchUrl,
        parseBytes: parseBytes,
        formatBytes: formatBytes,
        round: round,
        sum: sum,
        deepClone: deepClone,
        log: log,
        getLocationParam: getLocationParam,
        getLocationParamJson: getLocationParamJson,
        setLocationParams: setLocationParams,
        setLocationParamJson: setLocationParamJson,
        number: number,
        dateNow: dateNow,
        dateAddDays: dateAddDays,
        dateAddMonths: dateAddMonths,
        dateAddMonthsSetDay: dateAddMonthsSetDay,
        dateDiffDays: dateDiffDays,
        dateFormat: dateFormat,
        dateIsBefore: dateIsBefore,
        dateIsBetween: dateIsBetween,
        dateMax: dateMax,
        dateMin: dateMin,
        dateYearMonthDayDuration: dateYearMonthDayDuration,
        arrayUnique: arrayUnique,
        echartsSankeyLinks2Nodes: echartsSankeyLinks2Nodes,
        httpGet: httpGet,
        httpGetJson: httpGetJson,
        isNotEmptyArray: isNotEmptyArray,
        isEmptyArray: isEmptyArray,
        isNotNull: isNotNull,
        isNull: isNull,
        isNullOrLte0: isNullOrLte0,
    };

})(window, document, navigator);
