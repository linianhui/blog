"use strict";
(function (window, document, navigator) {

  function isMobile() {
    return navigator.userAgent.match(/.*Mobile.*/);
  }

  function removeMobileCss() {
    document.getElementsByName("mobile_css")[0].remove();
  }

  function getFragmentId(url) {
    var fragmentIndex = (url || '').lastIndexOf('#');
    if (fragmentIndex == -1) {
      return null;
    }
    return url.substr(fragmentIndex + 1);
  }

  function getTocList() {
    var tocList = [];
    document.querySelectorAll("#TableOfContents a").forEach(function (a) {
      var hId = getFragmentId(a.href);
      if (hId) {
        var h = document.getElementById(hId);
        if (h) {
          tocList.push({
            a: a,
            offsetTop: h.offsetTop
          });
        }
      }
    });

    return tocList;
  }

  function selectedTocItem(tocList, selectedItem) {
    tocList.forEach(function (item) {
      item.a.className = '';
    });
    selectedItem.a.className = 'selected';
  }

  function selectedToc(tocList, scrollTop) {
    for (var i = 0; i < tocList.length; i++) {
      var current = tocList[i];
      var next = tocList[i + 1];
      if (scrollTop > current.offsetTop) {
        if (next && (scrollTop >= next.offsetTop)) {
          continue;
        }
        selectedTocItem(tocList, current);
        break;
      }
    }
  }

  function onScroll() {
    var scrollTop = window.scrollY + 32;
    console.log("scrollTop", scrollTop);
    selectedToc(lnh.tocList, scrollTop);
  }

  function tryRegisterOnScroll() {
    if (!isMobile() && lnh.tocList.length != 0) {
      window.onscroll = onScroll;
    }
  }

  function onLoad() {
    lnh.tocList = getTocList();
    tryRegisterOnScroll();
  }

  window.lnh = {
    isMobile: isMobile,
    removeMobileCss: removeMobileCss,
    onLoad: onLoad
  };

})(window, document, navigator);

window.onload = lnh.onLoad;

if (!lnh.isMobile()) {
  lnh.removeMobileCss();
}