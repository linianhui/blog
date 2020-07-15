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

    function getScrollTop() {
        return window.scrollY;
    }

    function getClientHeight() {
        return document.documentElement.clientHeight;
    }

    function getBodyHeight() {
        return document.body.offsetHeight;
    }

    function addMobileCssUrl(href) {
        document.write('<link href="' + href + '" rel="stylesheet">');
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
            var anchorElement = id(fragmentId);
            if (anchorElement) {
                tocItemArray.push({
                    aElement: aElement,
                    anchorElement: anchorElement
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

    function refreshSelectedTocStyle(tocItemArray, scrollTop, clientHeight) {
        var selectedTocItemArray = [];
        for (var i = 0; i < tocItemArray.length; i++) {
            var current = tocItemArray[i];
            var next = tocItemArray[i + 1];
            if (inViewport(current, next, scrollTop, clientHeight)) {
                selectedTocItemArray.push(current);
            }
        }

        refreshSelectedTocItemArrayStyle(tocItemArray, selectedTocItemArray);
    }

    function inViewport(currentTocItem, nextTocItem, scrollTop, clientHeight) {
        var clientEndHight = scrollTop + clientHeight;
        var currentOffsetTop = currentTocItem.anchorElement.offsetTop;
        if (currentOffsetTop > clientEndHight) {
            return false;
        }
        var nextOffsetTop = (nextTocItem && nextTocItem.anchorElement.offsetTop) || clientEndHight;
        return Math.max(currentOffsetTop, scrollTop) < Math.min(nextOffsetTop, clientEndHight);
    }

    function tocOnScroll(tocItemArray) {
        if (tocItemArray) {
            var scrollTop = getScrollTop();
            var clientHeight = getClientHeight();
            refreshSelectedTocStyle(tocItemArray, scrollTop, clientHeight);
        }
    }

    function refreshHorizontalProgressStyle() {
        var scrollTop = getScrollTop();
        var clientHeight = getClientHeight();
        var bodyHeight = getBodyHeight();
        var progress = (scrollTop + clientHeight) / bodyHeight * 100;

        if (progress < 0) {
            progress = 0;
        }

        if (progress > 100) {
            progress = 100;
        }

        id("horizontal-progress").style.width = progress + "%";
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
        addMobileCssUrl: addMobileCssUrl,
        toggleClassName: toggleClassName,
        addOnScorllEvent: addOnScorllEvent,
        toggleToc: toggleToc
    };

})(window, document, navigator);
