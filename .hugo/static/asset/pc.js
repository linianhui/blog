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

    function round2(value) {
        const number = value || 0;
        return Math.round(number * 100) / 100;
    }

    function sum(items, func) {
        var result = 0;
        for (let index in items) {
            const item = items[index];
            result = round2(result + func(item));
        }
        return round2(result);
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
        round2: round2,
        sum: sum,
        deepClone: deepClone,
        log: log,
        getLocationParam: getLocationParam,
        getLocationParamJson: getLocationParamJson,
        setLocationParams: setLocationParams,
        setLocationParamJson: setLocationParamJson
    };

})(window, document, navigator);
