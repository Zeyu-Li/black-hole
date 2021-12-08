const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false
const OFFSCREEN_PADDING = 200;
const IMAGE_RESIZE = 3;
const MIN_MASS = 5;
const MAX_MASS = 50;
var DEBUG = true;
let PLAY = true;
const celestialObjects = [];
let planet_image = new Image();
let coords = new Image();

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
  ctx.drawImage(image, x, y, size_y, size_x);
}

const initialize = () => {
  // closest neighbour (default is bilinear)
  // ctx.imageSmoothingEnabled = false
  // get canvas and context
  fitToScreen();
  for (let i = 0; i < Math.random() * 5 + 5; i++) {
    const speed = Math.random() * 16;
    const angle = Math.random() * 2 * Math.PI;
    celestialObjects.push(
      new CelestialObject((Math.random() ** 5) * (MAX_MASS - MIN_MASS) + MIN_MASS,
        new Vector(Math.random() * canvas.width, Math.random() * canvas.height),
        new Vector(speed * Math.cos(angle), speed * Math.sin(angle)))
    );
  }
  $("#massVal").innerText = $("#massSlider").value;
  $("#speedVal").innerText = $("#speedSlider").value;
  $("#angleVal").innerText = `${$("#angleSlider").value}π`;
};

function render() {
  fitToScreen();
  renderBackground();
  renderCelestialObjects();
  renderImage(coords, 0, 0);
  cleanupCelestialObjects();
  if (PLAY) {
    requestAnimationFrame(render);
  }
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

function resumeIfPaused() {
  if (!PLAY) {
    PLAY = true;
    render();
  }
}

// image
planet_image.src =
  "https://raw.githubusercontent.com/Zeyu-Li/black-hole/main/img/planet.png";
planet_image.onload = () => {
  initialize();
  // coords
  coords.src =
    "https://raw.githubusercontent.com/Zeyu-Li/black-hole/main/img/arrows.svg";
    coords.onload = () => {
    render();
  };
};

/*
 * Slider Listeners
 */

$("#massSlider").addEventListener("input", () => {
  $("#massVal").innerText = $("#massSlider").value;
});

$("#speedSlider").addEventListener("input", () => {
  $("#speedVal").innerText = $("#speedSlider").value;
});

$("#angleSlider").addEventListener("input", () => {
  $("#angleVal").innerText = `${$("#angleSlider").value}π`;
});


/*
 * Button event listeners
 */

$("#pause").addEventListener("click", () => {
  PLAY = !PLAY;
  if (PLAY) {
    render();
  }
});

$("#generateMass").addEventListener("click", () => {
  resumeIfPaused();
  const speed = parseFloat($("#speedSlider").value);
  const angle = $("#angleSlider").value * Math.PI;
  celestialObjects.push(
    new CelestialObject(
      parseFloat($("#massSlider").value),
      new Vector(Math.random() * canvas.width, Math.random() * canvas.height),
      new Vector(speed * Math.cos(angle), speed * Math.sin(angle))
    )
  );
});

$("#deleteButton").addEventListener("click", () => {
  resumeIfPaused();
  celestialObjects.splice(0);
});

if (!DEBUG) {
  window.addEventListener('load', () => {
    fetch('https://raw.githubusercontent.com/Zeyu-Li/black-hole/main/data/info.txt')
      .then(response => {
        response.text()
          .then(alert);
      });
  });
}

/*
 * Preset 1: Two bodies of same mass orbiting around a barycenter
*/
$("#preset1").addEventListener("click", () => {
  resumeIfPaused();
  const center = new Vector(canvas.width / 2, canvas.height / 2);
  const mass = 10;
  const radius = 200;
  // I don't know why but this value make the circular orbit a bit "circular"
  const $wtf = 1.9;
  const speed = Math.sqrt(G * mass / (radius)) / $wtf;
  const loc1 = center.add(new Vector(radius, 0));
  const loc2 = center.subtract(new Vector(radius, 0));
  const vel1 = new Vector(0, speed);
  const vel2 = new Vector(0, -speed);
  celestialObjects.push(
    new CelestialObject(mass, loc1, vel1),
    new CelestialObject(mass, loc2, vel2)
  );
});

/*
 * Preset 2: Two bodies with different mass orbiting around a barycenter
*/
$("#preset2").addEventListener("click", () => {
  resumeIfPaused();
  const center = new Vector(canvas.width / 2, canvas.height / 2);
  const m1 = 5;
  const m2 = 20;
  const a = 250;
  const r1 = a / (1 + (m1 / m2));
  const r2 = a / (1 + (m2 / m1));
  const speed1 = Math.sqrt(G * m2 / (r1));
  const speed2 = Math.sqrt(G * m1 / (r2));
  const loc1 = center.add(new Vector(r1, 0));
  const loc2 = center.subtract(new Vector(r2, 0));
  const vel1 = new Vector(0, speed1);
  const vel2 = new Vector(0, -speed2);
  if (DEBUG) {
    console.table([
      {
        mass: m1,
        radius: r1,
        speed: speed1
      },
      {
        mass: m2,
        radius: r2,
        speed: speed2
      }
    ]);
    console.debug(a);
  }
  celestialObjects.push(
    new CelestialObject(m1, loc1, vel1),
    new CelestialObject(m2, loc2, vel2)
  );
});
