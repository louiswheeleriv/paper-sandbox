//
// Constants
//

var HEX_RADIUS = 25;
var BOARD_WIDTH_TILES = 20;
var BOARD_HEIGHT_TILES = 14;

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
var HEX_COLOR_BLACK = '#000000';
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
    strokeColor: HEX_COLOR_BLACK,
    strokeWidth: HEX_STROKE_WIDTH,
    fillColor: HEX_COLOR_WHITE,
    closed: true
};

var hexPathDefs = [];
_.each(HEX_COLORS_RAINBOW, function(color) {
    var hexPathDefColor = _.clone(hexPathDefWhite);
    hexPathDefColor.fillColor = color;
    hexPathDefs.push(hexPathDefColor);
});

var hexPathWhite = new Path(hexPathDefWhite);
var hexPaths = [];
_.each(hexPathDefs, function(hexPathDef) {
    hexPaths.push(new Path(hexPathDef));
});

//
// Symbols
//

var hexSymbolWhite = new Symbol(hexPathWhite);
var hexSymbols = [];
_.each(hexPaths, function(hexPath) {
    hexSymbols.push(new Symbol(hexPath));
})

//
// Constructors
//

function HexTile(pnt, clr) {
    this.point = pnt;
    this.colorIndex = clr;
    this.color = (this.colorIndex > -1) ? HEX_COLORS_RAINBOW[this.colorIndex] : HEX_COLOR_WHITE;
    this.hovered = false;
    this.selected = false;
    this.symbol = (this.colorIndex > -1) ? hexSymbols[this.colorIndex].place(this.point) : hexSymbolWhite.place(this.point);
}

//
// Prototypes
//

HexTile.prototype = {
    changeColorAndScale: function(clr, scl) {
        this.changeColor(clr);
        if (scl != 1) {
            this.changeScale(scl);
        }
    },
    changeColor: function(clr) {
        this.symbol.remove();
        this.colorIndex = clr;
        this.color = (this.colorIndex > -1) ? HEX_COLORS_RAINBOW[this.colorIndex] : HEX_COLOR_WHITE;
        this.symbol = (this.colorIndex > -1) ? hexSymbols[this.colorIndex].place(this.point) : hexSymbolWhite.place(this.point);
    },
    changeScale: function(scl) {
        this.symbol.scale(scl);
    },
    moveByDelta: function(delta) {
        this.point += delta;
        this.symbol.position = this.point;
    },
    toggleHovered: function(hov) {
        this.hovered = hov;
        if (this.hovered) {
            this.changeColorAndScale(0, 1.2);
        } else {
            this.changeColor(-1);
        }
    },
    toggleSelected: function(sel) {
        this.selected = sel;
        this.hovered = false;
        if (this.selected) {
            this.changeColorAndScale(4, 1.2);
        } else {
            this.changeColor(-1);
        }
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

var hoveredTile;
var selectedTile;
var freakingOut = false;

var modes = {
    dragging: 'DRAG',
    selecting: 'SELECT',
    drawing: 'DRAW'
};
var mode = modes.dragging;

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
    if (mode == modes.dragging) {
        dragTiles(tiles, getAdjustedDeltaAtBorders(event.delta));
    } else if (mode == modes.drawing) {
        colorHex(event.point, 0);
    }
}

function onMouseDown(event) {
    if (mode == modes.drawing) {
        colorHex(event.point, 0);
    } else if (mode == modes.selecting) {
        var tile = findClickedTile(event.point);
        selectTile(tile);
    }
}

function onMouseMove(event) {
    if (mode == modes.selecting && selectedTile == null) {
        var tile = findClickedTile(event.point);
        hoverTile(tile);
    }
}

function onKeyDown(event) {
    if (event.key == 'f') {
        freakingOut = true;
    }
}

function onKeyUp(event) {
    switch(event.key) {
        case 'a':
            switchMode(modes.dragging);
            break;
        case 's':
            switchMode(modes.selecting);
            break;
        case 'd':
            switchMode(modes.drawing);
            break;
        case 'f':
            freakingOut = false;
            break;
        case 'z':
            // zoom in
            break;
        case 'x':
            // zoom out
            break;
        case 'r':
            resetHexes(tiles);
            break;
    }
}

//
// Methods for interacting with tiles
//

function selectTile(tile) {
    if (selectedTile != tile) {
        if (selectedTile != null) {
            selectedTile.toggleSelected(false);
        }
        tile.toggleSelected(true);
        selectedTile = tile;
        hoveredTile = null;
    }
    if (hoveredTile != null && hoveredTile != selectedTile) {
        hoveredTile.toggleHovered(false);
        hoveredTile = null;
    }
}

function hoverTile(tile) {
    if (hoveredTile != tile) {
        if (hoveredTile != null) {
            hoveredTile.toggleHovered(false);
        }
        tile.toggleHovered(true);
        hoveredTile = tile;
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

function dragTiles(_tiles, delta) {
    _.each(_tiles, function(tileRow) {
        _.each(tileRow, function(tile) {
            tile.moveByDelta(delta);
        });
    });
}

function colorHex(pnt, clr) {
    findClickedTile(pnt).changeColor(clr);
}

function findClickedTile(pnt) {
    // Recursively find clicked tile
    return findClickCol(pnt, tiles);
}

function findClickCol(pnt, _tiles) {
    // Find middle col from tileCols
    var middleColIndex = Math.floor(_tiles[0].length / 2);
    var middleCol = _tiles[0][middleColIndex];
    var tileCols = [];

    if (pnt.x < (middleCol.point.x - HEX_RADIUS)) {
        // Click is in left half
        _.each(_tiles, function(tileRow) {
            tileCols.push(tileRow.slice(0, middleColIndex));
        });
    } else if (pnt.x > (middleCol.point.x + HEX_RADIUS)) {
        // Click is in right half
        _.each(_tiles, function(tileRow) {
            tileCols.push(tileRow.slice(middleColIndex+1, tileRow.length));
        });
    } else {
        // Click is in this column!
        _.each(_tiles, function(tileRow) {
            tileCols.push(tileRow[middleColIndex]);
        });
        return findClickRow(pnt, tileCols);
    }
    return findClickCol(pnt, tileCols);
}

function findClickRow(pnt, tileCol) {
    // Find middle tile from tileCol
    var middleTileIndex = Math.floor(tileCol.length / 2);
    var middleTile = tileCol[middleTileIndex];

    if (pnt.y < (middleTile.point.y - HEX_DIST_A)) {
        // Click is in top half
        return findClickRow(pnt, tileCol.slice(0, middleTileIndex));
    } else if (pnt.y > (middleTile.point.y + HEX_DIST_A)) {
        // Click is in bottom half
        return findClickRow(pnt, tileCol.slice(middleTileIndex+1, tileCol.length));
    } else {
        // Click is in this tile!
        return middleTile;
    }
}

function switchMode(m) {
    mode = m;
    console.log('mode = ' + mode);
    
    if (mode != modes.selecting) {
        if (hoveredTile != null) {
            // De-select selected tile
            hoveredTile.toggleHovered(false);
            hoveredTile = null;
        }
    } else {
        if (selectedTile != null) {
            selectedTile.toggleSelected(false);
            selectedTile = null;
        }
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
            freakOut(tiles);
            freakOutCounter = 0;
        }
    }
}

function freakOut(_tiles) {
    _.each(_tiles, function(tileRow) {
        _.each(tileRow, function(tile) {
            var clr = (tile.colorIndex < HEX_COLORS_RAINBOW.length-1) ? tile.colorIndex+1 : 0;
            tile.changeColor(clr);
        });
    });
}

function resetHexes(_tiles) {
    _.each(_tiles, function(tileRow) {
        _.each(tileRow, function(tile) {
            tile.changeColor(-1);
        });
    });
    hoveredTile = null;
    selectedTile = null;
}
