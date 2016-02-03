'use strict';
const cheerio = require("cheerio");
const request = require("request");
const library = require("./library");
const utils = require("./utils");

var cacheMap = {};

function getParser(url) {
	if (url.indexOf('tappedout.net') > 0) {
		return _parseTappedout;
	}
	if (url.indexOf('mtgtop8.com') > 0) {
		return _parseMTGTop8;
	}
	if (url.indexOf('mtggoldfish.com/deck') > 0 || url.indexOf('mtggoldfish.com/archetype') > 0) {
		return _parseMTGGoldfish;
	}
	if (url.indexOf('mtgsalvation.com') > 0) {
		return _parseMTGSalvation;
	}
	if (url.indexOf('channelfireball.com') > 0) {
		return _parseChannelFireball;
	}
	if (url.indexOf('hearthpwn.com/decks') > 0) {
		return _parseHearthpwn;
	}
	if (url.indexOf('hearthhead.com/deck') > 0) {
		return _parseHearthhead;
	}
	return null;
}

function createCardElem(name, qty, type) {
	var safeclass = utils.SafeCSSClass(name, type);
	var elemstr = "<li>" + (qty + "x <a class='tooltip noshow' target='_blank' data-preview=\"" + 
    	library.getstyle(safeclass) + "\" href=\"" + 
		utils.GetCardURL(name, type) +
	 	"\">" + name + "</a></li>");
	return elemstr;
}

/* Scrapers */

function _parseTappedout(url, $) {
	var title = $("title").text();
	var members = $(".boardlist .member .qty.board, .board-col h3, .board-col a[href*='mtg-card']:not([rel])");

	var deckstr = "<div class='inline-wrap'><div class='inline-preview mtg'></div></div>" + 
    	"<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.tappedout.net'>Tappedout.net</a></span></div><div class='cardlist'><ul>";

    members.each(function(index) {
    	if($(this).is("h3")) {
    		deckstr = deckstr + "<li class='separator'>" + $(this).text().trim() + "</li>";
    	} else {
    		var qty = 1, name;
    		if($(this).attr("href") != "#") {
    			name = $(this).attr("href");
    			name = name.replace("/mtg-card/",'');
		        name = name.replace("/",'');
		        name = name.split("-").join(' ');
    		} else {
    			name = $(this).attr("data-name");
    			qty = $(this).attr("data-quantity");
    		}
	    	deckstr = deckstr + createCardElem(name, qty, "mtg");
	    }
    });

    deckstr += "</ul></div>";

    return deckstr;
}

function _parseMTGTop8(url, $) {
	var title = $("title").text();
	var members = $(".O13, .G14");

	var deckstr = "<div class='inline-wrap'><div class='inline-preview mtg'></div></div>" + 
    	"<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.mtgtop8.com'>MTGTop8.com</a></span></div><div class='cardlist'><ul>";

    members.each(function(index) {
    	if($(this).hasClass("O13")) {
    		deckstr = deckstr + "<li class='separator'>" + $(this).text().trim() + "</li>";
    	} else {
    		var name = $(this).find(".L14").text().trim();
    		$(this).find(".L14").remove();
    		var qty = $(this).text().trim();
    		deckstr = deckstr + createCardElem(name, qty, "mtg");
	    }
    });

    deckstr += "</ul></div>";

    return deckstr;
}

function _parseMTGGoldfish(url, $) {
	var title = $("title").text();
	var members = $("#tab-paper .deck-view-deck-table tr");

	var deckstr = "<div class='inline-wrap'><div class='inline-preview mtg'></div></div>" + 
    	"<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.mtggoldfish.com'>MTGGoldfish.com</a></span></div><div class='cardlist'><ul>";

    members.each(function(index) {
    	if($(this).find(".deck-header").length > 0) {
    		deckstr = deckstr + "<li class='separator'>" + $(this).find(".deck-header").text().trim().replace("\n",' ') + "</li>";
    	} else {
	    	if($(this).find(".deck-col-qty").length > 0 && $(this).find(".deck-col-card a").length > 0) {
	    		var qty = $(this).find(".deck-col-qty").text().trim();
		    	var name = $(this).find(".deck-col-card a").text().trim();
	    		deckstr = deckstr + createCardElem(name, qty, "mtg");
	    	}
	    }
    });

    deckstr += "</ul></div>";

    return deckstr;
}

function _parseMTGSalvation(url, $) {
	var deckwrap = $(".forum-deck-wrapper .deck");
	if(deckwrap.length == 0) { return ""; }
	var deckinfo = JSON.parse(deckwrap.attr("data-card-list"));
	var members = deckinfo["Deck"];
	var title = $("header.caption-threads h2").text();

	var deckstr = "<div class='inline-wrap'><div class='inline-preview mtg'></div></div>" + 
    	"<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.mtgsalvation.com'>MTGSalvation.com</a></span></div><div class='cardlist'><ul>";

	for(var j = 0; j < members.length; j++) {
	    var name = members[j]["CardName"];
	    var qty = members[j]["Qty"];
	    deckstr = deckstr + createCardElem(name, qty, "mtg");
	}

	deckstr += "</ul></div>";
    return deckstr;
}

function _parseChannelFireball(url, $) {
	var title = $("title").text();
	var decklist = $(".crystal-catalog-helper.crystal-catalog-helper-list");
	var deckname = decklist.prevUntil('h1').text();
	if (deckname == undefined) deckname = title;
	var members = decklist.first().find("a.crystal-catalog-helper-list-item, span.crystal-catalog-helper-subtitle");

	var deckstr = "<div class='inline-wrap'><div class='inline-preview mtg'></div></div>" + 
    	"<div class='inline-icon mtg'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.channelfireball.com'>ChannelFireball.com</a></span></div><div class='cardlist'><ul>";

    members.each(function(index) {
    	if($(this).is("span")) {
    		deckstr = deckstr + "<li class='separator'>" + $(this).text().trim() + "</li>";
    	} else {
    		var qty = $(this).find(".qty").text().trim();
	    	var name = $(this).attr('data-name');
    		deckstr = deckstr + createCardElem(name, qty, "mtg");
	    }
    });

    deckstr += "</ul></div>";

    return deckstr;
}

function _parseHearthpwn(url, $) {
	var title = $("title").text();
	var members = $(".col-name b a, .t-deck-details-card-list.class-listing h4, .t-deck-details-card-list.neutral-listing h4");

	var deckstr = "<div class='inline-wrap'><div class='inline-preview hs'></div></div>" + 
    	"<div class='inline-icon hs'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.hearthpwn.com'>Hearthpwn.com</a></span></div><div class='cardlist'><ul>";

    members.each(function(index) {
    	if( $(this).is("h4") ) {
    		deckstr = deckstr + "<li class='separator'>" + $(this).text().trim() + "</li>";
    	} else {
    		var name = $(this).text().trim();
		    var qty = $(this).attr("data-count");
		    deckstr = deckstr + createCardElem(name, qty, "hs");
    	}
    });

    deckstr += "</ul></div>";

    return deckstr;
}

function _parseHearthhead(url, $) {
	var title = $("title").text();
	var members = $(".deckguide-cards-type .heading-size-3, .deckguide-cards-type ul li");

	var deckstr = "<div class='inline-wrap'><div class='inline-preview hs'></div></div>" + 
    	"<div class='inline-icon hs'></div><div class='titlewrap'><a class='decktitle' target='_blank' href='" + 
    	url + "'>" + title + "</a>\n<span>via <a href='http://www.hearthhead.com'>Hearthhead.com</a></span></div><div class='cardlist'><ul>";

    members.each(function(index) {
    	if( $(this).is("h2") ) {
    		deckstr = deckstr + "<li class='separator'>" + $(this).text().trim() + "</li>";
    	} else {
    		var name = $(this).find(".card").text().trim();
    		$(this).children(".card").eq(0).remove();
		    var qty = $(this).text().trim().replace('x','');
		    if (qty == "") {
        		qty = 1;
      		}
		    deckstr = deckstr + createCardElem(name, qty, "hs");
    	}
    });

    deckstr += "</ul></div>";

    return deckstr;
}

/* Init */

function initScraper(elemid, url) {
	if (cacheMap[url] != undefined) {
		return Promise.resolve([elemid, 'urlsummary', cacheMap[url]]);
	}
	var parser = getParser(url);
	if (parser == null) return null;
	return new Promise(function(resolve, reject) {
		request(url, function (error, response, html) {
			if(!error && response.statusCode == 200) {
				var $ = cheerio.load(html);
				cacheMap[url] = parser(url, $);
				resolve([elemid, 'urlsummary', cacheMap[url]]);
			}
			resolve(null);
		});
	});
}

exports.parse = (elemid, url) => {
	return initScraper(elemid, url);
};