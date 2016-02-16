'use strict';
const electron = require('electron');
const path = require('path');
const ipc = require('electron').ipcRenderer;
const utils = require('./utils');
const library = require('./library');
const cheerio = require("cheerio");
const scraper = require("./scraper");
const filehandler = require("./filehandler");
const BrowserWindow = electron.BrowserWindow;

function handleSticker(raw) {
	var stickerPattern = /^\[[^\[\]]+::[^\[\]]+\]$/i
    if (!stickerPattern.test(raw)) {
    	return null;
    }
	var split = raw.substring(1,raw.length-1).split("::");
	var type = split[0];
	var name = split[1];
  	var safeclass = utils.SafeCSSClass(name, type);
  	var url = utils.GetCardURL(name, type);
  	var style = library.getstyle(safeclass)
  	if (style == undefined) {
  		return null;
  	}
  	var	innerHTML = '<a target="_blank" href="' + url + 
  		'"><div class="sticker ' + safeclass + '" style="' + style + '"></div></a>';

  	return innerHTML;
}

function handleURL(raw) {
	if(raw.indexOf('</a>') > 0) {
		var $ = cheerio.load(raw);
		return $("a").text();
	}
	return null;
}

function handleSpecial(raw) {
	var split = raw.split("\n");
	if(split[0].indexOf(".dek") >= 0) {
		var p0 = raw.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, function(match, $1, $2) {
			var safeclass = utils.SafeCSSClass($2, $1);
			var style = library.getstyle(safeclass);
			if (style != undefined) {
				return '<a class="tooltip noshow" target="_blank" href="' + utils.GetCardURL($2, $1) + '" rel="' + $1 + '" data-preview="' + style + '">' + $2 + '</a>';
			} else {
				return '[' + $1 + "::" + $2 + "]";
			}
		});
		split = p0.split("\n");
		var deckstr = "<div class='inline-wrap'><div class='inline-preview mtg'></div></div>" + 
    	"<div class='inline-icon mtg'></div><div class='titlewrap'><span class='decktitle'>" + split[0] + "\n</span><span>via MTGO DEK File</span></div><div class='cardlist'><ul>";
    	for(var i = 1; i < split.length; i++) {
    		var entry = split[i];
    		if(entry.toLowerCase().indexOf("main (") >= 0 || entry.toLowerCase().indexOf("sideboard (") >= 0) {
    			deckstr = deckstr + "<li class='separator'>" + entry.trim() + "</li>";
    		} else {
    			deckstr = deckstr + "<li>" + entry.trim() + "</li>";
    		}
    	}
    	deckstr += "</ul></div>";
    	return deckstr;
	}
	return null;
}

function handleTooltips(raw) {
	if(raw.indexOf('</a>') == -1) {
		return raw.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, function(match, $1, $2) {
			var safeclass = utils.SafeCSSClass($2, $1);
			var style = library.getstyle(safeclass);
			if (style != undefined) {
				return '<a class="tooltip" target="_blank" href="' + utils.GetCardURL($2, $1) + '" rel="' + $1 + '" data-preview="' + style + '">' + $2 + '</a>';
			} else {
				return '[' + $1 + "::" + $2 + "]";
			}
		});
	}
	return null;
}

function processKeyboard(keytype, content) {
	var p1 = content.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, function(match, $1, $2) {
		var safeclass = utils.SafeCSSClass($2, $1);
		var style = library.getstyle(safeclass);
		if (style != undefined) {
			return '<a class="tooltip" target="_blank" contenteditable="false" href="' + utils.GetCardURL($2, $1) + '" rel="' + $1 + '" style-preview="' + style + '">' + $2 + '</a> ';
		} else {
			return '[' + $1 + "::" + $2 + ']';
		}
	});
	var p2 = p1.replace(/\[([^\[\]]+)\]/g, function(match, $1) {
		var safeclass = utils.SafeCSSClass($1, keytype);
		var style = library.getstyle(safeclass);
		if (style != undefined) {
			return '<a class="tooltip" target="_blank" contenteditable="false" href="' + utils.GetCardURL($1, keytype) + '" rel="' + keytype + '" style-preview="' + style + '">' + $1 + '</a> ';
		} else {
			return '[' + $1 + ']';
		}
	});
	return p2;
}

function parseWithPromises(messages) {
	var promises = [];
	var results = [];
	var win = BrowserWindow.getAllWindows()[0];

	if(messages.length == 0) {
		win.webContents.send("message-callback", results);
	}

	for(var i = 0; i < messages.length; i++) {
		var msg = messages[i];
		var elemid = msg[0];
		var raw = msg[1];

		// Type 1: Asset Sticker
		var result = handleSticker(raw);
		if (result != null) {
			results.push([elemid, 'sticker', result]);
			continue;
		}

		// Type 2: URL Parse, requires async promise
		var url = handleURL(raw);
		if (url != null) {
			var promise = scraper.parse(elemid, url);
			if (promise != null) {
				promises.push(promise);
				continue;
			}
		}

		// Type 3: Special parse for custom file uploads
		var special = handleSpecial(raw);
		if (special != null) {
			results.push([elemid, 'special', special]);
			continue;
		}

		// Type 4: Inline tooltips
		var tooltips = handleTooltips(raw);
		if (tooltips != null) {
			results.push([elemid, 'tooltips', tooltips]);
			continue;
		}

		// Do nothing
		results.push([elemid, 'default', null]);
	}

	Promise.all(promises).then(function(values) {
		results = results.concat(values);
		win.webContents.send("message-callback", results);
		var lastid = messages[messages.length-1][0];
		win.webContents.send("scroll-to", [lastid]);
		win.webContents.send("check-ready");
	}, function(reason) {
		console.log(reason);
	});
}

function parseFile(path) {
	return filehandler.parse(path);
}

/* Exports */

exports.parse = (messages) => {
	parseWithPromises(messages);
};

exports.parseFile = (path) => {
	return parseFile(path);
};

exports.processKeyboard = (keytype, content) => {
	return processKeyboard(keytype, content);
};