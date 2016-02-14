'use strict';
const utils = require('./utils');
const autosize = require('autosize');
const ipc = require('electron').ipcRenderer;

var s_type = []
var s_content = [];

function SaveThreadContent(threadid) {
  s_content[threadid] = document.getElementById("customkey").innerHTML;
}

function GetThreadContent(threadid) {
  if (threadid in s_content) {
    return s_content[threadid];
  }
  return "";
}

function SaveThreadType(threadid) {
  s_type[threadid] = GetKeyType();
}

function GetThreadType(threadid) {
  if (threadid in s_type) {
    return s_type[threadid];
  }
  return "mtg";
}

function OnSwitchThread() {
  var threadid = GetThreadID();
  SetKeyboardType(GetThreadType(threadid));
  document.getElementById("customkey").innerHTML = GetThreadContent(threadid);
  AlignKeyboard();
}

function AlignKeyboard() {
  var outerwrap = document.querySelector("._2xhi");
  var topwrap = document.querySelector("._4u-c._1wfr");
  var keycontents = document.querySelector("._4rv3");
  var topheight = outerwrap.offsetHeight - keycontents.offsetHeight;
  if (topwrap != undefined) {
    topwrap.style.height = topheight + "px";
  }
  if(document.getElementById("customkey").textContent == "") {
    document.getElementById("placeholder").style.visibility = "visible";
  } else {
    document.getElementById("placeholder").style.visibility = "hidden";
  }
  SaveThreadContent(GetThreadID());
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
  ClearAuto(false);
  SetKeyboardTooltips();
  placeCaretAtEnd(document.getElementById("customkey"));
}

function Send() {
  var content;
  var contentbox = document.getElementById("customkey");
  var selected = document.querySelector(".auto-region ul li.selected a");
  if(selected != undefined) {
    content = "[" + GetKeyType() + "::" + selected.textContent + "]";
  } else {
    var tooltips = contentbox.querySelectorAll(".tooltip");
    for(var i = 0; i < tooltips.length; i++) {
      tooltips[i].innerHTML = "[" + tooltips[i].getAttribute("rel") + "::" + tooltips[i].innerHTML + "]";
      tooltips[i].innerHTML = tooltips[i].innerHTML.toLowerCase();
    }
    content = contentbox.textContent;
  }
  SendMessage(content);
  contentbox.textContent = "";
  AlignKeyboard();
  ClearAuto(true);
  placeCaretAtEnd(contentbox);
}

function CreateCustomKeyboard(default_type) {
  var inputbox = document.querySelector("._5irm ._kmc");
  if (document.getElementById("customkey") == undefined) {
    var keycontainer = document.createElement("div");
    keycontainer.id = "keywrap";
    keycontainer.onclick = function() {
      document.getElementById("customkey").focus();
    }

    var placebox = document.createElement("div");
    placebox.id = "placeholder";
    placebox.innerHTML = "Type a message, or link a card with [cardname]...";
    keycontainer.appendChild(placebox);

    var keybox = document.createElement("div");
    keybox.id = "customkey";
    keybox.setAttribute("contenteditable", true);
    // Copy paste should be text only.
    keybox.addEventListener("paste", function(e) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    });
    keybox.onkeypress = function(e) {
      document.getElementById("placeholder").style.visibility = "hidden";
    }
    keybox.onkeydown = function(e) {
      if (e.keyCode == '13' && !e.shiftKey) {
        e.preventDefault();
        Send();  
      }
      if (e.keyCode == '9') {
        e.preventDefault();
        var selected = document.querySelector(".auto-region ul li.selected a");
        if (selected != undefined) {
          selected.click();
        }
      }
      // UP
      if (e.keyCode == '38') {
        e.preventDefault();
        SelectPrevAuto();
      }
      // DOWN
      if (e.keyCode == '40') {
        e.preventDefault();
        SelectNextAuto();
      }
    }
    keybox.onkeyup = function (e) {
      if ((e.keyCode == '13' && !e.shiftKey) || 
        e.keyCode == '9' || 
        e.keyCode == '37' || 
        e.keyCode == '38' || 
        e.keyCode == '39' || 
        e.keyCode == '40') { 
        return;
      }
      var content = this.innerHTML.replace(/&nbsp;/g,' ');
      AlignKeyboard();
      ClearAuto(false);
      var doReplace = (e.keyCode == '221');
      ipc.send('process-keyboard', [GetKeyType(), content, doReplace]);
    };
    keycontainer.appendChild(keybox);

    inputbox.appendChild(keycontainer);
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
    SaveThreadType(GetThreadID());
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

function ClearAuto(hide) {
  var autoarea = document.querySelector(".auto-region");
  autoarea.innerHTML = "";
  if(hide) {
    autoarea.style.display = "none";
    ClearKeyboardPreview();
  }
}

function GetThreadID() {
  var textbox = document.querySelector("._kmc");
  return textbox[Object.getOwnPropertyNames(textbox)[0]]._currentElement._owner._instance.props.threadID;
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
  var contentbox = document.getElementById("customkey");
  var content = contentbox.innerHTML;
  var prefix = content.substring(0, content.lastIndexOf("["));
  var replace = prefix + "[" + keytype + "::" + name + "]";
  contentbox.innerHTML = replace;

  AlignKeyboard();
  ClearAuto(true);
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

function GetKeyType() {
  return document.querySelector(".icon").alt;
}

function SelectPrevAuto() {
  var selected = document.querySelector(".selected");
  if (selected != undefined) {
    var prev = selected.previousSibling;
    if (prev != undefined) {
      prev.className = "selected";
      selected.className = "";
      SetKeyboardPreview(GetKeyType(), prev.firstChild.textContent, prev.firstChild.getAttribute("style-preview") + "top: -490px !important;")
      prev.scrollIntoView(false);
    }
  }
}

function SelectNextAuto() {
  var selected = document.querySelector(".selected");
  if (selected != undefined) {
    var next = selected.nextSibling;
    if (next != undefined) {
      next.className = "selected";
      selected.className = "";
      SetKeyboardPreview(GetKeyType(), next.firstChild.textContent, next.firstChild.getAttribute("style-preview") + "top: -490px !important;")
      next.scrollIntoView(false);
    }
  }
}

function SetAutocomplete(results, partial) {
  var keytype = GetKeyType();
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
        var selected = document.querySelector(".selected");
        if (selected != undefined) {
          SetKeyboardPreview(keytype, selected.firstChild.textContent, selected.firstChild.getAttribute("style-preview") + "top: -490px !important;")
        } else {
          ClearKeyboardPreview();
        }
      };
      link.onclick = function() {
        var partial = document.querySelector(".auto-region").alt;
        InsertCard(keytype, this.textContent);
        ClearKeyboardPreview();
      };
      if(noresults) {
        li.className = "selected";
        SetKeyboardPreview(keytype, link.textContent, link.getAttribute("style-preview") + "top: -490px !important;");
      }
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

function SetKeyboardType(keytype) {
  var icon = document.querySelector(".icon")
  icon.alt = keytype;
  icon.className = "icon " + keytype;
}

/* Exports */

exports.init = (default_type) => {
  CreateAutocomplete(default_type);
  CreateCustomKeyboard(default_type);
  OnSwitchThread();
}

exports.setResults = (results) => {
  SetAutocomplete(results, '');
}

exports.changed = () => {
  OnChange();
}