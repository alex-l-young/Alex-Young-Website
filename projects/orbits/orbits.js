let canvasX;
let canvasY;
let G;
let sunMass = 100;
let sunRadius;
let sunCenter;
let planetMass = 1;
let starLocations = [];
let starSizes = [];
let heldPlanets = [];
let planets = [];
let mx;
let my;

function setup() {
  canvasX = min(windowWidth, 500);
  canvasY = min(windowHeight, 500);
  createCanvas(canvasX, canvasY);

  // Set sun position.
  sunCenter = createVector(canvasX / 2, canvasY / 2);
  sunRadius = canvasX * 0.1;

  // Gravitational constant.
  G = 10;

  // Vectors to store mouse positions.
  mx = [0, 0, 0, 0, 0];
  my = [0, 0, 0, 0, 0];

  // Make some stars.
  let nStars = 100;
  for (let i = 0; i < nStars; i++) {
    let starX = random() * canvasX;
    let starY = random() * canvasY;
    starLocations.push(createVector(starX, starY));
    starSizes.push(random() * 2.5);
  }

}

function draw() {
  background(10);
  drawStars();

  // Store mouse locations.
  mx.splice(0, 0, mouseX);
  mx.pop();
  my.splice(0, 0, mouseY);
  my.pop();

  // Make the Sun.
  let sun = new Sun();
  sun.createSun();

  // Held planet with the mouse.
  for (i = 0; i < heldPlanets.length; i++) {
    heldPlanets[i].moveWithMouse();
  }

  // Update the planets.
  for (i = 0; i < planets.length; i++) {
    planets[i].runPlanet();
    if (planets[i].isDead()) {
      planets.splice(i,1);
    }
  }

}

// ================================================
// SUN
let Sun = function() {
  this.r = sunRadius;
  this.center = sunCenter;

}

Sun.prototype.createSun = function() {
  noStroke()
  fill(255, 228, 153);
  circle(this.center.x,this.center.y,this.r);
}

function mousePressed() {
  heldPlanets.push(new Planet());
}

function mouseReleased() {
  heldPlanets[0].vel = computeMouseVelocity();
  planets.push(heldPlanets[0]);
  heldPlanets = [];
}

// ==================================
let Planet = function() {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
  this.dt = 1;
  this.pos = createVector(mouseX, mouseY);
  this.vel = createVector(0, 0);
  this.accel = createVector(0, 0);
  this.r = canvasX * 0.03;
  this.initLifespan = 1000;
  this.lifespan = this.initLifespan;
}


Planet.prototype.createPlanet = function() {
  noStroke()
  fill(107, 174, 255);
  circle(this.pos.x,this.pos.y,this.r);
}

Planet.prototype.moveWithMouse = function() {
  this.pos = createVector(mouseX, mouseY);
  this.displayPlanet();
}

Planet.prototype.updatePosition = function() {

  // Check collision.
  this.checkCollision();

  // Calculate acceleration.
  this.accel = acceleration(sunCenter, this.pos);

  // Calculate velocity.
  let velX = this.vel.x + this.accel.x * this.dt;
  let velY = this.vel.y + this.accel.y * this.dt;

  // Calculate position.
  let posX = this.pos.x + this.vel.x * this.dt;
  let posY = this.pos.y + this.vel.y * this.dt;

  // Update velocity and position.
  this.vel = createVector(velX, velY);
  this.pos = createVector(posX, posY);

  // Update lifespan.
  this.lifespan -= 1;

  }

Planet.prototype.displayPlanet = function() {
  let alpha = 255 * (this.lifespan / this.initLifespan);
  fill(107, 174, 255);
  noStroke();
  circle(this.pos.x,this.pos.y,this.r);
  }

Planet.prototype.isDead = function() {
  return this.lifespan <= 0;
  }

Planet.prototype.runPlanet = function() {
  this.updatePosition();
  this.displayPlanet();
}

Planet.prototype.checkCollision = function() {
  let sunDist = dist(sunCenter.x, sunCenter.y, this.pos.x, this.pos.y);

  if (sunDist <= (sunRadius + this.r) / 2) {
    this.vel = createVector(0, 0);
    this.accel = createVector(0, 0);
  }
}

let drawStars = function() {
  for (let i = 0; i < starLocations.length; i++) {
    noStroke();
    fill(255);
    circle(starLocations[i].x, starLocations[i].y, starSizes[i]);
  }
}

let acceleration = function(sunPosition, planetPosition) {
  // Distance between the two bodies.
  let R = dist(sunPosition.x, sunPosition.y, planetPosition.x, planetPosition.y);

  // Compute the graviational force.
  let Fg = G * sunMass * planetMass / R**2;

  // Direction of gravitational force.
  let vX = sunPosition.x - planetPosition.x;
  let vY = sunPosition.y - planetPosition.y;
  let vMag = mag(vX,vY);


  accelX = Fg * (vX / vMag);
  accelY = Fg * (vY / vMag);
  accel = createVector(accelX, accelY);

  return accel;

}

let computeMouseVelocity = function() {
  // X velocity.
  xDisp = [];
  for (let i = 0; i < mx.length - 1; i++) {
    xDisp.push(mx[i+1] - mx[i]);
  }
  xVelocity = xDisp.reduce((a, b) => a + b, 0) / xDisp.length;

  // Y velocity.
  yDisp = [];
  for (let i = 0; i < my.length - 1; i++) {
    yDisp.push(my[i+1] - my[i]);
  }
  yVelocity = yDisp.reduce((a, b) => a + b, 0) / yDisp.length;

  mouseVelocity = createVector(-xVelocity, -yVelocity);

  return mouseVelocity;

}
