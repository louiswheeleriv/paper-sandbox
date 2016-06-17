//
// Constants
//

var COLOR_INVADER = '#cc0022';
var COLOR_INVADER_BORDER = '#880011';
var COLOR_DEFENDER = '#0066cc';
var COLOR_DEFENDER_BORDER = '#003377';
var COLOR_BULLET = '#cc00aa';
var COLOR_BACKGROUND = '#000000';
var COLOR_STAR = '#ffffff';
var COLOR_STAR_BORDER = '#ffff99';

var INVADER_RADIUS = 15;
var DEFENDER_RADIUS = 20;
var STAR_RADIUS_MAX = 7;
var DAT_BOI_RADIUS_MAX = 50;
var DAT_BOI_VECTOR = [-4, 0];

var NUM_STARS = 20;
var STAR_VECTOR = (new Point(0.4, 1)) - (new Point(0, 0));

var INVADER_SPEED = 3;
var BULLET_SPEED = 8;
var BULLET_LENGTH = 30;
var BULLET_WIDTH = 7;

var NUM_DEFENDERS = 1;
var PLAYER_MAX_HEALTH = 3;
var INVADER_RATE = 100;

//
// Path definitions for entity appearance
//

var invaderPath = new Path.Circle({
    center: [0, 0],
    radius: INVADER_RADIUS,
    strokeColor: COLOR_INVADER_BORDER,
    strokeWidth: 3,
    fillColor: COLOR_INVADER
});

var defenderPath = new Path.Circle({
    center: [0, 0],
    radius: DEFENDER_RADIUS,
    strokeColor: COLOR_DEFENDER_BORDER,
    strokeWidth: 3,
    fillColor: COLOR_DEFENDER
});

var starPath = new Path.Circle({
    center: [0, 0],
    radius: STAR_RADIUS_MAX,
    strokeColor: COLOR_STAR_BORDER,
    strokeWidth: 4,
    fillColor: COLOR_STAR
});

//
// Text definitions
//

var scoreText = new PointText({
    point: [20, 40],
    justification: 'left',
    fontSize: 20,
    fillColor: 'white',
    content: 'Score: 0'
});

var healthText = new PointText({
    point: [view.size.width - 100, 40],
    justification: 'left',
    fontSize: 20,
    fillColor: 'white',
    content: ('Health: ' + PLAYER_MAX_HEALTH)
});

var deathText = new PointText({
    point: [view.size.width / 2, view.size.height / 2],
    justification: 'center',
    fontSize: 30,
    fillColor: 'white',
    content: 'You ded',
    visible: false
});

var restartText = new PointText({
    point: [view.size.width / 2, (view.size.height / 2) + 50],
    justification: 'center',
    fontSize: 30,
    fillColor: 'white',
    content: 'Press R to restart',
    visible: false
});

//
// Symbols for drawing entities
//

var invaderSymbol = new Symbol(invaderPath);
var defenderSymbol = new Symbol(defenderPath);
var starSymbol = new Symbol(starPath);

//
// Constructors
//

function Invader(p, v) {
    this.point = p;
    this.vector = v;
    this.radius = INVADER_RADIUS;
    this.symbol = invaderSymbol.place(this.point);
}

function Defender(p) {
    this.point = p;
    this.radius = DEFENDER_RADIUS;
    this.symbol = defenderSymbol.place(this.point);
}

function Bullet(p1, p2) {
    this.point = p1;
    this.unitVector = (p2 - p1).normalize();

    this.bulletLength = BULLET_LENGTH;
    this.bulletWidth = BULLET_WIDTH;

    this.vector = (this.unitVector * BULLET_SPEED);
    this.drawVector = (this.unitVector * this.bulletLength);

    this.path = new Path({
        segments: [
            this.point,
            (this.point + this.drawVector)
        ],
        strokeColor: COLOR_BULLET,
        strokeWidth: this.bulletWidth,
        strokeCap: 'round'
    });
}

function Star(p, s) {
    this.point = p;
    this.vector = STAR_VECTOR * s;
    this.symbol = starSymbol.place(this.point);
    this.symbol.scale(s);
}

function DatBoi(p, s, v) {
    this.point = p;
    this.scale = s;
    this.vector = v;
    this.frameCount = 0;
    this.animateAtFrames = 5;
    this.bouncePixels = 10;
    this.raster = new Raster({
        source: 'dat_boi',
        position: this.point
    });
    this.raster.scale(this.scale);
}

//
// Prototypes
//

Invader.prototype = {
    progress: function() {
        this.point += this.vector;
        this.symbol.position = this.point;
    },

    isPastBottom: function() {
        return (this.point.y >= (view.size.height + INVADER_RADIUS));
    }
};

Defender.prototype = {
    fire: function(targetPoint) {
        return createBullet(this.point, targetPoint);
    }
};

Bullet.prototype = {
    progress: function() {
        this.point += this.vector;
        this.path.removeSegment(0);
        this.path.removeSegment(0);
        this.path.add(new Point(this.point));
        this.path.add(new Point(this.point + this.drawVector));
    },

    isOutOfBounds: function() {
        return (
            this.point.x < 0 ||
            this.point.x > view.size.width ||
            this.point.y < 0 ||
            this.point.y > view.size.height
        );
    },

    detectHit: function(target) {
        return (
            this.point.getDistance(target.point) < (target.radius + this.bulletWidth) ||
            (this.point + this.drawVector).getDistance(target.point) < (target.radius + this.bulletWidth)
        );
    }
}

Star.prototype = {
    progress: function() {
        this.point += this.vector;
        this.symbol.position = this.point;
        this.wrapBorders();
    },

    wrapBorders: function() {
        if (this.point.x < -STAR_RADIUS_MAX) {
            this.point.x = view.size.width + STAR_RADIUS_MAX;
            this.symbol.position.x = this.point.x;
        }
        if (this.point.x > view.size.width + STAR_RADIUS_MAX) {
            this.point.x = -STAR_RADIUS_MAX;
            this.symbol.position.x = this.point.x;
        }
        if (this.point.y < -STAR_RADIUS_MAX) {
            this.point.y = view.size.height + STAR_RADIUS_MAX;
            this.symbol.position.y = this.point.y;
        }
        if (this.point.y > view.size.height + STAR_RADIUS_MAX) {
            this.point.y = -STAR_RADIUS_MAX;
            this.symbol.position.y = this.point.y;
        }
    }
}

DatBoi.prototype = {
    progress: function() {
        this.point += this.vector;
        if (this.frameCount == this.animateAtFrames) {
            this.point.y -= this.bouncePixels;
        } else if (this.frameCount == (this.animateAtFrames * 2)) {
            this.point.y += this.bouncePixels;
            this.frameCount = 0;
        }
        this.raster.position = this.point;
        //this.wrapBorders();
        this.frameCount++;
    },
    
    wrapBorders: function() {
        if (this.point.x < -DAT_BOI_RADIUS_MAX) {
            this.point.x = view.size.width + DAT_BOI_RADIUS_MAX;
            this.raster.position.x = this.point.x;
        }
        if (this.point.x > view.size.width + DAT_BOI_RADIUS_MAX) {
            this.point.x = -DAT_BOI_RADIUS_MAX;
            this.raster.position.x = this.point.x;
        }
        if (this.point.y < -DAT_BOI_RADIUS_MAX) {
            this.point.y = view.size.height + DAT_BOI_RADIUS_MAX;
            this.raster.position.y = this.point.y;
        }
        if (this.point.y > view.size.height + DAT_BOI_RADIUS_MAX) {
            this.point.y = -DAT_BOI_RADIUS_MAX;
            this.raster.position.y = this.point.y;
        }
    }
}

//
// Background effects
//

var background = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
    strokeColor: COLOR_BACKGROUND,
    fillColor: COLOR_BACKGROUND
});
background.sendToBack();

//
// Object API (Clear & Create functions)
//

// Invaders
function clearInvaders(invdrs) {
    for (var i = 0; i < invdrs.length; i++) {
        invdrs[i].symbol.remove();
    }
    invdrs = [];
    return invdrs;
}

function createInvader(radius, vector) {
    return new Invader(
        new Point(
            getRandomInt(
                radius,
                view.size.width - radius
            ),
            -radius
        ),
        vector
    );
}

// Defenders
function clearDefenders(dfndrs) {
    for (var i = 0; i < dfndrs.length; i++) {
        dfndrs[i].symbol.remove();
    }
    dfndrs = [];
    return dfndrs;
}

function createDefenders(numToCreate) {
    var dfndrs = [];
    for (var i = 0; i < numToCreate; i++) {
        var defenderRangeWidth = (view.size.width / numToCreate);
        var xPos = (defenderRangeWidth * (i + 1) - (defenderRangeWidth / 2));
        dfndrs.push(new Defender(
            new Point(
                xPos,
                view.size.height
            )
        ));
    }
    return dfndrs;
}

// Bullets
function clearBullets(bllts) {
    for (var i = 0; i < bllts.length; i++) {
        bllts[i].path.remove();
    }
    bllts = [];
    return bllts;
}

function createBullet(firingPoint, targetPoint) {
    return new Bullet(
        firingPoint,
        targetPoint
    );
}

// Stars
function clearStars(strs) {
    for (var i = 0; i < strs.length; i++) {
        strs[i].symbol.remove();
    }
    strs = [];
    return strs;
}

function createStars(numToCreate) {
    var strs = [];
    for (var i = 0; i < numToCreate; i++) {
        var center = Point.random() * view.size;
        strs.push(new Star(center, i / numToCreate));
    }
    return strs;
}

// Dem Bois
function clearDemBois(bois) {
    for (var i = 0; i < bois.length; i++) {
        bois[i].raster.remove();
    }
    bois = [];
    return bois;
}

function createDemBois(numToCreate) {
    var bois = [];
    for (var i = 0; i < numToCreate; i++) {
        var point = new Point(view.size.width + DAT_BOI_RADIUS_MAX + 1000, 200);
        var scale = 0.25;
        var vector = DAT_BOI_VECTOR;
        bois.push(new DatBoi(point, scale, vector));
    }
    return bois;
}

//
// Game data setup
//

var invaders = [];
var defenders = [];
var bullets = [];
var stars = [];
var demBois = [];

var numDefenders = NUM_DEFENDERS;  // Num defenders in game
var health = PLAYER_MAX_HEALTH;    // Num invaders allowed through before death

var invaderRate = INVADER_RATE;    // Frames between invader spawns
var framesSinceSpawn = 0;          // Frames since last spawn
var invadersAllowedThrough = 0;    // Num invaders which reached bottom
var invadersKilled = 0;            // Num invaders killed

//
// Start game!
//

setupGame(numDefenders, health, invaderRate);

function setupGame(numDef, hp, invRate) {
    invaders = clearInvaders(invaders);
    bullets = clearBullets(bullets);
    clearDefenders(defenders);
    clearStars(stars);
    stars = createStars(NUM_STARS);
    defenders = createDefenders(NUM_DEFENDERS);

    health = hp;
    deathText.visible = false;
    restartText.visible = false;
    healthText.content = ('Health: ' + health);
    scoreText.content = ('Score: ' + 0);
    
    clearDemBois(demBois);
    demBois = createDemBois(1);
}

//
// Input handlers
//

function onMouseUp(event) {
    if (isPlayerAlive()) {
        bullets.push(defenders[0].fire(event.point));
    }
}

function onKeyUp(event) {
    // If R key pressed, reset
    if (event.key == 'r') {
        setupGame(NUM_DEFENDERS, PLAYER_MAX_HEALTH, INVADER_RATE);
    }
}

//
// Game tick
//

function onFrame() {
    if (isPlayerAlive()) {
        spawnInvaders();
        moveInvaders();
        moveBullets();
    } else {
        moveDemBois();
    }
    moveStars();
    
}

function spawnInvaders() {
    if (framesSinceSpawn == invaderRate && isPlayerAlive()) {
        invaders.push(createInvader(INVADER_RADIUS, [0, INVADER_SPEED]));
        framesSinceSpawn = 0;
    } else {
        framesSinceSpawn++;
    }
}

function moveInvaders() {
    for (var i = 0; i < invaders.length; i++) {
        invaders[i].progress();

        if (invaders[i].isPastBottom()) {
            // Invader hit bottom
            invaders[i].symbol.remove();
            invaders.splice(i, 1);
            invadersAllowedThrough++;
            if (health > 0) {
                health--;
                if (health <= 0) {
                    gameOver();
                }
            }
            i--;

            healthText.content = ('Health: ' + health);
        }
    }
}

function moveBullets() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].progress();

        if (bullets[i].isOutOfBounds()) {
            // Bullet is out of bounds
            bullets[i].path.remove();
            bullets.splice(i, 1);
            i--;
        } else {
            // In bounds, check for hits
            for (var j = 0; j < invaders.length; j++) {
                if (bullets[i].detectHit(invaders[j])) {
                    // Bullet hit invader
                    invaders[j].symbol.remove();
                    invaders.splice(j, 1);
                    invadersKilled++;

                    bullets[i].path.remove();
                    bullets.splice(i, 1);

                    scoreText.content = ('Score: ' + invadersKilled);
                    break;
                }
            }
        }
    }
}

function moveStars() {
    for (var i = 0; i < stars.length; i++) {
        stars[i].progress();
    }
}

function moveDemBois() {
    for (var i = 0; i < demBois.length; i++) {
        demBois[i].progress();
    }
}

function isPlayerAlive() {
    return (health > 0);
}

function gameOver() {
    // Player is dead!
    deathText.visible = true;
    restartText.visible = true;
    deathText.bringToFront();
    restartText.bringToFront();
    invaders = clearInvaders(invaders);
    bullets = clearBullets(bullets);
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}
