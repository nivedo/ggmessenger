function SafeCSSClass(name, type) {
  namestr = NormString(type) + "_" + NormString(name);
  return namestr;
}

function NormString(str) {
  return str.trim().replace(/[^a-z0-9]/g, function(s) {
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

function RandomGUID() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function ScrollDown() {
    var s = document.querySelector("._4_j4 .scrollable");
    s.scrollTop = s.scrollHeight;
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
      this.className = "icon hs";
      this.alt = "hs";
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
  var keytype = document.querySelector(".icon").alt;
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
        preview.className = "preview-region sticker " + SafeCSSClass(this.textContent, keytype);
        preview.style.cssText = stylemap[SafeCSSClass(this.textContent, keytype)];
      };
      link.onmouseout = function() {
        preview.className = "preview-region";
        preview.style.cssText = "";
      };
      
      link.onclick = function() {
        var partial = document.querySelector(".auto-region").alt;
        var textbox = document.querySelector("._45m_._2vxa");
        var tmp = textbox[Object.getOwnPropertyNames(textbox)[0]]._currentElement._owner._currentElement._owner._currentElement._owner._currentElement._owner._instance;
        //tmp._sendMessage()
        tmp.props.onMessageSend("[" + keytype + "::" + this.textContent + "]")
        tmp._typingDetector.resetState();
        tmp._resetState(function() {
          return this._saveCurrentEditorState();
        });
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
  } else {
    autoarea.style.display = "block";
    preview.style.display = "block";
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
    var results = [];
    var partial = '';

    if (content.length > 0 && content.charAt(0) == "@") {
      var searchstr = TrieString(content.substring(1));
      var fullres = trie[keytype].find(searchstr);
      if (fullres != undefined) {
        for(var k = 0; k < fullres.length; k++) {
          if (fullres[k].type == keytype) {
            results = results.concat(fullres[k]);
          }
        }
      }
    } else {
      var lasttoken = content.trim().split(']').pop();
      var endpart = lasttoken.trim().split('[');

      if (endpart.length > 1) {
        var opentoken = endpart.pop();
        var n = content.lastIndexOf(opentoken);
        var partial = content.slice(0,n-1);

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
            var partialres = trie[keytype].find(queries[j]);
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
    }

    if (results.length > 0) {
      SetAutocomplete(results, partial);
    } else {
      autoarea.style.display = "none";
      preview.style.display = "none";
    }
  };
}

var urlcount = 0;

function ParseURL(url, elemid, type) {
  if (url in cachemap) {
    //CreateCardFromCache(url, elemid);
    setTimeout(function(a,b) { CreateCardFromCache(a,b); }, 0, url, elemid);
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function (e) {
    urlcount--;
    if(this.status == 200 || this.status == 304) {
      var cleanresp = this.responseText.replace(/<script(.|\s)*?\/script>/g, '');
      cleanresp = cleanresp.replace(/<img(.|\s)*?>/g, '');
      if(type == "tappedout") {
        cachemap[url] = CreateTappedoutCard(cleanresp, elemid);
      }
      if(type == "mtggoldfish") {
        cachemap[url] = CreateMtggoldfishCard(cleanresp, elemid);
      }
      if(type == "mtgsalvation") {
        cachemap[url] = CreateMTGSalvationCard(cleanresp, elemid);
      }
      if(type == "channelfireball") {
        cachemap[url] = CreateChannelFireballCard(cleanresp, elemid);
      }
      if(type == "hearthpwn") {
        cachemap[url] = CreateHearthpwnCard(cleanresp, elemid);
      }
      if(type == "tempostorm") {
        cachemap[url] = CreateTempostormCard(cleanresp, elemid);
      }
      FixTooltips();
      ScrollDown();
    }
  };
  urlcount++;
  xhr.send(null);
}

function CreateCardFromCache(url, elemid) {
  var elem = document.getElementById(elemid);
  elem.innerHTML = cachemap[url];
  FixTooltips();
  ScrollDown();

  return elem.innerHTML;
}

function CreateHearthpwnCard(result, elemid) {
  var elem = document.getElementById(elemid);
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = result;

  var title = tempDiv.querySelector("title");
  var members = tempDiv.querySelectorAll(".col-name b a, .t-deck-details-card-list.class-listing h4, .t-deck-details-card-list.neutral-listing h4");

  var deckstr = "<div class='inline-wrap'><div class='inline-preview hs'></div></div>" + 
    "<div class='inline-icon hs'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    elem.firstChild.innerHTML + "'>" + title.textContent + "</a>\n<span>via <a href='http://www.hearthpwn.com'>Hearthpwn.com</a></span></div><div class='cardlist'><ul>";
  for(j = 0; j < members.length; j++) {
    if (members[j].nodeName == "H4") {
      deckstr = deckstr + "<li class='separator'>" + members[j].innerHTML.trim() + "</li>";
    } else {
      var name = members[j].innerHTML.trim();
      var qty = members[j].getAttribute("data-count");
      deckstr = deckstr + "<li>" + (qty + "x [hs::" + name + "]\n</li>");
    }
  }
  deckstr += "</ul></div>";
  elem.innerHTML = deckstr;
  elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip noshow" data-preview="' + elemid + '" target="_blank" rel="$1">$2</a>');
  
  return elem.innerHTML;
}

function CreateTempostormCard(result, elemid) {
  var elem = document.getElementById(elemid);
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = result;

  var title = tempDiv.querySelector("title");
  var qtys = tempDiv.querySelectorAll(".db-deck-card-qty");
  var members = tempDiv.querySelectorAll(".db-deck-card-name");

  var deckstr = "<div class='inline-wrap'><div class='inline-preview'></div></div>" + 
    "<div class='inline-icon hs'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    elem.firstChild.innerHTML + "'>" + title.textContent + "</a>\n<span>via <a href='http://www.tempostorm.com'>Tempostorm.com</a></span></div><div class='cardlist'><ul>";
  for(j = 0; j < members.length; j++) {
    var name = members[j].innerHTML.trim();
    var qty = qtys[j].innerHTML.trim();
    deckstr = deckstr + "<li>" + (qty + "x [mtg::" + name + "]\n</li>");
  }
  deckstr += "</ul></div>";
  elem.innerHTML = deckstr;
  elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip noshow" data-preview="' + elemid + '" target="_blank" rel="$1">$2</a>');

  return elem.innerHTML;
}

function CreateChannelFireballCard(result, elemid) {
  var elem = document.getElementById(elemid);
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = result;

  var title = tempDiv.querySelector("title");
  var decklist = tempDiv.querySelector(".crystal-catalog-helper.crystal-catalog-helper-list");
  var deckname = decklist.previousSibling.previousSibling.innerHTML;
  if (deckname == undefined) {
    deckname = title;
  }
  var members = decklist.querySelectorAll("a.crystal-catalog-helper-list-item, span.crystal-catalog-helper-subtitle");
  var deckstr = "<div class='inline-wrap'><div class='inline-preview'></div></div>" + 
    "<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    elem.firstChild.innerHTML + "'>" + deckname + "</a>\n<span>via <a href='http://www.channelfireball.com'>ChannelFireball.com</a></span></div><div class='cardlist'><ul>";
  for(j = 0; j < members.length; j++) {
    if (members[j].nodeName == "SPAN") {
      deckstr = deckstr + "<li class='separator'>" + members[j].innerHTML.trim() + "</li>";
    } else {
      var name = members[j].getAttribute('data-name');
      var qty = members[j].querySelector(".qty").innerHTML;
      deckstr = deckstr + "<li>" + (qty + "x [mtg::" + name + "]\n</li>");
    }
  }
  deckstr += "</ul></div>";
  elem.innerHTML = deckstr;
  elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip noshow" data-preview="' + elemid + '" target="_blank" rel="$1">$2</a>');

  return elem.innerHTML;
}

function CreateTappedoutCard(result, elemid) {
  var elem = document.getElementById(elemid);
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = result;

  var title = tempDiv.querySelector("title");

  var members = tempDiv.querySelectorAll(".boardlist .member .qty.board, .board-col h3, .board-col a[href*='mtg-card']:not([rel])");
  var deckstr = "<div class='inline-wrap'><div class='inline-preview'></div></div>" + 
    "<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    elem.firstChild.innerHTML + "'>" + title.textContent + "</a>\n<span>via <a href='http://www.tappedout.net'>Tappedout.net</a></span></div><div class='cardlist'><ul>";
  for(j = 0; j < members.length; j++) {
    if (members[j].nodeName == "H3") {
      deckstr = deckstr + "<li class='separator'>" + members[j].innerHTML.trim() + "</li>";
    } else {
      if (members[j].getAttribute("href") != "#") {
        var name = members[j].getAttribute("href");
        name = name.replace("/mtg-card/",'');
        name = name.replace("/",'');
        name = name.split("-").join(' ');
        deckstr = deckstr + "<li>[mtg::" + name + "]\n</li>";
      } else {
        var name = members[j].getAttribute('data-name');
        var qty = members[j].getAttribute('data-quantity');
        deckstr = deckstr + "<li>" + (qty + "x [mtg::" + name + "]\n</li>");
      }
    }
  }
  deckstr += "</ul></div>";
  elem.innerHTML = deckstr;
  elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip noshow" data-preview="' + elemid + '" target="_blank" rel="$1">$2</a>');

  return elem.innerHTML;
}

function CreateMtggoldfishCard(result, elemid) {
  var elem = document.getElementById(elemid);
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = result;

  var title = tempDiv.querySelector("title");
  var qtys = tempDiv.querySelectorAll(".deck-view-deck-table tbody tr .deck-col-qty");
  var members = tempDiv.querySelectorAll(".deck-view-deck-table tbody tr .deck-col-card a");

  var deckstr = "<div class='inline-wrap'><div class='inline-preview'></div></div>" + 
    "<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    elem.firstChild.innerHTML + "'>" + title.textContent + "</a>\n<span>via <a href='http://www.mtggoldfish.com'>MTGGoldfish.com</a></span></div><div class='cardlist'><ul>";
  for(j = 0; j < members.length; j++) {
    var name = members[j].innerHTML.trim();
    var qty = qtys[j].innerHTML.trim();
    deckstr = deckstr + "<li>" + (qty + "x [mtg::" + name + "]\n</li>");
  }
  deckstr += "</ul></div>";
  elem.innerHTML = deckstr;
  elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip noshow" data-preview="' + elemid + '" target="_blank" rel="$1">$2</a>');

  return elem.innerHTML;
}

function CreateMTGSalvationCard(result, elemid) {
  var elem = document.getElementById(elemid);
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = result;

  var deckwrap = tempDiv.querySelector(".forum-deck-wrapper .deck");
  var deckinfo = JSON.parse(deckwrap.getAttribute("data-card-list"));
  var members = deckinfo["Deck"];
  var title = tempDiv.querySelector("header.caption-threads h2");

  var deckstr = "<div class='inline-wrap'><div class='inline-preview'></div></div>" + 
   "<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    elem.firstChild.innerHTML + "'>" + title.textContent + "</a>\n<span>" + deckinfo["Name"] + " via <a href='http://www.mtgsalvation.com'>MTGSalvation.com</a></span></div><div class='cardlist'><ul>";
  for(j = 0; j < members.length; j++) {
    var name = members[j]["CardName"];
    var qty = members[j]["Qty"];
    deckstr = deckstr + "<li>" + (qty + "x [mtg::" + name + "]\n</li>");
  }
  deckstr += "</ul></div>";
  elem.innerHTML = deckstr;
  elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip noshow" data-preview="' + elemid + '" target="_blank" rel="$1">$2</a>');

  return elem.innerHTML;
}

function CallbackMTG() {
  if(libnum == 0 || libload < libnum) return;

  var elems = document.querySelectorAll('div > span._3oh-'), i, elem;
  // TODO: Split this into two sections.  Sticker parsing vs. URL parsing.
  for (i = 0; i < elems.length; ++i) {
    elem = elems[i]
    var stickerPattern = /^\[[^\[\]]+::[^\[\]]+\]$/i
    if (stickerPattern.test(elem.innerHTML)) {
      var split = elem.innerHTML.substring(1,elem.innerHTML.length-1).split("::");
      var safeclass = SafeCSSClass(split[1], split[0]);
      if(split[0] == "mtg") {
        elem.innerHTML = '<div class="sticker ' + safeclass + '" style="' + stylemap[safeclass] + '"><ul class="mtg">' + 
          '<li><a href="http://gatherer.wizards.com/Pages/Card/Details.aspx?name=' + encodeURIComponent(split[1]) + '" target="_blank">📖</a></li>' + 
          '<li><a href="http://sales.starcitygames.com/cardsearch.php?singlesearch=' + encodeURIComponent(split[1]) + '" target="_blank">💰</a></li>' + 
          '</ul></div>'
      } else {
        if(split[0] == "hs") {
          elem.innerHTML = '<div class="sticker ' + safeclass + '" style="' + stylemap[safeclass] + '"><ul class="hs">' + 
            '<li><a href="http://www.hearthpwn.com/cards?filter-name=' + encodeURIComponent(split[1]) + '" target="_blank">📖</a></li>' + 
            '</ul></div>'
        } else {
          elem.innerHTML = '<div class="sticker ' + safeclass + '" style="' + stylemap[safeclass] + '"></div>';
        }
      }
      elem.parentNode.style.cssText = 'padding: 0; background-color:transparent !important';
    } else {
      if (elem.innerHTML.indexOf('</a>') == -1) {
        elem.innerHTML = elem.innerHTML.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, '<a class="tooltip" target="_blank" rel="$1">$2</a>');
      }
      // Detect HTML match string and set appropriate data-type
      if (!elem.hasAttribute("data-type") && elem.innerHTML.indexOf('</a>') > 0) {
        if (elem.innerHTML.indexOf('tappedout.net') > 0) {
          elem.setAttribute("data-type","tappedout");
          elem.id = RandomGUID();
          elem.parentNode.parentNode.className += " hidecard";
          ParseURL(elem.firstChild.innerHTML, elem.id, "tappedout");
        }
        if (elem.innerHTML.indexOf('mtggoldfish.com/deck') > 0 || elem.innerHTML.indexOf('mtggoldfish.com/archetype') > 0) {
          elem.setAttribute("data-type","mtggoldfish");
          elem.id = RandomGUID();
          elem.parentNode.parentNode.className += " hidecard";
          ParseURL(elem.firstChild.innerHTML, elem.id, "mtggoldfish");
        }
        if (elem.innerHTML.indexOf('mtgsalvation.com') > 0) {
          elem.setAttribute("data-type","mtgsalvation");
          elem.id = RandomGUID();
          elem.parentNode.parentNode.className += " hidecard";
          ParseURL(elem.firstChild.innerHTML, elem.id, "mtgsalvation");
        }
        if (elem.innerHTML.indexOf('channelfireball.com') > 0) {
          elem.setAttribute("data-type","channelfireball");
          elem.id = RandomGUID();
          elem.parentNode.parentNode.className += " hidecard";
          ParseURL(elem.firstChild.innerHTML, elem.id, "channelfireball");
        }
        if (elem.innerHTML.indexOf('hearthpwn.com/decks') > 0) {
          elem.setAttribute("data-type","hearthpwn");
          elem.id = RandomGUID();
          elem.parentNode.parentNode.className += " hidecard";
          ParseURL(elem.firstChild.innerHTML, elem.id, "hearthpwn");
        }
        /*
        if (elem.innerHTML.indexOf('tempostorm.com/hearthstone/decks') > 0) {
          elem.setAttribute("data-type","tempostorm");
          elem.id = RandomGUID();
          elem.parentNode.parentNode.className += " hidecard";
          ParseURL(elem.firstChild.innerHTML, elem.id, "tempostorm");
        }
        */
      }
    }
  }

  FixTooltips();
}

function FixTooltips() {
  var tooltips = document.querySelectorAll('._nd_ .tooltip')
  for (i = 0; i < tooltips.length; ++i) {
    if (!hasClass(tooltips[i], "right")) {
      tooltips[i].className += " right"
    }
  }
  
  var tooltips = document.querySelectorAll('.tooltip[rel]')
  for (i = 0; i < tooltips.length; ++i) {
    var safeclass = SafeCSSClass(tooltips[i].textContent, tooltips[i].rel);
    if (!hasClass(tooltips[i], safeclass)) {
      tooltips[i].className += (" " + safeclass)
      if (tooltips[i].rel == "mtg") {
        tooltips[i].href = "http://gatherer.wizards.com/Pages/Card/Details.aspx?name=" + encodeURIComponent(tooltips[i].textContent);
      }
      if (tooltips[i].rel == "hs") {
        tooltips[i].href = "http://www.hearthpwn.com/cards?filter-name=" + encodeURIComponent(tooltips[i].textContent);
      }
      if(hasClass(tooltips[i], "noshow") && tooltips[i].hasAttribute("data-preview")) {
        tooltips[i].onmouseover = function() {
          var elem = this.closest('span._3oh-');
          var inpreview = elem.querySelector(".inline-preview");
          var safeclass = SafeCSSClass(this.textContent, this.rel);
          inpreview.className += " sticker";
          inpreview.style.cssText = stylemap[safeclass];
        }
        tooltips[i].onmouseout = function() {
          var elem = this.closest('span._3oh-');
          var inpreview = elem.querySelector(".inline-preview");
          inpreview.className = inpreview.className.replace("sticker","");
          inpreview.style.cssText = "";
        }
      } else {
        tooltips[i].textContent = tooltips[i].textContent;
        tooltips[i].onmouseover = function() {
          var safeclass = SafeCSSClass(this.textContent, this.rel);
          this.style.cssText = stylemap[safeclass];
        }
        tooltips[i].onouseout = function() {
          this.style.cssText = "";
        }
      }
    }
  }
}

function hasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function loadPluginFromJSON(jsonpath, extracss, type) {
  libnum++;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", jsonpath, true);
  xhr.addEventListener( 'load',  function () {
    xhr.responseJSON = JSON.parse( xhr.responseText );
    loadHelper( xhr.responseJSON, extracss, type );
    CallbackMTG();
    libload++;
  });

  xhr.send();
}

function loadHelper(lib, extracss, type) {
  var jsfull = 'trie["' + type + '"] = new Triejs({sort: function() {this.sort(function(a, b) {return a.name.localeCompare(b.name);})}});';
  var count = 0;
  var closed = true;
  for (var i = 0; i < lib.length; i++) {
    var bundleId = lib[i]["bundleId"];
    var ext = lib[i]["ext"];
    var sublib = lib[i]["assets"];
    for( var j = 0; j < sublib.length; j++) {
      // Hacky "async" optimization to not lock UI
      if (count % 100 == 0) {
        jsfull += "setTimeout(function() {";
        closed = false;
      }
      var name = sublib[j]["name"];
      var words = name.trim().split(' ');
      var lastword = "";
      while (words.length > 0) {
        var word = words.pop();
        var nextword = word + " " + lastword;
        // longer word, or beginning of word, add to trie
        if (word.length > 3 || words.length == 0) {
          var jsline = 'trie["' + type + '"].add("'+ 
            TrieString(nextword) + 
            '", {name: "' + 
            name.replace(/"/g, '\\"') + 
            '", type: "' + type + '"});';
          jsfull += jsline;
        }
        lastword = nextword;
      }
      //jsfull += ('stylemap["' + SafeCSSClass(name) + '"] = "' + extracss + 'background-image:url(\'https://d1fyt5lxvxva06.cloudfront.net/' + bundleId + '/' +  sublib[j]["id"] + '.' + ext + '\');";');
      if (count % 100 == 99) {
        jsfull += "}, " + (count - count % 100) / 2 + ");"
        closed = true;
      }
      stylemap[SafeCSSClass(name, type)] = extracss + 
        "background-image:url('https://d1fyt5lxvxva06.cloudfront.net/" + bundleId + "/" +  sublib[j]["id"] + "." + ext + "') !important;";
      count++;
    }
  }
  if (!closed) {
    jsfull += "}, " + (i - i % 100) + ");"
  }
  eval(jsfull);
}

var trie = {};
var stylemap = {};
var cachemap = {};
var libnum = 0;
var libload = 0;