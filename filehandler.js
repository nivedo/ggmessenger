'use strict';
const fs = require('fs');
const path = require('path')
const cheerio = require('cheerio');
const ipc = require('electron').ipcRenderer;

function HandleFile(filepath) {
	if(path.extname(filepath).toLowerCase() == ".dek") {
		return HandleDek(filepath);
	}
	return null;
}

function HandleDek(filepath) {
	try {
		var deckstr = "";
		var sidestr = "";
		var deckcount = 0;
		var sidecount = 0;
		var data = fs.readFileSync(filepath, 'ascii');
		var $xml = cheerio.load(data, {xmlMode: true});
		var cards = $xml("Cards");
		for(var i = 0; i < cards.length; i++) {
			if(cards[i].attribs.Sideboard == 'true') {
				sidestr += cards[i].attribs.Quantity + "x [mtg::" + cards[i].attribs.Name + "]\n";
				sidecount += parseInt(cards[i].attribs.Quantity);
			} else {
				deckstr += cards[i].attribs.Quantity + "x [mtg::" + cards[i].attribs.Name + "]\n";
				deckcount += parseInt(cards[i].attribs.Quantity);
			}
		}
		var result = path.basename(filepath) + "\n\nMain (" + deckcount + ")\n\n" + 
			deckstr + "\nSideboard (" + sidecount + ")\n\n" + sidestr;
		return result;
	} catch (ex) {
		console.log(ex);
	}
	return null;
}

exports.parse = (filepath) => {
	return HandleFile(filepath);
};