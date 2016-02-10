'use strict';
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const ipc = require('electron').ipcMain;
const app = electron.app;
const appMenu = require('./menu');
const storage = require('./storage');
const createTray = require('./tray');
const handler = require('./handler');
const library = require('./library');

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

app.on('ready', () => {
	electron.Menu.setApplicationMenu(appMenu);

	mainWindow = createMainWindow();

	createTray(mainWindow);

	const page = mainWindow.webContents;

	/* TODO: switch library load to read from config file */
	library.load('https://d1fyt5lxvxva06.cloudfront.net/config/mtg_en_v5.json','height:328px;width:230px;','mtg');
	library.load('https://d1fyt5lxvxva06.cloudfront.net/config/hearthstone_en.json','height:348px;width:230px;','hs');

	page.on('dom-ready', () => {
		page.insertCSS(fs.readFileSync(path.join(__dirname, 'browser.css'), 'utf8'));
		page.send('set-splash');
		mainWindow.show();
	});

	page.on('new-window', (e, url) => {
		e.preventDefault();
		electron.shell.openExternal(url);
	});

	page.on('did-frame-finish-load', (e, url) => {
		page.send('create-keyboard',['mtg']);
		page.send('refresh-all');
		page.send('observe-dom');
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

/* Main thread IPC callbacks */

ipc.on('notification-click', () => {
	mainWindow.show();
});

ipc.on('handle-messages', (evt, messages) => {
	handler.parse(messages);
});

ipc.on('process-keyboard', (evt, args) => {
	var keytype = args[0];
	var content = args[1];
	var doreplace = args[2];
	var results = library.autocomplete(keytype, content);
	mainWindow.send("autocomplete", results);
	if(doreplace) {
		var process = handler.processKeyboard(keytype, content);
		mainWindow.send("keyboard-modify", [process]);
	}
});