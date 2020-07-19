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

    function getViewportYAxis() {
        var viewportY1 = window.scrollY;
        var viewportHeight = document.documentElement.clientHeight;
        var viewportY2 = viewportY1 + viewportHeight;
        return {
            y1: viewportY1,
            y2: viewportY2
        };
    }

    function getWindowSize() {
        return {
            width: document.body.offsetWidth,
            height: document.body.offsetHeight,
        };
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
        document.querySelectorAll('#toc a').forEach(function (aElement) {
            var fragmentId = getFragmentIdFromUrl(aElement.href);
            var locatorElement = id('locator-' + fragmentId);
            if (locatorElement) {
                tocItemArray.push({
                    aElement: aElement,
                    locatorElement: locatorElement
                });
            }
        });
        return tocItemArray;
    }

    function refreshSelectedTocStyle(tocItemArray) {
        var selectedTocItemArray = [];
        var viewportYAxis = getViewportYAxis();
        for (var i = 0; i < tocItemArray.length; i++) {
            var current = tocItemArray[i];
            var next = tocItemArray[i + 1];
            var locatorYAxis = {
                y1: current.locatorElement.offsetTop,
                y2: (next && next.locatorElement.offsetTop) || viewportYAxis.y2
            };
            if (inViewport(locatorYAxis, viewportYAxis)) {
                selectedTocItemArray.push(current);
            }
        }

        refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray);
    }

    function inViewport(locatorYAxis, viewportYAxis) {
        if (locatorYAxis.y1 > viewportYAxis.y2) {
            return false;
        }
        return Math.max(locatorYAxis.y1, viewportYAxis.y1) < Math.min(locatorYAxis.y2, viewportYAxis.y2);
    }

    function refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray) {
        tocItemArray.forEach(function (tocItem) {
            removeClassName(tocItem.aElement, 'selected');
        });
        selectedTocItemArray.forEach(function (tocItem) {
            appendClassName(tocItem.aElement, 'selected');
        });
    }

    function refreshHorizontalProgressStyle() {
        var viewportYAxis = getViewportYAxis();
        var windowSize = getWindowSize();
        var percentage = Math.min(1, Math.max(0, viewportYAxis.y2 / windowSize.height));
        id('horizontal-progress').style.width = (percentage * windowSize.width) + 'px';
    }

    function onScorllEventCore(tocItemArray) {
        refreshSelectedTocStyle(tocItemArray);
        refreshHorizontalProgressStyle();
    }

    function addOnScorllEvent() {
        var tocItemArray = getTocItemArray();
        window.onscroll = function () {
            onScorllEventCore(tocItemArray);
        };
        refreshHorizontalProgressStyle();
    }

    function toggleToc() {
        toggleClassName('toc', 'opened');
        refreshBodyStyle();
    }

    window.blog = {
        isMobile: isMobile,
        isPC: isPC,
        toggleClassName: toggleClassName,
        addOnScorllEvent: addOnScorllEvent,
        toggleToc: toggleToc
    };

})(window, document, navigator);
