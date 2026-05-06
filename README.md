Uisge
====================

![Uisge icon](html5/src/img/icons/uisge128.png)

[![Language: JavaScript](https://img.shields.io/badge/language-JavaScript-f7df1e?logo=javascript&logoColor=000)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Modules: ESM](https://img.shields.io/badge/modules-ESM-2f74c0)](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules)
[![UI: HTML5 + SVG](https://img.shields.io/badge/UI-HTML5%20%2B%20SVG-e34f26?logo=html5&logoColor=fff)](https://developer.mozilla.org/docs/Web/SVG)
[![Technique: Web Worker](https://img.shields.io/badge/technique-Web%20Worker-3b82f6)](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
[![AI: UCT/MCTS](https://img.shields.io/badge/AI-UCT%2FMCTS-0ea5e9)](html5/src/doc/engine_mcts_ucb.md)
[![Tests: Vitest + Playwright](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-16a34a)](html5/src/tests)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-22c55e)](html5/src/vitest.config.js)

Uisge - 2 player abstract strategic perfect information
board game claiming to have Irish, Celtic or Gaelic origins from 12th century.

Abstract
--------------------

__Keywords, Categories__ _2-player board game, deterministic game with perfect information_

Rules
--------------------

- [The rules of the board game Uisge in English language](https://omerkel.github.io/Uisge/html5/src/uisge_rules-en.html)
- [Die Spielregeln vom Brettspiel Uisge in deutscher Sprache](https://omerkel.github.io/Uisge/html5/src/uisge_rules-de.html)
  (The rules of the board game Uisge in German language)

Play Online
--------------------

- [Play in your browser](https://omerkel.github.io/Uisge/javascript/html5/src/)

PWA - Progressive Web App
-----------------------------

A Progressive Web App (PWA) is a web app that can be installed to your device
and run like a native app in fullscrenn without any browser decorations.
For Uisge, this means you can launch the game from your app list/start menu,
get a standalone window,
and keep playing even when network quality is poor (depending on cached assets).

Install Uisge as a PWA
--------------------

1. Open [Play in your browser](https://omerkel.github.io/Uisge/javascript/html5/src/)
   in a Chromium-based browser (Edge/Chrome).
1. Click the install button in the address bar, or use the browser menu:
   Edge: `Apps -> Install this site as an app`
   Chrome: `Cast, save, and share -> Install page as app`
1. Confirm the install prompt.
1. Start Uisge from your app launcher/start menu.

Install from a local build (localhost)
--------------------

PWA installation also works from `localhost` (HTTPS is not required for localhost).

1. Serve the repository with a local static server.
1. Example from repository root: `python -m http.server 8080`
1. Open `http://localhost:8080/javascript/html5/src/` in Edge/Chrome.
1. Use the same browser install steps listed above.

If install is not offered, check that the page is loaded from `https://...` or `localhost`,
then refresh once and try again.

Print-and-Play
--------------------

![Uisge game components showing a free print-and-play game board](res/uisge_components.jpg)

![Free print-and-play Uisge game board](res/pnp-uisge_board.jpg)

Links
--------------------

- [Uisge on BoardGameGeek](https://boardgamegeek.com/boardgame/11421/uisge)

Contributors / Authors
--------------------

Please see [AUTHORS](AUTHORS) for the maintained contributor list.

_All logos, brands and trademarks mentioned belong to their respective owners._
