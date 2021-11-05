class CelestialObject {
  constructor(mass, initialPosition, initialVelocity) {
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
    return new Vector(0, 0);
  }
}

let canvas, ctx;
let planet_image = new Image();
let curr_x, curr_y;
let speed_x = 5,
  speed_y = 5;

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
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");
};

function render() {
  fitToScreen();
  renderBackground();
  curr_x += speed_x;
  curr_y += speed_y;
  if (curr_x > document.documentElement.clientHeight - 100 || curr_x < 0) {
    speed_x = -speed_x;
  } else if (
    curr_y > document.documentElement.clientWidth - 100 ||
    curr_y < 0
  ) {
    speed_y = -speed_y;
  }
  renderImage(planet_image, curr_x, curr_y);
  requestAnimationFrame(render);
}

// image
planet_image.src = "../img/coin.png";
planet_image.onload = () => {
  curr_x = 0;
  curr_y = 0;
  initialize();
  render();
};
