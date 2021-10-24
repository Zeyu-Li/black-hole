const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext("2d");

class CelestialObject {
	constructor(mass) {
		this.mass = mass;
	}
}

function fitToScreen() {
	canvas.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	canvas.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
}

function renderBackground() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {
	fitToScreen();
	renderBackground();
	requestAnimationFrame(render);
}

render();
