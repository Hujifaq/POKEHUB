const grid = [
  "      XX      ",
  "     X..X     ",
  "     X..X     ",
  "     X..X     ",
  "     X..X  X  ",
  "     X..X X.X ",
  "     X..XX..X ",
  "   XX....X..X ",
  "  X.........X ",
  " X..........X ",
  "X...........X ",
  "X...........X ",
  "X...........X ",
  "X...........X ",
  " X.........X  ",
  "  XXXXXXXXX   "
];

let rects = [];
for(let y=0; y<grid.length; y++) {
  for(let x=0; x<grid[y].length; x++) {
    if(grid[y][x] === 'X') {
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`);
    } else if(grid[y][x] === '.') {
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="white"/>`);
    }
  }
}

const pixelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${grid[0].length * 2}" height="${grid.length * 2}" viewBox="0 0 ${grid[0].length} ${grid.length}">
  ${rects.join('')}
</svg>`;

const dataUri = `url('data:image/svg+xml;base64,${Buffer.from(pixelSvg).toString('base64')}'), pointer`;
console.log(dataUri);
