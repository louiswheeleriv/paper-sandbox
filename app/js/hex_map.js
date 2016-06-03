//
// Constants
//

var HEX_RADIUS = 30;
var HEX_DIST_A = (HEX_RADIUS * (Math.sqrt(3) / 2));
var HEX_DIST_B = HEX_RADIUS * 0.5;

// NOTE: Distances
//
//      x_B_   x
//             | <- A
//   xRADIUS   |  x
//
//      x      x

var HEX_STROKE_WIDTH = 2;
var HEX_STROKE_COLOR = '#000000';
var HEX_FILL_COLOR = '#ffffff';

var HEX_COLORS_RAINBOW = [
    '#FF0000',
    '#FF7F00',
    '#FFFF00',
    '#00FF00',
    '#0000FF',
    '#4B0082',
    '#9400D3'
];

var BOARD_WIDTH_TILES = 20;
var BOARD_HEIGHT_TILES = 16;
var BOARD_WIDTH_PIXELS = (1.5 * BOARD_WIDTH_TILES * HEX_RADIUS);
var BOARD_HEIGHT_PIXELS = (BOARD_HEIGHT_TILES * 2 * HEX_DIST_A);

//
// Paths for entity appearance
//

var hexPathDef = {
    segments: [
        [-HEX_RADIUS, 0],
        [-HEX_DIST_B, -HEX_DIST_A],
        [HEX_DIST_B, -HEX_DIST_A],
        [HEX_RADIUS, 0],
        [HEX_DIST_B, HEX_DIST_A],
        [-HEX_DIST_B, HEX_DIST_A]
    ],
    strokeColor: HEX_STROKE_COLOR,
    strokeWidth: HEX_STROKE_WIDTH,
    fillColor: HEX_FILL_COLOR,
    closed: true
};

var hexPathDefs = [];
for (var i = 0; i < HEX_COLORS_RAINBOW.length; i++) {
    var hexPathDefColor = _.clone(hexPathDef);
    hexPathDefColor.fillColor = HEX_COLORS_RAINBOW[i];
    hexPathDefs.push(hexPathDefColor);
}

var hexPaths = [];
for (var i = 0; i < hexPathDefs.length; i++) {
    hexPaths.push(new Path(hexPathDefs[i]));
}

//
// Symbols
//

var hexSymbols = [];
for (var i = 0; i < hexPaths.length; i++) {
    hexSymbols.push(new Symbol(hexPaths[i]));
}

//
// Constructors
//

function HexTile(pnt, clr) {
    this.point = pnt;
    this.colorIndex = clr;
    this.color = HEX_COLORS_RAINBOW[this.colorIndex];
    this.symbol = hexSymbols[this.colorIndex].place(this.point);
}

//
// Prototypes
//

HexTile.prototype = {
    changeColor: function(clr) {
        this.symbol.remove();
        this.colorIndex = clr;
        this.color = HEX_COLORS_RAINBOW[this.colorIndex];
        this.symbol = hexSymbols[this.colorIndex].place(this.point);
    }
}

//
// Setup
//

var tiles = [];

generateHexTiles(BOARD_HEIGHT_TILES, BOARD_WIDTH_TILES);

function generateHexTiles(rows, cols) {
    var colorCounter = 0;
    var xOffset = (BOARD_WIDTH_PIXELS - view.size.width) / -2;
    var yOffset = (BOARD_HEIGHT_PIXELS - view.size.height) / -2;
    
    for (var i = 0; i < rows; i++) {
        tiles[i] = [];
        for (var j = 0; j < cols; j++) {
            var x = (j * (HEX_RADIUS * 3/2)) + xOffset;
            var y = (i * (HEX_DIST_A * 2) + ((j % 2) * HEX_DIST_A)) + yOffset;
            
            var tile = new HexTile(new Point(x, y), colorCounter);
            tiles[i].push(tile);
            colorCounter = (colorCounter == HEX_COLORS_RAINBOW.length-1) ? 0 : colorCounter + 1;
        }
    }
}

//
// Handle user input
//

function onMouseDrag(event) {
    dragTiles(getAdjustedDeltaAtBorders(event.delta));
}

function getAdjustedDeltaAtBorders(delta) {
    var topLeftTile = tiles[0][0];
    var topRightTile = tiles[0][tiles[0].length-1];
    var bottomLeftTile = tiles[tiles.length-1][0];
    
    if ((delta.x > 0 && topLeftTile.point.x > HEX_RADIUS) ||
        (delta.x < 0 && topRightTile.point.x < view.size.width - HEX_RADIUS)) {
        delta.x = 0;
    }
    if ((delta.y > 0 && topLeftTile.point.y > HEX_RADIUS) ||
        (delta.y < 0 && bottomLeftTile.point.y < view.size.height - (HEX_RADIUS*2))) {
        delta.y = 0;
    }
    return delta;
}

function dragTiles(delta) {
    for (var i = 0; i < tiles.length; i++) {
        for (var j = 0; j < tiles[i].length; j++) {
            tiles[i][j].point += delta;
            tiles[i][j].symbol.position = tiles[i][j].point;
        }
    }
}

var freakingOut = false;

function onKeyDown(event) {
    freakingOut = true;
}

function onKeyUp(event) {
    freakingOut = false;
    
}

//
// Tick
//

var freakOutCounter = 0;
var freakOutInterval = 4;
function onFrame() {
    if (freakingOut) {
        freakOutCounter++;
        if (freakOutCounter == freakOutInterval) {
            freakOut();
            freakOutCounter = 0;
        }
    }
}

function freakOut() {
    for (var i = 0; i < tiles.length; i++) {
        for (var j = 0; j < tiles[i].length; j++) {
            var clr = (tiles[i][j].colorIndex < HEX_COLORS_RAINBOW.length-1) ? tiles[i][j].colorIndex+1 : 0;
            tiles[i][j].changeColor(clr);
        }
    }
}