'use strict';
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const ipc = require('electron').ipcMain;
const app = electron.app;
const appMenu = require('./menu');
const storage = require('./storage');
const createTray = require('./tray');

require('electron-debug')();
require('electron-dl')();

electron.crashReporter.start();

let mainWindow;
let isQuitting = false;

function updateBadge(title) {
	if (!app.dock) {
		return;
	}

	// ignore `Sindre messaged you` blinking
	if (title.indexOf('Messenger') === -1) {
		return;
	}

	const messageCount = (/\(([0-9]+)\)/).exec(title);
	app.dock.setBadge(messageCount ? messageCount[1] : '');
}

function createMainWindow() {
	const lastWindowState = storage.get('lastWindowState') || {width: 1200, height: 900};

	const win = new electron.BrowserWindow({
		title: app.getName(),
		show: false,
		//frame: false,
		x: lastWindowState.x,
		y: lastWindowState.y,
		width: lastWindowState.width,
		height: lastWindowState.height,
		icon: process.platform === 'linux' && path.join(__dirname, 'media', 'Icon.png'),
		minWidth: 400,
		minHeight: 200,
		titleBarStyle: 'hidden-inset',
		webPreferences: {
			// fails without this because of CommonJS script detection
			nodeIntegration: false,
			preload: path.join(__dirname, 'browser.js'),
			// required for Facebook active ping thingy
			webSecurity: false,
			plugins: true
		}
	});

	win.loadURL('https://www.messenger.com/login/');

	win.on('close', e => {
		if (!isQuitting) {
			e.preventDefault();
			win.hide();
		}
	});

	win.on('page-title-updated', (e, title) => updateBadge(title));

	return win;
}

function TrieString(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 32) return '_';
    if (c == 198) return "ae";
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '' // everything else becomes dash
  });
}

function SafeCSSClass(name) {
  return name.trim().replace(/[^a-z0-9]/g, function(s) {
    var c = s.charCodeAt(0);
    if (c == 198) return "ae";
    if (c == 91 || c == 93) return ''; // remove [] brackets
    if (c >= 65 && c <= 90) return s.toLowerCase(); // convert upper to lowercase
    return '-' // everything else becomes dash
  });
}

function setupTrieAndCSS(page) {
	page.executeJavaScript(fs.readFileSync(path.join(__dirname, 'trie.js'), 'utf8'));
	var jsfull = "var trie = new Triejs({sort: function() {this.sort(function(a, b) {return a.name.localeCompare(b.name);})}});";
	var cssfull = "";
	const lib = JSON.parse(fs.readFileSync(path.join(__dirname, 'mtg_en_v3.json'), 'utf8'));
	for (var i = 0; i < lib.length; i++) {
		var bundleId = lib[i]["bundleId"];
		var ext = lib[i]["ext"];
		var sublib = lib[i]["assets"];
		for( var j = 0; j < sublib.length; j++) {
			var name = sublib[j]["name"];
			var words = name.trim().split(' ');
			var lastword = "";
			while (words.length > 0) {
				var word = words.pop();
				var nextword = word + " " + lastword;
				// longer word, or beginning of word, add to trie
				if (word.length > 3 || words.length == 0) {
					var jsline = 'trie.add("'+ 
						TrieString(nextword) + 
						'", {name: "' + 
						name.replace(/"/g, '\\"') + 
						'"});';
					jsfull += jsline;
				}
				lastword = nextword;
			}
			var cssline = ".tooltip." + SafeCSSClass(name) +
				":before,.sticker." + SafeCSSClass(name) + 
				"{background-image:url('https://s3-us-west-1.amazonaws.com/ggchat/" + bundleId + 
				"/" +  sublib[j]["id"] + "." + ext + "')}";
			cssfull += cssline;
		}
	}
	page.insertCSS(cssfull);
	page.executeJavaScript(jsfull);
	//page.executeJavaScript(fs.readFileSync(path.join(__dirname, 'mtg_en_v3.js'), 'utf8'));
}

app.on('ready', () => {
	electron.Menu.setApplicationMenu(appMenu);

	mainWindow = createMainWindow();

	createTray(mainWindow);

	const page = mainWindow.webContents;

	page.on('dom-ready', () => {
		page.insertCSS(fs.readFileSync(path.join(__dirname, 'browser.css'), 'utf8'));
		//page.insertCSS(fs.readFileSync(path.join(__dirname, 'mtg_en_v3.css'), 'utf8'));
		setupTrieAndCSS(page);
		page.executeJavaScript(fs.readFileSync(path.join(__dirname, 'load.js'), 'utf8'));
		mainWindow.show();
	});

	page.on('new-window', (e, url) => {
		e.preventDefault();
		electron.shell.openExternal(url);
	});

	page.on('did-frame-finish-load', (e, url) => {
		page.executeJavaScript('CreateKeyboard();CallbackMTG();ScrollDown();');
	});
});

app.on('activate', () => {
	mainWindow.show();
});

app.on('before-quit', () => {
	isQuitting = true;

	if (!mainWindow.isFullScreen()) {
		storage.set('lastWindowState', mainWindow.getBounds());
	}
});

ipc.on('notification-click', () => {
	mainWindow.show();
});
