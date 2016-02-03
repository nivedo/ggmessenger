'use strict';
const electron = require('electron');
const path = require('path');
const ipc = require('electron').ipcRenderer;
const utils = require('./utils');
const library = require('./library');
const cheerio = require("cheerio");
const scraper = require("./scraper");
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
  	var innerHTML = '<a target="_blank" href="' + url + 
  		'"><div class="sticker ' + safeclass + '" style="' + library.getstyle(safeclass) + '"></div></a>';

  	return innerHTML;
}

function handleURL(raw) {
	if(raw.indexOf('</a>') > 0) {
		var $ = cheerio.load(raw);
		return $("a").text();
	}
	return null;
}

function handleTooltips(raw) {
	if(raw.indexOf('</a>') == -1) {
		return raw.replace(/\[([^\[\]]+)::([^\[\]]+)\]/g, function(match, $1, $2) {
			var safeclass = utils.SafeCSSClass($2, $1);
			var style = library.getstyle(safeclass);
			return '<a class="tooltip" target="_blank" href="' + utils.GetCardURL($2, $1) + '" rel="' + $1 + '" data-preview="' + style + '">' + $2 + '</a>';
		});
	}
	return null;
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

		// Type 3: Inline tooltips
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

/* Exports */

exports.parse = (messages) => {
	parseWithPromises(messages);
};
