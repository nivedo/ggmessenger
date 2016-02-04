# <img src="media/Icon.png" width="45" align="left">&nbsp;GGMessenger

> An unofficial Facebook Messenger for Magic & Hearthstone addicts.

<br>
[![](media/screen3.png)](https://github.com/sindresorhus/caprine/releases/latest)

Supports both OSX and Windows.  Based on [*Caprine*](https://github.com/sindresorhus/caprine/releases/latest) by Sindre Sorhus.

## Features

### Easy card linking

Link any card from either Hearthstone or Magic with '@cardname' and autocomplete.  Toggle the game by clicking on the MTG / Hearthstone Icon.

### Inline card tooltips

Use a card name with tooltip in any sentence by typing [mtg::cardname] for Magic cards and [hs::cardname] for Hearthstone cards.  For example:

```
I ate a [mtg::black lotus], pooped a [mtg::lotus petal], and went [mtg::berserk].
```

![](media/screen4.png)

### Easy deck linking via URL

GGMessenger automatically expands decks from URLs that it recognizes.  Currently, it supports:

###### MTG
* [TappedOut.net](tappedout.net)
* [MTGTop8](mtgtop8.com)
* [MTGGoldfish](mtggoldfish.com)
* [MTGSalvation](mtgsalvation.com)
* [Channel Fireball](channelfireball.com)

###### Hearthstone
* [HearthPwn](hearthpwn.com)
* [HearthHead](hearthhead.com)

### Work in progress

Other features in the works (but not quite done yet...)

* Linking / importing deck from Hearthstone or MTGO client (PC only)
* TCGPlayer pricing next to card names.

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
