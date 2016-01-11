function SafeCSSClass(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '-' // everything else becomes dash
  });
}

function TrieString(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 32) return '_';
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '' // everything else becomes dash
  });
}

function CreateKeyboard() {
  var inputbox = document.querySelector("._5irm");
  var iconbox = document.createElement("div");
  iconbox.className = "key-icon";
  var autoarea = document.createElement("div");
  autoarea.className = "auto-region";
  var autoul = document.createElement("ul");
  autoarea.appendChild(autoul);
  iconbox.appendChild(autoarea);
  var parent = inputbox.parentNode;
  if (parent.firstChild.className != "key-icon") {
    inputbox.parentNode.insertBefore(iconbox, inputbox);
  }
  SetKeyboardEvents();
}

function ClearAuto() {
  var autoarea = document.querySelector(".auto-region");
  autoarea.innerHTML = "";
  var autoul = document.createElement("ul");
  autoarea.appendChild(autoul);
}

function SetAutocomplete(results) {
  var autoarea = document.querySelector(".auto-region");
  autoarea.innerHTML = "";
  var autoul = document.createElement("ul");
  var noresults = true;
  for (var i = 0; i < results.length; i++) {
    if (results[i] != undefined) {
      var li = document.createElement("li");
      li.textContent = results[i]["name"];
      autoul.appendChild(li);
      noresults = false;
    }
  }
  if (noresults) {
    document.querySelector(".auto-region").style.display = "none";
  }
  autoarea.appendChild(autoul);
}

function SetKeyboardEvents() {
  document.onkeyup = function (e) {
    ClearAuto();
    var textbox = document.querySelector("._45m_._2vxa");
    var content = textbox.firstChild.firstChild.textContent;
    if (content != "") {
      document.querySelector(".auto-region").style.display = "block";
      var words = content.trim().split(' ');
      var lastword = words.pop();
      var results = [];
      if (words.length > 0) {
        var word2 = words.pop() + " " + lastword;
      }
      if (words.length > 0) {
        var word3 = words.pop() + " " + word2;
      }
      if (word3 != undefined) {
        results = results.concat(trie.find(TrieString(word3)));
      }
      if (word2 != undefined) {
        results = results.concat(trie.find(TrieString(word2)));
      }
      results = results.concat(trie.find(TrieString(lastword)));
      console.log(results);
      SetAutocomplete(results);
    } else {
      document.querySelector(".auto-region").style.display = "none";
    }
  };
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