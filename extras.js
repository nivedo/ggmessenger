function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
  	if(!err && res.statusCode == 200) {
	    console.log('content-type:', res.headers['content-type']);
	    console.log('content-length:', res.headers['content-length']);

	    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	}
  });
};

function getHSImages() {
	for(var i = 1; i <= 8; i++) {
		var url = "http://www.hearthpwn.com/cards?display=2&page=" + i + "&filter-premium=1";
		setTimeout(function(path) {
			request(path, function (error, response, html) {
				if(!error && response.statusCode == 200) {
					var $ = cheerio.load(html);
					var cards = $("#cards tr");
					cards.each(function(index) {
						var name = $(this).find(".visual-details-cell h3 a").text().trim();
						var imgurl = $(this).find(".visual-image-cell img").attr("src");
						var triename = utils.TrieString(name);
						var cardinfo = trieMap['hs'].find(triename);
						if(cardinfo != undefined) {
							var cardid = cardinfo[0]["id"];
							console.log("Downloading card: ", name, cardid);
							setTimeout(function() { download(imgurl, "images/" + cardid + ".png", function(){ console.log("done!"); })}, index * 500);
						} else {
							console.log("Card not found: ", name);
						}
					});
				}
			})}, 
		60000 * i, url);
	}
}
