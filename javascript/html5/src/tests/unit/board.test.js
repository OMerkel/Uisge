import { describe, expect, it } from 'vitest';
import { Board, createBoard, doAction, getActions, getResult } from '../../js/board.js';
import { NORTH, NORTH_KING, SOUTH, SOUTH_KING } from '../../js/common.js';

const key = (action) =>
  `${action.from.row}:${action.from.column}:${action.to.row}:${action.to.column}:${action.type}`;

const findAction = (board, predicate) => getActions(board).find(predicate);

describe('createBoard', () => {
  it('creates a 7x6 board with 12 connected pieces in initial setup', () => {
    const board = createBoard();
    expect(board.grid).toHaveLength(6);
    board.grid.forEach((row) => expect(row).toHaveLength(7));

    const all = board.grid.flat();
    expect(all.filter((cell) => cell === SOUTH).length).toBe(6);
    expect(all.filter((cell) => cell === NORTH).length).toBe(6);
    expect(board.active).toBe(0);
    expect(board.winner).toBeNull();
  });
});

describe('getActions / doAction', () => {
  it('returns structured move actions', () => {
    const actions = getActions(createBoard());
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0]).toHaveProperty('from');
    expect(actions[0]).toHaveProperty('to');
    expect(actions[0]).toHaveProperty('type');
  });

  it('allows orthogonal jumps and flips the moving piece', () => {
    const board = createBoard();
    // SOUTH pawn at [3][3] jumps left over [3][2] to the empty [3][1]
    const jump = findAction(
      board,
      (a) => a.type === 'jump' && a.from.row === 3 && a.from.column === 3 && a.to.row === 3 && a.to.column === 1
    );
    expect(jump).toBeTruthy();

    const next = doAction(board, jump);
    expect(next.grid[3][1]).toBe(SOUTH_KING);
    expect(next.grid[3][3]).toBe(0);
    expect(next.active).toBe(1);
  });

  it('a king that jumps orthogonally flips back to a pawn', () => {
    // SOUTH_KING at [2][2] jumps right over SOUTH at [2][3] to empty [2][4]
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, SOUTH_KING, SOUTH, 0, 0, 0],
        [0, 0, 0, SOUTH, 0, 0, 0],
        [0, 0, 0, NORTH, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      active: 0,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    const jump = findAction(
      board,
      (a) => a.type === 'jump' && a.from.row === 2 && a.from.column === 2 && a.to.row === 2 && a.to.column === 4
    );
    expect(jump).toBeTruthy();

    const next = doAction(board, jump);
    expect(next.grid[2][4]).toBe(SOUTH);
    expect(next.grid[2][2]).toBe(0);
  });

  it('a NORTH_KING that jumps flips back to a NORTH pawn', () => {
    // NORTH_KING at [2][2] jumps down over NORTH at [3][2] to empty [4][2]
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, NORTH_KING, 0, 0, 0, 0],
        [0, 0, NORTH,      SOUTH, 0, 0, 0],
        [0, 0, 0,          SOUTH, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      active: 1,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    const jump = findAction(
      board,
      (a) => a.type === 'jump' && a.from.row === 2 && a.from.column === 2 && a.to.row === 4 && a.to.column === 2
    );
    expect(jump).toBeTruthy();

    const next = doAction(board, jump);
    expect(next.grid[4][2]).toBe(NORTH);
    expect(next.grid[2][2]).toBe(0);
  });

  it('wins immediately when all pieces of the mover become kings', () => {
    // 5 SOUTH_KINGs + 1 SOUTH pawn; the pawn can jump right and flip to king.
    // After the jump all 6 SOUTH pieces are kings -> immediate win.
    const board = {
      ...createBoard(),
      grid: [
        [0, SOUTH_KING, 0, 0, 0, 0, 0],
        [0, SOUTH_KING, 0, 0, 0, 0, 0],
        [0, SOUTH_KING, 0, 0, 0, 0, 0],
        [0, SOUTH_KING, NORTH, 0, 0, 0, 0],
        [0, SOUTH_KING, NORTH, 0, 0, 0, 0],
        [0, SOUTH,      NORTH, 0, 0, 0, 0],
      ],
      active: 0,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    // SOUTH pawn at [5][1] jumps right over NORTH at [5][2] to empty [5][3]
    const allKingsMove = {
      from: { row: 5, column: 1 },
      to: { row: 5, column: 3 },
      type: 'jump',
    };
    const next = doAction(board, allKingsMove);
    expect(next.winner).toBe(0);
    expect(next.grid[5][3]).toBe(SOUTH_KING);
  });

  it('does not allow diagonal jumps', () => {
    const actions = getActions(createBoard());
    const hasDiagonalJump = actions.some((a) =>
      a.type === 'jump' &&
      Math.abs(a.to.row - a.from.row) === 2 &&
      Math.abs(a.to.column - a.from.column) === 2
    );
    expect(hasDiagonalJump).toBe(false);
  });

  it('allows kings to move one square diagonally without flipping', () => {
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, SOUTH_KING, SOUTH, 0, 0, 0],
        [0, 0, SOUTH, NORTH, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      active: 0,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    const kingMove = findAction(
      board,
      (a) => a.type === 'move' && a.from.row === 2 && a.from.column === 2 && a.to.row === 1 && a.to.column === 3
    );
    expect(kingMove).toBeTruthy();

    const moved = doAction(board, kingMove);
    expect(moved.grid[1][3]).toBe(SOUTH_KING);
  });

  it('allows a lone king to move because a single occupied cell is connected', () => {
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, SOUTH_KING, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      active: 0,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    const actions = getActions(board);
    expect(actions).toHaveLength(8);
    expect(actions.every((action) => action.type === 'move')).toBe(true);
  });

  it('rejects actions that are not legal in current state', () => {
    const board = createBoard();
    const illegal = {
      from: { row: 3, column: 0 },
      to: { row: 0, column: 0 },
      type: 'move',
    };
    const next = doAction(board, illegal);
    expect(next).toEqual(board);
  });

  it('enforces single-group connectivity by filtering split moves', () => {
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      active: 0,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    // Moving the center piece away would split the group into two components,
    // so this move should not exist in legal actions.
    const forbidden = {
      from: { row: 3, column: 3 },
      to: { row: 5, column: 3 },
      type: 'jump',
    };
    const actionKeys = getActions(board).map(key);
    expect(actionKeys).not.toContain(key(forbidden));
  });

  it('wins when the opponent has no legal reply', () => {
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      active: 1,
      winner: null,
      latestMove: null,
      winningLine: null,
    };

    const winNow = {
      from: { row: 4, column: 3 },
      to: { row: 2, column: 3 },
      type: 'jump',
    };
    const next = doAction(board, winNow);
    expect(next.winner).toBe(1);
  });
});

describe('getResult and Board adapter', () => {
  it('returns [1, 0] when winner is SOUTH (player 0)', () => {
    const winnerBoard = { ...createBoard(), winner: 0 };
    expect(getResult(winnerBoard)).toEqual([1, 0]);
  });

  it('returns [0, 1] when winner is NORTH (player 1)', () => {
    const winnerBoard = { ...createBoard(), winner: 1 };
    expect(getResult(winnerBoard)).toEqual([0, 1]);
  });

  it('returns [0.5, 0.5] for a draw', () => {
    const drawBoard = { ...createBoard(), isDraw: true };
    expect(getResult(drawBoard)).toEqual([0.5, 0.5]);
  });

  it('returns [0.01, 0.01] for a non-terminal board', () => {
    expect(getResult(createBoard())).toEqual([0.01, 0.01]);
  });

  it('Board.getResult() delegates to getResult', () => {
    const board = new Board({ ...createBoard(), winner: 1 });
    expect(board.getResult()).toEqual([0, 1]);
  });

  it('Board.setState() replaces internal state', () => {
    const board = new Board();
    const custom = { ...createBoard(), winner: 0 };
    board.setState(custom);
    expect(board.getState().winner).toBe(0);
    expect(board.active).toBe(0);
  });

  it('supports copy and simulation without mutating original', () => {
    const board = new Board();
    const copy = board.copy();
    const first = copy.getActions()[0];
    copy.doAction(first);

    expect(copy.getState()).not.toEqual(board.getState());
  });

  it('copy preserves winningLine and latestMove deep structure', () => {
    const base = {
      ...createBoard(),
      winner: 0,
      latestMove: { from: { row: 1, column: 2 }, to: { row: 3, column: 2 }, type: 'jump', player: 0 },
      winningLine: [{ row: 3, column: 2 }],
    };
    const board = new Board(base);
    const copy = board.copy();
    // Mutate originals to prove the copy is independent
    base.latestMove.from.row = 99;
    base.winningLine[0].row = 99;
    expect(copy.getState().latestMove.from.row).toBe(1);
    expect(copy.getState().winningLine[0].row).toBe(3);
  });

  it('NORTH_KING piece values are recognized by pieceOwner via getActions', () => {
    const board = {
      ...createBoard(),
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, SOUTH, NORTH_KING, 0, 0, 0],
        [0, 0, SOUTH, NORTH,      0, 0, 0],
        [0, 0, 0,     0,          0, 0, 0],
      ],
      active: 1,
      winner: null,
      latestMove: null,
      winningLine: null,
    };
    const actions = getActions(board);
    // NORTH_KING at [3][3] can move diagonally – at least one action exists
    expect(actions.length).toBeGreaterThan(0);
    const kingMove = actions.find((a) => a.from.row === 3 && a.from.column === 3 && a.type === 'move');
    expect(kingMove).toBeTruthy();
  });
});
