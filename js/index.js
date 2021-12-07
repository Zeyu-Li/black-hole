const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const OFFSCREEN_PADDING = 200;
const IMAGE_RESIZE = 3;
const MIN_MASS = 5;
const MAX_MASS = 50;
var DEBUG = true;
const celestialObjects = [];
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
    if (celestialObjects.length > 1) {
      const velocity_incr = this.acceleration.multiply(TIME_SCALE);
      this.old_velocity = velocity_incr.add(this.old_velocity);
    }
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
    const position = this.position;
    const dimension = this.mass * IMAGE_RESIZE;
    renderImage(
      planet_image,
      position.x - (dimension / 2),
      position.y - (dimension / 2),
      dimension,
      dimension
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
  cleanupCelestialObjects();
}

function renderCelestialObjects() {
  try {
    for (let celestialObject of celestialObjects) {
      celestialObject.render();
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }
}

function cleanupCelestialObjects() {
  deleteOffscreenCelestialObjects();
  mergeCelestialObjects();
}

function deleteOffscreenCelestialObjects() {
  for (let i = 0; i < celestialObjects.length; i++) {
    let p = celestialObjects[i].old_position;
    if (
      p.x < -OFFSCREEN_PADDING ||
      p.x > canvas.width + OFFSCREEN_PADDING ||
      p.y < -OFFSCREEN_PADDING ||
      p.y > canvas.height + OFFSCREEN_PADDING
    ) {
      celestialObjects.splice(i, 1);
    }
  }
}

function mergeCelestialObjects() {
  for (let i = 0; i < celestialObjects.length - 1; i++) {
    for (let j = i + 1; j < celestialObjects.length; j++) {
      const p1 = celestialObjects[i].old_position;
      const p2 = celestialObjects[j].old_position;
      if (p1.distanceTo(p2) < Math.max(celestialObjects[i].mass,
        celestialObjects[j].mass) * IMAGE_RESIZE / 4) {
        const totalMass = celestialObjects[i].mass + celestialObjects[j].mass;
        const v1 = celestialObjects[i]
          .old_velocity
          .multiply(celestialObjects[i].mass);
        const v2 = celestialObjects[j]
          .old_velocity
          .multiply(celestialObjects[j].mass);
        celestialObjects[i].old_velocity = v1
          .add(v2)
          .multiply(1 / (totalMass));
        celestialObjects[i].old_position = p1
          .multiply(celestialObjects[i].mass)
          .add(p2.multiply(celestialObjects[j].mass))
          .multiply(1 / (totalMass));
        celestialObjects[i].mass = totalMass;
        celestialObjects.splice(j, 1);
        break;
      }
    }
  }
}

for (let i = 0; i < Math.random() * 5 + 5; i++) {
  celestialObjects.push(
    new CelestialObject((Math.random() ** 5) * (MAX_MASS - MIN_MASS) + MIN_MASS,
      new Vector(Math.random() * canvas.width, Math.random() * canvas.height))
  );
}

// image
planet_image.src =
  "https://raw.githubusercontent.com/Zeyu-Li/black-hole/main/img/planet.png";
planet_image.onload = () => {
  initialize();
  render();
};

function addMass() {
  celestialObjects.push(
    new CelestialObject(
      $(".mass").value,
      new Vector(Math.random() * canvas.width, Math.random() * canvas.height)
    )
  );
}

$(".generateMass").addEventListener("click", addMass);

window.addEventListener('load', () => {
  fetch('https://raw.githubusercontent.com/Zeyu-Li/black-hole/main/data/info.txt')
    .then(response => {
      response.text()
        .then(alert);
    });
})
