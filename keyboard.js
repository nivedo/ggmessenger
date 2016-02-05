'use strict';
const utils = require('./utils');
const autosize = require('autosize');
const ipc = require('electron').ipcRenderer;

function CreateCustomKeyboard(default_type) {
  var inputbox = document.querySelector("._5irm ._kmc");
  if (inputbox.querySelector(".custom-key") == undefined) {
    var newbox = document.createElement("textarea");
    newbox.className = "custom-key";
    newbox.setAttribute("placeholder","Type a message, or link a card with @cardname...");
    inputbox.onkeyup = function (e) {
      ClearAuto();
      var content = document.querySelector(".custom-key").value;
      var keytype = document.querySelector(".icon").alt;
      ipc.send('autocomplete', [keytype, content]);
    };
    //autosize(newbox);
    inputbox.appendChild(newbox);
  }
}

function CreateAutocomplete(default_type) {
  var inputbox = document.querySelector("._5irm");
  var iconwrap = document.createElement("div");
  iconwrap.className = "key-icon";
  var iconbox = document.createElement("div");
  iconbox.className = "icon " + default_type;
  iconbox.alt = default_type;

  /* TODO: fix this to load from the core JSON with selectable menu */
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
  SetPlaceholder();
}

function ClearAuto() {
  var autoarea = document.querySelector(".auto-region");
  autoarea.innerHTML = "";
  var autoul = document.createElement("ul");
  autoarea.appendChild(autoul);
}

function SendMessage(msg) {
  var textbox = document.querySelector("._45m_._2vxa");

  /* MAGIC: send a facebook "sticker" */
  var tmp = textbox[Object.getOwnPropertyNames(textbox)[0]]._currentElement._owner._currentElement._owner._currentElement._owner._currentElement._owner._instance;
  tmp.props.onMessageSend(msg)
  tmp._typingDetector.resetState();
  tmp._resetState(function() {
    return this._saveCurrentEditorState();
  });
  //document.querySelector(".custom-key").value = "";
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
      link.setAttribute("style-preview", results[i]["css"]);
      link.onmouseover = function() {
        preview.className = "preview-region sticker " + utils.SafeCSSClass(this.textContent, keytype);
        preview.style.cssText = this.getAttribute("style-preview");
      };
      link.onmouseout = function() {
        preview.className = "preview-region";
        preview.style.cssText = "";
      };
      
      link.onclick = function() {
        var partial = document.querySelector(".auto-region").alt;
        SendMessage("[" + keytype + "::" + this.textContent + "]");

        // Clear preview area
        preview.className = "preview-region";
        autoarea.style.display = "none";
        preview.style.display = "none";
      };
      li.appendChild(link);
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

function SetPlaceholder() {
  var placeElem = document.querySelector("._1p1t ._1p1v");
  if(placeElem && placeElem.className.indexOf("show") == -1) {
    placeElem.innerHTML = "Type a message, or link a card with @cardname...";
    placeElem.className += " show";
  }
}

function SetKeyboardType(keytype) {
  document.querySelector(".icon").alt = keytype;
}

function SetKeyboardEvents() {
  document.onkeyup = function (e) {
    ClearAuto();
    var textbox = document.querySelector("._45m_._2vxa");
    var content = textbox.firstChild.firstChild.textContent;
    var keytype = document.querySelector(".icon").alt;

    ipc.send('autocomplete', [keytype, content]);

    if(content.length == 0) SetPlaceholder();
  };
}

/* IPC callback */

ipc.on('autocomplete', (evt, results) => {
  var autoarea = document.querySelector(".auto-region");
  var preview = document.querySelector(".preview-region");

  if (results.length > 0) {
    SetAutocomplete(results, '');
  } else {
    autoarea.style.display = "none";
    preview.style.display = "none";
  }
});

/* Exports */

exports.init = (default_type) => {
  CreateAutocomplete(default_type);
  //CreateCustomKeyboard(default_type);
}