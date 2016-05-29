var GRAVITY = 0.5
var MIN_VELOCITY = 2.7;
var MIN_VELOCITY_ROLLING = 0.2;
var MAX_VELOCITY = 15;
var BOUNCE_MULT = 0.7;
var FRICTION_MULT = 0.97;

function Ball(r, p, v) {
	this.radius = r;
	this.point = p;
	this.vector = v;
	this.maxVec = MAX_VELOCITY;
	this.numSegment = Math.floor(r / 3 + 2);
	this.boundOffset = [];
	this.boundOffsetBuff = [];
	this.sidePoints = [];
	this.path = new Path({
		fillColor: {
			hue: Math.random() * 360,
			saturation: 1,
			brightness: 1
		},
		blendMode: 'lighter',
		selected: true
	});

	for (var i = 0; i < this.numSegment; i++) {
		this.boundOffset.push(this.radius);
		this.boundOffsetBuff.push(this.radius);
		this.path.add(new Point());
		this.sidePoints.push(new Point({
			angle: 360 / this.numSegment * i,
			length: 1
		}));
	}
}

Ball.prototype = {
	iterate: function() {
		this.checkBorders();
		if (this.vector.length > this.maxVec)
			this.vector.length = this.maxVec;
		this.point += this.vector;
		this.vector += [0, GRAVITY];
		this.updateShape();
	},

	checkBorders: function() {
		var size = view.size;
		if (this.point.x < this.radius && this.vector.x < 0) {
			// Left wall
			this.point.x = this.radius;
			this.vector.x = (Math.abs(this.vector.x) > MIN_VELOCITY) ? (-this.vector.x * BOUNCE_MULT) : 0;
		}
		if (this.point.x > size.width - this.radius && this.vector.x > 0) {
			// Right wall
			this.point.x = (size.width - this.radius);
			this.vector.x = (Math.abs(this.vector.x) > MIN_VELOCITY) ? (-this.vector.x * BOUNCE_MULT) : 0;
		}
		if (this.point.y < this.radius && this.vector.y < 0) {
			// Ceiling
			this.point.y = this.radius;
			this.vector.y = (Math.abs(this.vector.y) > MIN_VELOCITY) ? (-this.vector.y * BOUNCE_MULT) : 0;
			this.vector.x = (this.vector.x * FRICTION_MULT);
		}
		if (this.point.y > (size.height - this.radius) && this.vector.y > 0) {
			// Floor
			this.point.y = (size.height - this.radius);
			this.vector.y = (Math.abs(this.vector.y) > MIN_VELOCITY) ? (this.vector.y * -1 * BOUNCE_MULT) : 0;
			this.vector.x = (this.vector.x * FRICTION_MULT);
		}
		if (this.point.y == (size.height - this.radius) && this.vector.y == 0 && this.vector.x != 0) {
			// Rolling on floor
			this.vector.x = (Math.abs(this.vector.x) > MIN_VELOCITY_ROLLING) ? (this.vector.x * FRICTION_MULT) : 0;
		}
	},

	updateShape: function() {
		var segments = this.path.segments;
		for (var i = 0; i < this.numSegment; i++)
			segments[i].point = this.getSidePoint(i);

		this.path.smooth();
		for (var i = 0; i < this.numSegment; i++) {
			if (this.boundOffset[i] < this.radius / 4)
				this.boundOffset[i] = this.radius / 4;
			var next = (i + 1) % this.numSegment;
			var prev = (i > 0) ? i - 1 : this.numSegment - 1;
			var offset = this.boundOffset[i];
			offset += (this.radius - offset) / 15;
			offset += ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3;
			this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
		}
	},

	react: function(b) {
		var dist = this.point.getDistance(b.point);
		if (dist < this.radius + b.radius && dist != 0) {
			var overlap = this.radius + b.radius - dist;
			var direc = (this.point - b.point).normalize(overlap * 0.015);
			this.vector += direc;
			b.vector -= direc;

			this.calcBounds(b);
			b.calcBounds(this);
			this.updateBounds();
			b.updateBounds();
		}
	},

	getBoundOffset: function(b) {
		var diff = this.point - b;
		var angle = (diff.angle + 180) % 360;
		return this.boundOffset[Math.floor(angle / 360 * this.boundOffset.length)];
	},

	calcBounds: function(b) {
		for (var i = 0; i < this.numSegment; i++) {
			var tp = this.getSidePoint(i);
			var bLen = b.getBoundOffset(tp);
			var td = tp.getDistance(b.point);
			if (td < bLen) {
				this.boundOffsetBuff[i] -= (bLen - td) / 2;
			}
		}
	},

	getSidePoint: function(index) {
		return this.point + this.sidePoints[index] * this.boundOffset[index];
	},

	updateBounds: function() {
		for (var i = 0; i < this.numSegment; i++)
			this.boundOffset[i] = this.boundOffsetBuff[i];
	}
};

//--------------------- main ---------------------

var balls = [];
var radius = 40;

function onMouseUp(event) {
	aimVector.remove();
	var vector = (event.downPoint - event.point);
	balls.push(new Ball(radius, event.downPoint, vector));
}

var aimVector = new Path();
function onMouseDrag(event) {
	aimVector.remove();
	aimVector = new Path(event.downPoint, event.point);
	aimVector.strokeColor = 'black';
	aimVector.strokeWidth = 2;
}

function onFrame() {
    for (var i = 0; i < balls.length - 1; i++) {
		for (var j = i + 1; j < balls.length; j++) {
			balls[i].react(balls[j]);
		}
	}
	for (var i = 0, l = balls.length; i < l; i++) {
		balls[i].iterate();
	}
}