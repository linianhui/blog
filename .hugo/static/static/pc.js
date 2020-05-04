"use strict";

(function (window, document, navigator) {
    function isMobile() {
        return /.*Mobile.*/.test(navigator.userAgent);
    }

    function isPC() {
        return !isMobile();
    }

    function addMobileCssFile(href) {
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
            var element = document.getElementById(arguments[i]);
            toggleClassNameCore(element, className);
        }
    }

    function getFragmentIdFromUrl(url) {
        var fragmentIdIndex = (url || '').indexOf('#');
        if (fragmentIdIndex != -1) {
            return url.substr(fragmentIdIndex + 1);
        }
    }

    function resetBodyStyle() {
        var tocElement = document.getElementById('toc');
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
            var anchorElement = document.getElementById(fragmentId);
            if (anchorElement) {
                tocItemArray.push({
                    aElement: aElement,
                    anchorElement: anchorElement
                });
            }
        });
        return tocItemArray;
    }

    function resetSelectedTocItemStyle(tocItemArray, selectedTocItem) {
        tocItemArray.forEach(function (tocItem) {
            removeClassName(tocItem.aElement, 'selected');
        });
        appendClassName(selectedTocItem.aElement, 'selected');
    }

    function resetSelectedTocStyle(tocItemArray, scrollTop) {
        for (var i = 0; i < tocItemArray.length; i++) {
            var current = tocItemArray[i];
            var next = tocItemArray[i + 1];
            if (scrollTop > current.anchorElement.offsetTop) {
                if (next && (scrollTop >= next.anchorElement.offsetTop)) {
                    continue;
                }
                resetSelectedTocItemStyle(tocItemArray, current);
                break;
            }
        }
    }


    function tocAnchorElementAddAElement(tocItemArray) {
        if (tocItemArray) {
            tocItemArray.forEach(function (tocItem) {
                var anchorElement = tocItem.anchorElement;
                if (anchorElement) {
                    anchorElement.innerHTML = '<a href="#'
                        + anchorElement.id
                        + '" class="fa fa-link article-h-a" aria-hidden="true"></a>'
                        + anchorElement.innerHTML;
                }
            });
        }
    }

    function tocOnScroll(tocItemArray) {
        if (tocItemArray) {
            var scrollTop = window.scrollY + 32;
            resetSelectedTocStyle(tocItemArray, scrollTop);
        }
    }

    function addOnScorllEvent() {
        var tocItemArray = getTocItemArray();
        tocAnchorElementAddAElement(tocItemArray);
        window.onscroll = function () {
            tocOnScroll(tocItemArray);
        };
    }

    function toggleToc() {
        toggleClassNameCore(document.getElementById('toc'), 'opened');
        resetBodyStyle();
    }

    window.blog = {
        isMobile: isMobile,
        isPC: isPC,
        addMobileCssFile: addMobileCssFile,
        toggleClassName: toggleClassName,
        addOnScorllEvent: addOnScorllEvent,
        toggleToc: toggleToc
    };

})(window, document, navigator);
