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

var NUM_STARS = 20;
var STAR_VECTOR = (new Point(0.4, 1)) - (new Point(0, 0));

var INVADER_SPEED = 3;
var BULLET_SPEED = 8;
var BULLET_LENGTH = 30;
var BULLET_WIDTH = 7;

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
    content: 'Health: 3'
});

var deathText = new PointText({
    point: [view.size.width / 2, view.size.height / 2],
    justification: 'center',
    fontSize: 30,
    fillColor: 'white',
    content: 'You ded',
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
        return new Bullet(
            this.point,
            targetPoint
        );
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

//
// Background effects
//

var invaders = [];
var defenders = [];
var bullets = [];
var stars = [];

var background = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
    strokeColor: COLOR_BACKGROUND,
    fillColor: COLOR_BACKGROUND
});
background.sendToBack();

for (var i = 0; i < NUM_STARS; i++) {
    var center = Point.random() * view.size;
    stars.push(new Star(center, i / NUM_STARS));
}

//
// Setup before start
//

var numDefenders = 1;           // Num defenders in game
var health = 3;                 // Num invaders allowed through before death

var invaderRate = 200;          // Frames between invader spawns
var framesSinceSpawn = 0;       // Frames since last spawn
var invadersAllowedThrough = 0; // Num invaders which reached bottom
var invadersKilled = 0;         // Num invaders killed

for (var i = 0; i < numDefenders; i++) {
    var defenderRangeWidth = (view.size.width / numDefenders);
    var xPos = (defenderRangeWidth * (i + 1) - (defenderRangeWidth / 2));
    defenders.push(new Defender(
        new Point(
            xPos,
            view.size.height
        )
    ));
}

//
// Game tick
//

function onFrame() {
    spawnInvaders();
    moveInvaders();
    moveBullets();
    moveStars();
    if (health <= 0) {
        gameOver();
    }
}

function onMouseUp(event) {
    if (health > 0) {
        bullets.push(defenders[0].fire(event.point));
    }
}

function spawnInvaders() {
    if (framesSinceSpawn == invaderRate && health > 0) {
        var invader = new Invader(
            new Point(
                getRandomInt(
                    INVADER_RADIUS,
                    view.size.width - INVADER_RADIUS
                ),
                -INVADER_RADIUS
            ),
            [0, INVADER_SPEED]
        );
        invaders.push(invader);

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
            health--;
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

function gameOver() {
    // Player is dead!
    deathText.visible = true;
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}
