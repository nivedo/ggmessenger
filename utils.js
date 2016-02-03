'use strict';

var _CARDURL = {};
_CARDURL["mtg"] = "http://magiccards.info/query?q=!";
_CARDURL["hs"] = "http://www.hearthpwn.com/cards?filter-name=";

exports.GetCardURL = (name, type) => {
  return _CARDURL[type] + encodeURIComponent(name.replace(/[\u2018\u2019]/g, "'"));
}

exports.SafeCSSClass = (name, type) => {
  var namestr = exports.NormString(type) + "_" + exports.NormString(name);
  return namestr;
}

exports.NormString = str => {
  return str.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 198) return "ae";
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '-' // everything else becomes dash
  });
}

exports.TrieString = name => {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 32) return '_';
    if (c == 198) return "ae";
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '' // remove all other chars
  });
}

exports.RandomGUID = () => {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

exports.HasClass = (element, cls) => {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}