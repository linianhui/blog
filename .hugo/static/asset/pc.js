"use strict";

(function (window, document, navigator) {
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
        refreshHorizontalProgressStyle();
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
            var locatorYAxis = {
                y1: current.locator.offsetTop,
                y2: (next && next.locator.offsetTop) || scrollAxis.viewport.y2
            };
            if (inViewport(locatorYAxis, scrollAxis.viewport)) {
                selectedTocItemArray.push(current);
            }
        }

        refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray);
    }

    function inViewport(locatorYAxis, viewportAxis) {
        if (locatorYAxis.y1 > viewportAxis.y2) {
            return false;
        }
        return Math.max(locatorYAxis.y1, viewportAxis.y1) < Math.min(locatorYAxis.y2, viewportAxis.y2);
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


    function refreshToc(scrollAxis) {
        scrollAxis = scrollAxis || getScrollAxis();
        var tocElement = id('toc');
        var top = tocElement.scrollHeight * scrollAxis.scroll.percentage.y1 - scrollAxis.viewport.height / 2;
        tocElement.scroll({
            top: top,
            left: 0,
            behavior: 'smooth'
        });
    }

    function onScorllEventCore(scrollAxis, tocItemArray) {
        refreshSelectedTocStyle(scrollAxis, tocItemArray);
        refreshHorizontalProgressStyle(scrollAxis);
        refreshToc(scrollAxis);
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
        refreshHorizontalProgressStyle();
    }

    window.blog = {
        isMobile: isMobile,
        isPC: isPC,
        toggleClassName: toggleClassName,
        addOnScorllEvent: addOnScorllEvent,
        toggleToc: toggleToc
    };

})(window, document, navigator);
