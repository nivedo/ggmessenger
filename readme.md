# <img src="media/Icon.png" width="45" align="left">&nbsp;GGMessenger

> An unofficial Facebook Messenger for Magic & Hearthstone addicts.

Based on [*Caprine*](https://github.com/sindresorhus/caprine/releases/latest) by Sindre Sorhus.

## Installation

GGMessenger currently supports both OSX and Windows.

NOTE: Your computer must have access to MTG / Hearthstone sites to support integrations.  Firewalls will prevent integrations from working.

* [OSX 10.9+ Zip](https://www.dropbox.com/s/o0r8pty6shubwqb/GGMessenger-osx-0.4.0.zip?dl=0)
* [Windows 7+ Installer](https://www.dropbox.com/s/d8kwqkukferm0xj/GGMessenger-v0.4.0.exe?dl=0)

![](media/screen3.png)

## Features

### Card Linking

Link *any* card from MTG or Hearthstone by sending `[cardname]`, or you can inline cards with tooltips:

```
I heard they were reprinting [Force of Will] and [Wasteland] in EMA!
```

GGMessenger supports both tab / click autocomplete for all cards.  To switch the autocomplete, simply click the icon left of the keyboard.

### Easily Share Deck Lists

You can share your current draft deck from MTGO by simply exporting it as a DEK file, and drag-and-drop into the chat window!

GGMessenger also automatically expands decks from many external URLs.  Currently, it supports:

###### MTG
* [TappedOut.net](http://tappedout.net)
* [MTGTop8](http://mtgtop8.com)
* [MTGGoldfish](http://mtggoldfish.com)
* [MTGSalvation](http://mtgsalvation.com)
* [Channel Fireball](http://channelfireball.com)

###### Hearthstone
* [HearthPwn](http://hearthpwn.com)
* [HearthHead](http://hearthhead.com)

## Screenshots

![](media/screen1.png)
![](media/screen2.png)

## Dev

Built with [Electron](http://electron.atom.io).

###### Commands

- Init: `$ npm install`
- Run: `$ npm start`
- Build OS X: `$ npm run build-osx`
- Build Linux: `$ npm run build-linux`
- Build Windows: `$ npm run build-windows`
- Build all: `$ brew install wine` and `$ npm run build` *(OS X only)*

## License

MIT © [Jay Ni](https://github.com/jayxni)
