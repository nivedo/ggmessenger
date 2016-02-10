'use strict';
const https = require('https');
const utils = require('./utils');
const Triejs = require('triejs');
const ipc = require('electron').ipcMain;
const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");

var trieMap = {};
var styleMap = {};

function loadLibrary(url, extracss, type) {
	https.get(url, function(res){
		var body = '';
		res.on('data', function(chunk){
			body += chunk;
		});
		res.on('end', function(){
			var resp = JSON.parse(body);
			loadHelper(resp, extracss, type);
		});
	}).on('error', function(e){
		console.log("ERROR: ", e);
	});
}

/* TODO: can we make this JS loader less hacky but still async? */
function loadHelper(lib, extracss, type) {
	trieMap[type] = new Triejs({sort: function() {
		this.sort(function(a, b) {
			return a.name.localeCompare(b.name);
		})
	}});

	var count = 0;
	var closed = true;
	var jsfull = "";
	for (var i = 0; i < lib.length; i++) {
		var bundleId = lib[i]["bundleId"];
		var ext = lib[i]["ext"];
		var sublib = lib[i]["assets"];
		for( var j = 0; j < sublib.length; j++) {
			var imgsrc = utils.GetImageURL(bundleId, sublib[j]["id"], ext);
			var cssstr = extracss + 
			"background-image:url('" + imgsrc + "') !important;";
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
		       	var jsline = 'trieMap["' + type + '"].add("'+ 
		       		utils.TrieString(nextword) + 
		       		'", {name: "' + 
		       		name.replace(/"/g, '\\"') + 
		       		'", id: "' + sublib[j]["id"] + '", type: "' + type + '", css: "' + cssstr + '"});';
						jsfull += jsline;
					}
				lastword = nextword;
			}
			if (count % 100 == 99) {
				jsfull += "}, " + (count - count % 100) / 2 + ");"
				closed = true;
			}
			styleMap[utils.SafeCSSClass(name, type)] = cssstr;
			count++;
		}
	}
	if (!closed) {
		jsfull += "}, " + (i - i % 100) + ");"
	}
	eval(jsfull);
}

function autoComplete(keytype, content) {
	var results = [];

	if (content.length == 0) return results;

	var lasttoken = content.trim().split(']').pop();
	var endpart = lasttoken.trim().split('[');

	if (endpart.length > 1) {
		var opentoken = endpart.pop();
		opentoken = opentoken.split("::").pop();

		var autoword = opentoken.trim().split(' ').join('_');
		var qres = trieMap[keytype].find(autoword);
		if (qres != undefined) {
			results = results.concat(qres);
		}
	}

	return results;
}

/* Exports */

exports.load = (url, extracss, type) => {
	loadLibrary(url, extracss, type);
};

exports.autocomplete = (keytype, content) => {
	return autoComplete(keytype, content);
};

exports.getstyle = (safeclass) => {
	return styleMap[safeclass];
};