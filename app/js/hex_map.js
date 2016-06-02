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

var BOARD_WIDTH_TILES = 12;
var BOARD_HEIGHT_TILES = 8;
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
    
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            var x = (i * (HEX_RADIUS * 3/2));
            var y = (j * (HEX_DIST_A * 2) + ((i % 2) * HEX_DIST_A));
            
            x += xOffset;
            y += yOffset;
            
            var tile = new HexTile(new Point(x, y), colorCounter);
            tiles.push(tile);
            colorCounter = (colorCounter == HEX_COLORS_RAINBOW.length-1) ? 0 : colorCounter + 1;
        }
    }
}

//
// Handle user input
//

function onMouseDrag(event) {
    for (var i = 0; i < tiles.length; i++) {
        tiles[i].point += event.delta;
        tiles[i].symbol.position = tiles[i].point;
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
        var clr = (tiles[i].colorIndex < HEX_COLORS_RAINBOW.length-2) ? tiles[i].colorIndex+1 : 0;
        tiles[i].changeColor(clr);
    }
}