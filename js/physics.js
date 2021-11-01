// TODO: finetune this constant
const G = 200;
const TIME_SCALE = 1/60;

function isVector(o) {
	return o.x !== undefined && o.y !== undefined;
}

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(o) {
		if (typeof o === "number") {
			return new Vector(this.x + o, this.y + o);
		} else if (isVector(o)) {
			return new Vector(this.x + o.x, this.y + o.y);
		}
		throw new TypeError("Not a Vector or Number");
	}

	subtract(o) {
		if (typeof o === "number") {
			return new Vector(this.x - o, this.y - o);
		} else if (isVector(o)) {
			return new Vector(this.x - o.x, this.y - o.y);
		}
		throw new TypeError("Not a Vector or Number");
	}

	multiply(o) {
		if (typeof o === "number") {
			return new Vector(this.x * o, this.y * o);
		} else if (isVector(o)) {
			return new Vector(this.x * o.x, this.y * o.y);
		}
		throw new TypeError("Not a Vector or Number");
	}

	distanceTo(o) {
		if (!isVector(o)) {
			throw new TypeError("Not a Vector")
		}
		const delta = this.subtract(o);
		return Math.sqrt((delta.x**2) + (delta.y**2));
	}

	angleTo(o) {
		const delta = o.subtract(this);
		return Math.atan2(delta.y, delta.x);
	}
}

function GravityAcceleration(o1, o2) {
	const r = o1.old_position.distanceTo(o2.position);
	const acc = G * o2.mass / (r ** 2);
	const angle = o1.old_position.angleTo(o2.position);
	return new Vector(acc * Math.cos(angle), acc * Math.sin(angle));
}
