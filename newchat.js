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
  tooltips[i].className += " right"
}

var tooltips = document.querySelectorAll('.tooltip')
for (i = 0; i < tooltips.length; ++i) {
  tooltips[i].className += (" " + SafeCSSClass(tooltips[i].innerHTML))
}