'use strict';
const utils = require('./utils');
const autosize = require('autosize');
const ipc = require('electron').ipcRenderer;

function AlignKeyboard() {
  var outerwrap = document.querySelector("._2xhi");
  var topwrap = document.querySelector("._4u-c._1wfr");
  var keycontents = document.querySelector("._4rv3");
  var topheight = outerwrap.offsetHeight - keycontents.offsetHeight;
  topwrap.style.height = topheight + "px";
}

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
    && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

function OnChange() {
  AlignKeyboard();
  ClearAuto();
  SetKeyboardTooltips();
  placeCaretAtEnd(document.querySelector(".custom-key"));
}

function Send() {
  var contentbox = document.querySelector(".custom-key");
  var tooltips = contentbox.querySelectorAll(".tooltip");
  for(var i = 0; i < tooltips.length; i++) {
    tooltips[i].innerHTML = "[" + tooltips[i].getAttribute("rel") + "::" + tooltips[i].innerHTML + "]";
    tooltips[i].innerHTML = tooltips[i].innerHTML.toLowerCase();
  }
  var content = contentbox.textContent;
  SendMessage(content);
  document.querySelector(".custom-key").textContent = "";
  AlignKeyboard();
  ClearAuto();
  placeCaretAtEnd(contentbox);
}

function CreateCustomKeyboard(default_type) {
  var inputbox = document.querySelector("._5irm ._kmc");
  if (inputbox.querySelector(".custom-key") == undefined) {
    var newbox = document.createElement("div");
    newbox.className = "custom-key";
    newbox.id = "customkey";
    newbox.setAttribute("contenteditable", true);
    // Copy paste should be text only.
    newbox.addEventListener("paste", function(e) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    });
    //newbox.innerHTML = "Type a message, or link a card with @cardname...";
    inputbox.onkeydown = function(e) {
      if (e.keyCode == '13' && !e.shiftKey) {
        e.preventDefault();
        Send();  
      }
      if (e.keyCode == '9') {
        e.preventDefault();
        var autofirst = document.querySelector(".auto-region ul li a");
        if (autofirst != undefined) {
          console.log(autofirst);
          autofirst.click();
        }
      }
    }
    inputbox.onkeyup = function (e) {
      if ((e.keyCode == '13' && !e.shiftKey) || (e.keyCode == '9')) { 
        return;
      }
      var contentbox = document.getElementById("customkey");
      var content = contentbox.innerHTML.replace(/&nbsp;/g,' ');
      AlignKeyboard();
      ClearAuto();
      var keytype = document.querySelector(".icon").alt;
      var doReplace = (e.keyCode == '221');
      ipc.send('process-keyboard', [keytype, content, doReplace]);
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
  iconwrap.appendChild(autoarea);
  var preview = document.createElement("div");
  preview.className = "preview-region";
  iconwrap.appendChild(preview);
  var parent = inputbox.parentNode;
  if (parent.firstChild.className.split(' ')[0] != "key-icon") {
    inputbox.parentNode.insertBefore(iconwrap, inputbox);
  }

  //SetKeyboardEvents();
  //SetPlaceholder();
}

function ClearAuto() {
  var autoarea = document.querySelector(".auto-region");
  autoarea.innerHTML = "";
}

function SendMessage(msg) {
  if (msg.length == 0) return;
  var textbox = document.querySelector("._kmc");

  /* MAGIC: send a facebook "sticker" */
  var tmp = textbox[Object.getOwnPropertyNames(textbox)[0]]._currentElement._owner._instance;
  tmp.props.onMessageSend(msg)
  tmp._typingDetector.resetState();
  tmp._resetState(function() {
    return this._saveCurrentEditorState();
  });
}

function SetKeyboardTooltips() {
  var contentbox = document.getElementById("customkey");
  var tooltips = contentbox.querySelectorAll("a"), link, i;
  var preview = document.querySelector(".preview-region");
  for(i = 0; i < tooltips.length; i++) {
    link = tooltips[i];
    link.onmouseover = function() {
      SetKeyboardPreview(this.getAttribute("rel"), this.textContent, this.getAttribute("style-preview"));
    };
    link.onmouseout = function() {
      ClearKeyboardPreview();
    };
  }
}

function InsertCard(keytype, name) {
  var contentbox = document.querySelector(".custom-key");
  var content = contentbox.innerHTML;
  var prefix = content.substring(0, content.lastIndexOf("["));
  var replace = prefix + "[" + keytype + "::" + name + "]";
  contentbox.innerHTML = replace;

  AlignKeyboard();
  ClearAuto();
  ipc.send('process-keyboard', [keytype, contentbox.innerHTML, true]);
}

function SetKeyboardPreview(keytype, name, style) {
  var preview = document.querySelector(".preview-region");
  preview.style.display = "block";
  preview.className = "preview-region sticker " + utils.SafeCSSClass(name, keytype);
  preview.style.cssText = style;
}

function ClearKeyboardPreview() {
  var preview = document.querySelector(".preview-region");
  preview.style.display = "none";
  preview.className = "preview-region";
  preview.style.cssText = "";
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
        SetKeyboardPreview(keytype, this.textContent, this.getAttribute("style-preview") + "top: -490px !important;");
      };
      link.onmouseout = function() {
        ClearKeyboardPreview();
      };
      
      link.onclick = function() {
        var partial = document.querySelector(".auto-region").alt;
        InsertCard(keytype, this.textContent);
        ClearKeyboardPreview();
      };
      li.appendChild(link);
      autoul.appendChild(li);
      noresults = false;
    }
  }
  if (noresults) {
    autoarea.style.display = "none";
  } else {
    autoarea.style.display = "block";
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

/* Exports */

exports.init = (default_type) => {
  CreateAutocomplete(default_type);
  CreateCustomKeyboard(default_type);
}

exports.setResults = (results) => {
  SetAutocomplete(results, '');
}

exports.changed = () => {
  OnChange();
}