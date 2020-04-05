
"use strict";

(function (window, document, navigator) {
    function isMobile() {
        return /.*Mobile.*/.test(navigator.userAgent);
    }

    function isPC() {
        return !isMobile();
    }

    function addMobileCss(href) {
        document.write('<link href="' + href + '" rel="stylesheet">');
    }

    function addAnalyzes() {
        document.write(unescape("%3Cspan id='cnzz_stat_icon_1278011463'%3E%3C/span%3E%3Cscript src='https://s4.cnzz.com/z_stat.php%3Fid%3D1278011463%26show%3Dpic' type='text/javascript'%3E%3C/script%3E"));
    }

    function tocResetStyle() {
        var tocElement = document.getElementById('toc');
        var tocElementOffsetWidth = tocElement.offsetWidth;
        document.body.style.marginLeft = tocElementOffsetWidth + 'px';
    }

    function tocGetAnchorIdFromUrl(url) {
        var fragmentIndex = (url || '').lastIndexOf('#');
        if (fragmentIndex != -1) {
            return url.substr(fragmentIndex + 1);
        }
    }

    function tocGetAnchorElementArray() {
        var anchorElementArray = [];
        document.querySelectorAll('#toc a').forEach(function (aElement) {
            var anchorId = tocGetAnchorIdFromUrl(aElement.href);
            if (anchorId) {
                var anchorElement = document.getElementById(anchorId);
                if (anchorElement) {
                    anchorElementArray.push({
                        aElement: aElement,
                        anchorElement: anchorElement,
                        offsetTop: anchorElement.offsetTop
                    });
                }
            }
        });
        return anchorElementArray;
    }

    function tocSelectedTocItem(anchorElementArray, selectedItem) {
        anchorElementArray.forEach(function (anchorElement) {
            anchorElement.aElement.className = '';
        });
        selectedItem.aElement.className = 'selected';
    }

    function tocSelectedToc(anchorElementArray, scrollTop) {
        for (var i = 0; i < anchorElementArray.length; i++) {
            var current = anchorElementArray[i];
            var next = anchorElementArray[i + 1];
            if (scrollTop > current.offsetTop) {
                if (next && (scrollTop >= next.offsetTop)) {
                    continue;
                }
                tocSelectedTocItem(anchorElementArray, current);
                break;
            }
        }
    }


    function tocAnchorElementAddAElement(anchorElementArray) {
        anchorElementArray.forEach(function (anchorElement) {
            var element = anchorElement.anchorElement;
            if (element) {
                element.innerHTML = '<a href="#' + element.id + '" class="fa fa-hashtag article-h-a" aria-hidden="true"></a>' + element.innerHTML;
            }
        });
    }

    function tocOnScroll(anchorElementArray) {
        var scrollTop = window.scrollY + 32;
        tocSelectedToc(anchorElementArray, scrollTop);
    }


    function tocAddOnScorllEvent() {
        var anchorElementArray = tocGetAnchorElementArray();
        tocAnchorElementAddAElement(anchorElementArray);
        if (anchorElementArray.length != 0) {
            window.onscroll = function () {
                tocOnScroll(anchorElementArray);
            };
        }
    }

    window.lnh = {
        isMobile: isMobile,
        isPC: isPC,
        css: {
            addMobileCss: addMobileCss
        },
        analyzes: {
            addAnalyzes: addAnalyzes
        },
        toc: {
            resetStyle: tocResetStyle,
            addOnScorllEvent: tocAddOnScorllEvent
        }
    };

})(window, document, navigator);
