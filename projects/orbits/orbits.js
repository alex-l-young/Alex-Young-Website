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
  let container = select('.simulation-stage');
  
  // Grab the container's width, default to 800 if missing
  let w = container ? container.width : 800;
  // Use the container's height (defined in CSS as 550px)
  let h = container ? container.height : 550; 

  let cnv = createCanvas(w, h);
  
  if (container) {
    cnv.parent(container);
  }

  canvasX = width;
  canvasY = height;

  sunCenter = createVector(canvasX / 2, canvasY / 2);
  sunRadius = canvasX * 0.05;

  G = 10;

  mx = [0, 0, 0, 0, 0];
  my = [0, 0, 0, 0, 0];

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

  mx.splice(0, 0, mouseX);
  mx.pop();
  my.splice(0, 0, mouseY);
  my.pop();

  let sun = new Sun();
  sun.createSun();

  for (i = 0; i < heldPlanets.length; i++) {
    heldPlanets[i].moveWithMouse();
  }

  for (i = 0; i < planets.length; i++) {
    planets[i].runPlanet();
    if (planets[i].isDead()) {
      planets.splice(i,1);
    }
  }
}

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
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    heldPlanets.push(new Planet());
  }
}

function mouseReleased() {
  if (heldPlanets.length > 0) {
    heldPlanets[0].vel = computeMouseVelocity();
    planets.push(heldPlanets[0]);
    heldPlanets = [];
  }
}

let Planet = function() {
  this.dt = 1;
  this.pos = createVector(mouseX, mouseY);
  this.vel = createVector(0, 0);
  this.accel = createVector(0, 0);
  this.r = 15; // Fixed size for better visibility
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
  this.checkCollision();
  this.accel = acceleration(sunCenter, this.pos);

  let velX = this.vel.x + this.accel.x * this.dt;
  let velY = this.vel.y + this.accel.y * this.dt;

  let posX = this.pos.x + this.vel.x * this.dt;
  let posY = this.pos.y + this.vel.y * this.dt;

  this.vel = createVector(velX, velY);
  this.pos = createVector(posX, posY);

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
  let R = dist(sunPosition.x, sunPosition.y, planetPosition.x, planetPosition.y);
  let Fg = G * sunMass * planetMass / R**2;
  let vX = sunPosition.x - planetPosition.x;
  let vY = sunPosition.y - planetPosition.y;
  let vMag = mag(vX,vY);
  accelX = Fg * (vX / vMag);
  accelY = Fg * (vY / vMag);
  return createVector(accelX, accelY);
}

let computeMouseVelocity = function() {
  xDisp = [];
  for (let i = 0; i < mx.length - 1; i++) {
    xDisp.push(mx[i+1] - mx[i]);
  }
  xVelocity = xDisp.reduce((a, b) => a + b, 0) / xDisp.length;

  yDisp = [];
  for (let i = 0; i < my.length - 1; i++) {
    yDisp.push(my[i+1] - my[i]);
  }
  yVelocity = yDisp.reduce((a, b) => a + b, 0) / yDisp.length;

  return createVector(-xVelocity, -yVelocity);
}