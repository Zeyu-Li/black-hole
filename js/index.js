const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext("2d");
let centerOfMass;
var DEBUG = true;

class CelestialObject {
	constructor(mass,
		initialPosition = new Vector(canvas.width / 2, canvas.height / 2),
		initialVelocity = new Vector(0, 0)) {
		this.mass = mass;
		this.old_position = initialPosition;
		this.old_velocity = initialVelocity;
	}

	get position() {
		const position_incr = this.velocity.multiply(TIME_SCALE);
		this.old_position = position_incr.add(this.old_position);
		return this.old_position;
	}

	get velocity() {
		const velocity_incr = this.acceleration.multiply(TIME_SCALE);
		this.old_velocity = velocity_incr.add(this.old_velocity);
		return this.old_velocity;
	}

	get acceleration() {
		// remove self from center of mass
		let correctedCenterOfMass = centerOfMass;
		// I think this is right but not 100%
		correctedCenterOfMass.position = centerOfMass.position
			.subtract(this.old_position
				.multiply(1 / centerOfMass.mass)
				.multiply(this.mass));
		correctedCenterOfMass.mass -= this.mass;
		return GravityAcceleration(this, centerOfMass);
	}

	render() {
		ctx.beginPath();
		ctx.fillStyle = "#ffff00";
		let position = this.position;
		ctx.arc(position.x, position.y, this.mass, 0, 2 * Math.PI);
		ctx.fill();
	}
}

function fitToScreen() {
	canvas.width = Math.max(document.documentElement.clientWidth || 0,
		window.innerWidth || 0);
	canvas.height = Math.max(document.documentElement.clientHeight || 0,
		window.innerHeight || 0);
}

function renderBackground() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateCenterOfMass() {
	centerOfMass = {
		mass: 0,
		position: new Vector(0, 0)
	};
	for (let celestialObject of celestialObjects) {
		centerOfMass.mass += celestialObject.mass;
		centerOfMass.position = centerOfMass.position
			.add(celestialObject.old_position.multiply(celestialObject.mass));
	}
	centerOfMass.position = centerOfMass.position
		.multiply(1 / centerOfMass.mass);
}

function renderCelestialObjects() {
	for (let celestialObject of celestialObjects) {
		celestialObject.render();
	}
}

function render() {
	fitToScreen();
	renderBackground();
	updateCenterOfMass();
	renderCelestialObjects();
	// TODO remove when the issue is fixed
	if (DEBUG) {
		ctx.beginPath();
		ctx.fillStyle = "#00ff00";
		ctx.arc(centerOfMass.position.x, centerOfMass.position.y, 5, 0, 2 * Math.PI);
		ctx.fill();
	}
	requestAnimationFrame(render);
}

let celestialObjects = [
	new CelestialObject(10, new Vector(100, 100)),
	new CelestialObject(20, new Vector(255, 500)),
	new CelestialObject(30, new Vector(400, 150)),
	new CelestialObject(30, new Vector(600, 750)),
];

render();
