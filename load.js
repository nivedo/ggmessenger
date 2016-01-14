function SafeCSSClass(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 198) return "ae";
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '-' // everything else becomes dash
  });
}

function TrieString(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 32) return '_';
    if (c == 198) return "ae";
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '' // everything else becomes dash
  });
}

function ScrollDown() {
  var s = document.querySelector("._4_j4 .scrollable");s.scrollTop = s.scrollHeight;
}

function CreateKeyboard(default_type) {
  var inputbox = document.querySelector("._5irm");
  var iconwrap = document.createElement("div");
  iconwrap.className = "key-icon";
  var iconbox = document.createElement("div");
  iconbox.className = "icon " + default_type;
  iconbox.alt = default_type;
  iconbox.onclick = function() {
    if (this.className == "icon mtg") {
      this.className = "icon hearthstone";
      this.alt = "hearthstone";
    } else {
      this.className = "icon mtg";
      this.alt = "mtg";
    }
  }
  iconwrap.appendChild(iconbox);
  var autoarea = document.createElement("div");
  autoarea.className = "auto-region";
  var autoul = document.createElement("ul");
  autoarea.appendChild(autoul);
  iconwrap.appendChild(autoarea);
  var preview = document.createElement("div");
  preview.className = "preview-region";
  iconwrap.appendChild(preview);
  var parent = inputbox.parentNode;
  if (parent.firstChild.className.split(' ')[0] != "key-icon") {
    inputbox.parentNode.insertBefore(iconwrap, inputbox);
  }
  SetKeyboardEvents();
}

function ClearAuto() {
  var autoarea = document.querySelector(".auto-region");
  autoarea.innerHTML = "";
  var autoul = document.createElement("ul");
  autoarea.appendChild(autoul);
}

function SetAutocomplete(results, partial) {
  var autoarea = document.querySelector(".auto-region");
  autoarea.alt = partial;
  var preview = document.querySelector(".preview-region");
  autoarea.innerHTML = "";
  var autoul = document.createElement("ul");
  var noresults = true;
  var names = [];
  for (var i = 0; i < results.length; i++) {
    if (results[i] != undefined && names.indexOf(results[i]["name"]) < 0) {
      names = names.concat(results[i]["name"]);
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.textContent = results[i]["name"];
      link.onmouseover = function() {
        preview.className = "preview-region sticker " + SafeCSSClass(this.textContent);
      };
      link.onmouseout = function() {
        preview.className = "preview-region";
      };
      
      link.onclick = function() {
        var partial = document.querySelector(".auto-region").alt;
        var textbox = document.querySelector("._45m_._2vxa");
        var tmp = textbox[Object.getOwnPropertyNames(textbox)[0]]._currentElement._owner._currentElement._owner._currentElement._owner._currentElement._owner._instance;
        //tmp._sendMessage()
        tmp.props.onMessageSend("[" + this.textContent + "]")
        //textbox.firstChild.firstChild.textContent = partial + " " + this.textContent;
        
        preview.className = "preview-region";
        autoarea.style.display = "none";
        preview.style.display = "none";
      };
      li.appendChild(link);
      //li.className = "tooltip " + SafeCSSClass(results[i]["name"]);
      autoul.appendChild(li);
      noresults = false;
    }
  }
  if (noresults) {
    autoarea.style.display = "none";
    preview.style.display = "none";
  }
  preview.className = "preview-region";
  autoarea.appendChild(autoul);
}

function SetKeyboardType(keytype) {
  document.querySelector(".icon").alt = keytype;
}

function SetKeyboardEvents() {
  document.querySelector("._5irm").onkeydown = function(e) {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
    }
  }
  document.onkeyup = function (e) {
    ClearAuto();
    var keytype = document.querySelector(".icon").alt;
    var autoarea = document.querySelector(".auto-region");
    var preview = document.querySelector(".preview-region");
    var textbox = document.querySelector("._45m_._2vxa");
    var content = textbox.firstChild.firstChild.textContent;
    var lasttoken = content.trim().split(']').pop();
    var endpart = lasttoken.trim().split('[');
    var results = [];

    if (endpart.length > 1) {
      var opentoken = endpart.pop();
      var n = content.lastIndexOf(opentoken);
      var partial = content.slice(0,n-1);

      autoarea.style.display = "block";
      preview.style.display = "block";
      var words = opentoken.trim().split(' ');
      var lastword = TrieString(words.pop());
      if (lastword.length > 0) {
        var queries = [lastword];
        
        var depth = 4;
        for(var j = depth; j > 0 && words.length > 0; j--) {
          var nextword = TrieString(words.pop()) + "_" + lastword;
          queries = queries.concat(nextword);
          lastword = nextword;
        }

        
        for(var j = queries.length-1; j >= 0; j--) {
          var partialres = trie.find(queries[j]);
          if (partialres != undefined) {
            for(var k = 0; k < partialres.length; k++) {
              if (partialres[k].type == keytype) {
                results = results.concat(partialres[k]);
              }
            }
          }
        }
      }
    }

    if (results.length > 0) {
      SetAutocomplete(results, partial);
    } else {
      autoarea.style.display = "none";
      preview.style.display = "none";
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
      elem.innerHTML = '<div class="sticker ' + safeclass + '"></div>'
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