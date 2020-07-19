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

    function getViewportY1() {
        return window.scrollY;
    }

    function getViewportHeight() {
        return document.documentElement.clientHeight;
    }

    function getWindowHeight() {
        return document.body.offsetHeight;
    }

    function getWindowWidth() {
        return document.body.offsetWidth;
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

    function refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray) {
        tocItemArray.forEach(function (tocItem) {
            removeClassName(tocItem.aElement, 'selected');
        });
        selectedTocItemArray.forEach(function (tocItem) {
            appendClassName(tocItem.aElement, 'selected');
        });
    }

    function refreshSelectedTocStyle(tocItemArray, viewportY1, viewportY2) {
        var selectedTocItemArray = [];
        for (var i = 0; i < tocItemArray.length; i++) {
            var current = tocItemArray[i];
            var next = tocItemArray[i + 1];
            if (inViewport(current, next, viewportY1, viewportY2)) {
                selectedTocItemArray.push(current);
            }
        }

        refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray);
    }

    function inViewport(currentTocItem, nextTocItem, viewportY1, viewportY2) {
        var currentElementY1 = currentTocItem.locatorElement.offsetTop;
        if (currentElementY1 > viewportY2) {
            return false;
        }
        var nextElementY1 = (nextTocItem && nextTocItem.locatorElement.offsetTop) || viewportY2;
        return Math.max(currentElementY1, viewportY1) < Math.min(nextElementY1, viewportY2);
    }

    function tocOnScroll(tocItemArray) {
        if (tocItemArray) {
            var viewportY1 = getViewportY1();
            var viewportHeight = getViewportHeight();
            var viewportY2 = viewportY1 + viewportHeight;
            refreshSelectedTocStyle(tocItemArray, viewportY1, viewportY2);
        }
    }

    function refreshHorizontalProgressStyle() {
        var viewportY1 = getViewportY1();
        var viewportHeight = getViewportHeight();
        var viewportY2 = viewportY1 + viewportHeight;
        var windowHeight = getWindowHeight();
        var windowWidth = getWindowWidth();
        var progress = Math.min(1, Math.max(0, viewportY2 / windowHeight));
        id("horizontal-progress").style.width = (progress * windowWidth) + "px";
    }

    function onScorllEventCore(tocItemArray) {
        tocOnScroll(tocItemArray);
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
