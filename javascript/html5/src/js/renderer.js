// Copyright (c) 2016,2026 Oliver Merkel. All rights reserved.
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

const SVG_NS = 'http://www.w3.org/2000/svg';
const VB_W = 1950;
const VB_H = 1450;
const CELL = 190;
// Vertical board offset aligns pawn centers with the printed board artwork.
const GRID_CENTER_OFFSET_Y = 5;
const GRID_X = Math.floor((VB_W - COLUMNS * CELL) / 2);
const GRID_Y = Math.floor((VB_H - ROWS * CELL) / 2) + GRID_CENTER_OFFSET_Y;
const PIECE_R = 72;

const colors = {
  south: '#dc2626',
  north: '#facc15',
  selected: '#22c55e',
  latest: '#f8fafc',
  selectable: '#0ea5e9',
  idleStroke: '#111827',
  destinationStroke: '#052e16',
  destination: 'rgba(34, 197, 94, 0.6)',
};

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  return el;
};

const cellCenter = (row, col) => ({
  x: GRID_X + col * CELL + CELL / 2,
  y: GRID_Y + row * CELL + CELL / 2,
});

const CROWN_SCALE = 0.22;
// Vertical crown offset aligns the source SVG geometry over the piece center.
const CROWN_CENTER_OFFSET_Y = 1;
const CROWN_STYLE = 'pointer-events:none;';
const CROWN_FILTER_SOUTH = 'brightness(1.03)';
const CROWN_FILTER_NORTH = 'brightness(0.8)';
const CROWN_PATHS = [
  {
    style: 'fill:#000000;fill-opacity:1;stroke:#333333;stroke-width:8;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1',
    d: 'm 222.10858,147.19935 c 18.11593,24.49482 22.37559,43.28025 26.97699,61.48481 3.51865,-14.78317 26.79189,-64.20409 42.00031,-73.35178 -8.86547,-13.27765 -8.01032,-22.65652 -23.52107,-41.186979 L 302,94 c 4.2265,0.0598 8.45089,-1.63776 11.46083,-4.60544 3.00994,-2.96768 4.76704,-7.16764 4.76704,-11.39456 0,-4.22692 -1.7571,-8.42688 -4.76704,-11.39456 C 310.45089,63.63776 306.2265,61.94023 302,62 L 268.48605,61.73554 268,28 c 0.0584,-4.26698 -1.67576,-8.53024 -4.69616,-11.54483 -3.02039,-3.01458 -7.28698,-4.74056 -11.55384,-4.67392 -4.18353,0.0654 -8.31454,1.85029 -11.22941,4.85191 C 237.60572,19.63478 235.94271,23.81635 236,28 L 235.9074,61.94215 202,62 c -4.2265,-0.0598 -8.45089,1.63776 -11.46083,4.60544 -3.00994,2.96768 -4.76704,7.16764 -4.76704,11.39456 0,4.22692 1.7571,8.42688 4.76704,11.39456 C 193.54911,92.36224 197.7735,94.05977 202,94 l 33.7652,0.575077 c -0.40798,22.611043 -3.59215,31.332613 -13.65662,52.624273 z',
  },
  {
    style: 'fill:#ffffff;fill-opacity:1;stroke:#333333;stroke-width:8;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1',
    d: 'm 424.19393,414.12291 c -5.01067,21.82806 -20.15185,38.40824 -83.80595,57.93069 -63.6541,19.52245 -243.216246,0.63617 -249.68471,-33.36284 23.20304,-49.97497 3.46225,-64.04525 -24.3064,-87.04096 C -127.94675,105.37237 247.24009,-2.313802 249.93273,234.91797 248.10658,-1.091116 694.31728,108.68446 403.28712,357.9792 c 0,0 24.14271,37.65597 20.90716,56.14372 z',
  },
  {
    style: 'fill:none;stroke:#000000;stroke-width:16;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none',
    d: 'M 237.55339,342.25572 C 218.43768,303.60727 221.66547,44.772395 57.243215,132.3608 5.4318047,150.84242 33.300604,343.56952 135.65809,353.39692 236.75359,369.38744 351.26934,373.58361 381.78967,340.84248 509.92317,230.76157 450.33098,155.29264 432.20925,141.20063 261.82114,36.120295 277.52439,284.30456 237.55339,342.25572 z',
  },
  {
    style: 'fill:#000000;fill-opacity:1;stroke:#333333;stroke-width:8;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none',
    d: 'M 245.62605,340.52777 C 247.14975,295.44921 230.42335,76.794117 63.813883,130.14548 24.72802,154.73537 17.429032,319.0387 114.66119,361.0531 c 6.13741,5.31056 117.01129,33.44094 232.91037,10.55667 -93.3921,51.7375 -252.39875,-18.37353 -224.98148,56.01517 53.05319,26.25957 240.84951,27.95732 274.90336,-6.51025 -22.48664,10.59976 -218.97069,17.07752 -252.45155,-7.82017 41.47573,6.08492 288.98986,20.20294 227.24401,-54.69839 C 532.70868,242.79174 472.64876,145.42933 444.27837,133.80586 267.79856,58.913108 273.55418,285.2897 245.62605,340.52777 z m 178.56788,73.59514 c -5.01067,21.82806 -20.15185,38.40824 -83.80595,57.93069 -63.6541,19.52245 -243.216246,0.63617 -249.68471,-33.36284 23.20304,-49.97497 3.46225,-64.04525 -24.3064,-87.04096 C -127.94675,105.37237 247.24009,-0.313802 249.93273,236.91797 248.10658,0.908884 694.31728,108.68446 403.28712,357.9792 c 0,0 24.14271,37.65597 20.90716,56.14372 z',
  },
  {
    style: 'fill:#ffffff;fill-opacity:1;stroke:#333333;stroke-width:8;stroke-linecap:round;stroke-miterlimit:4;stroke-opacity:1',
    d: 'm 254.22829,114.79413 c -2.42237,14.30266 -7.70083,22.34601 -12.97251,32.47519 3.82032,7.96862 7.3263,12.19299 8.55892,21.39523 3.39477,-9.71668 13.16483,-19.86088 23.02684,-33.06184 -5.04155,-12.64499 -10.83761,-18.79468 -18.61325,-20.80858 z',
  },
];

const pieceColor = (piece) => {
  if (piece === SOUTH || piece === SOUTH_KING) return colors.south;
  if (piece === NORTH || piece === NORTH_KING) return colors.north;
  return '#ffffff';
};

const isKingPiece = (piece) => piece === SOUTH_KING || piece === NORTH_KING;

const createCrown = (x, y) => {
  const crown = svgEl('g', {
    'data-role': 'crown',
    transform: `translate(${x} ${y}) scale(${CROWN_SCALE}) translate(-256 -256)`,
    style: CROWN_STYLE,
    display: 'none',
  });

  for (const path of CROWN_PATHS) {
    crown.appendChild(svgEl('path', path));
  }

  return crown;
};

export const createRenderer = (container, onCellClick) => {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Uisge game board',
  });
  svg.style.cssText = 'display:block;width:100%;height:100%;';

  svg.appendChild(svgEl('image', {
    href: 'img/pnp-uisge_board.jpg',
    x: 0,
    y: 0,
    width: VB_W,
    height: VB_H,
    preserveAspectRatio: 'none',
  }));

  const statusText = svgEl('text', {
    x: VB_W / 2,
    y: 76,
    'text-anchor': 'middle',
    style: 'font:700 72px/1 system-ui,sans-serif;fill:#f8fafc;stroke:#1f2937;stroke-width:2;',
  });
  svg.appendChild(statusText);

  const pieceLayer = svgEl('g');
  const overlayLayer = svgEl('g');
  svg.appendChild(pieceLayer);
  svg.appendChild(overlayLayer);

  const pieces = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, col) => {
      const pos = cellCenter(row, col);
      const group = svgEl('g');
      const disc = svgEl('circle', {
        cx: pos.x,
        cy: pos.y,
        r: PIECE_R,
        fill: 'transparent',
        stroke: 'transparent',
        'stroke-width': 0,
      });
      const crown = createCrown(pos.x, pos.y + CROWN_CENTER_OFFSET_Y);
      const sourceIndicator = svgEl('circle', {
        cx: pos.x,
        cy: pos.y,
        r: 20,
        fill: '#ffffff',
        opacity: 0.6,
        display: 'none',
      });
      group.appendChild(disc);
      group.appendChild(crown);
      group.appendChild(sourceIndicator);
      pieceLayer.appendChild(group);
      return { group, disc, crown, sourceIndicator };
    })
  );

  const cells = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, col) => {
      const pos = cellCenter(row, col);
      const ring = svgEl('circle', {
        cx: pos.x,
        cy: pos.y,
        r: PIECE_R + 18,
        fill: 'transparent',
        stroke: 'transparent',
        'stroke-width': 0,
      });
      ring.style.cursor = 'default';
      overlayLayer.appendChild(ring);
      return ring;
    })
  );

  container.appendChild(svg);

  const handlers = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

  const clearHandlers = () => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const handler = handlers[row][col];
        handlers[row][col] = null;
        if (handler) {
          cells[row][col].removeEventListener('click', handler);
        }
        cells[row][col].style.cursor = 'default';
      }
    }
  };

  const render = (boardState, selectableActions = [], selectedFrom = null, allowReselect = false) => {
    const latest = boardState.latestMove;

    const sourceSet = new Set(
      selectableActions
        .filter((a) => !selectedFrom || allowReselect)
        .map((a) => `${a.from.row}:${a.from.column}`)
    );
    const destinationSet = new Set(
      selectableActions
        .filter((a) => selectedFrom && a.from.row === selectedFrom.row && a.from.column === selectedFrom.column)
        .map((a) => `${a.to.row}:${a.to.column}`)
    );

    const latestKey = latest ? `${latest.to.row}:${latest.to.column}` : null;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const piece = boardState.grid[row][col];
        const key = `${row}:${col}`;

        const cell = pieces[row][col];
        
        // Show source indicator only for the "from" cell of the last move
        const isLastMoveSource = latest && latest.from.row === row && latest.from.column === col;
        cell.sourceIndicator.setAttribute('display', isLastMoveSource ? 'block' : 'none');
        
        if (piece === EMPTY) {
          cell.disc.setAttribute('fill', 'transparent');
          cell.disc.setAttribute('stroke', 'transparent');
          cell.disc.setAttribute('stroke-width', '0');
          cell.crown.setAttribute('display', 'none');
        } else {
          cell.disc.setAttribute('fill', pieceColor(piece));
          const isSelected = selectedFrom && selectedFrom.row === row && selectedFrom.column === col;
          const isLatest = latestKey === key;
          const isSelectable = sourceSet.has(key);
          
          if (isSelected) {
            cell.disc.setAttribute('stroke', colors.selected);
            cell.disc.setAttribute('stroke-width', '18');
            cell.disc.style.filter = 'drop-shadow(0 0 18px rgba(34,197,94,0.95))';
          } else if (isSelectable) {
            cell.disc.setAttribute('stroke', colors.selectable);
            cell.disc.setAttribute('stroke-width', '14');
            cell.disc.style.filter = 'none';
          } else if (isLatest) {
            cell.disc.setAttribute('stroke', colors.latest);
            cell.disc.setAttribute('stroke-width', '9');
            cell.disc.style.filter = 'drop-shadow(0 0 12px rgba(248,250,252,0.95))';
          } else {
            cell.disc.setAttribute('stroke', colors.idleStroke);
            cell.disc.setAttribute('stroke-width', '6');
            cell.disc.style.filter = 'none';
          }

          if (isKingPiece(piece)) {
            cell.crown.setAttribute('display', 'block');
            cell.crown.style.filter = (piece === SOUTH_KING) ? CROWN_FILTER_SOUTH : CROWN_FILTER_NORTH;
          } else {
            cell.crown.setAttribute('display', 'none');
            cell.crown.style.filter = 'none';
          }
        }

        const ring = cells[row][col];
        if (destinationSet.has(key)) {
          ring.setAttribute('fill', colors.destination);
          ring.setAttribute('stroke', colors.destinationStroke);
          ring.setAttribute('stroke-width', '5');
        } else {
          ring.setAttribute('fill', 'transparent');
          ring.setAttribute('stroke', 'transparent');
          ring.setAttribute('stroke-width', '0');
        }
      }
    }

    if (boardState.winner === 0) statusText.textContent = 'Red wins';
    else if (boardState.winner === 1) statusText.textContent = 'Yellow wins';
    else statusText.textContent = boardState.active === 0 ? 'Red to move' : 'Yellow to move';

    clearHandlers();

    const clickable = (selectedFrom && allowReselect)
      ? new Set([...sourceSet, ...destinationSet])
      : (selectedFrom ? destinationSet : sourceSet);
    for (const key of clickable) {
      const [rowText, colText] = key.split(':');
      const row = Number(rowText);
      const col = Number(colText);
      const handler = () => onCellClick(row, col);
      handlers[row][col] = handler;
      cells[row][col].addEventListener('click', handler);
      cells[row][col].style.cursor = 'pointer';
    }
  };

  return {
    render,
    resize: () => {},
    actionKey: actionToKey,
  };
};
