const fs = require('fs');

const arrowGrid = [
  "X               ",
  "XX              ",
  "X.X             ",
  "X..X            ",
  "X...X           ",
  "X....X          ",
  "X.....X         ",
  "X......X        ",
  "X.......X       ",
  "X........X      ",
  "X.....XXXXX     ",
  "X..X..X         ",
  "X.X X..X        ",
  "XX  X..X        ",
  "X    X..X       ",
  "      XX        "
];

const pointingHandGrid = [
  "      XX        ",
  "     X..X       ",
  "     X..X       ",
  "     X..X       ",
  "     X..X  X    ",
  "     X..X X.X   ",
  "     X..XX..X   ",
  "   XX....X..X   ",
  "  X.........X   ",
  " X..........X   ",
  "X...........X   ",
  "X...........X   ",
  "X...........X   ",
  "X...........X   ",
  " X.........X    ",
  "  XXXXXXXXX     "
];

function gridToSvgBase64(grid) {
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
  const pixelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${grid[0].length * 2}" height="${grid.length * 2}" viewBox="0 0 ${grid[0].length} ${grid.length}">${rects.join('')}</svg>`;
  return `url('data:image/svg+xml;base64,${Buffer.from(pixelSvg).toString('base64')}')`;
}

const idleCss = gridToSvgBase64(arrowGrid);
const hoverCss = gridToSvgBase64(pointingHandGrid);

const cssPath = 'src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace body cursor
css = css.replace(/body\s*\{[\s\S]*?cursor:[^;]+!important;/g, (match) => {
  return match.replace(/cursor:[^;]+!important;/, `cursor: ${idleCss}, auto !important;`);
});

// Update the hover rule we appended earlier
const hoverRuleRegex = /a, button, \[role="button"\], \.cursor-pointer, \.brutal-btn\s*\{\s*cursor:[^;]+!important;\s*\}/g;

if (css.match(hoverRuleRegex)) {
    css = css.replace(hoverRuleRegex, `a, button, [role="button"], .cursor-pointer, .brutal-btn {\n  cursor: ${hoverCss}, pointer !important;\n}`);
}

fs.writeFileSync(cssPath, css);
console.log('Successfully updated to Arrow + Pointing Hand cursors!');
