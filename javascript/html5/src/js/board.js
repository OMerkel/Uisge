// Copyright (c) 2016,2026 Oliver Merkel. All rights reserved.
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
// SPDX-License-Identifier: MIT

import {
  actionToKey,
  COLUMNS,
  EMPTY,
  NORTH,
  NORTH_KING,
  ROWS,
  SOUTH,
  SOUTH_KING,
} from './common.js';

const ORTHOGONAL_DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const KING_MOVE_DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const createGrid = () => Array.from({ length: ROWS }, () => Array(COLUMNS).fill(EMPTY));

const createInitialGrid = () => {
  const grid = createGrid();

  // Initial setup for this variant: two connected rows of pawns.
  for (let col = 1; col < 5; col++) {
    grid[2][col] = NORTH;
    grid[3][col+1] = SOUTH;
  }
  for (let col = 2; col < 4; col++) {
    grid[1][col] = NORTH;
    grid[4][col+1] = SOUTH;
  }

  return grid;
};

export const createBoard = () => ({
  active: 0,
  grid: createInitialGrid(),
  winner: null,
  isDraw: false,
  latestMove: null,
  winningLine: null,
});

const inBounds = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLUMNS;

const cloneGrid = (grid) => grid.map((line) => [...line]);

const pieceOwner = (piece) => {
  if (piece === SOUTH || piece === SOUTH_KING) return 0;
  if (piece === NORTH || piece === NORTH_KING) return 1;
  return null;
};

const isKing = (piece) => piece === SOUTH_KING || piece === NORTH_KING;

const toggleFace = (piece) => {
  const toggledFaces = [EMPTY, SOUTH_KING, NORTH_KING, SOUTH, NORTH];
  return toggledFaces[piece];
};

const listOccupied = (grid) => {
  const occupied = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (grid[row][col] !== EMPTY) occupied.push({ row, column: col });
    }
  }
  return occupied;
};

const isConnected = (grid) => {
  const occupied = listOccupied(grid);
  if (occupied.length <= 1) return true;

  const visited = new Set();
  const start = occupied[0];
  const queue = [start];
  visited.add(`${start.row}:${start.column}`);

  while (queue.length > 0) {
    const current = queue.shift();
    for (const [dr, dc] of ORTHOGONAL_DIRS) {
      const nr = current.row + dr;
      const nc = current.column + dc;
      if (!inBounds(nr, nc) || grid[nr][nc] === EMPTY) continue;
      const key = `${nr}:${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ row: nr, column: nc });
    }
  }

  return visited.size === occupied.length;
};

const applyActionToGrid = (grid, action) => {
  const piece = grid[action.from.row][action.from.column];

  const next = cloneGrid(grid);
  next[action.from.row][action.from.column] = EMPTY;
  next[action.to.row][action.to.column] = action.type === 'jump' ? toggleFace(piece) : piece;
  return next;
};

const allPiecesAreKings = (grid, player) => {
  let ownPieceCount = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const piece = grid[row][col];
      if (pieceOwner(piece) !== player) continue;
      ownPieceCount++;
      if (!isKing(piece)) return false;
    }
  }
  return ownPieceCount === 6;
};

const getActionsForPlayer = (grid, player) => {
  const actions = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const piece = grid[row][col];
      if (pieceOwner(piece) !== player) continue;

      for (const [dr, dc] of ORTHOGONAL_DIRS) {
        const midRow = row + dr;
        const midCol = col + dc;
        const toRow = row + 2 * dr;
        const toCol = col + 2 * dc;

        if (!inBounds(midRow, midCol) || !inBounds(toRow, toCol)) continue;
        if (grid[midRow][midCol] === EMPTY || grid[toRow][toCol] !== EMPTY) continue;

        const action = {
          from: { row, column: col },
          to: { row: toRow, column: toCol },
          type: 'jump',
        };

        const next = applyActionToGrid(grid, action);
        if (next && isConnected(next)) actions.push(action);
      }

      if (isKing(piece)) {
        for (const [dr, dc] of KING_MOVE_DIRS) {
          const toRow = row + dr;
          const toCol = col + dc;
          if (!inBounds(toRow, toCol) || grid[toRow][toCol] !== EMPTY) continue;

          const action = {
            from: { row, column: col },
            to: { row: toRow, column: toCol },
            type: 'move',
          };

          const next = applyActionToGrid(grid, action);
          if (next && isConnected(next)) actions.push(action);
        }
      }
    }
  }

  return actions;
};

export const getActions = (board) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.assert(
      board.grid && board.grid.length === ROWS && board.grid[0].length === COLUMNS,
      'Invalid board state: grid dimensions mismatch'
    );
    console.assert(
      board.winner === null || board.winner === 0 || board.winner === 1,
      'Invalid board state: invalid winner value'
    );
  }
  if (board.winner !== null || board.isDraw) return [];
  return getActionsForPlayer(board.grid, board.active);
};

const findAction = (actions, action) => {
  const wanted = actionToKey(action);
  return actions.find((candidate) => actionToKey(candidate) === wanted) ?? null;
};

export const doAction = (board, action) => {
  const legalActions = getActions(board);
  const legal = findAction(legalActions, action);
  if (!legal) return board;

  const nextGrid = applyActionToGrid(board.grid, legal);

  const mover = board.active;
  const nextPlayer = 1 - mover;

  let winner = null;
  if (allPiecesAreKings(nextGrid, mover)) {
    winner = mover;
  } else {
    const replyActions = getActionsForPlayer(nextGrid, nextPlayer);
    if (replyActions.length === 0) winner = mover;
  }

  return {
    ...board,
    grid: nextGrid,
    winner,
    isDraw: false,
    latestMove: {
      from: { ...legal.from },
      to: { ...legal.to },
      player: mover,
      type: legal.type,
    },
    winningLine: winner !== null
      ? [{ row: legal.to.row, column: legal.to.column }]
      : null,
    active: winner === null ? nextPlayer : mover,
  };
};

export const getResult = (board) => {
  if (board.winner === 0) return [1, 0];
  if (board.winner === 1) return [0, 1];
  if (board.isDraw) return [0.5, 0.5];
  return [0.01, 0.01];
};

export class Board {
  constructor(state) {
    this._state = state ?? createBoard();
  }

  get active() { return this._state.active; }

  getActions() { return getActions(this._state); }
  getResult() { return getResult(this._state); }

  doAction(action) { this._state = doAction(this._state, action); }

  copy() {
    return new Board({
      ...this._state,
      grid: cloneGrid(this._state.grid),
      latestMove: this._state.latestMove
        ? {
            ...this._state.latestMove,
            from: { ...this._state.latestMove.from },
            to: { ...this._state.latestMove.to },
          }
        : null,
      winningLine: this._state.winningLine
        ? this._state.winningLine.map((cell) => ({ ...cell }))
        : null,
    });
  }

  getState() { return this._state; }
  setState(state) { this._state = state; }
}
