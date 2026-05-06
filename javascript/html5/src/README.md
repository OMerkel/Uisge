# Uisge

[![Language: JavaScript](https://img.shields.io/badge/language-JavaScript-f7df1e?logo=javascript&logoColor=000)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Modules: ESM](https://img.shields.io/badge/modules-ESM-2f74c0)](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules)
[![UI: HTML5 + SVG](https://img.shields.io/badge/UI-HTML5%20%2B%20SVG-e34f26?logo=html5&logoColor=fff)](https://developer.mozilla.org/docs/Web/SVG)
[![Technique: Web Worker](https://img.shields.io/badge/technique-Web%20Worker-3b82f6)](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
[![AI: UCT/MCTS](https://img.shields.io/badge/AI-UCT%2FMCTS-0ea5e9)](doc/engine_mcts_ucb.md)
[![Tests: Vitest + Playwright](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-16a34a)](tests)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-22c55e)](vitest.config.js)

Modern HTML5 implementation of the Uisge board game with a built-in AI based on UCT / MCTS (UCB1).

Uisge is a 2-player abstract strategy game of Celtic/Irish origin from the 12th century,
played on a 7×6 grid. Players move pieces by jumping orthogonally, flipping pieces to kings
on landing, and must always keep all pieces in one connected group.

This implementation is fully browser-based, uses modern ES modules, and has no runtime UI framework dependency.

---

## Features

- Play Uisge on a 7×6 grid.
- Configure players independently: Human vs Human, Human vs AI, AI vs AI.
- Configure AI difficulty independently for Red (South) and Yellow (North): Easy, Medium, Hard.
- Difficulty badge in the header shows both sides and device profile (for example `R Easy | Y Hard | Desktop`).
- Two piece selection modes:
  - **Must Move** (default): once a piece is selected it must be moved.
  - **Flexible**: selected piece can be deselected or switched before confirming a destination.
- Reactive UI state store with explicit worker message flow.
- AI move selection via Monte Carlo Tree Search (UCT/UCB1).
- Visual move history: blueish border on selectable sources, green on selected piece, white dot marking the move source of the last move.
- Configurable pause after AI moves for readability.
- Responsive SVG board rendering.
- Full test suite:
  - Unit tests (Vitest) for board logic and UCT engine.
  - End-to-end tests (Playwright) for gameplay and UI flows.
- PWA - Progressive Web App support for local cached App install

---

## Tech Stack

- Language: JavaScript (ES modules)
- UI: HTML5 + CSS + SVG DOM API
- Concurrency: Web Worker (`js/controller.js`)
- AI: UCT / MCTS (`js/uct/`)
- Unit tests: Vitest
- E2E tests: Playwright

---

## Project Structure

```text
src/
├── index.html
├── README.md
├── package.json
├── vitest.config.js
├── playwright.config.js
├── css/
│   └── index.css
├── doc/
│   ├── engine_mcts_ucb.md
│   └── software_architecture.md
├── js/
│   ├── common.js
│   ├── board.js
│   ├── store.js
│   ├── renderer.js
│   ├── hmi.js
│   ├── controller.js
│   └── uct/
│       ├── uct.js
│       └── uctnode.js
├── tests/
│   ├── server.js
│   ├── unit/
│   │   ├── board.test.js
│   │   └── uct.test.js
│   └── e2e/
│       └── game.spec.js
└── img/
```

---

## Getting Started

### Prerequisites

- Node.js and npm installed.
- A modern browser (Chrome, Firefox, Edge, Safari).

### Install dependencies

```powershell
npm install
```

### Run in browser

Because this app uses a module Web Worker, load it through HTTP (not `file://`).

For local manual testing:

```powershell
node tests/server.js
```

Then open `http://localhost:4173`.

Playwright also starts its own test server automatically for E2E runs.

---

## Usage

1. Open the app.
2. Use the menu button (top-left) to:
   - Start a New Game
   - Open Rules
   - Change Options
   - View About
3. In game mode, click a highlighted piece to select it (source), then click a destination cell to move.
4. For AI turns, the worker computes and applies the move automatically.

### Options

- Red player: Human or AI
- Yellow player: Human or AI
- Red AI difficulty: Easy, Medium, Hard
- Yellow AI difficulty: Easy, Medium, Hard
- AI device profile: Auto, Desktop, Mobile
- Piece selection behavior: Must Move (default) or Flexible

In the UI, players are presented as Red and Yellow. In the code and worker settings,
these two sides are stored as `playerSouth` and `playerNorth`.

---

## Uisge Rules (Summary)

- The board has 7 columns and 6 rows.
- Red (South) moves first; players alternate turns.
- A pawn jumps orthogonally over an adjacent friendly piece and lands 2 squares away; the moving piece flips to a king on arrival.
- A king moves one square in any of 8 directions (orthogonal or diagonal), without flipping.
- After every move, all pieces together must remain in one orthogonally connected group.
- A move that would split the group is illegal and not offered.
- A player with no legal move loses.
- A player whose pieces are all kings wins immediately.

---

## Testing

### Run unit tests

```powershell
npm test
```

### Watch unit tests

```powershell
npm run test:watch
```

### Unit test coverage

```powershell
npm run test:coverage
```

### Run E2E tests

```powershell
npm run test:e2e
```

### Run all tests

```powershell
npm run test:all
```

### Coverage summary

- Unit tests (`tests/unit`)
  - Uisge board creation and initial piece placement
  - Legal action generation: orthogonal jumps, diagonal king moves, connectivity invariant
  - Move application: piece flipping, king promotion, terminal detection (all-kings win, no-move loss)
  - UCT node behavior and UCT-board integration
- E2E tests (`tests/e2e`)
  - Page load and navigation
  - Options defaults, difficulty updates, selection mode option
  - Header difficulty badge behavior
  - Board interaction: source selection, destination selection, move completion, turn handoff
  - New Game regression: immediate selectability after reset in human mode
  - Strict vs. flexible piece selection mode behavior
  - Accessibility smoke checks

---

## Architecture Documentation

Detailed architecture is documented in:

- [doc/software_architecture.md](doc/software_architecture.md)
- [doc/engine_mcts_ucb.md](doc/engine_mcts_ucb.md) (UCT/MCTS engine behavior, UCB formula, and budget wiring)

---

## Troubleshooting

### `node` command opens Microsoft HPC help instead of Node.js

On some Windows environments, `node` may resolve to Microsoft HPC's command tool.
This project includes npm scripts that prepend the Node.js path before running tests.

If needed, call npm explicitly:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' test
```

---

## License

- Source code: MIT License
- Image assets: see in-app About section and repository license files.

---

## Credits

Original game implementation and AI foundations by Oliver Merkel.

For the maintained contributor list, see [../../AUTHORS](../../AUTHORS).
