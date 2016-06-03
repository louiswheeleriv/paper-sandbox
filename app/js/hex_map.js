//
// Constants
//

var HEX_RADIUS = 30;
var BOARD_WIDTH_TILES = 10;
var BOARD_HEIGHT_TILES = 8;

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
var HEX_COLOR_WHITE = '#ffffff';
var HEX_COLORS_RAINBOW = [
    '#FF0000',
    '#FF7F00',
    '#FFFF00',
    '#00FF00',
    '#0000FF',
    '#4B0082',
    '#9400D3'
];

var BOARD_WIDTH_PIXELS = (1.5 * BOARD_WIDTH_TILES * HEX_RADIUS);
var BOARD_HEIGHT_PIXELS = (BOARD_HEIGHT_TILES * 2 * HEX_DIST_A);

//
// Paths for entity appearance
//

var hexPathDefWhite = {
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
    fillColor: HEX_COLOR_WHITE,
    closed: true
};

var hexPathDefs = [];
for (var i = 0; i < HEX_COLORS_RAINBOW.length; i++) {
    var hexPathDefColor = _.clone(hexPathDefWhite);
    hexPathDefColor.fillColor = HEX_COLORS_RAINBOW[i];
    hexPathDefs.push(hexPathDefColor);
}

var hexPathWhite = new Path(hexPathDefWhite);
var hexPaths = [];
for (var i = 0; i < hexPathDefs.length; i++) {
    hexPaths.push(new Path(hexPathDefs[i]));
}

//
// Symbols
//

var hexSymbolWhite = new Symbol(hexPathWhite);
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
    this.color = (this.colorIndex > -1) ? HEX_COLORS_RAINBOW[this.colorIndex] : HEX_COLOR_WHITE;
    this.symbol = (this.colorIndex > -1) ? hexSymbols[this.colorIndex].place(this.point) : hexSymbolWhite.place(this.point);
}

//
// Prototypes
//

HexTile.prototype = {
    changeColor: function(clr) {
        this.symbol.remove();
        this.colorIndex = clr;
        this.color = (this.colorIndex > -1) ? HEX_COLORS_RAINBOW[this.colorIndex] : HEX_COLOR_WHITE;
        this.symbol = (this.colorIndex > -1) ? hexSymbols[this.colorIndex].place(this.point) : hexSymbolWhite.place(this.point);
    },
    moveByDelta: function(delta) {
        this.point += delta;
        this.symbol.position = this.point;
    }
}

//
// Setup
//

/*
var tileDefs = [
    [
        {colorIndex: 1},
        {colorIndex: 2}
    ],
    [
        {colorIndex: 3},
        {colorIndex: 4}
    ]
];
var tiles = generateHexTilesWithMap(tileDefs);
*/

var tiles = generateHexTiles(BOARD_HEIGHT_TILES, BOARD_WIDTH_TILES);

function generateHexTiles(rows, cols) {
    return generateHexTiles(rows, cols, false);
}

function generateHexTilesRainbow(rows, cols) {
    return generateHexTiles(rows, cols, true);
}

function generateHexTiles(rows, cols, isRainbow) {
    var colorCounter = isRainbow ? 0 : -1;
    var xOffset = (BOARD_WIDTH_PIXELS - view.size.width) / -2;
    var yOffset = (BOARD_HEIGHT_PIXELS - view.size.height) / -2;
    
    var _tiles = [];
    
    for (var i = 0; i < rows; i++) {
        _tiles[i] = [];
        for (var j = 0; j < cols; j++) {
            var x = (j * (HEX_RADIUS * 3/2)) + xOffset;
            var y = (i * (HEX_DIST_A * 2) + ((j % 2) * HEX_DIST_A)) + yOffset;
            
            var tile = new HexTile(new Point(x, y), colorCounter);
            _tiles[i].push(tile);
            if (isRainbow) {
                colorCounter = (colorCounter == HEX_COLORS_RAINBOW.length-1) ? 0 : colorCounter + 1;
            }
        }
    }
    return _tiles;
}

function generateHexTilesWithMap(tileDefs) {
    var widthPixels = (1.5 * tileDefs[0].length * HEX_RADIUS);
    var heightPixels = (tileDefs.length * 2 * HEX_DIST_A);
    
    var xOffset = (widthPixels - view.size.width) / -2;
    var yOffset = (heightPixels - view.size.height) / -2;
    
    var _tiles = [];
    
    for (var i = 0; i < tileDefs.length; i++) {
        _tiles[i] = [];
        for (var j = 0; j < tileDefs[0].length; j++) {
            var x = (j * (HEX_RADIUS * 3/2)) + xOffset;
            var y = (i * (HEX_DIST_A * 2) + ((j % 2) * HEX_DIST_A)) + yOffset;
            
            var tile = new HexTile(new Point(x, y), tileDefs[i][j].colorIndex);
            _tiles[i].push(tile);
        }
    }
    return _tiles;
}

//
// Handle user input
//

function onMouseDrag(event) {
    if (!drawing) {
        dragTiles(getAdjustedDeltaAtBorders(event.delta));
    } else {
        colorHex(event.point, 0);
    }
}

function onMouseDown(event) {
    if (drawing) {
        colorHex(event.point, 0);
    }
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
            tiles[i][j].moveByDelta(delta);
        }
    }
}

function colorHex(pnt, clr) {
    //
    // TODO: Alter this to use more efficient binary search
    //
    
    for (var i = 0; i < tiles[0].length; i++) {
        var tileCol = tiles[0][i];
        if (tileCol.point.x - HEX_DIST_A < pnt.x &&
            tileCol.point.x + HEX_DIST_A > pnt.x) {
            for (var j = 0; j < tiles[0].length; j++) {
                var tile = tiles[j][i];
                if (tile.point.y - HEX_DIST_A < pnt.y &&
                    tile.point.y + HEX_DIST_A > pnt.y) {
                    tile.changeColor(clr);
                    return;
                }
            }
        }
    }
}

var freakingOut = false;
var drawing = false;

function onKeyDown(event) {
    if (event.key == 'f') {
        freakingOut = true;
    }
}

function onKeyUp(event) {
    if (event.key == 'f') {
        freakingOut = false;
    } else if (event.key == 'd') {
        drawing = !drawing;
        console.log('drawing = ' + drawing);
    }
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