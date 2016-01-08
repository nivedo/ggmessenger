function SafeCSSClass(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '-' // everything else becomes dash
  });
}

function CallbackMTG() {
  var elems = document.querySelectorAll('div > span._3oh-'), i, elem;
  for (i = 0; i < elems.length; ++i) {
    elem = elems[i]
    var stickerPattern = /^\[[^\[\]]+\]$/i
    if (stickerPattern.test(elem.innerHTML)) {
      var safeclass = SafeCSSClass(elem.innerHTML)
      elem.innerHTML = '<div class="sticker ' + safeclass + '"></a>'
      elem.parentNode.style.cssText = 'padding: 0; background-color:transparent !important';
    } else {
      if (elem.innerHTML.indexOf('</a>') == -1) {
        elem.innerHTML = elem.innerHTML.replace(/(\[[^\[\]]+\])/g, '<a class="tooltip">$1</a>');
      }
    }
  }

  var tooltips = document.querySelectorAll('._nd_ .tooltip')
  for (i = 0; i < tooltips.length; ++i) {
    if (!hasClass(tooltips[i], "right")) {
      tooltips[i].className += " right"
    }
  }

  var tooltips = document.querySelectorAll('.tooltip')
  for (i = 0; i < tooltips.length; ++i) {
    var safeclass = SafeCSSClass(tooltips[i].innerHTML)
    if (!hasClass(tooltips[i], safeclass)) {
      tooltips[i].className += (" " + safeclass)
    }
  }
}

function hasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

// Mutation Observer to detect DOM Changes
var observeDOM = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    eventListenerSupported = window.addEventListener;

  return function(obj, callback){
    if( MutationObserver ){
      // define a new observer
      var obs = new MutationObserver(function(mutations, observer){
        if( mutations[0].addedNodes.length || mutations[0].removedNodes.length)
          if( mutations[0].target.nodeName != "SPAN" )
            callback();
      });
      // have the observer observe foo for changes in children
      obs.observe( obj, { childList:true, subtree:true });
    }
    else if( eventListenerSupported ){
      obj.addEventListener('DOMNodeInserted', callback, false);
      obj.addEventListener('DOMNodeRemoved', callback, false);
    }
  }
})();

// Observe a specific DOM element:
observeDOM( document.querySelector('._1q5-') ,function(){ 
  CallbackMTG()
});