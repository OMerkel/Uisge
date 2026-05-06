import { describe, expect, it } from 'vitest';
import { actionToKey, COLUMNS, EMPTY, NORTH, NORTH_KING, ROWS, SOUTH, SOUTH_KING } from '../../js/common.js';

describe('common constants', () => {
  it('exposes board dimensions and piece IDs', () => {
    expect(COLUMNS).toBe(7);
    expect(ROWS).toBe(6);
    expect(EMPTY).toBe(0);
    expect(SOUTH).toBe(1);
    expect(NORTH).toBe(2);
    expect(SOUTH_KING).toBe(3);
    expect(NORTH_KING).toBe(4);
  });
});

describe('actionToKey', () => {
  it('builds a stable action signature', () => {
    const action = {
      from: { row: 3, column: 4 },
      to: { row: 1, column: 4 },
      type: 'jump',
    };

    expect(actionToKey(action)).toBe('3:4:1:4:jump');
  });
});
