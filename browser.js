'use strict';
const ipc = require('electron').ipcRenderer;
const utils = require('./utils');
const keyboard = require('./keyboard');

ipc.on('show-preferences', () => {
	// create the menu for the below
	document.querySelector('._30yy._2fug._p').click();
	document.querySelector('._54nq._2i-c._558b._2n_z li:first-child a').click();
});

ipc.on('new-conversation', () => {
	document.querySelector('._30yy[href=\'/new\']').click();
});

ipc.on('log-out', () => {
	// create the menu for the below
	document.querySelector('._30yy._2fug._p').click();
	document.querySelector('._54nq._2i-c._558b._2n_z li:last-child a').click();
});

/* eslint-disable no-native-reassign, no-undef */
// Extend and replace the native notifications.
const NativeNotification = Notification;

Notification = function (title, options) {
	const notification = new NativeNotification(title, options);
	notification.addEventListener('click', () => {
		ipc.send('notification-click');
	});

	return notification;
};
Notification.prototype = NativeNotification.prototype;
Notification.permission = NativeNotification.permission;
Notification.requestPermission = NativeNotification.requestPermission.bind(Notification);
/* eslint-enable no-native-reassign, no-undef */

function SetTitle() {
	var isSplash = document.querySelector("._3v_v") != undefined;
	if (isSplash) {
		var title = document.querySelector("._3v_v h1._5hy4");
		var subtitle = document.querySelector("._3v_v ._3403");
		title.innerHTML = "GGMessenger";
		subtitle.innerHTML = "An unofficial Facebook Messenger for gamers.\n Sign in with Facebook to get started."
	}
}

function DisplayReady() {
	var blocks = document.querySelectorAll('._1t_p');
	var allready = true;
	for(var i = 0; i < blocks.length; i++) {
		var block = blocks[i];
		var elems = block.querySelectorAll('._hh7 > span._3oh-');
		var ready = true;
		for(var j = 0; j < elems.length; j++) {
			if (!elems[j].hasAttribute('data-ready')) {
				ready = false;
				allready = false;
				break;
			}
		}
		if (ready) {
			block.className += " show";
		}
	}
	if (allready) {
		var times = document.querySelectorAll('._497p._2lpt');
		for(var i = 0; i < times.length; i++) {
			if(times[i].className.indexOf("show") == -1) {
				times[i].className += " show";
			}
		}
	}
}

function DisplayReadyV2() {
	var js1 = document.getElementById("js_1");
	if(js1.className.indexOf("show") > 0) return;

	var elems = document.querySelectorAll('._hh7 > span._3oh-');
	for(var j = 0; j < elems.length; j++) {
		if (!elems[j].hasAttribute('data-ready')) {
			return;
		}
	}
	
	// All ready
	ScrollToBottom();
	js1.className += " show";
}

// TODO: move this to tooltips.js and refactor
function ProcessTooltips() {
  var tooltips = document.querySelectorAll('._nd_ .tooltip')
  for (var i = 0; i < tooltips.length; ++i) {
    if (!utils.HasClass(tooltips[i], "right")) {
      tooltips[i].className += " right"
    }
  }
  
  var tooltips = document.querySelectorAll('.tooltip[data-preview]')
  for (i = 0; i < tooltips.length; ++i) {
    var safeclass = utils.SafeCSSClass(tooltips[i].textContent, tooltips[i].rel);
    if (!utils.HasClass(tooltips[i], safeclass)) {
      tooltips[i].className += (" " + safeclass)
      if(utils.HasClass(tooltips[i], "noshow")) {
        tooltips[i].onmouseover = function() {
          var elem = this.closest('span._3oh-');
          var inpreview = elem.querySelector(".inline-preview");
          inpreview.className += " sticker";
          inpreview.style.cssText = this.getAttribute("data-preview");
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
          this.style.cssText = this.getAttribute("data-preview");
        }
        tooltips[i].onouseout = function() {
          this.style.cssText = "";
        }
      }
    }
  }
}

function RefreshAll() {
	var elems = document.querySelectorAll('._hh7 > span._3oh-'), i, elem;
	var count = 0;
	var messages = [];
	// HACK: prevent refreshing when URLs need to be replaced
	
	for (i = 0; i < elems.length; ++i) {
		elem = elems[i];
		if(elem.innerHTML.trim().substring(0,4) == "http") {
			return;			
		}
	}
	
	for (i = 0; i < elems.length; ++i) {
		elem = elems[i];
		if(!elem.hasAttribute("data-gg")) {
	  		var randomID = utils.RandomGUID();
	  		elem.setAttribute("data-gg",randomID);
	  		elem.id = randomID;
	  		messages.push([elem.id,elem.innerHTML]);
			count++;
		}
	}
	ipc.send('handle-messages',messages);
}

function ScrollTo(elemid) {
	var elem = document.getElementById(elemid);
	var rect = elem.getBoundingClientRect();
	var s = document.querySelector("._4_j4 .scrollable");
	elem.scrollIntoView();
}

function ScrollToBottom() {
	var s = document.querySelector("._4_j4 .scrollable");
	s.scrollTop = s.scrollHeight;
}

// Mutation Observer to detect DOM Changes
ipc.on('observe-dom', () => {
	var observeDOM = (function(){
	  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
	    eventListenerSupported = window.addEventListener;

	  return function(obj, callback){
	    if( MutationObserver ){
	      // define a new observer
	      var obs = new MutationObserver(function(mutations, observer){
	        if( mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
	        	callback();
	    	}
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
	observeDOM( document.querySelector('._1q5-') ,function(args){
	  RefreshAll();
	});
});

ipc.on('refresh-all', () => {
	RefreshAll();
});

ipc.on('message-callback', (evt,results) => {
	for(var i = 0; i < results.length; i++) {
		var result = results[i];
		var elemid = result[0];
		var type = result[1];
		var replaceContent = result[2];
		var elem = document.getElementById(elemid);

		if (elem == null) {
			continue;
		}
		elem.setAttribute("data-ready", true);
		if (type == 'sticker') {
			elem.parentNode.style.cssText = 'padding: 0; background-color:transparent !important';
		}
		if (type == "urlsummary") {
			elem.parentNode.parentNode.className += " hidecard";
			var refNode = elem.closest("._o46._3erg");
			var clone = refNode.cloneNode(true);
			var cloneElems = clone.querySelectorAll("._hh7 > span._3oh-");
			for(var j = 0; j < cloneElems.length; j++) {
				cloneElems[j].id += "-clone";
			}
			refNode.parentNode.insertBefore(clone, refNode);
			elem.parentNode.style.cssText = 'border: 1px solid #ddd; background-color:transparent !important';
		}
		if (replaceContent != null) {
			elem.innerHTML = replaceContent;
		}
	}
	if(results.length > 0) {
		ProcessTooltips();
	}
});

ipc.on('check-ready', () => {
	DisplayReadyV2();
});

ipc.on('scroll-to', (evt, args) => {
	ScrollTo(args[0]);
});

ipc.on('create-keyboard', (evt, args) => {
	keyboard.init(args[0]);
});

ipc.on('set-splash', () => {
	SetTitle();
});
