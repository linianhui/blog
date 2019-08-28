"use strict";

function isMobile() {
  return navigator.userAgent.match(/.*Mobile.*/);
}

function removeMobileCss(){
  document.getElementsByName("mobile_css")[0].remove();
}

if(!isMobile()){
  removeMobileCss();
}