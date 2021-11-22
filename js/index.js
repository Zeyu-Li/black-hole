const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
var DEBUG = true;

let planet_image = new Image();

class CelestialObject {
  constructor(
    mass,
    initialPosition = new Vector(canvas.width / 2, canvas.height / 2),
    initialVelocity = new Vector(0, 0)
  ) {
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
    let accelerations = [];
    for (let celestialObject of celestialObjects) {
      if (celestialObject !== this) {
        accelerations.push(GravityAcceleration(this, celestialObject));
      }
    }
    return accelerations.reduce((v1, v2) => v1.add(v2));
  }

  render() {
    let position = this.position;
    // ctx.beginPath();
    // ctx.arc(position.x, position.y, this.mass, 0, 2 * Math.PI);
    // ctx.fillStyle = "#ffff00";
    // ctx.fill();

    renderImage(
      planet_image,
      position.x,
      position.y,
      this.mass * 3,
      this.mass * 3
    );
  }
}

function fitToScreen() {
  canvas.width = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  canvas.height = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );
}

function renderBackground() {
  ctx.fillStyle = "#191529";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Renders an image at x, y of size size_x by size_y
 * Note: top left corner is 0, 0
 * @param {Image} image image to be rendered
 * @param {number} x
 * @param {*} y
 * @param {*} size_x
 * @param {*} size_y
 */
function renderImage(image, x, y, size_x = 100, size_y = 100) {
  ctx.drawImage(image, y, x, size_y, size_x);
}

const initialize = () => {
  // closest neighbour (default is bilinear)
  // ctx.imageSmoothingEnabled = false
  // get canvas and context
};

function render() {
  fitToScreen();
  renderBackground();
  renderCelestialObjects();
  requestAnimationFrame(render);
}

function renderCelestialObjects() {
  for (let celestialObject of celestialObjects) {
    celestialObject.render();
  }
}
let celestialObjects = [
  new CelestialObject(10, new Vector(100, 100)),
  new CelestialObject(20, new Vector(255, 500), new Vector(5, -1)),
  new CelestialObject(30, new Vector(400, 150)),
  new CelestialObject(30, new Vector(600, 750)),
];

// image
planet_image.src = "https://zeyu-li.github.io/black-hole/img/planet.png";
planet_image.onload = () => {
  initialize();
  render();
};
