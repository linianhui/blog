"use strict";
(function (window, document, navigator) {

  function isMobile() {
    return navigator.userAgent.match(/.*Mobile.*/);
  }

  function isPC() {
    return !isMobile();
  }

  function removeMobileCss() {
    document.getElementsByName("mobile_css")[0].remove();
  }

  function showToc() {
    var toc = document.getElementById("toc");
    toc.style.display = "block";
    var tocWidth = toc.offsetWidth;
    if (tocWidth > 360) {
      tocWidth = 360;
      toc.style.width = tocWidth + 'px';
    }
    document.body.style.marginLeft = tocWidth + 'px';
  }

  function addComment() {
    var comment = document.getElementById("article-comment")
    if (comment) {
      comment.innerHTML = '<script src="https://utteranc.es/client.js" repo="linianhui/linianhui.github.io" issue-term="url" label="博客评论" theme="github-light" crossorigin="anonymous"></script>';
    }
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
    document.querySelectorAll("#toc a").forEach(function (a) {
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
    selectedToc(lnh.tocList, scrollTop);
  }

  function onLoad() {
    if (isPC()) {
      showToc();
      lnh.tocList = getTocList();
      if (lnh.tocList.length != 0) {
        window.onscroll = onScroll;
      }
    }
    addComment();
  }

  window.lnh = {
    isPC: isPC,
    removeMobileCss: removeMobileCss,
    onLoad: onLoad
  };

})(window, document, navigator);

window.onload = lnh.onLoad;

if (lnh.isPC()) {
  lnh.removeMobileCss();
}
