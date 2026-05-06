# Software Architecture - Uisge

> Copyright (c) 2016, 2026 Oliver Merkel. MIT License.

## 1. Overview

Uisge is a browser-only single-page application implemented with vanilla ES modules.
The design separates rendering/UI concerns from game-state/AI concerns:

- Main thread: DOM, SVG rendering, options/navigation UI
- Worker thread: authoritative game state, move validation, UCT/MCTS AI
- Pure game logic module for deterministic unit testing

For UCT details, see [engine_mcts_ucb.md](engine_mcts_ucb.md).

## 2. Dependency Diagram

```mermaid
flowchart TB
  subgraph MAIN[Main Thread]
    IDX[index.html]
    HMI[js/hmi.js]
    STORE[js/store.js]
    RENDERER[js/renderer.js]
    BOARD_MAIN[js/board.js]
    COMMON_MAIN[js/common.js]

    IDX --> HMI
    HMI --> STORE
    HMI --> RENDERER
    HMI --> BOARD_MAIN
    RENDERER --> COMMON_MAIN
    BOARD_MAIN --> COMMON_MAIN
  end

  subgraph WORKER[Web Worker]
    CTRL[js/controller.js]
    BOARD_WORKER[js/board.js]
    UCT[js/uct/uct.js]
    UCTNODE[js/uct/uctnode.js]
    COMMON_WORKER[js/common.js]

    CTRL --> BOARD_WORKER
    CTRL --> UCT
    BOARD_WORKER --> COMMON_WORKER
    UCT --> UCTNODE
    UCT --> BOARD_WORKER
  end

  HMI <--> |postMessage| CTRL
```

## 3. Flow Charts

### 3.1 Startup

```mermaid
flowchart TD
  A[DOMContentLoaded] --> B[wireUI in hmi.js]
  B --> C[Create store, renderer, worker]
  C --> D[Read initial options]
  D --> E[Dispatch SETTINGS_CHANGE]
  E --> F[Send start to worker]
  F --> G[Worker posts redraw]
  G --> H[Store ENGINE_BOARD_UPDATE]
  H --> I[Renderer render]
```

### 3.2 Move And Turn Handoff

```mermaid
flowchart TD
  A[Human click] --> B{phase == human_turn}
  B -- no --> Z[Ignore]
  B -- yes --> C[Select source/destination]
  C --> D[Send move to worker]
  D --> E[controller.move]
  E --> F{doAction changed state}
  F -- no --> G[post redraw]
  F -- yes --> H[setState + post redraw]
  H --> I{terminal state}
  I -- yes --> J[Stop handoff]
  I -- no --> K{AI to move}
  K -- yes --> L[post ai_to_move]
  K -- no --> M[post human_to_move]
```

### 3.3 Settings Sync

```mermaid
flowchart TD
  A[Options changed] --> B[Send sync to worker]
  B --> C[Worker applySettings]
  C --> D[post redraw]
  D --> E{terminal state}
  E -- yes --> F[Stop]
  E -- no --> G{AI to move}
  G -- yes --> H[post ai_to_move]
  G -- no --> I[post human_to_move]
```

## 4. Class Diagram

```mermaid
classDiagram
  class Board {
    - _state
    + active
    + getActions()
    + doAction(action)
    + getResult()
    + copy()
    + getState()
    + setState(state)
  }

  class Uct {
    + getActionInfo(board, maxIterations, maxTime, maxDepthSimulation, maxLookAhead)
  }

  class UctNode {
    + action
    + parentNode
    + children
    + wins
    + visits
    + unexamined
    + activePlayer
    + addChild(board, index)
    + selectChild()
    + update(result)
    + mostVisitedChild()
  }

  class Store {
    + getState()
    + dispatch(action)
    + subscribe(listener)
  }

  Uct --> UctNode
  Uct --> Board
  Store <.. hmi.js
```

## 5. Interfaces

### 5.1 Board And Action Data

```ts
type Player = 0 | 1;
type Piece = 0 | 1 | 2 | 3 | 4;

interface CellRef {
  row: number;
  column: number;
}

interface Action {
  from: CellRef;
  to: CellRef;
  type: 'jump' | 'move';
}

interface LatestMove extends Action {
  player: Player;
}

interface BoardState {
  active: Player;
  grid: Piece[][]; // 6x7
  winner: Player | null;
  isDraw: boolean;
  latestMove: LatestMove | null;
  winningLine: CellRef[] | null;
}
```

### 5.2 Worker Messaging

```ts
interface WorkerSettingsPayload {
  playersouth: 'Human' | 'AI';
  playernorth: 'Human' | 'AI';
  difficultysouth: 'Easy' | 'Medium' | 'Hard';
  difficultynorth: 'Easy' | 'Medium' | 'Hard';
  deviceprofile: 'Auto' | 'Desktop' | 'Mobile';
  selectionmode: 'MustMove' | 'Flexible';
  resolveddeviceprofile: 'Desktop' | 'Mobile';
}

interface WorkerRequestMessage {
  class: 'request';
  request: 'start' | 'restart' | 'move' | 'action_by_ai' | 'sync';
  settings: WorkerSettingsPayload;
  action?: Action;
}

interface WorkerEventMessage {
  eventClass: 'request';
  request: 'redraw' | 'human_to_move' | 'ai_to_move';
  board: BoardState;
}
```

### 5.3 Renderer Interface

```ts
interface Renderer {
  render(boardState: BoardState, selectableActions?: Action[], selectedFrom?: CellRef | null, allowReselect?: boolean): void;
  resize(): void;
  actionKey(action: Action): string;
}
```

## 6. Module Responsibilities

### js/common.js

- Board constants (`ROWS`, `COLUMNS`, piece IDs)
- Player constants
- Shared action key helper `actionToKey(action)`

### js/board.js

- Pure rules, legal move generation, and state transitions
- Orthogonal global connectivity invariant
- Terminal detection (all-kings win or no-reply win)
- `Board` adapter for UCT simulation

### js/controller.js

- Web Worker orchestrator and single writer of board state
- AI budget selection by side, difficulty, device profile, and phase
- Request handling for `start`, `restart`, `move`, `action_by_ai`, `sync`
- Turn handoff events after valid moves and after `sync`

### js/hmi.js

- Composition root (store + renderer + worker)
- Options reading and synchronization to worker
- Worker event mapping into reducer actions
- AI handoff pause (`AI_MOVE_PAUSE_MS = 900`)
- Debounced resize auto-profile re-sync in Auto mode

### js/renderer.js

- SVG scene and overlays
- Layout constants include:
  - `GRID_CENTER_OFFSET_Y` for board-art alignment
  - `CROWN_CENTER_OFFSET_Y` for crown centering
- Visual states: selectable border, selected border/glow, destination ring, latest source marker, crown overlay

### js/store.js

- Minimal Redux-like store
- Pure reducer (`appReducer`) with app view/phase/board/settings state

## 7. Threading Model

- Main thread handles input and rendering only.
- Worker thread handles state mutation and AI compute.
- Main thread never mutates board state directly; it consumes worker snapshots.

## 8. Testing

- Unit tests (`tests/unit/*.test.js`): board rules, UCT, store, common helper
- E2E tests (`tests/e2e/game.spec.js`): navigation/options/interaction/regressions/accessibility
- Coverage thresholds enforced in `vitest.config.js` at 98% for statements/branches/functions/lines

## 9. Sequence Diagram

```mermaid
sequenceDiagram
  participant User
  participant HMI as hmi.js
  participant Worker as controller.js
  participant Board as board.js
  participant Store as store.js
  participant Renderer as renderer.js

  User->>HMI: Select source and destination
  HMI->>Worker: request move
  Worker->>Board: doAction(state, action)
  Board-->>Worker: nextState
  Worker-->>HMI: redraw(board)
  HMI->>Store: ENGINE_BOARD_UPDATE
  Store-->>Renderer: render(board)
  Worker-->>HMI: human_to_move / ai_to_move
  HMI->>Store: HUMAN_TURN_READY / AI_THINKING
```
