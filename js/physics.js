// TODO: finetune this constant
const G = 1;
const TIME_SCALE = 1/60;

function isVector() {
	return this.x !== undefined && this.y !== undefined;
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
}

function GravityForce(o1, o2) {
	const m1 = o1.mass;
	const m2 = o2.mass;
	const r = o1.position.subtract(o2.position);
	const r_squared = r.multiply(r);
	const GMm = G * m1 * m2;
	const force_x = GMm / r.x;
	const force_y = GMm / r.y;
	return new Vector(force_x, force_y);
}
