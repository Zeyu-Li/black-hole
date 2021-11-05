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

const initialize = () => {
  // get canvas and context
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");
};

function render() {
  fitToScreen();
  renderBackground();
  requestAnimationFrame(render);
}

initialize();
render();
